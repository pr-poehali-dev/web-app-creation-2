import { useState } from 'react';
import { ComicFrame, MergeLayoutType } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface ComicFrameEditorProps {
  frames: ComicFrame[];
  layout: MergeLayoutType;
  onFramesChange: (frames: ComicFrame[]) => void;
  onLayoutChange: (layout: MergeLayoutType) => void;
}

export default function ComicFrameEditor({ frames, layout, onFramesChange, onLayoutChange }: ComicFrameEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const addFrame = () => {
    const newFrame: ComicFrame = {
      id: `frame-${Date.now()}`,
      type: 'image',
      url: '',
      textTrigger: ''
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
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Комикс-фреймы ({frames.length})</Label>
        <div className="flex gap-2">
          <Select value={layout} onValueChange={(v) => onLayoutChange(v as MergeLayoutType)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">1 фрейм</SelectItem>
              <SelectItem value="horizontal-2">2 в ряд</SelectItem>
              <SelectItem value="horizontal-3">3 в ряд</SelectItem>
              <SelectItem value="horizontal-2-1">2+1</SelectItem>
              <SelectItem value="horizontal-1-2">1+2</SelectItem>
              <SelectItem value="grid-2x2">Сетка 2×2</SelectItem>
              <SelectItem value="mosaic-left">Мозаика ←</SelectItem>
              <SelectItem value="mosaic-right">Мозаика →</SelectItem>
              <SelectItem value="vertical-left-3">← + 3</SelectItem>
              <SelectItem value="vertical-right-3">3 + →</SelectItem>
              <SelectItem value="center-large">Центр</SelectItem>
              <SelectItem value="grid-3x3">Сетка 3×3</SelectItem>
              <SelectItem value="asymmetric-1">Асим. 1</SelectItem>
              <SelectItem value="asymmetric-2">Асим. 2</SelectItem>
              <SelectItem value="l-shape">L-форма</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
          </Button>
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
                <Label className="text-xs text-muted-foreground">Триггер (текст для показа)</Label>
                <Input
                  value={frame.textTrigger || ''}
                  onChange={(e) => updateFrame(index, { textTrigger: e.target.value })}
                  placeholder="Оставьте пустым для показа всегда"
                  className="h-8 text-xs"
                />
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