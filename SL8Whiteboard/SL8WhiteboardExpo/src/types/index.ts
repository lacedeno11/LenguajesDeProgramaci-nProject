// Core data types for the whiteboard application

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StrokeStyle {
  color: string;
  width: number;
  opacity: number;
  lineCap: 'round' | 'square' | 'butt';
  lineJoin: 'round' | 'miter' | 'bevel';
}

export interface Stroke {
  id: string;
  layerId: string;
  tool: ToolType;
  points: Point[];
  style: StrokeStyle;
  timestamp: number;
  bounds: BoundingBox;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
  strokes: string[]; // stroke IDs
  textElements: string[]; // text element IDs
  imageElements: string[]; // image element IDs
}

export interface TextElement {
  id: string;
  layerId: string;
  content: string;
  position: Point;
  style: TextStyle;
  timestamp: number;
  bounds: BoundingBox;
}

export interface TextStyle {
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
}

export interface ImageElement {
  id: string;
  layerId: string;
  uri: string;
  position: Point;
  size: { width: number; height: number };
  rotation: number;
  timestamp: number;
  bounds: BoundingBox;
}

export type ToolType = 
  | 'pen' 
  | 'pencil' 
  | 'highlighter' 
  | 'marker' 
  | 'eraser' 
  | 'text' 
  | 'select-lasso' 
  | 'select-rectangle';

export interface ToolSettings {
  color: string;
  width: number;
  opacity: number;
  texture?: TextureType;
}

export interface Tool {
  type: ToolType;
  settings: ToolSettings;
}

export type TextureType = 'smooth' | 'rough' | 'textured';

export interface ViewState {
  x: number;
  y: number;
  zoom: number;
}

export interface GestureData {
  type: 'pan' | 'zoom' | 'draw' | 'select';
  startPoint: Point;
  currentPoint: Point;
  scale?: number;
  velocity?: Point;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  data: any;
}