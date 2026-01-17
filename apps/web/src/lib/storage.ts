
import { createClient } from './supabase';

export const storage = {
    async uploadImage(file: File, path: string): Promise<string> {
        const supabase = createClient();

        // Generate a unique filename to avoid "overlapping" or collisions
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error } = await supabase.storage
            .from('shopy-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('shopy-images')
            .getPublicUrl(filePath);

        return publicUrl;
    }
};

