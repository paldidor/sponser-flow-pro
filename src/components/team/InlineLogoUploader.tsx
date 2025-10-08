import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface InlineLogoUploaderProps {
  teamName: string;
  currentLogo?: string;
  onUploaded?: (newUrl?: string) => void;
}

export const InlineLogoUploader = ({ 
  teamName, 
  currentLogo, 
  onUploaded 
}: InlineLogoUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Image must be less than 2MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const deleteOldLogo = async (logoUrl: string) => {
    try {
      if (logoUrl.includes('team-photos')) {
        const urlParts = logoUrl.split('/team-photos/');
        if (urlParts.length === 2) {
          const filePath = urlParts[1].split('?')[0];
          await supabase.storage.from('team-photos').remove([filePath]);
        }
      }
    } catch (error) {
      console.error('Error deleting old logo:', error);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!validateFile(file)) return;

    setUploading(true);
    const originalUrl = previewUrl;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Delete old logo if exists
      if (currentLogo) {
        await deleteOldLogo(currentLogo);
      }

      // Upload new logo
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/logo-${timestamp}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('team-photos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('team-photos')
        .getPublicUrl(filePath);

      // Update database
      const { error: updateError } = await supabase
        .from('team_profiles')
        .update({ logo: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update UI
      setPreviewUrl(publicUrl);
      onUploaded?.(publicUrl);

      toast({
        title: "Logo updated",
        description: "Your team logo has been updated successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      setPreviewUrl(originalUrl);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo(file);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={uploading}
        className="relative group flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-all"
        aria-label="Upload team logo"
      >
        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white shadow-md">
          <AvatarImage src={previewUrl || ""} alt={teamName} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-primary-dark text-white font-bold text-base sm:text-lg">
            {teamName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload overlay on hover */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Loader2 className="h-4 w-4 text-white animate-spin" />
          ) : (
            <Upload className="h-4 w-4 text-white" />
          )}
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
