import { useState, useEffect } from 'react';
import { TextParagraph, DialogueParagraph, ComicFrame, MergeLayoutType, FrameAnimationType } from '@/types/novel';
import MergedParagraphsLayout from './MergedParagraphsLayout';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ComicFrameReaderProps {
  paragraph: TextParagraph | DialogueParagraph;
  currentSubParagraphIndex?: number; // Индекс текущего подпараграфа
  layout: MergeLayoutType;
  isTyping: boolean; // Флаг печати текста
}

export default function ComicFrameReader({ paragraph, currentSubParagraphIndex, layout, isTyping }: ComicFrameReaderProps) {
  const [activeFrames, setActiveFrames] = useState<ComicFrame[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAspectRatios, setImageAspectRatios] = useState<Map<string, number>>(new Map());
  const [showFrames, setShowFrames] = useState(false);

  // Показываем фреймы только после завершения печати текста
  useEffect(() => {
    if (!isTyping) {
      // Небольшая задержка для плавности
      const timer = setTimeout(() => setShowFrames(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowFrames(false);
    }
  }, [isTyping]);

  useEffect(() => {
    if (!paragraph.comicFrames || paragraph.comicFrames.length === 0) {
      setActiveFrames([]);
      return;
    }

    // Если есть подпараграфы, показываем все фреймы до текущего индекса включительно
    if (paragraph.subParagraphs && paragraph.subParagraphs.length > 0 && currentSubParagraphIndex !== undefined) {
      // Собираем все ID подпараграфов от начала до текущего
      const subParagraphIdsUpToNow = paragraph.subParagraphs
        .slice(0, currentSubParagraphIndex + 1)
        .map(sp => sp.id);
      
      const matchingFrames = paragraph.comicFrames.filter(frame => {
        // Фреймы без триггера показываются всегда
        if (!frame.subParagraphTrigger) return true;
        
        // Проверяем, есть ли ID триггера в списке просмотренных подпараграфов
        return subParagraphIdsUpToNow.includes(frame.subParagraphTrigger);
      });
      
      setActiveFrames(matchingFrames);
    } else {
      // Если нет подпараграфов, показываем все фреймы без триггеров
      const defaultFrames = paragraph.comicFrames.filter(frame => !frame.subParagraphTrigger);
      setActiveFrames(defaultFrames);
    }
  }, [currentSubParagraphIndex, paragraph.comicFrames, paragraph.subParagraphs]);

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
      case 'zoom-out':
        return 'animate-zoom-out';
      case 'flip':
        return 'animate-flip';
      case 'flip-x':
        return 'animate-flip-x';
      case 'rotate-in':
        return 'animate-rotate-in';
      case 'bounce':
        return 'animate-bounce';
      case 'shake':
        return 'animate-shake';
      case 'blur-in':
        return 'animate-blur-in';
      case 'split-v':
        return 'animate-split-v';
      case 'split-h':
        return 'animate-split-h';
      case 'glitch':
        return 'animate-glitch';
      case 'wave':
        return 'animate-wave';
      case 'none':
        return '';
      default:
        return '';
    }
  };

  // Не показываем фреймы, если текст еще печатается или если нет активных фреймов
  if (!showFrames || activeFrames.length === 0) return null;

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
              className={`w-full h-full cursor-pointer ${animClass}`}
              style={{ 
                animationDelay: hasAnimation ? `${index * 0.2}s` : undefined,
                opacity: hasAnimation ? 0 : 1
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(frame.url);
              }}
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