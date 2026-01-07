import { supabase } from './supabase';

/**
 * Uploads a file to Supabase Storage and returns the public URL or a signed URL.
 * Defaults to the 'avatars' bucket as requested by the current setup.
 */
export const uploadFile = async (
    file: File | Blob,
    path: string,
    bucket: string = 'avatars',
    getSigned: boolean = false
): Promise<string> => {
    const sanitizeFileName = (name: string) => {
        return name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^\w.-]/g, "_") // Replace non-alphanumeric (except . and -) with _
            .replace(/_{2,}/g, "_"); // Remove duplicate underscores
    };

    const originalName = (file as File).name || 'upload.jpg';
    const sanitizedName = sanitizeFileName(originalName);
    const fileName = `${path}/${Date.now()}-${sanitizedName}`;

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

    if (getSigned) {
        return getSignedUrl(bucket, fileName);
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return publicUrl;
};

/**
 * Generates a signed URL for a private file.
 */
export const getSignedUrl = async (
    bucket: string,
    path: string,
    expiresIn: number = 3600 // 1 hour
): Promise<string> => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

    if (error) {
        console.error('Error creating signed URL:', error);
        throw error;
    }

    return data.signedUrl;
};
