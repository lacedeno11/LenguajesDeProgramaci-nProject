import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import Svg, { Path, G, Circle, Text as SvgText, Image as SvgImage } from 'react-native-svg';
import { useAppDispatch, useAppSelector } from '../store';
import { setZoom, setPanOffset, addStroke, removeStroke, addTextElement, addImageElement, updateImageElement, selectImageElement, deselectAllImages } from '../store/slices/canvasSlice';
import { useHistory } from '../hooks/useHistory';
import { PenTool } from '../tools/PenTool';
import { PencilTool } from '../tools/PencilTool';
import { HighlighterTool } from '../tools/HighlighterTool';
import { EraserTool } from '../tools/EraserTool';
import { TextTool } from '../tools/TextTool';
import { Point, Stroke, ImageElement } from '../types';
import { 
  createImageElement, 
  compressImage, 
  saveImageToLocal,
  isPointInImageBounds,
  updateImagePosition 
} from '../utils/imageUtils';

interface CanvasProps {
  width?: number;
  height?: number;
}

const Canvas: React.FC<CanvasProps> = ({
  width = Dimensions.get('window').width,
  height = Dimensions.get('window').height
}) => {
  const dispatch = useAppDispatch();
  const canvasState = useAppSelector(state => state.canvas);
  const toolsState = useAppSelector(state => state.tools);
  const { addToHistory } = useHistory();

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isErasing, setIsErasing] = useState(false);
  const [eraserPosition, setEraserPosition] = useState<Point | null>(null);
  const [showEraserCursor, setShowEraserCursor] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingPosition, setTypingPosition] = useState<Point | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [lastCursorPosition, setLastCursorPosition] = useState<Point>({ x: width / 2, y: height / 2, timestamp: Date.now() });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0, timestamp: Date.now() });
  const currentTool = useRef<PenTool | PencilTool | HighlighterTool | EraserTool | TextTool>(new PenTool(toolsState.currentTool.settings));
  const lastPinchDistance = useRef<number>(0);
  const initialPanOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<View>(null);

  // Create the appropriate tool based on the selected tool type
  React.useEffect(() => {
    const settings = toolsState.currentTool.settings;

    switch (toolsState.currentTool.type) {
      case 'pen':
        currentTool.current = new PenTool(settings);
        setShowEraserCursor(false);
        break;
      case 'pencil':
        currentTool.current = new PencilTool(settings);
        setShowEraserCursor(false);
        break;
      case 'highlighter':
        currentTool.current = new HighlighterTool(settings);
        setShowEraserCursor(false);
        break;
      case 'eraser':
        currentTool.current = new EraserTool(settings);
        setShowEraserCursor(true);
        break;
      case 'text':
        currentTool.current = new TextTool(settings);
        setShowEraserCursor(false);
        break;
      default:
        currentTool.current = new PenTool(settings);
        setShowEraserCursor(false);
    }
  }, [toolsState.currentTool.type, toolsState.currentTool.settings]);

  const convertPointsToPath = (points: Point[]): string => {
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    if (points.length === 1) {
      // Single point - draw a small circle
      path += ` L ${points[0].x + 0.1} ${points[0].y}`;
    } else {
      // Multiple points - create smooth curve
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        path += ` L ${point.x} ${point.y}`;
      }
    }

    return path;
  };

  const getDistance = (touches: any[]): number => {
    if (touches.length < 2) return 0;
    const [touch1, touch2] = touches;
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCanvasPoint = (touch: any): Point => {
    // Use locationX/Y which are relative to the component, not the screen
    const screenX = touch.locationX !== undefined ? touch.locationX : touch.pageX;
    const screenY = touch.locationY !== undefined ? touch.locationY : touch.pageY;

    // Convert screen coordinates to canvas coordinates accounting for zoom and pan
    return {
      x: screenX / canvasState.zoom - canvasState.panOffset.x / canvasState.zoom,
      y: screenY / canvasState.zoom - canvasState.panOffset.y / canvasState.zoom,
      timestamp: Date.now(),
    };
  };

  // Check if a point is within eraser radius of any stroke point
  const checkStrokeCollision = (eraserPoint: Point, stroke: Stroke, eraserRadius: number): boolean => {
    return stroke.points.some(strokePoint => {
      const dx = strokePoint.x - eraserPoint.x;
      const dy = strokePoint.y - eraserPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= eraserRadius;
    });
  };

  // Split a stroke at eraser points with better precision
  const splitStroke = (stroke: Stroke, eraserPoint: Point, eraserRadius: number): Stroke[] => {
    const newStrokes: Stroke[] = [];
    let currentSegment: Point[] = [];
    let isInEraserZone = false;

    for (let i = 0; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      const dx = point.x - eraserPoint.x;
      const dy = point.y - eraserPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const pointInEraser = distance <= eraserRadius;

      if (pointInEraser && !isInEraserZone) {
        // Entering eraser zone - end current segment
        if (currentSegment.length >= 2) {
          const newStroke: Stroke = {
            ...stroke,
            id: `${stroke.id}-split-${newStrokes.length}`,
            points: [...currentSegment],
            bounds: calculateBoundingBox(currentSegment),
            timestamp: Date.now(),
          };
          newStrokes.push(newStroke);
        }
        currentSegment = [];
        isInEraserZone = true;
      } else if (!pointInEraser && isInEraserZone) {
        // Exiting eraser zone - start new segment
        currentSegment = [point];
        isInEraserZone = false;
      } else if (!pointInEraser) {
        // Outside eraser zone - add to current segment
        currentSegment.push(point);
      }
      // If pointInEraser && isInEraserZone, we skip the point (it gets erased)
    }

    // Add final segment if it has enough points
    if (currentSegment.length >= 2) {
      const newStroke: Stroke = {
        ...stroke,
        id: `${stroke.id}-split-${newStrokes.length}`,
        points: [...currentSegment],
        bounds: calculateBoundingBox(currentSegment),
        timestamp: Date.now(),
      };
      newStrokes.push(newStroke);
    }

    return newStrokes;
  };

  // Calculate bounding box for points
  const calculateBoundingBox = (points: Point[]) => {
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
  };

  // Keep track of processed strokes to avoid duplicate processing
  const processedStrokes = useRef<Set<string>>(new Set());

  // Generate unique ID
  const generateId = (prefix: string = 'id'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Check if a point is within any image element
  const getImageAtPoint = (point: Point): ImageElement | null => {
    // Check images in reverse order (top to bottom)
    const imageElements = Object.values(canvasState.imageElements);
    for (let i = imageElements.length - 1; i >= 0; i--) {
      const imageElement = imageElements[i];
      if (isPointInImageBounds(point, imageElement)) {
        return imageElement;
      }
    }
    return null;
  };

  // Handle paste events (Ctrl+V / Cmd+V)
  const handlePaste = async (event: ClipboardEvent) => {
    event.preventDefault();

    const clipboardItems = event.clipboardData?.items;
    if (!clipboardItems) return;

    // Get paste position (center of visible area)
    const pastePosition: Point = {
      x: (width / 2 - canvasState.panOffset.x) / canvasState.zoom,
      y: (height / 2 - canvasState.panOffset.y) / canvasState.zoom,
      timestamp: Date.now(),
    };

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];

      if (item.type.startsWith('image/')) {
        // Handle image paste with improved processing
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const originalUri = e.target?.result as string;
              
              // Compress and process the image
              const compressedUri = await compressImage(originalUri, 800, 600, 0.8);
              const savedUri = await saveImageToLocal(compressedUri);
              
              // Create image element using utility function
              const imageElement = createImageElement(
                savedUri,
                pastePosition,
                'default-layer'
              );

              dispatch(addImageElement(imageElement));
              addToHistory('ADD_IMAGE', { imageElement });
            } catch (error) {
              console.error('Error processing pasted image:', error);
              // Fallback to original implementation
              const imageElement = createImageElement(
                e.target?.result as string,
                pastePosition,
                'default-layer'
              );
              dispatch(addImageElement(imageElement));
              addToHistory('ADD_IMAGE', { imageElement });
            }
          };
          reader.readAsDataURL(file);
        }
      } else if (item.type === 'text/plain') {
        // Handle text paste
        item.getAsString((text) => {
          const textElement = {
            id: generateId('text'),
            layerId: 'default-layer',
            content: text,
            position: pastePosition,
            style: {
              fontSize: 16,
              fontWeight: 'normal' as const,
              fontStyle: 'normal' as const,
              color: '#000000',
            },
            timestamp: Date.now(),
            bounds: {
              x: pastePosition.x,
              y: pastePosition.y,
              width: text.length * 10, // Approximate width
              height: 20, // Approximate height
            },
          };

          dispatch(addTextElement(textElement));
          addToHistory('ADD_TEXT', { textElement });
        });
      }
    }
  };

  // Handle typing directly on canvas
  const handleTyping = (text: string, position: Point) => {
    if (editingTextId) {
      // Update existing text
      const existingText = canvasState.textElements[editingTextId];
      if (existingText) {
        const updatedText = {
          ...existingText,
          content: text,
          bounds: {
            ...existingText.bounds,
            width: text.length * 10,
          },
        };
        dispatch(addTextElement(updatedText));
      }
    } else {
      // Create new text
      const textElement = {
        id: generateId('text'),
        layerId: 'default-layer',
        content: text,
        position: position,
        style: {
          fontSize: 18,
          fontWeight: 'normal' as const,
          fontStyle: 'normal' as const,
          color: toolsState.currentTool.settings.color,
        },
        timestamp: Date.now(),
        bounds: {
          x: position.x,
          y: position.y,
          width: text.length * 12,
          height: 24,
        },
      };
      
      dispatch(addTextElement(textElement));
      addToHistory('ADD_TEXT', { textElement });
    }
  };

  // Handle paste functionality for React Native/Expo
  const handlePasteFromClipboard = async () => {
    console.log('handlePasteFromClipboard called');
    
    try {
      // Get paste position (center of visible area)
      const pastePosition: Point = {
        x: (width / 2 - canvasState.panOffset.x) / canvasState.zoom,
        y: (height / 2 - canvasState.panOffset.y) / canvasState.zoom,
        timestamp: Date.now(),
      };

      console.log('Paste position:', pastePosition);

      // For web platform, use web APIs
      if (typeof window !== 'undefined' && navigator?.clipboard) {
        console.log('Using modern clipboard API');
        
        try {
          // First try to read clipboard items (for images)
          const clipboardItems = await navigator.clipboard.read();
          console.log('Clipboard items:', clipboardItems);
          
          for (const clipboardItem of clipboardItems) {
            console.log('Clipboard item types:', clipboardItem.types);
            
            // Handle images
            for (const type of clipboardItem.types) {
              if (type.startsWith('image/')) {
                console.log('Found image in clipboard:', type);
                
                const blob = await clipboardItem.getType(type);
                console.log('Got blob:', blob);
                
                const reader = new FileReader();
                reader.onload = async (e) => {
                  try {
                    const originalUri = e.target?.result as string;
                    console.log('Image loaded, URI length:', originalUri?.length);
                    
                    // Create image element using utility function
                    const imageElement = createImageElement(
                      originalUri,
                      pastePosition,
                      'default-layer'
                    );

                    console.log('Created image element:', imageElement);
                    dispatch(addImageElement(imageElement));
                    addToHistory('ADD_IMAGE', { imageElement });
                    console.log('Image added to canvas');
                  } catch (error) {
                    console.error('Error processing clipboard image:', error);
                  }
                };
                reader.onerror = (error) => {
                  console.error('FileReader error:', error);
                };
                reader.readAsDataURL(blob);
                return; // Exit after handling first image
              }
            }
          }

          // Handle text if no image was found
          try {
            const text = await navigator.clipboard.readText();
            if (text) {
              console.log('Found text in clipboard:', text);
              const textElement = {
                id: generateId('text'),
                layerId: 'default-layer',
                content: text,
                position: pastePosition,
                style: {
                  fontSize: 16,
                  fontWeight: 'normal' as const,
                  fontStyle: 'normal' as const,
                  color: '#000000',
                },
                timestamp: Date.now(),
                bounds: {
                  x: pastePosition.x,
                  y: pastePosition.y,
                  width: text.length * 10,
                  height: 20,
                },
              };

              dispatch(addTextElement(textElement));
              addToHistory('ADD_TEXT', { textElement });
            }
          } catch (textError) {
            console.log('No text in clipboard or permission denied:', textError);
          }
        } catch (error) {
          console.log('Modern clipboard API failed, trying fallback:', error);
          // Fallback to paste event listener
          if (typeof document !== 'undefined') {
            console.log('Adding paste event listener as fallback');
            document.addEventListener('paste', handlePaste as any, { once: true });
          }
        }
      } else {
        console.log('Clipboard API not available');
      }
    } catch (error) {
      console.error('Error handling paste:', error);
    }
  };

  // Add keyboard handling for web
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on React Native

    const handleKeyDown = async (event: KeyboardEvent) => {
      // Handle typing when in text mode or typing mode
      if (isTyping || toolsState.currentTool.type === 'text') {
        if (event.key === 'Enter') {
          // Finish typing
          if (currentText.trim() && typingPosition) {
            handleTyping(currentText, typingPosition);
          }
          setIsTyping(false);
          setCurrentText('');
          setTypingPosition(null);
          setEditingTextId(null);
          return;
        } else if (event.key === 'Escape') {
          // Cancel typing
          setIsTyping(false);
          setCurrentText('');
          setTypingPosition(null);
          setEditingTextId(null);
          return;
        } else if (event.key === 'Backspace') {
          // Handle backspace
          setCurrentText(prev => prev.slice(0, -1));
          return;
        } else if (event.key.length === 1) {
          // Add character to current text
          setCurrentText(prev => prev + event.key);
          return;
        }
      }

      // Check for Ctrl+V (Windows/Linux) or Cmd+V (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        await handlePasteFromClipboard();
      }
    };

    // Add event listeners for web only
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('paste', handlePaste as any);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('paste', handlePaste as any);
    };
  }, [canvasState.zoom, canvasState.panOffset, width, height, isTyping, currentText, typingPosition]);

  // Handle erasing logic - split strokes instead of removing them completely
  const handleErasing = (point: Point) => {
    if (toolsState.currentTool.type !== 'eraser') return;

    const eraserRadius = toolsState.currentTool.settings.width / 2;
    const strokesToProcess: Stroke[] = [];

    // Find strokes that collide with eraser and haven't been processed yet
    Object.values(canvasState.strokes).forEach((stroke: Stroke) => {
      if (checkStrokeCollision(point, stroke, eraserRadius) && !processedStrokes.current.has(stroke.id)) {
        strokesToProcess.push(stroke);
        processedStrokes.current.add(stroke.id);
      }
    });

    // Process each colliding stroke
    strokesToProcess.forEach(originalStroke => {
      // Remove original stroke
      dispatch(removeStroke(originalStroke.id));
      addToHistory('REMOVE_STROKE', { stroke: originalStroke });

      // Split the stroke and add the segments
      const splitStrokes = splitStroke(originalStroke, point, eraserRadius);
      splitStrokes.forEach(newStroke => {
        dispatch(addStroke(newStroke));
        addToHistory('ADD_STROKE', { stroke: newStroke });
      });
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onShouldBlockNativeResponder: () => false,

    onPanResponderGrant: (evt: GestureResponderEvent) => {
      const { nativeEvent } = evt;

      if (nativeEvent.touches.length === 2) {
        // Two finger gesture - prepare for zoom/pan
        lastPinchDistance.current = getDistance(nativeEvent.touches);
        initialPanOffset.current = { ...canvasState.panOffset };
        return;
      }

      // Single finger - check for image interaction first
      const touch = nativeEvent.touches[0];
      const point = getCanvasPoint(touch);

      // Check if we're touching an image
      const touchedImage = getImageAtPoint(point);
      if (touchedImage) {
        // Start dragging the image
        setIsDraggingImage(true);
        setDraggedImageId(touchedImage.id);
        dispatch(selectImageElement(touchedImage.id));
        
        // Calculate offset from image position to touch point
        setDragOffset({
          x: point.x - touchedImage.position.x,
          y: point.y - touchedImage.position.y,
          timestamp: Date.now(),
        });
        return;
      }

      // If not touching an image, deselect any selected images
      dispatch(deselectAllImages());

      if (toolsState.currentTool.type === 'eraser') {
        setIsErasing(true);
        setEraserPosition(point);
        handleErasing(point);
      } else if (toolsState.currentTool.type === 'text') {
        // Start typing at clicked position
        setIsTyping(true);
        setTypingPosition(point);
        setCurrentText('');
        setEditingTextId(null);
      } else {
        setIsDrawing(true);
        currentTool.current.onStart(point, 'default-layer');

        const stroke = currentTool.current.getCurrentStroke();
        if (stroke) {
          setCurrentPath(convertPointsToPath(stroke.points));
        }
      }
    },

    onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const { nativeEvent } = evt;

      if (nativeEvent.touches.length === 2) {
        // Two finger gesture - zoom and pan
        const currentDistance = getDistance(nativeEvent.touches);

        if (lastPinchDistance.current > 0) {
          const scale = currentDistance / lastPinchDistance.current;
          const newZoom = Math.max(0.25, Math.min(4.0, canvasState.zoom * scale));
          dispatch(setZoom(newZoom));
        }

        // Pan with two fingers
        const newPanOffset = {
          x: initialPanOffset.current.x + gestureState.dx,
          y: initialPanOffset.current.y + gestureState.dy,
        };
        dispatch(setPanOffset(newPanOffset));

        lastPinchDistance.current = currentDistance;
        return;
      }

      // Single finger - continue drawing, erasing, or dragging image
      const touch = nativeEvent.touches[0];
      const point = getCanvasPoint(touch);

      if (isDraggingImage && draggedImageId) {
        // Continue dragging the image
        const draggedImage = canvasState.imageElements[draggedImageId];
        if (draggedImage) {
          const newPosition = {
            x: point.x - dragOffset.x,
            y: point.y - dragOffset.y,
            timestamp: Date.now(),
          };
          
          const updatedImage = updateImagePosition(draggedImage, newPosition);
          dispatch(updateImageElement(updatedImage));
        }
      } else if (toolsState.currentTool.type === 'eraser') {
        // Update eraser position and continue erasing if active
        setEraserPosition(point);
        if (isErasing) {
          handleErasing(point);
        }
      } else if (isDrawing) {
        // Continue drawing
        currentTool.current.onMove(point);

        const stroke = currentTool.current.getCurrentStroke();
        if (stroke) {
          setCurrentPath(convertPointsToPath(stroke.points));
        }
      }
    },

    onPanResponderRelease: (evt: GestureResponderEvent) => {
      const { nativeEvent } = evt;

      if (nativeEvent.touches.length === 0) {
        if (isDraggingImage) {
          // End image dragging
          setIsDraggingImage(false);
          setDraggedImageId(null);
          // Note: We keep the image selected for potential further manipulation
        } else if (isDrawing) {
          // End drawing
          const touch = nativeEvent.changedTouches[0];
          const point = getCanvasPoint(touch);

          const finalStroke = currentTool.current.onEnd(point);
          if (finalStroke) {
            dispatch(addStroke(finalStroke));
            addToHistory('ADD_STROKE', { stroke: finalStroke });
          }

          setIsDrawing(false);
          setCurrentPath('');
        } else if (isErasing) {
          // End erasing
          setIsErasing(false);
          // Clear processed strokes so they can be erased again
          processedStrokes.current.clear();
        }
      }

      lastPinchDistance.current = 0;
    },
  });

  const renderStrokes = () => {
    return Object.values(canvasState.strokes).map((stroke: Stroke) => (
      <Path
        key={stroke.id}
        d={convertPointsToPath(stroke.points)}
        stroke={stroke.style.color}
        strokeWidth={stroke.style.width}
        strokeOpacity={stroke.style.opacity}
        strokeLinecap={stroke.style.lineCap}
        strokeLinejoin={stroke.style.lineJoin}
        fill="none"
      />
    ));
  };

  const renderTextElements = () => {
    return Object.values(canvasState.textElements).map((textElement) => (
      <SvgText
        key={textElement.id}
        x={textElement.position.x}
        y={textElement.position.y}
        fontSize={textElement.style.fontSize}
        fontWeight={textElement.style.fontWeight}
        fontStyle={textElement.style.fontStyle}
        fill={textElement.style.color}
        textAnchor="start"
        alignmentBaseline="hanging"
      >
        {textElement.content}
      </SvgText>
    ));
  };

  const renderImageElements = () => {
    return Object.values(canvasState.imageElements).map((imageElement) => {
      const isSelected = canvasState.selectedImageId === imageElement.id;
      
      return (
        <G key={imageElement.id}>
          {/* Render the image */}
          <SvgImage
            x={imageElement.position.x}
            y={imageElement.position.y}
            width={imageElement.size.width}
            height={imageElement.size.height}
            href={imageElement.uri}
            preserveAspectRatio="xMidYMid meet"
          />
          
          {/* Render selection border if selected */}
          {isSelected && (
            <rect
              x={imageElement.position.x - 2}
              y={imageElement.position.y - 2}
              width={imageElement.size.width + 4}
              height={imageElement.size.height + 4}
              fill="none"
              stroke="#007AFF"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.8}
            />
          )}
          
          {/* Render selection handles if selected */}
          {isSelected && (
            <>
              {/* Corner handles */}
              <Circle
                cx={imageElement.position.x}
                cy={imageElement.position.y}
                r={4}
                fill="#007AFF"
                stroke="white"
                strokeWidth={1}
              />
              <Circle
                cx={imageElement.position.x + imageElement.size.width}
                cy={imageElement.position.y}
                r={4}
                fill="#007AFF"
                stroke="white"
                strokeWidth={1}
              />
              <Circle
                cx={imageElement.position.x}
                cy={imageElement.position.y + imageElement.size.height}
                r={4}
                fill="#007AFF"
                stroke="white"
                strokeWidth={1}
              />
              <Circle
                cx={imageElement.position.x + imageElement.size.width}
                cy={imageElement.position.y + imageElement.size.height}
                r={4}
                fill="#007AFF"
                stroke="white"
                strokeWidth={1}
              />
            </>
          )}
        </G>
      );
    });
  };

  // Handle mouse move for web (to show eraser cursor)
  const handleMouseMove = (event: any) => {
    if (toolsState.currentTool.type === 'eraser' && !isErasing) {
      const rect = event.currentTarget.getBoundingClientRect();
      const point: Point = {
        x: (event.clientX - rect.left) / canvasState.zoom - canvasState.panOffset.x / canvasState.zoom,
        y: (event.clientY - rect.top) / canvasState.zoom - canvasState.panOffset.y / canvasState.zoom,
        timestamp: Date.now(),
      };
      setEraserPosition(point);
    }
  };

  return (
    <View
      style={styles.container}
      {...panResponder.panHandlers}
      // @ts-ignore - onMouseMove is web-only
      onMouseMove={handleMouseMove}
    >
      <Svg
        width={width}
        height={height}
        style={styles.svg}
      >
        <G
          scale={canvasState.zoom}
          translateX={canvasState.panOffset.x / canvasState.zoom}
          translateY={canvasState.panOffset.y / canvasState.zoom}
        >
          {/* Render existing strokes */}
          {renderStrokes()}

          {/* Render text elements */}
          {renderTextElements()}

          {/* Render image elements */}
          {renderImageElements()}

          {/* Render current stroke being drawn */}
          {isDrawing && currentPath && toolsState.currentTool.type !== 'eraser' && (
            <Path
              d={currentPath}
              stroke={toolsState.currentTool.settings.color}
              strokeWidth={toolsState.currentTool.settings.width}
              strokeOpacity={toolsState.currentTool.settings.opacity}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}

          {/* Render eraser cursor */}
          {showEraserCursor && eraserPosition && (
            <Circle
              cx={eraserPosition.x}
              cy={eraserPosition.y}
              r={toolsState.currentTool.settings.width / 2}
              fill="white"
              stroke="black"
              strokeWidth={2}
              opacity={0.8}
            />
          )}

          {/* Render text being typed */}
          {isTyping && typingPosition && (
            <>
              {/* Text cursor/indicator */}
              <Circle
                cx={typingPosition.x}
                cy={typingPosition.y}
                r={2}
                fill={toolsState.currentTool.settings.color}
                opacity={0.8}
              />
              {/* Current text being typed */}
              {currentText && (
                <SvgText
                  x={typingPosition.x}
                  y={typingPosition.y}
                  fontSize={18}
                  fontWeight="normal"
                  fontStyle="normal"
                  fill={toolsState.currentTool.settings.color}
                  textAnchor="start"
                  alignmentBaseline="hanging"
                  opacity={0.8}
                >
                  {currentText}
                </SvgText>
              )}
            </>
          )}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  svg: {
    flex: 1,
  },
});

export default Canvas;