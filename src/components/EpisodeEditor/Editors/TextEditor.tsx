import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TextParagraph } from '@/types/novel';
import SubParagraphsEditor from '../SubParagraphsEditor';
import ComicFrameEditor from '../ComicFrameEditor';

interface TextEditorProps {
  paragraph: TextParagraph;
  index: number;
  onUpdate: (index: number, updatedParagraph: TextParagraph) => void;
}

function TextEditor({ paragraph, index, onUpdate }: TextEditorProps) {
  return (
    <div className="space-y-3">
      <Textarea
        value={paragraph.content}
        onChange={(e) =>
          onUpdate(index, { ...paragraph, content: e.target.value })
        }
        rows={3}
        className="text-foreground"
      />
      <p className="text-xs text-muted-foreground">
        💡 Подсказка: используйте <code className="bg-secondary px-1 rounded">[слово|подсказка]</code> для интерактивных подсказок
      </p>

      <SubParagraphsEditor
        subParagraphs={paragraph.subParagraphs || []}
        onSubParagraphsChange={(subParagraphs) =>
          onUpdate(index, { ...paragraph, subParagraphs: subParagraphs.length > 0 ? subParagraphs : undefined })
        }
      />

      <ComicFrameEditor
        frames={paragraph.comicFrames || []}
        layout={paragraph.frameLayout || 'horizontal-3'}
        defaultAnimation={paragraph.frameAnimation}
        onFramesChange={(frames) =>
          onUpdate(index, { ...paragraph, comicFrames: frames.length > 0 ? frames : undefined })
        }
        onLayoutChange={(layout) =>
          onUpdate(index, { ...paragraph, frameLayout: layout })
        }
        onAnimationChange={(animation) =>
          onUpdate(index, { ...paragraph, frameAnimation: animation })
        }
        onBothChange={(layout, frames) =>
          onUpdate(index, { 
            ...paragraph, 
            frameLayout: layout, 
            comicFrames: frames.length > 0 ? frames : undefined 
          })
        }
      />
    </div>
  );
}

export default TextEditor;