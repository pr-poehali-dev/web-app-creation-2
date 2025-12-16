import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { SubParagraph } from '@/types/novel';

interface SubParagraphsEditorProps {
  subParagraphs: SubParagraph[];
  onSubParagraphsChange: (subParagraphs: SubParagraph[]) => void;
}

export default function SubParagraphsEditor({ subParagraphs, onSubParagraphsChange }: SubParagraphsEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const addSubParagraph = () => {
    const newSubParagraph: SubParagraph = {
      id: `sub-${Date.now()}`,
      text: ''
    };
    onSubParagraphsChange([...subParagraphs, newSubParagraph]);
  };

  const removeSubParagraph = (index: number) => {
    onSubParagraphsChange(subParagraphs.filter((_, i) => i !== index));
  };

  const updateSubParagraph = (index: number, value: string) => {
    const updated = [...subParagraphs];
    updated[index] = { ...updated[index], text: value };
    onSubParagraphsChange(updated);
  };

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
            <div key={sub.id} className="border border-border/50 rounded p-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">#{index + 1}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSubParagraph(index)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <Icon name="X" size={12} />
                </Button>
              </div>
              
              <Textarea
                value={sub.text}
                onChange={(e) => updateSubParagraph(index, e.target.value)}
                placeholder="Текст подпараграфа..."
                className="text-xs min-h-[60px]"
              />
            </div>
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