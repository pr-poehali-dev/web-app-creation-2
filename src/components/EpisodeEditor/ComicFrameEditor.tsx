import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { ComicFrame, MergeLayoutType, FrameAnimationType, SubParagraph } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import LayoutAnimationGuide from './LayoutAnimationGuide';
import ComicFrameItem from './ComicFrameItem';
import equal from 'fast-deep-equal';

const LAYOUT_OPTIONS = [
  { group: 'Простые', items: [
    { value: 'single', label: '◻️ 1 фрейм' },
    { value: 'horizontal-2', label: '◼️◼️ 2 в ряд' },
    { value: 'horizontal-3', label: '◼️◼️◼️ 3 в ряд' },
    { value: 'horizontal-4', label: '◼️◼️◼️◼️ 4 в ряд' },
    { value: 'vertical-2', label: '⬛⬛ 2 в столбец' },
    { value: 'vertical-3', label: '⬛⬛⬛ 3 в столбец' },
    { value: 'vertical-4', label: '⬛⬛⬛⬛ 4 в столбец' }
  ]},
  { group: 'Сетки', items: [
    { value: 'grid-2x2', label: '▦ Сетка 2×2' },
    { value: 'grid-3x3', label: '▦ Сетка 3×3' },
    { value: 'grid-2x3', label: '▦ Сетка 2×3' }
  ]},
  { group: 'Комбинации', items: [
    { value: 'horizontal-2-1', label: '◼️◼️◻️ 2+1' },
    { value: 'horizontal-1-2', label: '◻️◼️◼️ 1+2' },
    { value: 'mosaic-left', label: '⬛◻️◻️ Мозаика ←' },
    { value: 'mosaic-right', label: '◻️◻️⬛ Мозаика →' },
    { value: 'l-shape', label: '↪️ L-форма' }
  ]},
  { group: 'Диагональные', items: [
    { value: 'diagonal-left', label: '◥◤ Диагональ ←' },
    { value: 'diagonal-right', label: '◤◥ Диагональ →' }
  ]},
  { group: 'Треугольники', items: [
    { value: 'triangle-top', label: '▲ Треугольник ↑' },
    { value: 'triangle-bottom', label: '▼ Треугольник ↓' },
    { value: 'triangle-left', label: '◀ Треугольник ←' },
    { value: 'triangle-right', label: '▶ Треугольник →' }
  ]},
  { group: 'Круглые', items: [
    { value: 'circle-2-left', label: '●●▫ 2 круга ←' },
    { value: 'circle-2-right', label: '▫●● 2 круга →' },
    { value: 'circle-3-row', label: '●●● 3 круга в ряд' },
    { value: 'circle-4-corners', label: '● Круги по углам' },
    { value: 'circle-duo-large', label: '●● 2 больших круга' },
    { value: 'circle-trio-overlap', label: '●●● Перекрытие' },
    { value: 'circle-scatter-5', label: '● 5 кругов рассыпью' }
  ]}
] as const;

interface ComicFrameEditorProps {
  frames: ComicFrame[];
  layout: MergeLayoutType;
  defaultAnimation?: FrameAnimationType;
  subParagraphs?: SubParagraph[]; // Список подпараграфов для выбора триггера
  onFramesChange: (frames: ComicFrame[]) => void;
  onLayoutChange: (layout: MergeLayoutType) => void;
  onAnimationChange?: (animation: FrameAnimationType) => void;
  onBothChange?: (layout: MergeLayoutType, frames: ComicFrame[]) => void;
}

function ComicFrameEditor({ frames, layout, defaultAnimation, subParagraphs, onFramesChange, onLayoutChange, onAnimationChange, onBothChange }: ComicFrameEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const framesRef = useRef(frames);
  
  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  // Очищаем старые поля textTrigger из фреймов при первом рендере
  useEffect(() => {
    const hasOldFields = frames.some((f: any) => 'textTrigger' in f);
    if (hasOldFields) {
      console.log('Cleaning old textTrigger fields from frames');
      const cleanedFrames = frames.map((f: any) => {
        const { textTrigger, ...rest } = f;
        return rest as ComicFrame;
      });
      onFramesChange(cleanedFrames);
    }
  }, []); // Выполняется только один раз при монтировании

  const getRequiredFramesCount = (layoutType: MergeLayoutType): number => {
    switch (layoutType) {
      case 'single': return 1;
      case 'horizontal-2': return 2;
      case 'horizontal-3': return 3;
      case 'horizontal-4': return 4;
      case 'vertical-2': return 2;
      case 'vertical-3': return 3;
      case 'vertical-4': return 4;
      case 'horizontal-2-1': return 3;
      case 'horizontal-1-2': return 3;
      case 'grid-2x2': return 4;
      case 'grid-3x3': return 9;
      case 'grid-2x3': return 6;
      case 'mosaic-left': return 3;
      case 'mosaic-right': return 3;
      case 'vertical-left-3': return 4;
      case 'vertical-right-3': return 4;
      case 'center-large': return 5;
      case 'asymmetric-1': return 4;
      case 'asymmetric-2': return 4;
      case 'asymmetric-3': return 5;
      case 'l-shape': return 6;
      case 'sandwich': return 3;
      case 'spotlight': return 5;
      case 'filmstrip': return 5;
      case 'magazine-1': return 6;
      case 'magazine-2': return 9;
      case 'magazine-3': return 8;
      case 'magazine-4': return 8;
      case 'magazine-5': return 8;
      case 'magazine-6': return 8;
      case 'magazine-7': return 8;
      case 'magazine-8': return 2;
      case 'magazine-9': return 8;
      case 'diagonal-left': return 2;
      case 'diagonal-right': return 2;
      case 'triangle-top': return 3;
      case 'triangle-bottom': return 3;
      case 'triangle-left': return 3;
      case 'triangle-right': return 3;
      case 'circle-2-left': return 3;
      case 'circle-2-right': return 3;
      case 'circle-3-row': return 3;
      case 'circle-4-corners': return 5;
      case 'circle-duo-large': return 2;
      case 'circle-trio-overlap': return 3;
      case 'circle-scatter-5': return 5;
      default: return 3;
    }
  };

  const handleLayoutChange = (newLayout: MergeLayoutType) => {
    const requiredCount = getRequiredFramesCount(newLayout);
    const currentCount = frames.length;
    
    if (currentCount !== requiredCount) {
      // Создаем или обрезаем фреймы до нужного количества
      const newFrames = [...frames];
      
      if (currentCount < requiredCount) {
        // Добавляем недостающие фреймы
        for (let i = currentCount; i < requiredCount; i++) {
          newFrames.push({
            id: `frame-${Date.now()}-${i}`,
            type: 'image',
            url: ''
          });
        }
      } else {
        // Обрезаем лишние фреймы
        newFrames.splice(requiredCount);
      }
      
      // Если есть onBothChange, используем его для атомарного обновления
      if (onBothChange) {
        onBothChange(newLayout, newFrames);
      } else {
        // Fallback на раздельные вызовы
        onLayoutChange(newLayout);
        onFramesChange(newFrames);
      }
    } else {
      // Если фреймов ровно столько, сколько нужно - просто меняем макет
      onLayoutChange(newLayout);
    }
  };

  const addFrame = useCallback(() => {
    const newFrame: ComicFrame = {
      id: `frame-${Date.now()}`,
      type: 'image',
      url: ''
    };
    onFramesChange([...framesRef.current, newFrame]);
  }, [onFramesChange]);

  const removeFrame = useCallback((index: number) => {
    onFramesChange(framesRef.current.filter((_, i) => i !== index));
  }, [onFramesChange]);

  const updateFrame = useCallback((index: number, updates: Partial<ComicFrame>) => {
    const updated = [...framesRef.current];
    updated[index] = { ...updated[index], ...updates };
    onFramesChange(updated);
  }, [onFramesChange]);

  const handleBulkUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      
      const uploadImage = async (file: File): Promise<string> => {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const img = new Image();
              img.onload = async () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                const maxDimension = 2048;
                if (width > maxDimension || height > maxDimension) {
                  if (width > height) {
                    height = (height / width) * maxDimension;
                    width = maxDimension;
                  } else {
                    width = (width / height) * maxDimension;
                    height = maxDimension;
                  }
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Canvas context failed');
                
                ctx.drawImage(img, 0, 0, width, height);
                
                let quality = 0.9;
                let base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1];
                
                while (base64.length > 4 * 1024 * 1024 * 1.37 && quality > 0.1) {
                  quality -= 0.1;
                  base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1];
                }
                
                const response = await fetch('https://functions.poehali.dev/a0c6a23f-1d31-4d44-9ca4-fd04d7e97063', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    fileData: base64,
                    fileName: file.name,
                    contentType: file.type
                  })
                });
                
                if (!response.ok) throw new Error('Upload failed');
                const data = await response.json();
                resolve(data.url);
              };
              img.onerror = reject;
              img.src = reader.result as string;
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };
      
      try {
        const urls = await Promise.all(Array.from(files).map(uploadImage));
        const currentFrames = [...framesRef.current];
        
        urls.forEach((url, idx) => {
          if (idx < currentFrames.length) {
            currentFrames[idx] = { ...currentFrames[idx], url };
          } else {
            currentFrames.push({
              id: `frame-${Date.now()}-${idx}`,
              type: 'image',
              url
            });
          }
        });
        
        onFramesChange(currentFrames);
      } catch (error) {
        console.error('Bulk upload failed:', error);
        alert('Ошибка при загрузке изображений');
      }
    };
    
    input.click();
  }, [onFramesChange]);

  return (
    <div className="border border-border rounded-lg p-3 space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Комикс-фреймы ({frames.length})</Label>
            <LayoutAnimationGuide />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Макет</Label>
            <Select value={layout} onValueChange={(v) => handleLayoutChange(v as MergeLayoutType)}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {LAYOUT_OPTIONS.map((group, idx) => (
                  <div key={group.group}>
                    <div className={`px-2 py-1.5 text-xs font-semibold text-muted-foreground ${idx > 0 ? 'mt-2' : ''}`}>
                      {group.group}
                    </div>
                    {group.items.map(item => (
                      <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {onAnimationChange && (
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Анимация по умолчанию</Label>
              <Select value={defaultAnimation || 'none'} onValueChange={(v) => onAnimationChange(v as FrameAnimationType)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[400px]">
                  <SelectItem value="none">⚫ Без анимации</SelectItem>
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Плавные</div>
                  <SelectItem value="fade">✨ Плавное появление</SelectItem>
                  <SelectItem value="blur-in">🌫️ Из размытия</SelectItem>
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Движение</div>
                  <SelectItem value="slide-up">⬆️ Снизу вверх</SelectItem>
                  <SelectItem value="slide-down">⬇️ Сверху вниз</SelectItem>
                  <SelectItem value="slide-left">⬅️ Справа налево</SelectItem>
                  <SelectItem value="slide-right">➡️ Слева направо</SelectItem>
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Масштаб</div>
                  <SelectItem value="zoom">🔍 Увеличение</SelectItem>
                  <SelectItem value="zoom-out">🔎 Уменьшение</SelectItem>
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Вращение</div>
                  <SelectItem value="flip">🔄 Переворот</SelectItem>
                  <SelectItem value="flip-x">↕️ Переворот X</SelectItem>
                  <SelectItem value="rotate-in">🌀 Вращение</SelectItem>
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Динамичные</div>
                  <SelectItem value="bounce">🏀 Прыжок</SelectItem>
                  <SelectItem value="shake">⚡ Тряска</SelectItem>
                  <SelectItem value="wave">🌊 Волна</SelectItem>
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Эффекты</div>
                  <SelectItem value="split-v">⬍⬌ Разделение ↕️</SelectItem>
                  <SelectItem value="split-h">⬍⬌ Разделение ↔️</SelectItem>
                  <SelectItem value="glitch">📺 Глитч</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkUpload}
              className="flex-1 h-8"
            >
              <Icon name="Upload" size={14} className="mr-1" />
              Загрузить изображения
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={addFrame}
              className="flex-1 h-8"
            >
              <Icon name="Plus" size={14} className="mr-1" />
              Добавить фрейм
            </Button>
          </div>

          {frames.map((frame, index) => (
            <ComicFrameItem
              key={frame.id}
              frame={frame}
              index={index}
              subParagraphs={subParagraphs}
              onUpdate={updateFrame}
              onRemove={removeFrame}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(ComicFrameEditor, (prevProps, nextProps) => {
  return (
    prevProps.layout === nextProps.layout &&
    prevProps.defaultAnimation === nextProps.defaultAnimation &&
    equal(prevProps.frames, nextProps.frames) &&
    equal(prevProps.subParagraphs, nextProps.subParagraphs)
  );
});