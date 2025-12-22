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
  const [currentImage, setCurrentImage] = useState(backgroundImage);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (backgroundImage !== currentImage) {
      console.log('[BackgroundImageLayer] Starting transition from', currentImage, 'to', backgroundImage);
      
      // Сохраняем старое изображение
      setOldImage(currentImage);
      setFadeOut(false);
      
      // Обновляем текущее
      setCurrentImage(backgroundImage);
    }
  }, [backgroundImage, currentImage]);

  useEffect(() => {
    if (oldImage && imageLoaded && !fadeOut) {
      console.log('[BackgroundImageLayer] New image loaded, fading out old');
      
      // Небольшая задержка перед началом fade
      const timer = setTimeout(() => {
        setFadeOut(true);
        
        // Удаляем старое изображение после завершения перехода
        setTimeout(() => {
          setOldImage(null);
          setFadeOut(false);
        }, 2500);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [oldImage, imageLoaded, fadeOut]);

  return (
    <>
      {/* Старое изображение - исчезает */}
      {oldImage && (
        <>
          <img
            src={oldImage}
            alt=""
            className="absolute inset-0 w-full h-full transition-all duration-[2500ms] ease-in-out"
            style={{ 
              objectFit: backgroundObjectFit,
              objectPosition: backgroundObjectPosition,
              opacity: fadeOut ? 0 : 1,
              filter: getFilterStyle(fadeOut ? 'blur(20px)' : 'blur(0px)'),
              zIndex: 1
            }}
          />
          <div 
            className="absolute inset-0 transition-opacity duration-[2500ms] ease-in-out"
            style={{ 
              background: isRetrospective 
                ? `radial-gradient(circle at center, ${getPastelColor(effectivePastelColor)} 0%, ${getPastelColor(effectivePastelColor).replace('0.4', '0.15')} 60%, rgba(0, 0, 0, 0.3) 100%)`
                : 'rgba(0, 0, 0, 0.2)',
              opacity: fadeOut ? 0 : 1,
              zIndex: 2
            }}
          />
        </>
      )}
      
      {/* Новое изображение - появляется */}
      <img
        src={currentImage}
        alt=""
        className="absolute inset-0 w-full h-full transition-opacity duration-[2500ms] ease-in-out"
        onLoad={() => {
          console.log('[BackgroundImageLayer] Image onLoad:', currentImage);
          onImageLoad();
        }}
        style={{ 
          objectFit: backgroundObjectFit,
          objectPosition: backgroundObjectPosition,
          opacity: (oldImage && !fadeOut) ? 0 : 1,
          zIndex: 3
        }}
      />

      {/* Постоянный оверлей */}
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
