/**
 * PDF text extraction utilities
 * Handles downloading and extracting text from PDF files
 */

export interface ExtractedPDFContent {
  text: string;
  pageCount: number;
}

/**
 * Downloads and extracts text from a PDF URL
 * @param pdfUrl - URL of the PDF to download
 * @returns Extracted text content and page count
 * @throws Error if download fails, PDF has no text, or extraction fails
 */
export async function extractTextFromPDF(pdfUrl: string): Promise<ExtractedPDFContent> {
  // Download PDF content with timeout
  console.log('Downloading PDF content...');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  const pdfResponse = await fetch(pdfUrl, { signal: controller.signal });
  clearTimeout(timeoutId);
  
  if (!pdfResponse.ok) {
    throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`);
  }

  const pdfBuffer = await pdfResponse.arrayBuffer();
  console.log(`PDF downloaded, size: ${pdfBuffer.byteLength} bytes`);

  // Extract text from PDF using pdfjs-serverless (designed for Deno/Edge Functions)
  // Add 45-second timeout to prevent hanging on complex PDFs
  console.log('Extracting text from PDF...');
  
  const extractionPromise = (async () => {
    const pdfjsServerless = await import('https://esm.sh/pdfjs-serverless@0.5.0');
    
    // Resolve the PDF.js library (no worker setup needed with pdfjs-serverless)
    const pdfjsLib = await pdfjsServerless.resolvePDFJS();

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDoc = await loadingTask.promise;
    
    console.log(`PDF loaded, ${pdfDoc.numPages} pages`);

    if (pdfDoc.numPages === 0) {
      throw new Error('PDF has no pages');
    }

    if (pdfDoc.numPages > 50) {
      console.warn(`PDF has ${pdfDoc.numPages} pages, processing first 50 only`);
    }

    // Extract text from all pages (max 50)
    let extractedText = '';
    const maxPages = Math.min(pdfDoc.numPages, 50);
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      extractedText += `\n--- Page ${pageNum} ---\n${pageText}\n`;
    }
    
    return { extractedText, pageCount: pdfDoc.numPages };
  })();
  
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('PDF extraction timeout after 45 seconds. The PDF may be too complex or large.')), 45000)
  );
  
  const { extractedText, pageCount } = await Promise.race([extractionPromise, timeoutPromise]);

  console.log(`Text extraction completed, ${extractedText.length} characters extracted`);

  // Validate extracted text
  const cleanedText = extractedText
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleanedText.length < 100) {
    throw new Error('PDF appears to contain little to no text. Please ensure your PDF has extractable text content, not just images.');
  }

  // Chunk text for large PDFs to optimize token usage
  const maxChunkSize = 8000; // Conservative limit for context window
  let textToAnalyze = cleanedText;
  
  if (cleanedText.length > maxChunkSize) {
    console.log(`Large PDF detected (${cleanedText.length} chars), chunking for optimization`);
    
    // Extract the most relevant sections (first 60% and last 20%)
    const firstPart = cleanedText.substring(0, Math.floor(cleanedText.length * 0.6));
    const lastPart = cleanedText.substring(Math.floor(cleanedText.length * 0.8));
    
    textToAnalyze = firstPart + '\n\n[... content truncated for analysis ...]\n\n' + lastPart;
    console.log(`Chunked to ${textToAnalyze.length} characters for analysis`);
  }

  return {
    text: textToAnalyze,
    pageCount: pageCount
  };
}
