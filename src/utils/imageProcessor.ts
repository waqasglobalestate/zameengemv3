/**
 * Client-Side Image Processing Utility
 * Performs compression, resizing, and watermark generation.
 */

export interface ProcessProgress {
  status: "compressing" | "resizing" | "watermarking" | "done" | "idle";
  message: string;
}

export interface ProcessedImage {
  previewUrl: string;
  blob: Blob;
}

export function processImage(
  file: File,
  onProgress?: (progress: ProcessProgress) => void
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    if (onProgress) {
      onProgress({ status: "resizing", message: "Resizing image..." });
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        // Resize parameters (Max 1200px width or height)
        const MAX_DIMENSION = 1200;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not create canvas context"));
          return;
        }

        // Draw image resized
        ctx.drawImage(img, 0, 0, width, height);

        if (onProgress) {
          onProgress({ status: "watermarking", message: "Adding custom watermark..." });
        }

        // Determine font size proportional to width
        const fontSize = Math.max(12, Math.round(width * 0.024));
        ctx.font = `bold ${fontSize}px sans-serif`;
        
        const watermarkText = "ZAMEEN GEM";
        const textMetrics = ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        
        // Define watermark banner dimensions
        const padX = 14;
        const padY = 8;
        const bannerW = textWidth + padX * 2;
        const bannerH = fontSize + padY * 2;
        
        // Placement coordinates: Bottom Right (with 16px offset)
        const bannerX = width - bannerW - 16;
        const bannerY = height - bannerH - 16;

        // Draw banner backdrop (dark transparent navy)
        ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
        ctx.beginPath();
        // Support roundRect fallback
        if (ctx.roundRect) {
          ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 6);
        } else {
          ctx.rect(bannerX, bannerY, bannerW, bannerH);
        }
        ctx.fill();

        // Draw watermark text in gold
        ctx.fillStyle = "#c5a85c";
        ctx.fillText(watermarkText, bannerX + padX, bannerY + fontSize + padY - 2);

        if (onProgress) {
          onProgress({ status: "compressing", message: "Compressing image..." });
        }

        // Small simulated delay for premium UX feedback
        setTimeout(() => {
          try {
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image to Blob"));
                return;
              }
              const previewUrl = URL.createObjectURL(blob);
              
              if (onProgress) {
                onProgress({ status: "done", message: "Processing finished!" });
              }
              resolve({ blob, previewUrl });
            }, "image/jpeg", 0.75);
          } catch (err) {
            reject(err);
          }
        }, 500);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}
