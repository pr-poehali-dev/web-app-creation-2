import { useRef, useEffect, useState } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import type { SlideObject, Transform } from '@/types/presentation';

interface SlideCanvasProps {
  onObjectSelect?: (objectId: string, multiSelect: boolean) => void;
}

export function SlideCanvas({ onObjectSelect }: SlideCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);

  const presentation = usePresentationStore(s => s.presentation);
  const currentSlideIndex = usePresentationStore(s => s.currentSlideIndex);
  const selectedObjectIds = usePresentationStore(s => s.selectedObjectIds);
  const zoom = usePresentationStore(s => s.zoom);
  const grid = usePresentationStore(s => s.grid);
  const updateObject = usePresentationStore(s => s.updateObject);
  const selectObjects = usePresentationStore(s => s.selectObjects);

  const currentSlide = presentation.slides[currentSlideIndex];
  const { width, height } = presentation.settings;

  const snapToGrid = (value: number) => {
    if (!grid.snap || !grid.enabled) return value;
    return Math.round(value / grid.size) * grid.size;
  };

  const handleMouseDown = (e: React.MouseEvent, objectId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedObjectId(objectId);
    setDragStart({ x: e.clientX, y: e.clientY });

    const multiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
    if (onObjectSelect) {
      onObjectSelect(objectId, multiSelect);
    } else {
      if (multiSelect) {
        if (selectedObjectIds.includes(objectId)) {
          selectObjects(selectedObjectIds.filter(id => id !== objectId));
        } else {
          selectObjects([...selectedObjectIds, objectId]);
        }
      } else {
        selectObjects([objectId]);
      }
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !draggedObjectId) return;

      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      const objectsToMove = selectedObjectIds.includes(draggedObjectId)
        ? selectedObjectIds
        : [draggedObjectId];

      objectsToMove.forEach(id => {
        const object = currentSlide.objects.find(obj => obj.id === id);
        if (object && !object.locked) {
          const newX = snapToGrid(object.transform.x + deltaX);
          const newY = snapToGrid(object.transform.y + deltaY);
          updateObject(id, {
            transform: {
              ...object.transform,
              x: newX,
              y: newY
            }
          });
        }
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedObjectId(null);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedObjectId, dragStart, zoom, selectedObjectIds, currentSlide.objects, updateObject, snapToGrid]);

  const renderObject = (object: SlideObject) => {
    const { transform, opacity, locked, hidden } = object;
    const isSelected = selectedObjectIds.includes(object.id);

    if (hidden) return null;

    const style: React.CSSProperties = {
      position: 'absolute',
      left: transform.x,
      top: transform.y,
      width: transform.width,
      height: transform.height,
      transform: `rotate(${transform.rotation}deg) scale(${transform.scaleX}, ${transform.scaleY})`,
      opacity,
      cursor: locked ? 'not-allowed' : 'move',
      pointerEvents: locked ? 'none' : 'auto',
      border: isSelected ? '2px solid #3b82f6' : 'none',
      boxSizing: 'border-box',
      zIndex: object.zIndex
    };

    switch (object.type) {
      case 'text':
        return (
          <div
            key={object.id}
            style={{
              ...style,
              ...object.style,
              color: object.style.color,
              fontFamily: object.style.fontFamily,
              fontSize: object.style.fontSize,
              fontWeight: object.style.fontWeight,
              fontStyle: object.style.fontStyle,
              textAlign: object.style.textAlign,
              lineHeight: object.style.lineHeight,
              letterSpacing: object.style.letterSpacing,
              textDecoration: object.style.textDecoration,
              padding: '8px',
              overflow: 'auto'
            }}
            onMouseDown={(e) => handleMouseDown(e, object.id)}
          >
            {object.content}
          </div>
        );

      case 'shape':
        const { fill, stroke, strokeWidth } = object.style;
        return (
          <div
            key={object.id}
            style={{
              ...style,
              backgroundColor: fill,
              border: `${strokeWidth}px solid ${stroke}`,
              borderRadius: object.shapeType === 'circle' ? '50%' : '0',
              boxShadow: object.style.shadow
                ? `${object.style.shadow.offsetX}px ${object.style.shadow.offsetY}px ${object.style.shadow.blur}px ${object.style.shadow.color}`
                : undefined
            }}
            onMouseDown={(e) => handleMouseDown(e, object.id)}
          />
        );

      case 'image':
        return (
          <div
            key={object.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, object.id)}
          >
            <img
              src={object.url}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: object.filters
                  ? `brightness(${object.filters.brightness}%) contrast(${object.filters.contrast}%) saturate(${object.filters.saturation}%) blur(${object.filters.blur}px)`
                  : undefined
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div
            key={object.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, object.id)}
          >
            <video
              src={object.url}
              poster={object.poster}
              controls={object.controls}
              autoPlay={object.autoplay}
              loop={object.loop}
              muted={object.muted}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const renderGrid = () => {
    if (!grid.enabled) return null;

    const lines = [];
    for (let x = 0; x <= width; x += grid.size) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }
    for (let y = 0; y <= height; y += grid.size) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      );
    }

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {lines}
      </svg>
    );
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    const { background } = currentSlide;
    
    if (background.type === 'color') {
      return { backgroundColor: background.value };
    }
    
    if (background.type === 'image') {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }

    if (background.type === 'gradient' && background.gradient) {
      const { type, stops, angle = 0 } = background.gradient;
      const stopsStr = stops.map(s => `${s.color} ${s.offset * 100}%`).join(', ');
      
      if (type === 'linear') {
        return { backgroundImage: `linear-gradient(${angle}deg, ${stopsStr})` };
      } else {
        return { backgroundImage: `radial-gradient(circle, ${stopsStr})` };
      }
    }

    return { backgroundColor: '#ffffff' };
  };

  return (
    <div
      ref={canvasRef}
      className="relative overflow-auto"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: width * zoom,
          height: height * zoom,
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          ...getBackgroundStyle(),
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
        onClick={() => selectObjects([])}
      >
        {renderGrid()}
        {currentSlide.objects
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(obj => renderObject(obj))}
      </div>
    </div>
  );
}
