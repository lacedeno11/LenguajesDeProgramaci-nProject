import { BaseTool } from './BaseTool';
import { Point, Stroke, ToolSettings } from '../types';

/**
 * Text tool for adding text elements to the canvas
 */
export class TextTool extends BaseTool {
  private textPosition: Point | null = null;

  constructor(settings: ToolSettings) {
    super(settings);
  }

  onStart(point: Point, layerId: string): void {
    this.isActive = true;
    this.textPosition = point;
    
    // Text tool doesn't create strokes, it creates text elements
    this.currentStroke = null;
  }

  onMove(point: Point): void {
    // Text tool doesn't need to handle move events
    return;
  }

  onEnd(point: Point): Stroke | null {
    this.isActive = false;
    // Text tool doesn't return strokes, text elements are handled separately
    return null;
  }

  /**
   * Get the position where text should be placed
   */
  getTextPosition(): Point | null {
    return this.textPosition;
  }

  /**
   * Clear the text position
   */
  clearTextPosition(): void {
    this.textPosition = null;
  }
}