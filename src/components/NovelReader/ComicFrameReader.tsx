import { useState, useEffect } from 'react';
import { TextParagraph, DialogueParagraph, ComicFrame, MergeLayoutType, FrameAnimationType } from '@/types/novel';
import MergedParagraphsLayout from './MergedParagraphsLayout';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ComicFrameReaderProps {
  paragraph: TextParagraph | DialogueParagraph;
  currentSubParagraphIndex?: number; // Индекс текущего подпараграфа
  layout: MergeLayoutType;
  isTyping: boolean; // Флаг печати текста
  isRetrospective?: boolean; // Флаг времени прошлого
  pastelColor?: string; // Пастельный цвет для ретроспективы
  isComicGroup?: boolean; // Флаг комикс-группы (фреймы уже отфильтрованы)
}

const BRUSH_MASKS = [
  'https://cdn.poehali.dev/files/brush-mask-1.png',
  'https://cdn.poehali.dev/files/brush-mask-2.png',
  'https://cdn.poehali.dev/files/brush-mask-3.png',
  'https://cdn.poehali.dev/files/brush-mask-4.png',
  'https://cdn.poehali.dev/files/brush-mask-5.png',
  'https://cdn.poehali.dev/files/brush-mask-6.png',
  'https://cdn.poehali.dev/files/brush-mask-7.png',
  'https://cdn.poehali.dev/files/brush-mask-8.png',
];

export default function ComicFrameReader({ paragraph, currentSubParagraphIndex, layout, isTyping, isRetrospective = false, pastelColor, isComicGroup = false }: ComicFrameReaderProps) {
  const [activeFrames, setActiveFrames] = useState<ComicFrame[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAspectRatios, setImageAspectRatios] = useState<Map<string, number>>(new Map());
  const [showFrames, setShowFrames] = useState(false);
  const [brushMasks, setBrushMasks] = useState<string[]>([]);
  const [masksLoaded, setMasksLoaded] = useState<Set<string>>(new Set());

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
    console.log('[ComicFrameReader] Effect triggered', {
      isComicGroup,
      totalFrames: paragraph.comicFrames?.length || 0,
      showFrames
    });
    
    if (!paragraph.comicFrames || paragraph.comicFrames.length === 0) {
      console.log('[ComicFrameReader] No frames, clearing');
      setActiveFrames([]);
      return;
    }

    // Для комикс-групп фреймы уже отфильтрованы родителем, показываем все
    if (isComicGroup) {
      console.log('[ComicFrameReader] Comic group mode, setting all frames:', paragraph.comicFrames.length);
      setActiveFrames(paragraph.comicFrames);
      return;
    }

    // Если есть подпараграфы, показываем фреймы по индексу
    if (paragraph.subParagraphs && paragraph.subParagraphs.length > 0 && currentSubParagraphIndex !== undefined) {
      // Индекс 0 = основной текст (показываем только фреймы без триггера)
      // Индекс 1+ = подпараграфы с индексом 0, 1, 2... (показываем фреймы с триггерами)
      
      if (currentSubParagraphIndex === 0) {
        // Показываем основной текст - только фреймы без триггера
        const defaultFrames = paragraph.comicFrames.filter(frame => !frame.subParagraphTrigger);
        setActiveFrames(defaultFrames);
      } else {
        // Показываем подпараграфы - собираем ID всех подпараграфов до текущего (включительно)
        const subParagraphIdsUpToNow = paragraph.subParagraphs
          .slice(0, currentSubParagraphIndex)
          .map(sp => sp.id);
        
        const matchingFrames = paragraph.comicFrames.filter(frame => {
          // Фреймы без триггера показываются всегда
          if (!frame.subParagraphTrigger) {
            return true;
          }
          
          // Проверяем, есть ли ID триггера в списке просмотренных подпараграфов
          return subParagraphIdsUpToNow.includes(frame.subParagraphTrigger);
        });
        
        setActiveFrames(matchingFrames);
      }
    } else {
      // Если нет подпараграфов, показываем все фреймы без триггеров
      const defaultFrames = paragraph.comicFrames.filter(frame => !frame.subParagraphTrigger);
      setActiveFrames(defaultFrames);
    }
  }, [currentSubParagraphIndex, paragraph.comicFrames, paragraph.subParagraphs, showFrames, isComicGroup]);

  useEffect(() => {
    if (isRetrospective && activeFrames.length > 0) {
      const masks = activeFrames.map((_, index) => BRUSH_MASKS[index % BRUSH_MASKS.length]);
      setBrushMasks(masks);
      
      // Предзагрузка масок
      masks.forEach(maskUrl => {
        const img = new Image();
        img.onload = () => {
          setMasksLoaded(prev => new Set(prev).add(maskUrl));
        };
        img.onerror = () => {
          console.warn('Failed to load mask:', maskUrl);
        };
        img.src = maskUrl;
      });
    } else {
      setBrushMasks([]);
      setMasksLoaded(new Set());
    }
  }, [isRetrospective, activeFrames.length]);

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
  console.log('[ComicFrameReader] Render check', { showFrames, activeFramesCount: activeFrames.length });
  
  if (!showFrames || activeFrames.length === 0) {
    console.log('[ComicFrameReader] Not rendering - showFrames:', showFrames, 'activeFrames:', activeFrames.length);
    return null;
  }

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
              className={`w-full h-full cursor-pointer min-w-0 ${animClass}`}
              style={{ 
                animationDelay: hasAnimation ? `${index * 0.2}s` : undefined,
                opacity: hasAnimation ? 0 : 1
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(frame.url);
              }}
            >
              <div 
                className="relative w-full h-full" 
                style={isRetrospective && brushMasks[index] && masksLoaded.has(brushMasks[index]) ? {
                  WebkitMaskImage: `url(${brushMasks[index]})`,
                  WebkitMaskSize: 'cover',
                  WebkitMaskPosition: 'center',
                  WebkitMaskRepeat: 'no-repeat',
                  maskImage: `url(${brushMasks[index]})`,
                  maskSize: 'cover',
                  maskPosition: 'center',
                  maskRepeat: 'no-repeat'
                } : undefined}
              >
                <img 
                  src={frame.url} 
                  alt={frame.alt || ''} 
                  onLoad={(e) => handleImageLoad(frame.id, e)}
                  className="w-full h-full min-w-0"
                  style={{
                    objectFit: frame.objectFit || 'cover',
                    objectPosition: frame.objectPosition || 'center',
                    filter: isRetrospective ? 'saturate(1.2) brightness(1.05) contrast(0.95)' : 'none',
                    transition: 'filter 1.2s ease-in-out',
                    borderRadius: isRetrospective ? '0' : '0.5rem'
                  }}
                />
                {isRetrospective && (
                  <div 
                    className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
                    style={{
                      background: `radial-gradient(circle at center, ${
                        pastelColor === 'pink' ? 'rgba(255, 182, 193, 0.3)' :
                        pastelColor === 'blue' ? 'rgba(173, 216, 230, 0.3)' :
                        pastelColor === 'peach' ? 'rgba(255, 218, 185, 0.3)' :
                        pastelColor === 'lavender' ? 'rgba(221, 160, 221, 0.3)' :
                        pastelColor === 'mint' ? 'rgba(152, 255, 152, 0.3)' :
                        pastelColor === 'yellow' ? 'rgba(255, 255, 153, 0.3)' :
                        pastelColor === 'coral' ? 'rgba(255, 160, 122, 0.3)' :
                        pastelColor === 'sky' ? 'rgba(135, 206, 235, 0.3)' :
                        'rgba(255, 182, 193, 0.3)'
                      } 0%, ${
                        pastelColor === 'pink' ? 'rgba(255, 182, 193, 0.1)' :
                        pastelColor === 'blue' ? 'rgba(173, 216, 230, 0.1)' :
                        pastelColor === 'peach' ? 'rgba(255, 218, 185, 0.1)' :
                        pastelColor === 'lavender' ? 'rgba(221, 160, 221, 0.1)' :
                        pastelColor === 'mint' ? 'rgba(152, 255, 152, 0.1)' :
                        pastelColor === 'yellow' ? 'rgba(255, 255, 153, 0.1)' :
                        pastelColor === 'coral' ? 'rgba(255, 160, 122, 0.1)' :
                        pastelColor === 'sky' ? 'rgba(135, 206, 235, 0.1)' :
                        'rgba(255, 182, 193, 0.1)'
                      } 60%, transparent 100%)`,
                      mixBlendMode: 'soft-light'
                    }}
                  />
                )}
              </div>
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