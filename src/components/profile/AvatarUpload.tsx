
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
  username: string;
}

export const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate, username }: AvatarUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { uploadFile, isUploading } = useFileUpload();
  const { user } = useSupabaseAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload file
    const uploadedUrl = await uploadFile(file, 'avatars');
    
    if (uploadedUrl && user) {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: uploadedUrl })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error("Failed to update profile picture");
        setPreviewUrl(null);
      } else {
        onAvatarUpdate(uploadedUrl);
        toast.success("Profile picture updated!");
      }
    }

    // Clean up preview
    URL.revokeObjectURL(preview);
    setPreviewUrl(null);
  };

  const removeAvatar = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', user.id);

    if (error) {
      console.error('Error removing avatar:', error);
      toast.error("Failed to remove profile picture");
    } else {
      onAvatarUpdate('');
      toast.success("Profile picture removed");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage 
          src={previewUrl || currentAvatarUrl || undefined}
          alt={username}
        />
        <AvatarFallback className="text-lg">
          {username[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-1" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>

          {currentAvatarUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeAvatar}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG, GIF or WebP. Max 5MB.
        </p>
      </div>

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
