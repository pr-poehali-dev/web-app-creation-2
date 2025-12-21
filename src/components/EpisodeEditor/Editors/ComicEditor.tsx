import { ComicParagraph, MergeLayoutType, ComicFrame } from '@/types/novel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import ComicFrameEditor from '../ComicFrameEditor';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface ComicEditorProps {
  paragraph: ComicParagraph;
  index: number;
  onUpdate: (index: number, updatedParagraph: ComicParagraph) => void;
}

function ComicEditor({ paragraph, index, onUpdate }: ComicEditorProps) {
  const frames = paragraph.frames || [];

  const handleFramesChange = (newFrames: ComicFrame[]) => {
    onUpdate(index, {
      ...paragraph,
      frames: newFrames
    });
  };

  const handleLayoutChange = (newLayout: MergeLayoutType) => {
    onUpdate(index, {
      ...paragraph,
      layout: newLayout
    });
  };

  const handleBothChange = (newLayout: MergeLayoutType, newFrames: ComicFrame[]) => {
    onUpdate(index, {
      ...paragraph,
      layout: newLayout,
      frames: newFrames
    });
  };

  const spanCount = paragraph.spanCount || 1;
  const isPersistent = paragraph.persistAcrossParagraphs || false;

  return (
    <div className="space-y-4">
      {/* Визуальная индикация растяжки */}
      {spanCount > 1 && isPersistent && (
        <Alert className="bg-primary/10 border-primary/30">
          <Icon name="Layers" size={16} className="text-primary" />
          <AlertDescription className="text-xs">
            <strong>Комикс растянут на {spanCount} параграф(ов)</strong>
            <br />
            Эти фреймы будут показываться как фон для следующих {spanCount} текстовых параграфов
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Растянуть на параграфов</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={spanCount}
            onChange={(e) => onUpdate(index, { ...paragraph, spanCount: parseInt(e.target.value) || 1 })}
            className="text-xs h-8"
          />
        </div>

        <div className="flex items-center gap-2 pt-5">
          <Checkbox
            id={`persist-${index}`}
            checked={isPersistent}
            onCheckedChange={(checked) => onUpdate(index, { ...paragraph, persistAcrossParagraphs: !!checked })}
          />
          <Label htmlFor={`persist-${index}`} className="text-xs cursor-pointer">
            Сохранять фон
          </Label>
        </div>
      </div>

      {/* Визуальная схема растяжки */}
      {spanCount > 1 && isPersistent && (
        <div className="border rounded-lg p-3 bg-muted/20">
          <Label className="text-xs font-semibold mb-2 block">Визуализация растяжки:</Label>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/20 rounded text-xs font-medium">
              <Icon name="Film" size={12} />
              Комикс #{index + 1}
            </div>
            <Icon name="ArrowRight" size={12} className="text-muted-foreground" />
            {Array.from({ length: spanCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="px-2 py-1 bg-muted border rounded text-xs">
                  Параграф #{index + 1 + i}
                </div>
                {i < spanCount - 1 && <Icon name="ArrowRight" size={10} className="text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      )}

      <ComicFrameEditor
        frames={frames}
        layout={paragraph.layout || 'horizontal-3'}
        onFramesChange={handleFramesChange}
        onLayoutChange={handleLayoutChange}
        onBothChange={handleBothChange}
      />
    </div>
  );
}

export default ComicEditor;
