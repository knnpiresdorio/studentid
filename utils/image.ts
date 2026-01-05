/**
 * Optimizes image URLs from Supabase Storage by adding transformation parameters.
 * Only applies if the URL is from Supabase Storage.
 */
export const optimizeImage = (url: string | undefined | null, width = 100, height = 100): string => {
    if (!url) return '';

    // Check if it's a Supabase storage URL
    if (url.includes('.supabase.co/storage/v1/object/public/')) {
        // Simple heuristic: if it already has parameters, skip or append
        const hasParams = url.includes('?');
        const params = `width=${width}&height=${height}&resize=cover`;
        return `${url}${hasParams ? '&' : '?'}${params}`;
    }

    return url;
};
