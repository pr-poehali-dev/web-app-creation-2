import { useState } from 'react';
import { ComicFrame, MergeLayoutType, FrameAnimationType, SubParagraph } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import LayoutAnimationGuide from './LayoutAnimationGuide';

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

export default function ComicFrameEditor({ frames, layout, defaultAnimation, subParagraphs, onFramesChange, onLayoutChange, onAnimationChange, onBothChange }: ComicFrameEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
      case 'pyramid': return 3;
      case 'inverted-pyramid': return 3;
      case 'sandwich': return 3;
      case 'spotlight': return 5;
      case 'filmstrip': return 5;
      default: return 3;
    }
  };

  const handleLayoutChange = (newLayout: MergeLayoutType) => {
    const requiredCount = getRequiredFramesCount(newLayout);
    const currentCount = frames.length;
    
    if (currentCount < requiredCount) {
      // Создаем недостающие фреймы
      const newFrames = [...frames];
      for (let i = currentCount; i < requiredCount; i++) {
        newFrames.push({
          id: `frame-${Date.now()}-${i}`,
          type: 'image',
          url: '',
          textTrigger: ''
        });
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
      // Если фреймов достаточно, просто меняем макет
      onLayoutChange(newLayout);
    }
  };

  const addFrame = () => {
    const newFrame: ComicFrame = {
      id: `frame-${Date.now()}`,
      type: 'image',
      url: ''
    };
    onFramesChange([...frames, newFrame]);
  };

  const removeFrame = (index: number) => {
    onFramesChange(frames.filter((_, i) => i !== index));
  };

  const updateFrame = (index: number, updates: Partial<ComicFrame>) => {
    const updated = [...frames];
    updated[index] = { ...updated[index], ...updates };
    onFramesChange(updated);
  };

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
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Простые</div>
                <SelectItem value="single">◻️ 1 фрейм</SelectItem>
                <SelectItem value="horizontal-2">◼️◼️ 2 в ряд</SelectItem>
                <SelectItem value="horizontal-3">◼️◼️◼️ 3 в ряд</SelectItem>
                <SelectItem value="horizontal-4">◼️◼️◼️◼️ 4 в ряд</SelectItem>
                <SelectItem value="vertical-2">⬛⬛ 2 в столбец</SelectItem>
                <SelectItem value="vertical-3">⬛⬛⬛ 3 в столбец</SelectItem>
                <SelectItem value="vertical-4">⬛⬛⬛⬛ 4 в столбец</SelectItem>
                
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Сетки</div>
                <SelectItem value="grid-2x2">▦ Сетка 2×2</SelectItem>
                <SelectItem value="grid-3x3">▦ Сетка 3×3</SelectItem>
                <SelectItem value="grid-2x3">▦ Сетка 2×3</SelectItem>
                
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Комбинации</div>
                <SelectItem value="horizontal-2-1">◼️◼️◻️ 2+1</SelectItem>
                <SelectItem value="horizontal-1-2">◻️◼️◼️ 1+2</SelectItem>
                <SelectItem value="mosaic-left">⬛◻️◻️ Мозаика ←</SelectItem>
                <SelectItem value="mosaic-right">◻️◻️⬛ Мозаика →</SelectItem>
                <SelectItem value="vertical-left-3">⬛◻️◻️◻️ ← + 3</SelectItem>
                <SelectItem value="vertical-right-3">◻️◻️◻️⬛ 3 + →</SelectItem>
                
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">Креативные</div>
                <SelectItem value="center-large">◻️⬛◻️ Центр</SelectItem>
                <SelectItem value="pyramid">🔺 Пирамида</SelectItem>
                <SelectItem value="inverted-pyramid">🔻 Обр. пирамида</SelectItem>
                <SelectItem value="sandwich">◻️⬛◻️ Сэндвич</SelectItem>
                <SelectItem value="spotlight">◻️⬛◻️ Прожектор</SelectItem>
                <SelectItem value="l-shape">↪️ L-форма</SelectItem>
                <SelectItem value="filmstrip">🎞️ Кинолента</SelectItem>
                <SelectItem value="asymmetric-1">⬛◻️◻️ Асим. 1</SelectItem>
                <SelectItem value="asymmetric-2">◻️⬛◻️ Асим. 2</SelectItem>
                <SelectItem value="asymmetric-3">⬛⬛◻️ Асим. 3</SelectItem>
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
          {frames.map((frame, index) => (
            <div key={frame.id} className="border border-border/50 rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Фрейм {index + 1}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFrame(index)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Icon name="X" size={12} />
                </Button>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">URL изображения</Label>
                <Input
                  value={frame.url}
                  onChange={(e) => updateFrame(index, { url: e.target.value })}
                  placeholder="https://..."
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Триггер (подпараграф для показа)</Label>
                {subParagraphs && subParagraphs.length > 0 ? (
                  <Select 
                    key={`trigger-${frame.id}`}
                    value={frame.subParagraphTrigger || 'none'} 
                    onValueChange={(v) => {
                      console.log('Trigger change:', v, 'for frame:', frame.id);
                      const newTrigger = v === 'none' ? undefined : v;
                      updateFrame(index, { subParagraphTrigger: newTrigger });
                      console.log('Updated frame:', { ...frame, subParagraphTrigger: newTrigger });
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Выберите триггер" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem value="none">⚫ Показывать всегда</SelectItem>
                      {subParagraphs.map((sp, idx) => (
                        <SelectItem key={sp.id} value={sp.id}>
                          {idx + 1}. {sp.text ? (sp.text.substring(0, 40) + (sp.text.length > 40 ? '...' : '')) : '(пустой)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded border border-border/50">
                    Нет подпараграфов. Фрейм будет показан сразу.
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Анимация (своя для фрейма)</Label>
                <Select value={frame.animation || 'default'} onValueChange={(v) => updateFrame(index, { animation: v === 'default' ? undefined : v as FrameAnimationType })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="default">⚙️ По умолчанию</SelectItem>
                    <SelectItem value="none">⚫ Без анимации</SelectItem>
                    <SelectItem value="fade">✨ Плавное</SelectItem>
                    <SelectItem value="blur-in">🌫️ Размытие</SelectItem>
                    <SelectItem value="slide-up">⬆️ Вверх</SelectItem>
                    <SelectItem value="slide-down">⬇️ Вниз</SelectItem>
                    <SelectItem value="slide-left">⬅️ Влево</SelectItem>
                    <SelectItem value="slide-right">➡️ Вправо</SelectItem>
                    <SelectItem value="zoom">🔍 Увеличение</SelectItem>
                    <SelectItem value="zoom-out">🔎 Уменьшение</SelectItem>
                    <SelectItem value="flip">🔄 Переворот</SelectItem>
                    <SelectItem value="flip-x">↕️ Переворот X</SelectItem>
                    <SelectItem value="rotate-in">🌀 Вращение</SelectItem>
                    <SelectItem value="bounce">🏀 Прыжок</SelectItem>
                    <SelectItem value="shake">⚡ Тряска</SelectItem>
                    <SelectItem value="wave">🌊 Волна</SelectItem>
                    <SelectItem value="split-v">⬍⬌ Разд. ↕️</SelectItem>
                    <SelectItem value="split-h">⬍⬌ Разд. ↔️</SelectItem>
                    <SelectItem value="glitch">📺 Глитч</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addFrame}
            className="w-full h-8"
          >
            <Icon name="Plus" size={14} className="mr-1" />
            Добавить фрейм
          </Button>
        </div>
      )}
    </div>
  );
}