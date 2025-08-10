import { BaseTool } from './BaseTool';
import { Point, Stroke, ToolSettings } from '../types';

/**
 * Pencil tool for textured, pencil-like drawing
 */
export class PencilTool extends BaseTool {
  private points: Point[] = [];

  constructor(settings: ToolSettings) {
    const pencilSettings = {
      ...settings,
      texture: 'textured' as const,
    };
    super(pencilSettings);
  }

  onStart(point: Point, layerId: string): void {
    this.isActive = true;
    this.points = [point];
    
    this.currentStroke = {
      id: this.generateId(),
      layerId,
      tool: 'pencil',
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

    // Add some texture variation to the points
    const texturedPoint = this.addTexture(point);
    this.points.push(texturedPoint);
    
    // Update current stroke
    this.currentStroke.points = [...this.points];
    this.currentStroke.bounds = this.calculateBounds(this.points);
  }

  onEnd(point: Point): Stroke | null {
    if (!this.isActive || !this.currentStroke) return null;

    // Add final point with texture
    const texturedPoint = this.addTexture(point);
    this.points.push(texturedPoint);
    
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
   * Add subtle texture variation to points for pencil effect
   */
  private addTexture(point: Point): Point {
    const textureIntensity = 0.5;
    const randomOffset = () => (Math.random() - 0.5) * textureIntensity;
    
    return {
      ...point,
      x: point.x + randomOffset(),
      y: point.y + randomOffset(),
    };
  }

  /**
   * Get points with pressure-sensitive width variation
   */
  getPressureVariedPoints(): Point[] {
    return this.points.map(point => ({
      ...point,
      // Simulate pressure variation for pencil effect
      pressure: point.pressure || (0.3 + Math.random() * 0.4),
    }));
  }
}