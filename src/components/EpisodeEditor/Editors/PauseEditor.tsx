import { memo } from 'react';
import equal from 'fast-deep-equal';
import { Paragraph } from '@/types/novel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PauseEditorProps {
  paragraph: Paragraph & { type: 'pause'; duration?: number };
  index: number;
  onUpdate: (index: number, updatedParagraph: Paragraph) => void;
}

function PauseEditor({ paragraph, index, onUpdate }: PauseEditorProps) {
  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor={`pause-duration-${index}`}>Длительность паузы (мс)</Label>
        <Input
          id={`pause-duration-${index}`}
          type="number"
          min="100"
          max="5000"
          step="100"
          value={paragraph.duration || 500}
          onChange={(e) => onUpdate(index, { ...paragraph, duration: parseInt(e.target.value) || 500 })}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Рекомендуется 300-800 мс для короткой паузы
        </p>
      </div>
    </div>
  );
}

export default memo(PauseEditor, (prevProps, nextProps) => {
  return (
    prevProps.paragraph.id === nextProps.paragraph.id &&
    equal(prevProps.paragraph, nextProps.paragraph) &&
    prevProps.index === nextProps.index
  );
});