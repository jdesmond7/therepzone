// Utility functions for image conversion and optimization

/**
 * Converts an image file to WebP format with compression
 * @param file - The original image file
 * @param quality - WebP quality (0-1), default 0.8
 * @param maxWidth - Maximum width for resizing, default 1920
 * @param maxHeight - Maximum height for resizing, default 1920
 * @returns Promise<Blob> - The converted WebP blob
 */
export const convertToWebP = async (
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1920,
  maxHeight: number = 1920
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }
      
      // Set canvas dimensions
      canvas.width = width
      canvas.height = height
      
      // Draw and convert to WebP
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert image to WebP'))
          }
        },
        'image/webp',
        quality
      )
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    // Create object URL for the image
    const url = URL.createObjectURL(file)
    img.src = url
  })
}

/**
 * Converts an image file to WebP and returns both the blob and data URL
 * @param file - The original image file
 * @param quality - WebP quality (0-1), default 0.8
 * @param maxWidth - Maximum width for resizing, default 1920
 * @param maxHeight - Maximum height for resizing, default 1920
 * @returns Promise<{blob: Blob, dataUrl: string}> - The converted WebP blob and data URL
 */
export const convertImageToWebP = async (
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1920,
  maxHeight: number = 1920
): Promise<{ blob: Blob; dataUrl: string }> => {
  const webpBlob = await convertToWebP(file, quality, maxWidth, maxHeight)
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      resolve({ blob: webpBlob, dataUrl })
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read WebP blob'))
    }
    
    reader.readAsDataURL(webpBlob)
  })
}

/**
 * Creates a File object from a Blob with WebP extension
 * @param blob - The WebP blob
 * @param originalFileName - The original file name
 * @returns File - The WebP file
 */
export const createWebPFile = (blob: Blob, originalFileName: string): File => {
  const nameWithoutExtension = originalFileName.replace(/\.[^/.]+$/, '')
  const webpFileName = `${nameWithoutExtension}.webp`
  return new File([blob], webpFileName, { type: 'image/webp' })
} 