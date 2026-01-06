import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 * Defaults to the 'avatars' bucket as requested by the current setup.
 */
export const uploadFile = async (
    file: File | Blob,
    path: string,
    bucket: string = 'avatars'
): Promise<string> => {
    const fileName = `${path}/${Date.now()}-${(file as File).name || 'upload'}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error uploading file:', error);
        throw error;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return publicUrl;
};
