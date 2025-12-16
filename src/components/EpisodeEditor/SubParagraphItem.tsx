import { memo } from 'react';
import { SubParagraph } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface SubParagraphItemProps {
  subParagraph: SubParagraph;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

function SubParagraphItem({ subParagraph, index, onUpdate, onRemove }: SubParagraphItemProps) {
  return (
    <div className="border border-border/50 rounded p-2 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">#{index + 1}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="h-6 w-6 p-0 text-destructive"
        >
          <Icon name="X" size={12} />
        </Button>
      </div>
      
      <Textarea
        value={subParagraph.text}
        onChange={(e) => onUpdate(index, e.target.value)}
        placeholder="Текст подпараграфа..."
        className="text-xs min-h-[60px]"
      />
    </div>
  );
}

export default memo(SubParagraphItem, (prevProps, nextProps) => {
  return (
    prevProps.subParagraph === nextProps.subParagraph &&
    prevProps.index === nextProps.index
  );
});
