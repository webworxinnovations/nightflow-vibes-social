
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { toast } from "sonner";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useSupabaseAuth();

  const uploadFile = async (
    file: File,
    folder: 'avatars' | 'covers' | 'general' = 'general'
  ): Promise<string | null> => {
    if (!user) {
      toast.error("Please log in to upload files");
      return null;
    }

    if (!file) {
      toast.error("Please select a file");
      return null;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return null;
    }

    // Validate file size (5MB max)
    if (file.size > 5242880) {
      toast.error("File size must be less than 5MB");
      return null;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);

      toast.success("File uploaded successfully!");
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload file. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (filePath: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.storage
        .from('uploads')
        .remove([filePath]);

      if (error) throw error;

      toast.success("File deleted successfully!");
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error("Failed to delete file.");
      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    isUploading
  };
};
