import { apiService } from './ApiService';
import { 
  CanvasSession, 
  SaveCanvasRequest, 
  UpdateCanvasRequest,
  SessionsResponse,
  SessionResponse,
  SerializedCanvasState
} from '../types/api';

class CanvasService {

  /**
   * Get all canvas sessions for the current user (max 5)
   */
  async listSessions(): Promise<SessionsResponse> {
    try {
      const response = await apiService.get<CanvasSession[]>('/api/sessions.php');
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to load sessions',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }

  /**
   * Save a new canvas session
   */
  async saveCanvas(title: string, canvasState: SerializedCanvasState): Promise<SessionResponse> {
    try {
      const request: SaveCanvasRequest = {
        title,
        canvas_data: JSON.stringify(canvasState)
      };

      const response = await apiService.post<CanvasSession>('/api/sessions.php', request);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to save canvas',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }

  /**
   * Update an existing canvas session
   */
  async updateCanvas(sessionId: number, title?: string, canvasState?: SerializedCanvasState): Promise<SessionResponse> {
    try {
      const request: UpdateCanvasRequest = {};
      
      if (title !== undefined) {
        request.title = title;
      }
      
      if (canvasState !== undefined) {
        request.canvas_data = JSON.stringify(canvasState);
      }

      const response = await apiService.put<CanvasSession>(`/api/sessions.php?id=${sessionId}`, request);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to update canvas',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }

  /**
   * Load a specific canvas session
   */
  async loadCanvas(sessionId: number): Promise<SessionResponse> {
    try {
      const response = await apiService.get<CanvasSession>(`/api/sessions.php?id=${sessionId}`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to load canvas',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }

  /**
   * Delete a canvas session
   */
  async deleteSession(sessionId: number): Promise<SessionResponse> {
    try {
      const response = await apiService.delete<CanvasSession>(`/api/sessions.php?id=${sessionId}`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to delete session',
        error: error.error || error.message || 'Unknown error'
      };
    }
  }

  /**
   * Parse canvas data from session
   */
  parseCanvasData(session: CanvasSession): SerializedCanvasState | null {
    try {
      return JSON.parse(session.canvas_data);
    } catch (error) {
      console.error('Failed to parse canvas data:', error);
      return null;
    }
  }

  /**
   * Check if user has reached the maximum number of sessions (5)
   */
  async canCreateNewSession(): Promise<{ canCreate: boolean; currentCount: number }> {
    try {
      const response = await this.listSessions();
      
      if (!response.success || !response.data) {
        return { canCreate: false, currentCount: 0 };
      }

      const currentCount = response.data.length;
      const canCreate = currentCount < 5;

      return { canCreate, currentCount };
    } catch (error) {
      console.error('Failed to check session limit:', error);
      return { canCreate: false, currentCount: 0 };
    }
  }

  /**
   * Get session by title (for duplicate checking)
   */
  async getSessionByTitle(title: string): Promise<CanvasSession | null> {
    try {
      const response = await this.listSessions();
      
      if (!response.success || !response.data) {
        return null;
      }

      const session = response.data.find(s => s.title === title);
      return session || null;
    } catch (error) {
      console.error('Failed to find session by title:', error);
      return null;
    }
  }

  /**
   * Generate unique title for new session
   */
  async generateUniqueTitle(baseName: string = 'Canvas'): Promise<string> {
    try {
      const response = await this.listSessions();
      
      if (!response.success || !response.data) {
        return `${baseName} 1`;
      }

      const existingTitles = response.data.map(s => s.title);
      let counter = 1;
      let newTitle = `${baseName} ${counter}`;

      while (existingTitles.includes(newTitle)) {
        counter++;
        newTitle = `${baseName} ${counter}`;
      }

      return newTitle;
    } catch (error) {
      console.error('Failed to generate unique title:', error);
      return `${baseName} ${Date.now()}`;
    }
  }
}

export const canvasService = new CanvasService();
export default CanvasService;
