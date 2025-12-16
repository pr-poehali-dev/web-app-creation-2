import { useState, useEffect } from 'react';
import { TextParagraph, DialogueParagraph, ComicFrame, MergeLayoutType } from '@/types/novel';
import MergedParagraphsLayout from './MergedParagraphsLayout';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ComicFrameReaderProps {
  paragraph: TextParagraph | DialogueParagraph;
  currentText: string; // Текущий отображаемый текст (для определения фрейма)
  layout: MergeLayoutType;
}

export default function ComicFrameReader({ paragraph, currentText, layout }: ComicFrameReaderProps) {
  const [activeFrames, setActiveFrames] = useState<ComicFrame[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    <>
      <MergedParagraphsLayout layout={layout}>
        {activeFrames.map((frame) => (
          <div 
            key={frame.id} 
            className="w-full h-full cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
            onClick={() => setSelectedImage(frame.url)}
          >
            <img 
              src={frame.url} 
              alt={frame.alt || ''} 
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        ))}
      </MergedParagraphsLayout>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 overflow-auto">
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="w-full h-auto object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}