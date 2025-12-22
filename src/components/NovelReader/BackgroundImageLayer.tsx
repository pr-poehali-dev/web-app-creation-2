import { useState, useEffect, useRef } from 'react';

interface BackgroundImageLayerProps {
  backgroundImage: string;
  previousBackgroundImage: string | null;
  imageLoaded: boolean;
  onImageLoad: () => void;
  backgroundObjectFit: 'cover' | 'contain' | 'fill';
  backgroundObjectPosition: string;
  isRetrospective: boolean;
  effectivePastelColor?: string;
  getFilterStyle: (baseFilter: string) => string;
  getPastelColor: (color?: string) => string;
}

function BackgroundImageLayer({
  backgroundImage,
  previousBackgroundImage,
  imageLoaded,
  onImageLoad,
  backgroundObjectFit,
  backgroundObjectPosition,
  isRetrospective,
  effectivePastelColor,
  getFilterStyle,
  getPastelColor
}: BackgroundImageLayerProps) {
  const [displayedImage, setDisplayedImage] = useState(backgroundImage);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevImageRef = useRef(backgroundImage);

  // Отслеживаем смену изображения
  useEffect(() => {
    if (backgroundImage !== prevImageRef.current && backgroundImage !== displayedImage) {
      console.log('[BackgroundImageLayer] Image change detected:', prevImageRef.current, '->', backgroundImage);
      
      // Сохраняем старое изображение для crossfade
      setOldImage(displayedImage);
      setDisplayedImage(backgroundImage);
      setIsTransitioning(false);
      
      prevImageRef.current = backgroundImage;
    }
  }, [backgroundImage, displayedImage]);

  // Запускаем переход когда новое изображение загружено
  useEffect(() => {
    if (oldImage && imageLoaded && !isTransitioning) {
      console.log('[BackgroundImageLayer] Starting crossfade transition');
      
      // Задержка для гарантии что браузер отрисовал начальное состояние
      const timer = setTimeout(() => {
        setIsTransitioning(true);
        
        // Убираем старое изображение после завершения перехода
        setTimeout(() => {
          console.log('[BackgroundImageLayer] Transition complete, removing old image');
          setOldImage(null);
        }, 2500);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [oldImage, imageLoaded, isTransitioning]);

  const hasTransition = oldImage && oldImage !== displayedImage;

  return (
    <>
      {/* Старое изображение - плавно исчезает */}
      {hasTransition && (
        <>
          <img
            src={oldImage}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ 
              objectFit: backgroundObjectFit,
              objectPosition: backgroundObjectPosition,
              opacity: isTransitioning ? 0 : 1,
              filter: getFilterStyle(isTransitioning ? 'blur(20px)' : 'blur(0px)'),
              transition: 'opacity 2.5s ease-in-out, filter 2.5s ease-in-out',
              zIndex: 1
            }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: isRetrospective 
                ? `radial-gradient(circle at center, ${getPastelColor(effectivePastelColor)} 0%, ${getPastelColor(effectivePastelColor).replace('0.4', '0.15')} 60%, rgba(0, 0, 0, 0.3) 100%)`
                : 'rgba(0, 0, 0, 0.2)',
              opacity: isTransitioning ? 0 : 1,
              transition: 'opacity 2.5s ease-in-out',
              zIndex: 2
            }}
          />
        </>
      )}
      
      {/* Новое изображение - плавно появляется */}
      <img
        src={displayedImage}
        alt=""
        className="absolute inset-0 w-full h-full"
        onLoad={() => {
          console.log('[BackgroundImageLayer] Image loaded:', displayedImage);
          onImageLoad();
        }}
        style={{ 
          objectFit: backgroundObjectFit,
          objectPosition: backgroundObjectPosition,
          opacity: (hasTransition && !isTransitioning) ? 0 : 1,
          transition: 'opacity 2.5s ease-in-out',
          zIndex: 3
        }}
      />

      {/* Постоянный оверлей для ретроспективы */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out"
        style={{ 
          background: isRetrospective 
            ? `radial-gradient(circle at center, ${getPastelColor(effectivePastelColor)} 0%, ${getPastelColor(effectivePastelColor).replace('0.4', '0.15')} 60%, rgba(0, 0, 0, 0.3) 100%)`
            : 'rgba(0, 0, 0, 0.2)',
          zIndex: 4
        }}
      />
    </>
  );
}

export default BackgroundImageLayer;
