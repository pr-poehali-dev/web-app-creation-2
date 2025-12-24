import { useRef, useState } from 'react';
import { Scene, Layer } from '@/types/scene';
import { cn } from '@/lib/utils';

interface CanvasProps {
  scene: Scene;
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  zoom: number;
  currentTime: number;
  width: number;
  height: number;
}

export default function Canvas({
  scene,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  zoom,
  width,
  height
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialState, setInitialState] = useState<Partial<Layer> | null>(null);

  const handleMouseDown = (e: React.MouseEvent, layer: Layer, resize = false) => {
    if (layer.locked) return;
    e.stopPropagation();
    
    onSelectLayer(layer.id);
    
    if (resize) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
    
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialState({
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing) return;
    if (!selectedLayerId || !initialState) return;

    const deltaX = (e.clientX - dragStart.x) / zoom;
    const deltaY = (e.clientY - dragStart.y) / zoom;

    if (isDragging) {
      onUpdateLayer(selectedLayerId, {
        x: (initialState.x || 0) + deltaX,
        y: (initialState.y || 0) + deltaY
      });
    } else if (isResizing) {
      onUpdateLayer(selectedLayerId, {
        width: Math.max(20, (initialState.width || 100) + deltaX),
        height: Math.max(20, (initialState.height || 100) + deltaY)
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setInitialState(null);
  };

  const sortedLayers = [...scene.layers].sort((a, b) => a.order - b.order);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div
        ref={canvasRef}
        className="relative shadow-2xl"
        style={{
          width: width * zoom,
          height: height * zoom,
          backgroundColor: scene.layers.find(l => l.type === 'background')?.backgroundColor || '#1a1a2e',
          transformOrigin: 'center',
          transform: `scale(${zoom})`
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => onSelectLayer('')}
      >
        {sortedLayers.map((layer) => {
          if (!layer.visible) return null;

          const isSelected = layer.id === selectedLayerId;

          return (
            <div
              key={layer.id}
              className={cn(
                'absolute cursor-move',
                isSelected && 'ring-2 ring-primary',
                layer.locked && 'cursor-not-allowed'
              )}
              style={{
                left: layer.x,
                top: layer.y,
                width: layer.width,
                height: layer.height,
                transform: `rotate(${layer.rotation}deg) scale(${layer.scale})`,
                opacity: layer.opacity,
                filter: layer.blur ? `blur(${layer.blur}px)` : undefined
              }}
              onMouseDown={(e) => handleMouseDown(e, layer)}
            >
              {layer.type === 'text' && (
                <div
                  className="w-full h-full overflow-hidden"
                  style={{
                    fontSize: layer.fontSize,
                    fontFamily: layer.fontFamily,
                    fontWeight: layer.fontWeight,
                    color: layer.color,
                    textAlign: layer.textAlign,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: layer.textAlign === 'center' ? 'center' : layer.textAlign === 'right' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {layer.textContent}
                </div>
              )}

              {layer.type === 'image' && layer.imageUrl && (
                <img
                  src={layer.imageUrl}
                  alt={layer.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )}

              {layer.type === 'video' && layer.videoUrl && (
                <video
                  src={layer.videoUrl}
                  className="w-full h-full object-cover"
                  controls={false}
                />
              )}

              {layer.type === 'shape' && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: layer.backgroundColor
                  }}
                />
              )}

              {isSelected && !layer.locked && (
                <>
                  <div
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-se-resize"
                    onMouseDown={(e) => handleMouseDown(e, layer, true)}
                  />
                  <div className="absolute -top-8 left-0 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs whitespace-nowrap">
                    {layer.name}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
