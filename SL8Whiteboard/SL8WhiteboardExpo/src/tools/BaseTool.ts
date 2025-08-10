import { Point, ToolSettings, Stroke } from '../types';

/**
 * Abstract base class for all drawing tools
 * Provides common functionality and interface for tool implementations
 */
export abstract class BaseTool {
  protected settings: ToolSettings;
  protected isActive: boolean = false;
  protected currentStroke: Stroke | null = null;

  constructor(settings: ToolSettings) {
    this.settings = { ...settings };
  }

  /**
   * Update tool settings
   */
  updateSettings(newSettings: Partial<ToolSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current tool settings
   */
  getSettings(): ToolSettings {
    return { ...this.settings };
  }

  /**
   * Start drawing/tool interaction
   */
  abstract onStart(point: Point, layerId: string): void;

  /**
   * Continue drawing/tool interaction
   */
  abstract onMove(point: Point): void;

  /**
   * End drawing/tool interaction
   */
  abstract onEnd(point: Point): Stroke | null;

  /**
   * Cancel current operation
   */
  cancel(): void {
    this.isActive = false;
    this.currentStroke = null;
  }

  /**
   * Check if tool is currently active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Get current stroke being drawn
   */
  getCurrentStroke(): Stroke | null {
    return this.currentStroke;
  }

  /**
   * Generate unique ID for strokes
   */
  protected generateId(): string {
    return `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate bounding box for a set of points
   */
  protected calculateBounds(points: Point[]) {
    if (points.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}