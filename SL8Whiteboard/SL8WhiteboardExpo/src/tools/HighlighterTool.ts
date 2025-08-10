import { BaseTool } from './BaseTool';
import { Point, Stroke, ToolSettings } from '../types';

/**
 * Highlighter tool for semi-transparent highlighting
 */
export class HighlighterTool extends BaseTool {
  private points: Point[] = [];

  constructor(settings: ToolSettings) {
    // Override opacity for highlighter effect
    const highlighterSettings = {
      ...settings,
      opacity: Math.min(settings.opacity, 0.4), // Max 40% opacity for highlighter
      width: Math.max(settings.width, 8), // Minimum width for highlighter
    };
    super(highlighterSettings);
  }

  onStart(point: Point, layerId: string): void {
    this.isActive = true;
    this.points = [point];
    
    this.currentStroke = {
      id: this.generateId(),
      layerId,
      tool: 'highlighter',
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

  updateSettings(newSettings: Partial<ToolSettings>): void {
    // Ensure highlighter constraints
    const constrainedSettings = {
      ...newSettings,
      opacity: newSettings.opacity ? Math.min(newSettings.opacity, 0.4) : undefined,
      width: newSettings.width ? Math.max(newSettings.width, 8) : undefined,
    };
    
    super.updateSettings(constrainedSettings);
  }
}