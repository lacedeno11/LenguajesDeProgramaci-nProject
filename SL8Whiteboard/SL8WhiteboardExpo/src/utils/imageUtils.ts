import * as FileSystem from 'expo-file-system';
import { ImageElement, Point, BoundingBox } from '../types';

/**
 * Generate unique ID for images
 */
export const generateImageId = (prefix: string = 'image'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Calculate bounding box for an image element
 */
export const calculateImageBounds = (
  position: Point,
  size: { width: number; height: number },
  rotation: number = 0
): BoundingBox => {
  // For now, we'll use simple bounds without rotation calculation
  // TODO: Add proper rotation bounds calculation
  return {
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
  };
};

/**
 * Get image dimensions from URI
 */
export const getImageDimensions = async (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = uri;
  });
};

/**
 * Compress image for optimal whiteboard performance
 */
export const compressImage = async (
  uri: string,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<string> => {
  try {
    // For web, we'll use canvas to compress
    if (typeof window !== 'undefined') {
      return await compressImageWeb(uri, maxWidth, maxHeight, quality);
    }
    
    // For native, we'll use the original URI for now
    // TODO: Implement native image compression
    return uri;
  } catch (error) {
    console.warn('Image compression failed, using original:', error);
    return uri;
  }
};

/**
 * Web-specific image compression using canvas
 */
const compressImageWeb = async (
  uri: string,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedUri = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedUri);
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = uri;
  });
};

/**
 * Save image to local storage
 */
export const saveImageToLocal = async (uri: string, filename?: string): Promise<string> => {
  try {
    if (typeof window !== 'undefined') {
      // For web, return the URI as-is (it's already a data URL or blob URL)
      return uri;
    }

    // For native platforms
    const fileUri = `${FileSystem.documentDirectory}images/`;
    const fileName = filename || `image_${Date.now()}.jpg`;
    const localUri = `${fileUri}${fileName}`;

    // Ensure directory exists
    await FileSystem.makeDirectoryAsync(fileUri, { intermediates: true });

    // Copy file to local storage
    await FileSystem.copyAsync({
      from: uri,
      to: localUri,
    });

    return localUri;
  } catch (error) {
    console.warn('Failed to save image locally, using original URI:', error);
    return uri;
  }
};

/**
 * Delete image from local storage
 */
export const deleteImageFromLocal = async (uri: string): Promise<void> => {
  try {
    if (typeof window !== 'undefined') {
      // For web, we can't delete data URLs, so just return
      return;
    }

    // For native platforms
    if (uri.startsWith(FileSystem.documentDirectory || '')) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.warn('Failed to delete image from local storage:', error);
  }
};

/**
 * Create a new ImageElement with proper defaults
 */
export const createImageElement = (
  uri: string,
  position: Point,
  layerId: string,
  size?: { width: number; height: number }
): ImageElement => {
  const defaultSize = size || { width: 200, height: 150 };
  
  return {
    id: generateImageId(),
    layerId,
    uri,
    position,
    size: defaultSize,
    rotation: 0,
    timestamp: Date.now(),
    bounds: calculateImageBounds(position, defaultSize),
  };
};

/**
 * Check if a point is within an image element's bounds
 */
export const isPointInImageBounds = (point: Point, imageElement: ImageElement): boolean => {
  const { bounds } = imageElement;
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
};

/**
 * Update image element position and recalculate bounds
 */
export const updateImagePosition = (
  imageElement: ImageElement,
  newPosition: Point
): ImageElement => {
  return {
    ...imageElement,
    position: newPosition,
    bounds: calculateImageBounds(newPosition, imageElement.size, imageElement.rotation),
  };
};

/**
 * Update image element size and recalculate bounds
 */
export const updateImageSize = (
  imageElement: ImageElement,
  newSize: { width: number; height: number }
): ImageElement => {
  return {
    ...imageElement,
    size: newSize,
    bounds: calculateImageBounds(imageElement.position, newSize, imageElement.rotation),
  };
};

/**
 * Update image element rotation and recalculate bounds
 */
export const updateImageRotation = (
  imageElement: ImageElement,
  newRotation: number
): ImageElement => {
  return {
    ...imageElement,
    rotation: newRotation,
    bounds: calculateImageBounds(imageElement.position, imageElement.size, newRotation),
  };
};