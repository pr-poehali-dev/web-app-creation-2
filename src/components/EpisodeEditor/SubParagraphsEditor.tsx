import { useState, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { SubParagraph } from '@/types/novel';
import SubParagraphItem from './SubParagraphItem';

interface SubParagraphsEditorProps {
  subParagraphs: SubParagraph[];
  onSubParagraphsChange: (subParagraphs: SubParagraph[]) => void;
}

function SubParagraphsEditor({ subParagraphs, onSubParagraphsChange }: SubParagraphsEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const addSubParagraph = useCallback(() => {
    const newSubParagraph: SubParagraph = {
      id: `sub-${Date.now()}`,
      text: ''
    };
    onSubParagraphsChange([...subParagraphs, newSubParagraph]);
  }, [subParagraphs, onSubParagraphsChange]);

  const removeSubParagraph = useCallback((index: number) => {
    onSubParagraphsChange(subParagraphs.filter((_, i) => i !== index));
  }, [subParagraphs, onSubParagraphsChange]);

  const updateSubParagraph = useCallback((index: number, value: string) => {
    const updated = [...subParagraphs];
    updated[index] = { ...updated[index], text: value };
    onSubParagraphsChange(updated);
  }, [subParagraphs, onSubParagraphsChange]);

  return (
    <div className="border border-border rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Подпараграфы ({subParagraphs.length})</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0"
        >
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          {subParagraphs.map((sub, index) => (
            <SubParagraphItem
              key={sub.id}
              subParagraph={sub}
              index={index}
              onUpdate={updateSubParagraph}
              onRemove={removeSubParagraph}
            />
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addSubParagraph}
            className="w-full h-8"
          >
            <Icon name="Plus" size={14} className="mr-1" />
            Добавить подпараграф
          </Button>
        </div>
      )}
    </div>
  );
}

export default memo(SubParagraphsEditor, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.subParagraphs) === JSON.stringify(nextProps.subParagraphs);
});