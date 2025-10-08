import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamPhotoUploaderProps {
  teamProfileId: string;
  currentImages: string[];
  onImagesUpdate: (newImages: string[]) => void;
  maxPhotos?: number;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
}

export const TeamPhotoUploader: React.FC<TeamPhotoUploaderProps> = ({
  teamProfileId,
  currentImages,
  onImagesUpdate,
  maxPhotos = 6,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WEBP images are allowed';
    }
    if (file.size > 5242880) { // 5MB
      return 'File size must be less than 5MB';
    }
    return null;
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const uploadId = Math.random().toString(36).substring(7);
    
    setUploadingFiles(prev => [...prev, { id: uploadId, file, progress: 0 }]);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      // Sanitize filename
      const timestamp = Date.now();
      const sanitizedName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      const fileName = `${session.user.id}/${timestamp}-${sanitizedName}`;

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

      setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload photo',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const filesArray = Array.from(files);
    const availableSlots = maxPhotos - currentImages.length - uploadingFiles.length;

    if (filesArray.length > availableSlots) {
      toast({
        title: 'Too many photos',
        description: `You can only upload ${availableSlots} more photo${availableSlots !== 1 ? 's' : ''}`,
        variant: 'destructive',
      });
      return;
    }

    for (const file of filesArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: 'Invalid file',
          description: `${file.name}: ${error}`,
          variant: 'destructive',
        });
        continue;
      }

      const url = await uploadPhoto(file);
      if (url) {
        const newImages = [...currentImages, url];
        onImagesUpdate(newImages);
      }
    }
  };

  const deletePhoto = async (url: string) => {
    try {
      // Extract path from URL
      const urlParts = url.split('/team-photos/');
      if (urlParts.length < 2) {
        throw new Error('Invalid photo URL');
      }
      const filePath = urlParts[1];

      // Delete from storage
      const { error } = await supabase.storage
        .from('team-photos')
        .remove([filePath]);

      if (error) throw error;

      // Update images array
      const newImages = currentImages.filter(img => img !== url);
      onImagesUpdate(newImages);

      toast({
        title: 'Photo deleted',
        description: 'Photo has been removed successfully',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete photo',
        variant: 'destructive',
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [currentImages.length, uploadingFiles.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const totalPhotos = currentImages.length + uploadingFiles.length;
  const canUpload = totalPhotos < maxPhotos;

  return (
    <div className="space-y-4">
      {/* Photo count indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {totalPhotos} / {maxPhotos} photos
        </p>
        {canUpload && (
          <p className="text-xs text-muted-foreground">
            Max 5MB per photo • JPEG, PNG, WEBP
          </p>
        )}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing photos */}
        {currentImages.map((url, index) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group"
          >
            <img
              src={url}
              alt={`Team photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => deletePhoto(url)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Uploading files */}
        {uploadingFiles.map((upload) => (
          <div
            key={upload.id}
            className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <p className="text-sm font-medium">Uploading...</p>
            </div>
          </div>
        ))}

        {/* Upload button */}
        {canUpload && (
          <label
            htmlFor="photo-upload"
            className={`relative aspect-square rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary hover:bg-accent/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
              <div className="rounded-full bg-primary/10 p-3">
                {isDragging ? (
                  <Upload className="h-6 w-6 text-primary" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-primary" />
                )}
              </div>
              <p className="text-sm font-medium text-center">
                {isDragging ? 'Drop here' : 'Add Photo'}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Drag & drop or click
              </p>
            </div>
            <input
              id="photo-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </label>
        )}
      </div>

      {/* Helper text */}
      {totalPhotos === 0 && (
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm text-accent-foreground">
            💡 <strong>Tip:</strong> Add high-quality photos of your team in action to make your profile stand out to sponsors!
          </p>
        </div>
      )}

      {totalPhotos >= maxPhotos && (
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm text-primary">
            ✓ You've reached the maximum of {maxPhotos} photos
          </p>
        </div>
      )}
    </div>
  );
};
