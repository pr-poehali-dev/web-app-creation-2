import { useRef, useState, useEffect } from 'react';
import { SlideObject, ImageObject, TextObject, ShapeObject } from '@/types/visual-slide';

interface DraggableObjectProps {
  object: SlideObject;
  isSelected: boolean;
  zoom: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<SlideObject>) => void;
  slideWidth: number;
  slideHeight: number;
}

export default function DraggableObject({
  object,
  isSelected,
  zoom,
  onSelect,
  onUpdate,
  slideWidth,
  slideHeight
}: DraggableObjectProps) {
  const objectRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    onSelect();

    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeStart({
        width: object.size.width,
        height: object.size.height
      });
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX / zoom - object.position.x,
        y: e.clientY / zoom - object.position.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX / zoom - dragStart.x;
        const newY = e.clientY / zoom - dragStart.y;

        onUpdate({
          position: {
            x: Math.max(0, Math.min(slideWidth - object.size.width, newX)),
            y: Math.max(0, Math.min(slideHeight - object.size.height, newY))
          }
        });
      } else if (isResizing) {
        const deltaX = (e.clientX / zoom - object.position.x - resizeStart.width);
        const deltaY = (e.clientY / zoom - object.position.y - resizeStart.height);

        const newWidth = Math.max(50, resizeStart.width + deltaX);
        const newHeight = Math.max(50, resizeStart.height + deltaY);

        onUpdate({
          size: {
            width: Math.min(slideWidth - object.position.x, newWidth),
            height: Math.min(slideHeight - object.position.y, newHeight)
          }
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, zoom]);

  const objectStyle = {
    position: 'absolute' as const,
    left: object.position.x,
    top: object.position.y,
    width: object.size.width,
    height: object.size.height,
    transform: `rotate(${object.transform.rotation}deg) scale(${object.transform.scaleX}, ${object.transform.scaleY})`,
    opacity: object.transform.opacity,
    zIndex: object.zIndex,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  return (
    <div
      ref={objectRef}
      style={objectStyle}
      className={`
        select-none
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${object.locked ? 'pointer-events-none opacity-50' : ''}
      `}
      onMouseDown={handleMouseDown}
    >
      {object.type === 'image' && <ImageRenderer object={object as ImageObject} />}
      {object.type === 'text' && <TextRenderer object={object as TextObject} />}
      {object.type === 'shape' && <ShapeRenderer object={object as ShapeObject} />}

      {isSelected && !object.locked && (
        <>
          <div
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full cursor-se-resize"
            style={{ transform: 'translate(50%, 50%)' }}
          />
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ border: '2px dashed hsl(var(--primary))' }}
          />
        </>
      )}
    </div>
  );
}

function ImageRenderer({ object }: { object: ImageObject }) {
  return (
    <img
      src={object.url}
      alt={object.alt || ''}
      style={{
        width: '100%',
        height: '100%',
        objectFit: object.objectFit || 'cover',
        borderRadius: object.borderRadius || 0,
        filter: object.filter
      }}
      draggable={false}
    />
  );
}

function TextRenderer({ object }: { object: TextObject }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        fontSize: object.fontSize,
        fontFamily: object.fontFamily || 'inherit',
        fontWeight: object.fontWeight || 400,
        textAlign: object.textAlign || 'left',
        color: object.color,
        backgroundColor: object.backgroundColor,
        padding: object.padding || 0,
        borderRadius: object.borderRadius || 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: object.textAlign === 'center' ? 'center' : object.textAlign === 'right' ? 'flex-end' : 'flex-start',
        overflowWrap: 'break-word',
        wordWrap: 'break-word'
      }}
    >
      {object.content}
    </div>
  );
}

function ShapeRenderer({ object }: { object: ShapeObject }) {
  const shapeStyle = {
    width: '100%',
    height: '100%',
    fill: object.fillColor || 'transparent',
    stroke: object.strokeColor || '#000000',
    strokeWidth: object.strokeWidth || 0
  };

  switch (object.shapeType) {
    case 'rectangle':
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: object.fillColor,
            border: object.strokeWidth ? `${object.strokeWidth}px solid ${object.strokeColor}` : 'none'
          }}
        />
      );

    case 'circle':
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: object.fillColor,
            border: object.strokeWidth ? `${object.strokeWidth}px solid ${object.strokeColor}` : 'none'
          }}
        />
      );

    case 'triangle':
      return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          <polygon points="50,10 90,90 10,90" style={shapeStyle} />
        </svg>
      );

    case 'star':
      return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          <polygon
            points="50,5 61,35 92,35 68,55 78,85 50,65 22,85 32,55 8,35 39,35"
            style={shapeStyle}
          />
        </svg>
      );

    default:
      return <div style={shapeStyle} />;
  }
}
