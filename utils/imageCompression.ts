
/**
 * Compresses and resizes an image file using the Browser's Canvas API.
 * 
 * @param file The original File object
 * @param maxWidth The maximum width/height dimension (default: 1200px)
 * @param quality The JPEG quality from 0 to 1 (default: 0.8)
 * @returns A Promise that resolves to the compressed File object
 */
export const compressImage = async (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
    // If it's not an image, return original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const image = new Image();
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = (event) => {
            image.src = event.target?.result as string;
        };
        reader.onerror = (error) => reject(error);

        image.onload = () => {
            const canvas = document.createElement('canvas');
            let width = image.width;
            let height = image.height;

            // Calculate new dimensions
            if (width > maxWidth || height > maxWidth) {
                if (width > height) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                } else {
                    width = Math.round((width * maxWidth) / height);
                    height = maxWidth;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Draw image on canvas
            ctx.drawImage(image, 0, 0, width, height);

            // Convert canvas to Blob/File
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Compression failed'));
                        return;
                    }

                    // Create new file with same name but jpeg extension (or original)
                    // We force jpeg for better compression usually, or keep original type if supported
                    const newFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });

                    console.log(`Image compressed: ${(file.size / 1024).toFixed(2)}KB -> ${(newFile.size / 1024).toFixed(2)}KB`);
                    resolve(newFile);
                },
                'image/jpeg',
                quality
            );
        };
        image.onerror = (error) => reject(error);
    });
};
