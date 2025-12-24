import { useState } from 'react';
import { Animation, Keyframe, TransformProperty, EasingFunction } from '@/types/scene';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AnimationEditorProps {
  animation: Animation;
  onUpdate: (updates: Partial<Animation>) => void;
  onDelete: () => void;
}

const TRANSFORM_PROPERTIES: { value: TransformProperty; label: string }[] = [
  { value: 'x', label: 'Позиция X' },
  { value: 'y', label: 'Позиция Y' },
  { value: 'scale', label: 'Масштаб' },
  { value: 'scaleX', label: 'Масштаб X' },
  { value: 'scaleY', label: 'Масштаб Y' },
  { value: 'rotation', label: 'Поворот' },
  { value: 'opacity', label: 'Прозрачность' },
  { value: 'blur', label: 'Размытие' },
  { value: 'width', label: 'Ширина' },
  { value: 'height', label: 'Высота' }
];

const EASING_FUNCTIONS: { value: EasingFunction; label: string }[] = [
  { value: 'linear', label: 'Линейная' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In-Out' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'elastic', label: 'Elastic' },
  { value: 'back', label: 'Back' }
];

export default function AnimationEditor({ animation, onUpdate, onDelete }: AnimationEditorProps) {
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);

  const addKeyframe = () => {
    const newKeyframe: Keyframe = {
      id: `kf-${Date.now()}`,
      time: 0,
      property: 'opacity',
      value: 1,
      easing: 'ease-in-out'
    };

    onUpdate({
      keyframes: [...animation.keyframes, newKeyframe]
    });
    setSelectedKeyframeId(newKeyframe.id);
  };

  const updateKeyframe = (keyframeId: string, updates: Partial<Keyframe>) => {
    onUpdate({
      keyframes: animation.keyframes.map(kf =>
        kf.id === keyframeId ? { ...kf, ...updates } : kf
      )
    });
  };

  const deleteKeyframe = (keyframeId: string) => {
    onUpdate({
      keyframes: animation.keyframes.filter(kf => kf.id !== keyframeId)
    });
    if (selectedKeyframeId === keyframeId) {
      setSelectedKeyframeId(null);
    }
  };

  const selectedKeyframe = animation.keyframes.find(kf => kf.id === selectedKeyframeId);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Input
          value={animation.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="text-lg font-semibold"
        />
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Icon name="Trash2" size={18} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label className="text-xs">Длительность (сек)</Label>
          <Input
            type="number"
            value={animation.duration}
            onChange={(e) => onUpdate({ duration: parseFloat(e.target.value) })}
            step={0.1}
            min={0.1}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Задержка (сек)</Label>
          <Input
            type="number"
            value={animation.delay || 0}
            onChange={(e) => onUpdate({ delay: parseFloat(e.target.value) })}
            step={0.1}
            min={0}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">Ключевые кадры</span>
        <Button variant="outline" size="sm" onClick={addKeyframe}>
          <Icon name="Plus" size={14} className="mr-1" />
          Добавить
        </Button>
      </div>

      <ScrollArea className="h-64 mb-4">
        <div className="space-y-2">
          {animation.keyframes
            .sort((a, b) => a.time - b.time)
            .map(keyframe => (
              <div
                key={keyframe.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                  selectedKeyframeId === keyframe.id ? 'bg-accent' : ''
                }`}
                onClick={() => setSelectedKeyframeId(keyframe.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {TRANSFORM_PROPERTIES.find(p => p.value === keyframe.property)?.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {keyframe.time}s → {keyframe.value}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteKeyframe(keyframe.id);
                    }}
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </ScrollArea>

      {selectedKeyframe && (
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold">Редактирование кадра</h4>

          <div>
            <Label className="text-xs">Свойство</Label>
            <Select
              value={selectedKeyframe.property}
              onValueChange={(v) => updateKeyframe(selectedKeyframe.id, { property: v as TransformProperty })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSFORM_PROPERTIES.map(prop => (
                  <SelectItem key={prop.value} value={prop.value}>
                    {prop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Время (сек)</Label>
            <Input
              type="number"
              value={selectedKeyframe.time}
              onChange={(e) => updateKeyframe(selectedKeyframe.id, { time: parseFloat(e.target.value) })}
              step={0.1}
              min={0}
              max={animation.duration}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Значение</Label>
            <Input
              type="number"
              value={selectedKeyframe.value as number}
              onChange={(e) => updateKeyframe(selectedKeyframe.id, { value: parseFloat(e.target.value) })}
              step={0.1}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Easing</Label>
            <Select
              value={selectedKeyframe.easing}
              onValueChange={(v) => updateKeyframe(selectedKeyframe.id, { easing: v as EasingFunction })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EASING_FUNCTIONS.map(easing => (
                  <SelectItem key={easing.value} value={easing.value}>
                    {easing.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </Card>
  );
}
