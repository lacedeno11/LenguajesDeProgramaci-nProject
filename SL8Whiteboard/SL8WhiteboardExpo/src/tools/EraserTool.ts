import { BaseTool } from './BaseTool';
import { Point, Stroke, ToolSettings } from '../types';

/**
 * Eraser tool for removing strokes by drawing over them
 */
export class EraserTool extends BaseTool {
  private points: Point[] = [];
  private erasedStrokes: string[] = [];

  constructor(settings: ToolSettings) {
    // Override settings for eraser
    const eraserSettings = {
      ...settings,
      color: '#ffffff', // White color for visual feedback
      opacity: 0.5, // Semi-transparent for visual feedback
      width: Math.max(settings.width, 10), // Minimum width for eraser
    };
    super(eraserSettings);
  }

  onStart(point: Point, layerId: string): void {
    this.isActive = true;
    this.points = [point];
    this.erasedStrokes = [];
    
    // Create a visual stroke for the eraser path (for feedback)
    this.currentStroke = {
      id: this.generateId(),
      layerId,
      tool: 'eraser',
      points: [...this.points],
      style: {
        color: this.settings.color,
        width: this.settings.width,
        opacity: this.settings.opacity,
        lineCap: 'round',
        lineJoin: 'round',
      },
      timestamp: Date.now(),
      bounds: this.calculateBounds(this.points),
    };
  }

  onMove(point: Point): void {
    if (!this.isActive || !this.currentStroke) return;

    this.points.push(point);
    
    // Update current stroke for visual feedback
    this.currentStroke.points = [...this.points];
    this.currentStroke.bounds = this.calculateBounds(this.points);
  }

  onEnd(point: Point): Stroke | null {
    if (!this.isActive || !this.currentStroke) return null;

    // Add final point
    this.points.push(point);
    
    // Finalize stroke
    this.currentStroke.points = [...this.points];
    this.currentStroke.bounds = this.calculateBounds(this.points);
    
    const finalStroke = { ...this.currentStroke };
    
    // Reset state
    this.isActive = false;
    this.currentStroke = null;
    this.points = [];
    
    return finalStroke;
  }

  /**
   * Get the eraser path bounds for collision detection
   */
  getEraserBounds(): { x: number; y: number; width: number; height: number } {
    return this.calculateBounds(this.points);
  }

  /**
   * Get eraser points for collision detection
   */
  getEraserPoints(): Point[] {
    return [...this.points];
  }

  /**
   * Check if a point is within eraser radius
   */
  isPointInEraserRadius(point: Point, eraserPoint: Point, radius: number): boolean {
    const dx = point.x - eraserPoint.x;
    const dy = point.y - eraserPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= radius;
  }

  updateSettings(newSettings: Partial<ToolSettings>): void {
    // Ensure eraser constraints
    const constrainedSettings = {
      ...newSettings,
      color: '#ffffff', // Always white for eraser
      opacity: 0.5, // Always semi-transparent
      width: newSettings.width ? Math.max(newSettings.width, 10) : undefined,
    };
    
    super.updateSettings(constrainedSettings);
  }
}