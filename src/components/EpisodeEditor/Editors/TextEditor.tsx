import { useCallback, useRef, useEffect, memo, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TextParagraph } from '@/types/novel';
import SubParagraphsEditor from '../SubParagraphsEditor';
import ComicFrameEditor from '../ComicFrameEditor';
import Icon from '@/components/ui/icon';
import equal from 'fast-deep-equal';

interface TextEditorProps {
  paragraph: TextParagraph;
  index: number;
  onUpdate: (index: number, updatedParagraph: TextParagraph) => void;
}

function TextEditor({ paragraph, index, onUpdate }: TextEditorProps) {
  const paragraphRef = useRef(paragraph);
  const [localContent, setLocalContent] = useState(paragraph.content);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    paragraphRef.current = paragraph;
    setLocalContent(paragraph.content);
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

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onUpdate(index, { ...paragraphRef.current, content: newContent });
    }, 300);
  }, [index, onUpdate]);

  return (
    <div className="space-y-3">
      <Textarea
        value={localContent}
        onChange={handleContentChange}
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

      {paragraph.comicGroupIndex === 0 && (
        <div className="p-3 border rounded-lg bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Film" size={16} className="text-primary" />
            <span className="text-sm font-semibold">Настройка комикс-группы</span>
          </div>
          <ComicFrameEditor
            frames={paragraph.comicFrames || []}
            layout={paragraph.frameLayout || 'horizontal-3'}
            defaultAnimation={paragraph.frameAnimation}
            subParagraphs={paragraph.subParagraphs}
            comicGroupSize={paragraph.comicGroupId ? undefined : undefined} {/* TODO: передать размер группы */}
            onFramesChange={handleFramesChange}
            onLayoutChange={handleLayoutChange}
            onAnimationChange={handleAnimationChange}
            onBothChange={handleBothChange}
          />
        </div>
      )}

      {!paragraph.comicGroupId && (
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
      )}
    </div>
  );
}

export default memo(TextEditor, (prevProps, nextProps) => {
  return (
    prevProps.paragraph.id === nextProps.paragraph.id &&
    prevProps.index === nextProps.index &&
    equal(prevProps.paragraph, nextProps.paragraph)
  );
});