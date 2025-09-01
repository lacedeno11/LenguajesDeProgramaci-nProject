import { apiService } from './ApiService';

export interface SavedImage {
  id: number;
  title: string;
  filename: string;
  created_at: string;
  size: number;
  image_url: string;
}

export interface ImagesResponse {
  success: boolean;
  message: string;
  data?: {
    images: SavedImage[];
    total: number;
  };
  error?: string;
}

export interface SaveImageResponse {
  success: boolean;
  message: string;
  data?: SavedImage;
  error?: string;
}

class ImageService {
  
  /**
   * Guardar imagen del canvas
   */
  async saveCanvasImage(title: string, imageDataUrl: string): Promise<SaveImageResponse> {
    try {
      console.log('🖼️ ImageService.saveCanvasImage called:', { title, dataLength: imageDataUrl.length });
      
      const response = await apiService.post<SavedImage>('/images_api.php', {
        title,
        image_data: imageDataUrl
      });
      
      console.log('📥 Save image response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ ImageService.saveCanvasImage error:', error);
      return {
        success: false,
        message: 'Failed to save image',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }
  
  /**
   * Obtener lista de imágenes guardadas
   */
  async getImages(): Promise<ImagesResponse> {
    try {
      console.log('📋 ImageService.getImages called');
      
      const response = await apiService.get<{ images: SavedImage[]; total: number }>('/images_api.php');
      
      console.log('📥 Get images response:', response);
      return response;
      
    } catch (error: any) {
      console.error('❌ ImageService.getImages error:', error);
      return {
        success: false,
        message: 'Failed to load images',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }
  
  /**
   * Obtener URL completa de una imagen
   */
  getImageUrl(filename: string): string {
    return `${apiService.getBaseUrl()}/images/${filename}`;
  }
  
  /**
   * Generar imagen del canvas como Data URL
   */
  async captureCanvasAsImage(canvasRef: any): Promise<string | null> {
    try {
      if (typeof window === 'undefined') {
        console.warn('Canvas capture not available on native platforms yet');
        return null;
      }
      
      // Para web, podemos usar HTML5 Canvas API
      console.log('🎨 Canvas capture requested');
      
      // Buscar el elemento SVG en el DOM
      const svgElement = document.querySelector('svg');
      if (svgElement) {
        try {
          // Método 1: Intentar capturar el SVG existente
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
          const svgUrl = URL.createObjectURL(svgBlob);
          
          // Crear canvas para convertir SVG a PNG
          const canvas = document.createElement('canvas');
          canvas.width = svgElement.viewBox?.baseVal?.width || svgElement.clientWidth || 800;
          canvas.height = svgElement.viewBox?.baseVal?.height || svgElement.clientHeight || 600;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            return new Promise((resolve) => {
              const img = new Image();
              img.onload = () => {
                // Fondo blanco
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Dibujar SVG
                ctx.drawImage(img, 0, 0);
                
                // Convertir a PNG
                const pngDataUrl = canvas.toDataURL('image/png');
                URL.revokeObjectURL(svgUrl);
                resolve(pngDataUrl);
              };
              img.onerror = () => {
                URL.revokeObjectURL(svgUrl);
                resolve(this.generatePlaceholderImage());
              };
              img.src = svgUrl;
            });
          }
        } catch (error) {
          console.warn('Error capturing SVG, using placeholder:', error);
        }
      }
      
      // Fallback: generar imagen placeholder
      return this.generatePlaceholderImage();
      
    } catch (error) {
      console.error('Error capturing canvas:', error);
      return null;
    }
  }

  private generatePlaceholderImage(): string {
    // Generar imagen placeholder con timestamp
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Texto principal
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📸 Captura del Canvas', canvas.width / 2, canvas.height / 2 - 40);
      
      // Timestamp
      ctx.font = '24px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText(new Date().toLocaleString(), canvas.width / 2, canvas.height / 2 + 20);
      
      // Info adicional
      ctx.font = '18px Arial';
      ctx.fillStyle = '#999999';
      ctx.fillText('SL8.ai Whiteboard', canvas.width / 2, canvas.height / 2 + 60);
      
      return canvas.toDataURL('image/png');
    }
    
    return '';
  }
}

export const imageService = new ImageService();
export default ImageService;
