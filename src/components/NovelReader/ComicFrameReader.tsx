import { useState, useEffect } from 'react';
import { TextParagraph, DialogueParagraph, ComicFrame, MergeLayoutType, FrameAnimationType } from '@/types/novel';
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
  const [imageAspectRatios, setImageAspectRatios] = useState<Map<string, number>>(new Map());

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

  const handleImageLoad = (frameId: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    setImageAspectRatios(prev => new Map(prev).set(frameId, aspectRatio));
  };

  const getAnimationClass = (animation: FrameAnimationType | undefined, defaultAnimation: FrameAnimationType | undefined): string => {
    const animType = animation || defaultAnimation || 'none';
    
    switch (animType) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-slide-up';
      case 'slide-down':
        return 'animate-slide-down';
      case 'slide-left':
        return 'animate-slide-left';
      case 'slide-right':
        return 'animate-slide-right';
      case 'zoom':
        return 'animate-zoom-in';
      case 'flip':
        return 'animate-flip';
      case 'none':
        return '';
      default:
        return '';
    }
  };

  if (activeFrames.length === 0) return null;

  const frameAspectRatios = activeFrames.map(frame => imageAspectRatios.get(frame.id) || 1);
  const defaultAnimation = paragraph.frameAnimation;

  return (
    <>
      <MergedParagraphsLayout layout={layout} aspectRatios={frameAspectRatios}>
        {activeFrames.map((frame, index) => {
          const animClass = getAnimationClass(frame.animation, defaultAnimation);
          const hasAnimation = animClass !== '';
          
          return (
            <div 
              key={frame.id} 
              className={`w-full h-full cursor-pointer hover:opacity-90 transition-opacity ${animClass}`}
              style={{ 
                animationDelay: hasAnimation ? `${index * 0.2}s` : undefined,
                opacity: hasAnimation ? 0 : 1
              }}
              onClick={() => setSelectedImage(frame.url)}
            >
              <img 
                src={frame.url} 
                alt={frame.alt || ''} 
                onLoad={(e) => handleImageLoad(frame.id, e)}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          );
        })}
      </MergedParagraphsLayout>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] p-2 overflow-auto"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {selectedImage && (
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="w-full h-auto object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}