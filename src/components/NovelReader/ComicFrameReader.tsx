import { useState, useEffect } from 'react';
import { TextParagraph, DialogueParagraph, ComicFrame, MergeLayoutType } from '@/types/novel';
import MergedParagraphsLayout from './MergedParagraphsLayout';

interface ComicFrameReaderProps {
  paragraph: TextParagraph | DialogueParagraph;
  currentText: string; // Текущий отображаемый текст (для определения фрейма)
  layout: MergeLayoutType;
}

export default function ComicFrameReader({ paragraph, currentText, layout }: ComicFrameReaderProps) {
  const [activeFrames, setActiveFrames] = useState<ComicFrame[]>([]);

  useEffect(() => {
    if (!paragraph.comicFrames || paragraph.comicFrames.length === 0) {
      setActiveFrames([]);
      return;
    }

    // Находим фреймы, которые должны показываться для текущего текста
    const matchingFrames = paragraph.comicFrames.filter(frame => {
      if (!frame.textTrigger) return true; // Без триггера - показываем всегда
      
      // Проверяем, содержится ли триггер в текущем тексте
      return currentText.includes(frame.textTrigger);
    });

    // Если нет подходящих фреймов с триггерами, показываем все фреймы без триггеров
    if (matchingFrames.length === 0) {
      const defaultFrames = paragraph.comicFrames.filter(frame => !frame.textTrigger);
      setActiveFrames(defaultFrames);
    } else {
      setActiveFrames(matchingFrames);
    }
  }, [currentText, paragraph.comicFrames]);

  if (activeFrames.length === 0) return null;

  return (
    <MergedParagraphsLayout layout={layout}>
      {activeFrames.map((frame) => (
        <div key={frame.id} className="w-full h-full">
          <img 
            src={frame.url} 
            alt={frame.alt || ''} 
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      ))}
    </MergedParagraphsLayout>
  );
}
