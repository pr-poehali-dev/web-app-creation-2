import { ComicParagraph, ComicFrame, MergeLayoutType } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface ComicEditorProps {
  paragraph: ComicParagraph;
  index: number;
  onUpdate: (index: number, updatedParagraph: ComicParagraph) => void;
}

function ComicEditor({ paragraph, index, onUpdate }: ComicEditorProps) {
  const frames = paragraph.frames || [];

  const addFrame = () => {
    const newFrame: ComicFrame = {
      id: `frame-${Date.now()}`,
      type: 'image',
      url: '',
      objectPosition: 'center',
      objectFit: 'cover'
    };
    onUpdate(index, {
      ...paragraph,
      frames: [...frames, newFrame]
    });
  };

  const updateFrame = (frameIndex: number, updatedFrame: ComicFrame) => {
    const updatedFrames = frames.map((f, i) => i === frameIndex ? updatedFrame : f);
    onUpdate(index, {
      ...paragraph,
      frames: updatedFrames
    });
  };

  const removeFrame = (frameIndex: number) => {
    onUpdate(index, {
      ...paragraph,
      frames: frames.filter((_, i) => i !== frameIndex)
    });
  };

  const moveFrame = (frameIndex: number, direction: 'up' | 'down') => {
    const newFrames = [...frames];
    const targetIndex = direction === 'up' ? frameIndex - 1 : frameIndex + 1;
    if (targetIndex >= 0 && targetIndex < newFrames.length) {
      [newFrames[frameIndex], newFrames[targetIndex]] = [newFrames[targetIndex], newFrames[frameIndex]];
      onUpdate(index, {
        ...paragraph,
        frames: newFrames
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Раскладка фреймов</Label>
          <Select
            value={paragraph.layout || 'single'}
            onValueChange={(value) => onUpdate(index, { ...paragraph, layout: value as MergeLayoutType })}
          >
            <SelectTrigger className="text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Одиночный</SelectItem>
              <SelectItem value="horizontal-2">2 в ряд</SelectItem>
              <SelectItem value="horizontal-3">3 в ряд</SelectItem>
              <SelectItem value="vertical-2">2 вертикально</SelectItem>
              <SelectItem value="vertical-3">3 вертикально</SelectItem>
              <SelectItem value="grid-2x2">Сетка 2×2</SelectItem>
              <SelectItem value="grid-3x3">Сетка 3×3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Растянуть на параграфов</Label>
          <Input
            type="number"
            min="1"
            value={paragraph.spanCount || 1}
            onChange={(e) => onUpdate(index, { ...paragraph, spanCount: parseInt(e.target.value) || 1 })}
            className="text-xs h-8"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id={`persist-${index}`}
          checked={paragraph.persistAcrossParagraphs || false}
          onCheckedChange={(checked) => onUpdate(index, { ...paragraph, persistAcrossParagraphs: !!checked })}
        />
        <Label htmlFor={`persist-${index}`} className="text-xs cursor-pointer">
          Сохранять фон при переходе между параграфами
        </Label>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs font-semibold">Фреймы комикса</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFrame}
            className="h-7 text-xs"
          >
            <Icon name="Plus" size={14} className="mr-1" />
            Добавить фрейм
          </Button>
        </div>

        {frames.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Нет фреймов. Добавьте хотя бы один.</p>
        )}

        {frames.map((frame, frameIndex) => (
          <div key={frame.id} className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">Фрейм #{frameIndex + 1}</span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveFrame(frameIndex, 'up')}
                  disabled={frameIndex === 0}
                  className="h-6 w-6 p-0"
                >
                  <Icon name="ChevronUp" size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveFrame(frameIndex, 'down')}
                  disabled={frameIndex === frames.length - 1}
                  className="h-6 w-6 p-0"
                >
                  <Icon name="ChevronDown" size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFrame(frameIndex)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs">URL изображения</Label>
              <Input
                value={frame.url}
                onChange={(e) => updateFrame(frameIndex, { ...frame, url: e.target.value })}
                placeholder="https://..."
                className="text-xs h-8"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Object Fit</Label>
                <Select
                  value={frame.objectFit || 'cover'}
                  onValueChange={(value) => updateFrame(frameIndex, { ...frame, objectFit: value as 'cover' | 'contain' | 'fill' })}
                >
                  <SelectTrigger className="text-xs h-7">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                    <SelectItem value="fill">Fill</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Object Position</Label>
                <Input
                  value={frame.objectPosition || 'center'}
                  onChange={(e) => updateFrame(frameIndex, { ...frame, objectPosition: e.target.value })}
                  placeholder="center"
                  className="text-xs h-7"
                />
              </div>
            </div>

            {frame.url && (
              <div className="mt-2">
                <img
                  src={frame.url}
                  alt={`Frame ${frameIndex + 1}`}
                  className="w-full h-32 object-cover rounded border"
                  style={{
                    objectFit: frame.objectFit || 'cover',
                    objectPosition: frame.objectPosition || 'center'
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComicEditor;
