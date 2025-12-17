import { useCallback, useRef, useEffect, memo } from 'react';
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
  const paragraphRef = useRef(paragraph);
  
  useEffect(() => {
    paragraphRef.current = paragraph;
  }, [paragraph]);

  const handleFramesChange = useCallback((frames: any[]) => {
    onUpdate(index, { ...paragraphRef.current, comicFrames: frames.length > 0 ? frames : undefined });
  }, [index, onUpdate]);

  const handleLayoutChange = useCallback((layout: any) => {
    onUpdate(index, { ...paragraphRef.current, frameLayout: layout });
  }, [index, onUpdate]);

  const handleAnimationChange = useCallback((animation: any) => {
    onUpdate(index, { ...paragraphRef.current, frameAnimation: animation });
  }, [index, onUpdate]);

  const handleBothChange = useCallback((layout: any, frames: any[]) => {
    const current = paragraphRef.current;
    onUpdate(index, { 
      ...current,
      content: current.content, // Явно сохраняем текущий контент
      subParagraphs: current.subParagraphs, // Явно сохраняем подпараграфы
      frameLayout: layout, 
      comicFrames: frames.length > 0 ? frames : undefined 
    });
  }, [index, onUpdate]);

  const handleSubParagraphsChange = useCallback((subParagraphs: any[]) => {
    onUpdate(index, { ...paragraphRef.current, subParagraphs: subParagraphs.length > 0 ? subParagraphs : undefined });
  }, [index, onUpdate]);

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
        onSubParagraphsChange={handleSubParagraphsChange}
      />

      <ComicFrameEditor
        frames={paragraph.comicFrames || []}
        layout={paragraph.frameLayout || 'horizontal-3'}
        defaultAnimation={paragraph.frameAnimation}
        subParagraphs={paragraph.subParagraphs}
        onFramesChange={handleFramesChange}
        onLayoutChange={handleLayoutChange}
        onAnimationChange={handleAnimationChange}
        onBothChange={handleBothChange}
      />
    </div>
  );
}

export default memo(TextEditor, (prevProps, nextProps) => {
  return (
    prevProps.paragraph.id === nextProps.paragraph.id &&
    JSON.stringify(prevProps.paragraph) === JSON.stringify(nextProps.paragraph) &&
    prevProps.index === nextProps.index
  );
});