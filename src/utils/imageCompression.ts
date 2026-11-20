export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1, default 0.82
  targetFormat?: 'image/webp' | 'image/jpeg';
}

export interface CompressedImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savedPercentage: number;
  width: number;
  height: number;
  originalFormatted: string;
  compressedFormatted: string;
}

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Compresses an image in the browser using HTML5 Canvas and converts it to WebP.
 * Resizes dimensions to max bounds while keeping the aspect ratio.
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.82,
    targetFormat = 'image/webp',
  } = options;

  // Preserve SVG and GIF without compression (to keep vector sharpness & animations)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savedPercentage: 0,
      width: 0,
      height: 0,
      originalFormatted: formatBytes(file.size),
      compressedFormatted: formatBytes(file.size),
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale if dimensions exceed max bounds
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // Enable high quality bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create compressed image blob'));
              return;
            }

            // Generate clean filename with .webp or .jpg extension
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const extension = targetFormat === 'image/webp' ? 'webp' : 'jpg';
            const cleanBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
            const newFileName = `${cleanBase}.${extension}`;

            const compressedFile = new File([blob], newFileName, {
              type: targetFormat,
              lastModified: Date.now(),
            });

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const savedPercentage = originalSize > compressedSize 
              ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
              : 0;

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              savedPercentage,
              width,
              height,
              originalFormatted: formatBytes(originalSize),
              compressedFormatted: formatBytes(compressedSize),
            });
          },
          targetFormat,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}
