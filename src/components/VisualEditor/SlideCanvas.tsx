import { useState, useRef, useEffect } from 'react';
import { VisualSlide, SlideObject } from '@/types/visual-slide';
import DraggableObject from './DraggableObject';

interface SlideCanvasProps {
  slide: VisualSlide;
  selectedObjectId: string;
  zoom: number;
  onSelectObject: (id: string) => void;
  onUpdateObject: (id: string, updates: Partial<SlideObject>) => void;
  onDeleteObject: (id: string) => void;
}

const SLIDE_WIDTH = 1080;
const SLIDE_HEIGHT = 1920;

export default function SlideCanvas({
  slide,
  selectedObjectId,
  zoom,
  onSelectObject,
  onUpdateObject,
  onDeleteObject
}: SlideCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          setCanvasSize({
            width: container.clientWidth,
            height: container.clientHeight
          });
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectObject('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedObjectId && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      onDeleteObject(selectedObjectId);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId]);

  const sortedObjects = [...slide.objects].sort((a, b) => a.zIndex - b.zIndex);

  const slideStyle = {
    width: SLIDE_WIDTH * zoom,
    height: SLIDE_HEIGHT * zoom,
    backgroundColor: slide.backgroundColor,
    backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center overflow-auto p-8"
      onClick={handleCanvasClick}
    >
      <div
        ref={canvasRef}
        className="relative shadow-2xl rounded-lg overflow-hidden"
        style={slideStyle}
      >
        {sortedObjects.map((obj) => (
          <DraggableObject
            key={obj.id}
            object={obj}
            isSelected={obj.id === selectedObjectId}
            zoom={zoom}
            onSelect={() => onSelectObject(obj.id)}
            onUpdate={(updates) => onUpdateObject(obj.id, updates)}
            slideWidth={SLIDE_WIDTH}
            slideHeight={SLIDE_HEIGHT}
          />
        ))}

        {sortedObjects.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">Пустой слайд</p>
              <p className="text-sm">Добавьте объекты из левой панели</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
