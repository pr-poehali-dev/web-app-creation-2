import { ComicFrame } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState, useRef, useEffect } from 'react';

interface FrameEditorProps {
  frame: ComicFrame;
  onUpdate: (updates: Partial<ComicFrame>) => void;
  onClose: () => void;
}

export default function FrameEditor({ frame, onUpdate, onClose }: FrameEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'move' | 'rotate' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  const transform = frame.transform || { x: 0, y: 0, scale: 1, rotate: 0 };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragMode || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      if (dragMode === 'move') {
        const deltaX = ((e.clientX - startPosRef.current.x) / rect.width) * 100;
        const deltaY = ((e.clientY - startPosRef.current.y) / rect.height) * 100;

        const newX = Math.max(-50, Math.min(50, transform.x + deltaX));
        const newY = Math.max(-50, Math.min(50, transform.y + deltaY));

        onUpdate({
          transform: { ...transform, x: newX, y: newY }
        });

        startPosRef.current = { x: e.clientX, y: e.clientY };
      } else if (dragMode === 'rotate') {
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const degrees = (angle * 180 / Math.PI + 90) % 360;
        
        onUpdate({
          transform: { ...transform, rotate: Math.round(degrees) }
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragMode(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragMode, transform, onUpdate]);

  const handleMouseDown = (e: React.MouseEvent, mode: 'move' | 'rotate') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragMode(mode);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8">
      <div className="bg-card rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Редактор фрейма</h3>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Превью фрейма */}
          <div 
            ref={containerRef}
            className="relative bg-muted/20 rounded-lg overflow-hidden"
            style={{ aspectRatio: '16/9', height: '400px' }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center cursor-move"
              onMouseDown={(e) => handleMouseDown(e, 'move')}
            >
              <div
                className="relative transition-transform"
                style={{
                  width: frame.shape === 'circle' ? '200px' : '300px',
                  height: frame.shape === 'circle' ? '200px' : '200px',
                  transform: `translate(${transform.x}%, ${transform.y}%) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
                }}
              >
                <img
                  src={frame.url || 'https://via.placeholder.com/300x200?text=Frame'}
                  alt={frame.alt || 'Frame'}
                  className="w-full h-full object-cover"
                  style={{
                    borderRadius: frame.shape === 'circle' ? '50%' : '8px',
                  }}
                  draggable={false}
                />
                
                {/* Кнопка поворота */}
                <div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center"
                  onMouseDown={(e) => handleMouseDown(e, 'rotate')}
                >
                  <Icon name="RotateCw" size={14} />
                </div>

                {/* Индикатор выделения */}
                <div className="absolute inset-0 ring-2 ring-primary rounded-lg pointer-events-none" />
              </div>
            </div>

            {/* Подсказка */}
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded text-sm">
              {dragMode === 'move' && 'Перемещение...'}
              {dragMode === 'rotate' && 'Поворот...'}
              {!dragMode && 'Зажмите фрейм для перемещения, или кружок сверху для поворота'}
            </div>
          </div>

          {/* Управление */}
          <div className="grid grid-cols-2 gap-4">
            {/* Форма */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Форма</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={frame.shape === 'square' || !frame.shape ? 'default' : 'outline'}
                  onClick={() => onUpdate({ shape: 'square' })}
                  className="flex-1"
                >
                  <Icon name="Square" size={16} className="mr-2" />
                  Квадрат
                </Button>
                <Button
                  size="sm"
                  variant={frame.shape === 'circle' ? 'default' : 'outline'}
                  onClick={() => onUpdate({ shape: 'circle' })}
                  className="flex-1"
                >
                  <Icon name="Circle" size={16} className="mr-2" />
                  Круг
                </Button>
              </div>
            </div>

            {/* URL изображения */}
            <div className="space-y-2">
              <label className="text-sm font-medium">URL изображения</label>
              <input
                type="text"
                value={frame.url}
                onChange={(e) => onUpdate({ url: e.target.value })}
                className="w-full px-3 py-2 bg-background border rounded-md text-sm"
                placeholder="https://..."
              />
            </div>

            {/* Масштаб */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Масштаб: {transform.scale.toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={transform.scale}
                onChange={(e) => onUpdate({
                  transform: { ...transform, scale: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            {/* Поворот */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Поворот: {transform.rotate}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={transform.rotate}
                onChange={(e) => onUpdate({
                  transform: { ...transform, rotate: parseInt(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            {/* Позиция X */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Позиция X: {transform.x.toFixed(0)}%
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={transform.x}
                onChange={(e) => onUpdate({
                  transform: { ...transform, x: parseInt(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            {/* Позиция Y */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Позиция Y: {transform.y.toFixed(0)}%
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={transform.y}
                onChange={(e) => onUpdate({
                  transform: { ...transform, y: parseInt(e.target.value) }
                })}
                className="w-full"
              />
            </div>
          </div>

          {/* Сброс */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate({
                transform: { x: 0, y: 0, scale: 1, rotate: 0 }
              })}
              className="flex-1"
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Сбросить трансформации
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="flex-1"
            >
              Готово
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
