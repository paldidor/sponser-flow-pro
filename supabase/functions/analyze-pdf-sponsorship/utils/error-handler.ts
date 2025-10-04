/**
 * Error handling and categorization utilities
 * Provides user-friendly error messages and suggested actions
 */

export interface CategorizedError {
  category: string;
  message: string;
  suggestedAction: string;
}

/**
 * Categorizes errors and provides user-friendly messages
 * @param error - The error to categorize
 * @returns Categorized error with helpful message and action
 */
export function categorizeError(error: Error): CategorizedError {
  const originalMessage = error.message;
  const errorDetails = error.stack || '';
  
  let errorMessage = 'PDF analysis failed';
  let errorCategory = 'unknown';
  let suggestedAction = 'Please try again or use manual entry';
  
  // 1. PDF Download Issues
  if (originalMessage.includes('abort') || originalMessage.includes('Failed to download')) {
    errorCategory = 'download';
    errorMessage = 'Unable to download the PDF file';
    suggestedAction = 'Please ensure the file URL is accessible and try uploading again. If the file is very large (>10MB), try compressing it first.';
  } 
  
  // 2. Text Extraction Issues
  else if (originalMessage.includes('little to no text') || originalMessage.includes('text content') || originalMessage.includes('no pages')) {
    errorCategory = 'no_text';
    errorMessage = 'PDF appears to contain no readable text';
    suggestedAction = 'Your PDF may be a scanned image or contain only graphics. Try:\n1. Converting scanned PDFs to text using OCR software\n2. Ensuring your PDF has selectable text (not just images)\n3. Using manual entry instead';
  } 
  
  // 3. AI Service Issues
  else if (originalMessage.includes('Rate limit') || originalMessage.includes('429')) {
    errorCategory = 'rate_limit';
    errorMessage = 'AI analysis service is temporarily at capacity';
    suggestedAction = 'Please wait 30-60 seconds and try again. Peak usage times may require a brief wait.';
  } 
  else if (originalMessage.includes('OpenAI API') || originalMessage.includes('API failed')) {
    errorCategory = 'api_error';
    errorMessage = 'AI analysis service is temporarily unavailable';
    suggestedAction = 'The AI service encountered an issue. Please try again in a few minutes. If the problem persists, use manual entry.';
  }
  
  // 4. Structure/Content Issues
  else if (originalMessage.includes('No valid packages found') || originalMessage.includes('did not extract any')) {
    errorCategory = 'no_packages';
    errorMessage = 'Could not identify sponsorship packages in the PDF';
    suggestedAction = 'Your PDF may not contain clearly labeled package tiers with pricing. Please ensure your PDF includes:\n• Package names (Bronze, Silver, Gold, etc.)\n• Price for each package\n• List of benefits/placements\n\nOr use manual entry to create your packages.';
  }
  else if (originalMessage.includes('parse') || originalMessage.includes('JSON') || originalMessage.includes('understand')) {
    errorCategory = 'unclear_structure';
    errorMessage = 'Unable to interpret the PDF structure';
    suggestedAction = 'The PDF format is unclear or non-standard. Try:\n1. Using a PDF with clearly labeled sections\n2. Ensuring package information is in tables or lists\n3. Using manual entry for better control';
  }
  
  // 5. Timeout Issues
  else if (originalMessage.includes('timeout') || originalMessage.includes('TIMEOUT') || originalMessage.includes('took too long')) {
    errorCategory = 'timeout';
    errorMessage = 'PDF analysis exceeded the time limit';
    suggestedAction = 'The PDF may be too large or complex. Try:\n1. Using a PDF with fewer pages (under 20 pages is ideal)\n2. Removing unnecessary content/images\n3. Breaking into multiple smaller offers\n4. Using manual entry instead';
  }
  
  // 6. Database/System Issues
  else if (originalMessage.includes('Database') || originalMessage.includes('Failed to update') || originalMessage.includes('Failed to create')) {
    errorCategory = 'database';
    errorMessage = 'Failed to save the analysis results';
    suggestedAction = 'A system error occurred while saving. Please try again. If this persists, contact support.';
  }
  
  // 7. Generic/Unknown Issues
  else {
    errorCategory = 'unknown';
    errorMessage = originalMessage.length > 100 ? originalMessage.substring(0, 100) + '...' : originalMessage;
    suggestedAction = 'An unexpected error occurred. Please try:\n1. Reuploading the PDF\n2. Using a different PDF format\n3. Manual entry\n4. Contacting support if the issue persists';
  }
  
  console.error(`[Error Category: ${errorCategory}] ${errorMessage}`);
  console.error('Suggested action:', suggestedAction);
  console.error('Error details:', errorDetails);

  return {
    category: errorCategory,
    message: errorMessage,
    suggestedAction
  };
}
