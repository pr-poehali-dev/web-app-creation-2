import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BackgroundImage {
  url: string;
  objectPosition?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  transform?: {
    x: number;
    y: number;
    scale: number;
    rotate: number;
  };
}

interface ImageEditorProps {
  image: BackgroundImage;
  onUpdate: (updates: Partial<BackgroundImage>) => void;
  onClose: () => void;
}

export default function ImageEditor({ image, onUpdate, onClose }: ImageEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [rotateCenter, setRotateCenter] = useState({ x: 0, y: 0 });

  const transform = image.transform || { x: 0, y: 0, scale: 1, rotate: 0 };

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setRotateCenter({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const containerWidth = containerRef.current.offsetWidth;

    const percentX = (deltaX / containerWidth) * 100;
    const percentY = (deltaY / containerWidth) * 100;

    onUpdate({
      transform: {
        ...transform,
        x: Math.max(-50, Math.min(50, transform.x + percentX)),
        y: Math.max(-50, Math.min(50, transform.y + percentY))
      }
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
  };

  const handleRotateMove = (e: MouseEvent) => {
    if (!isRotating || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = (angle * 180) / Math.PI + 90;

    onUpdate({
      transform: {
        ...transform,
        rotate: (degrees + 360) % 360
      }
    });
  };

  const handleRotateEnd = () => {
    setIsRotating(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  useEffect(() => {
    if (isRotating) {
      window.addEventListener('mousemove', handleRotateMove);
      window.addEventListener('mouseup', handleRotateEnd);
      return () => {
        window.removeEventListener('mousemove', handleRotateMove);
        window.removeEventListener('mouseup', handleRotateEnd);
      };
    }
  }, [isRotating]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
          <h3 className="text-lg font-semibold">Редактор изображения</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Превью */}
        <div className="p-6 border-b">
          <div
            ref={containerRef}
            className="relative w-full h-[400px] bg-muted rounded-lg overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
          >
            <div
              ref={imageRef}
              className="absolute inset-0"
              style={{
                transform: `translate(${transform.x}%, ${transform.y}%) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
                transition: isDragging || isRotating ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              <img
                src={image.url}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  objectPosition: image.objectPosition || 'center',
                  objectFit: image.objectFit || 'cover'
                }}
                draggable={false}
              />
            </div>

            {/* Кружок для поворота */}
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shadow-lg z-10 hover:scale-110 transition-transform"
              onMouseDown={handleRotateStart}
            >
              <Icon name="RotateCw" size={16} className="text-white" />
            </div>

            {/* Подсказка */}
            {!isDragging && !isRotating && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full">
                Тяните, чтобы переместить. Кружок — поворот
              </div>
            )}
          </div>
        </div>

        {/* Настройки */}
        <div className="p-6 space-y-6">
          {/* URL изображения */}
          <div className="space-y-2">
            <Label htmlFor="image-url">URL изображения</Label>
            <Input
              id="image-url"
              value={image.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Object Fit */}
          <div className="space-y-2">
            <Label>Режим заполнения</Label>
            <Select
              value={image.objectFit || 'cover'}
              onValueChange={(value) => onUpdate({ objectFit: value as 'cover' | 'contain' | 'fill' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover (заполнить)</SelectItem>
                <SelectItem value="contain">Contain (вместить)</SelectItem>
                <SelectItem value="fill">Fill (растянуть)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Object Position */}
          <div className="space-y-2">
            <Label>Позиция объекта</Label>
            <Select
              value={image.objectPosition || 'center'}
              onValueChange={(value) => onUpdate({ objectPosition: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">По центру</SelectItem>
                <SelectItem value="top">Сверху</SelectItem>
                <SelectItem value="bottom">Снизу</SelectItem>
                <SelectItem value="left">Слева</SelectItem>
                <SelectItem value="right">Справа</SelectItem>
                <SelectItem value="top left">Сверху слева</SelectItem>
                <SelectItem value="top right">Сверху справа</SelectItem>
                <SelectItem value="bottom left">Снизу слева</SelectItem>
                <SelectItem value="bottom right">Снизу справа</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Позиция X */}
            <div className="space-y-2">
              <Label>Позиция X: {transform.x.toFixed(0)}%</Label>
              <Slider
                value={[transform.x]}
                onValueChange={([value]) => onUpdate({
                  transform: { ...transform, x: value }
                })}
                min={-50}
                max={50}
                step={1}
              />
            </div>

            {/* Позиция Y */}
            <div className="space-y-2">
              <Label>Позиция Y: {transform.y.toFixed(0)}%</Label>
              <Slider
                value={[transform.y]}
                onValueChange={([value]) => onUpdate({
                  transform: { ...transform, y: value }
                })}
                min={-50}
                max={50}
                step={1}
              />
            </div>

            {/* Масштаб */}
            <div className="space-y-2">
              <Label>Масштаб: {transform.scale.toFixed(2)}x</Label>
              <Slider
                value={[transform.scale]}
                onValueChange={([value]) => onUpdate({
                  transform: { ...transform, scale: value }
                })}
                min={0.5}
                max={2}
                step={0.01}
              />
            </div>

            {/* Поворот */}
            <div className="space-y-2">
              <Label>Поворот: {transform.rotate.toFixed(0)}°</Label>
              <Slider
                value={[transform.rotate]}
                onValueChange={([value]) => onUpdate({
                  transform: { ...transform, rotate: value }
                })}
                min={0}
                max={360}
                step={1}
              />
            </div>
          </div>

          {/* Сброс трансформаций */}
          <Button
            variant="outline"
            onClick={() => onUpdate({
              transform: { x: 0, y: 0, scale: 1, rotate: 0 }
            })}
            className="w-full"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Сбросить трансформации
          </Button>
        </div>

        {/* Нижняя панель */}
        <div className="flex justify-end gap-2 p-4 border-t bg-muted/50">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </div>
  );
}
