import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, ArrowLeft, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PDFUploadInputProps {
  onUpload: (fileUrl: string, fileName: string, file?: File) => void;
  onBack: () => void;
}

const PDFUploadInput = ({ onUpload, onBack }: PDFUploadInputProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file.type === "application/pdf") {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a PDF file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      if (file.size < 1024) {
        toast({
          title: "File too small",
          description: "The PDF file appears to be empty or corrupted",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file (.pdf extension)",
        variant: "destructive",
      });
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // Validate file before upload
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('File must have a .pdf extension');
      }

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}_${sanitizedName}`;

      console.log('Uploading PDF to storage:', uniqueFileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sponsorship-pdfs')
        .upload(uniqueFileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(uploadError.message || 'Failed to upload file to storage');
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sponsorship-pdfs')
        .getPublicUrl(uniqueFileName);

      console.log('Public URL generated:', publicUrl);

      toast({
        title: "Upload successful",
        description: "Starting AI analysis...",
      });

      // Pass the public URL, filename, and file object to parent
      onUpload(publicUrl, selectedFile.name, selectedFile);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload PDF. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <Button
          variant="ghost"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold">Upload Sponsorship PDF</h1>
          <p className="text-muted-foreground">
            Upload your sponsorship deck and we'll extract the information automatically
          </p>
        </div>

        <Card
          className={`p-8 border-2 border-dashed transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {!selectedFile ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your PDF here, or
                </p>
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Browse Files</span>
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                PDF files only, max 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={handleUploadAndAnalyze}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Analyze PDF"
                )}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PDFUploadInput;
