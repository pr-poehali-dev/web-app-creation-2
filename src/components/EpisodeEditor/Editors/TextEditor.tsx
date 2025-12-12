import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TextParagraph } from '@/types/novel';

interface TextEditorProps {
  paragraph: TextParagraph;
  index: number;
  onUpdate: (index: number, updatedParagraph: TextParagraph) => void;
}

function TextEditor({ paragraph, index, onUpdate }: TextEditorProps) {
  return (
    <div className="space-y-2">
      <Textarea
        value={paragraph.content}
        onChange={(e) =>
          onUpdate(index, { ...paragraph, content: e.target.value })
        }
        rows={3}
        className="text-foreground"
      />
      <p className="text-xs text-muted-foreground">
        💡 Подсказка: <code className="bg-secondary px-1 rounded">[слово|подсказка]</code> для интерактивных подсказок, <code className="bg-secondary px-1 rounded">{"{ pause:500}"}</code> для паузы в печати
      </p>
    </div>
  );
}

export default TextEditor;