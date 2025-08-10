import { BaseTool } from './BaseTool';
import { Point, Stroke, ToolSettings } from '../types';

/**
 * Pen tool for smooth drawing with customizable stroke properties
 */
export class PenTool extends BaseTool {
  private points: Point[] = [];

  constructor(settings: ToolSettings) {
    super(settings);
  }

  onStart(point: Point, layerId: string): void {
    this.isActive = true;
    this.points = [point];
    
    this.currentStroke = {
      id: this.generateId(),
      layerId,
      tool: 'pen',
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
    
    // Update current stroke
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
   * Get smoothed points for better drawing quality
   */
  getSmoothedPoints(): Point[] {
    if (this.points.length < 3) return this.points;
    
    const smoothed: Point[] = [this.points[0]];
    
    for (let i = 1; i < this.points.length - 1; i++) {
      const prev = this.points[i - 1];
      const current = this.points[i];
      const next = this.points[i + 1];
      
      // Simple smoothing using average
      const smoothedPoint: Point = {
        x: (prev.x + current.x + next.x) / 3,
        y: (prev.y + current.y + next.y) / 3,
        pressure: current.pressure,
        timestamp: current.timestamp,
      };
      
      smoothed.push(smoothedPoint);
    }
    
    smoothed.push(this.points[this.points.length - 1]);
    return smoothed;
  }
}