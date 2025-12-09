import { Textarea } from '@/components/ui/textarea';
import { TextParagraph } from '@/types/novel';

interface TextEditorProps {
  paragraph: TextParagraph;
  index: number;
  onUpdate: (index: number, updatedParagraph: TextParagraph) => void;
}

function TextEditor({ paragraph, index, onUpdate }: TextEditorProps) {
  return (
    <Textarea
      value={paragraph.content}
      onChange={(e) =>
        onUpdate(index, { ...paragraph, content: e.target.value })
      }
      rows={3}
      className="text-foreground"
    />
  );
}

export default TextEditor;
