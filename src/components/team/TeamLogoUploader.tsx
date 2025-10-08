import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamLogoUploaderProps {
  currentLogo?: string;
  onLogoUpdate: (newLogoUrl: string | undefined) => void;
}

export const TeamLogoUploader: React.FC<TeamLogoUploaderProps> = ({
  currentLogo,
  onLogoUpdate,
}) => {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WEBP images are allowed';
    }
    if (file.size > 2097152) { // 2MB
      return 'File size must be less than 2MB';
    }
    return null;
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    setUploading(true);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      // Delete old logo if exists
      if (currentLogo) {
        const urlParts = currentLogo.split('/team-photos/');
        if (urlParts.length === 2) {
          await supabase.storage
            .from('team-photos')
            .remove([urlParts[1]]);
        }
      }

      // Sanitize filename
      const timestamp = Date.now();
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      const fileName = `${session.user.id}/logo-${timestamp}-${sanitizedName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('team-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('team-photos')
        .getPublicUrl(data.path);

      toast({
        title: 'Logo uploaded',
        description: 'Your team logo has been uploaded successfully',
      });

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload logo',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const error = validateFile(file);
    
    if (error) {
      toast({
        title: 'Invalid file',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    const url = await uploadLogo(file);
    if (url) {
      onLogoUpdate(url);
    }
  };

  const handleRemoveLogo = async () => {
    if (!currentLogo) return;

    try {
      // Extract path from URL
      const urlParts = currentLogo.split('/team-photos/');
      if (urlParts.length < 2) {
        throw new Error('Invalid logo URL');
      }
      const filePath = urlParts[1];

      // Delete from storage
      const { error } = await supabase.storage
        .from('team-photos')
        .remove([filePath]);

      if (error) throw error;

      onLogoUpdate(undefined);

      toast({
        title: 'Logo removed',
        description: 'Your team logo has been removed successfully',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to remove logo',
        variant: 'destructive',
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Team Logo</p>
        <p className="text-xs text-muted-foreground">
          Max 2MB • JPEG, PNG, WEBP
        </p>
      </div>

      {currentLogo ? (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border bg-muted group">
          <img
            src={currentLogo}
            alt="Team logo"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label htmlFor="logo-replace" className="cursor-pointer">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="pointer-events-none"
              >
                <Upload className="h-4 w-4 mr-1" />
                Replace
              </Button>
              <input
                id="logo-replace"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={uploading}
              />
            </label>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveLogo}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      ) : (
        <label
          htmlFor="logo-upload"
          className={`relative w-32 h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors flex items-center justify-center ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary hover:bg-accent/50'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <div className="flex flex-col items-center gap-2 p-2">
              <div className="rounded-full bg-primary/10 p-2">
                {isDragging ? (
                  <Upload className="h-5 w-5 text-primary" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-primary" />
                )}
              </div>
              <p className="text-xs font-medium text-center">
                {isDragging ? 'Drop here' : 'Upload Logo'}
              </p>
            </div>
          )}
          <input
            id="logo-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={uploading}
          />
        </label>
      )}

      <p className="text-xs text-muted-foreground">
        💡 A square logo (1:1 aspect ratio) works best
      </p>
    </div>
  );
};
