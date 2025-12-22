import React, { useEffect, useRef } from 'react';

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
  const showTransition = previousBackgroundImage && previousBackgroundImage !== backgroundImage;
  const newImgRef = useRef<HTMLImageElement>(null);
  const oldImgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Принудительный reflow для запуска transition
  useEffect(() => {
    if (showTransition && imageLoaded) {
      console.log('[BackgroundImageLayer] Forcing transition with reflow');
      
      const newImg = newImgRef.current;
      const oldImg = oldImgRef.current;
      const overlay = overlayRef.current;
      
      if (newImg && oldImg && overlay) {
        // Сначала устанавливаем начальные значения
        newImg.style.opacity = '0';
        oldImg.style.opacity = '1';
        overlay.style.opacity = '1';
        oldImg.style.filter = 'blur(0px)';
        
        // Принудительный reflow
        void newImg.offsetHeight;
        void oldImg.offsetHeight;
        void overlay.offsetHeight;
        
        // Запускаем transition через RAF
        requestAnimationFrame(() => {
          newImg.style.opacity = '1';
          oldImg.style.opacity = '0';
          overlay.style.opacity = '0';
          oldImg.style.filter = 'blur(20px)';
        });
      }
    }
  }, [imageLoaded, showTransition]);
  
  return (
    <>
      {showTransition && (
        <>
          <img
            ref={oldImgRef}
            src={previousBackgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full transition-all duration-[2500ms] ease-in-out"
            style={{ 
              objectFit: backgroundObjectFit,
              objectPosition: backgroundObjectPosition,
              opacity: 1,
              filter: 'blur(0px)',
              zIndex: 1
            }}
          />
          <div 
            ref={overlayRef}
            className="absolute inset-0 transition-opacity duration-[2500ms] ease-in-out"
            style={{ 
              background: isRetrospective 
                ? `radial-gradient(circle at center, ${getPastelColor(effectivePastelColor)} 0%, ${getPastelColor(effectivePastelColor).replace('0.4', '0.15')} 60%, rgba(0, 0, 0, 0.3) 100%)`
                : 'rgba(0, 0, 0, 0.2)',
              opacity: 1,
              zIndex: 2
            }}
          />
        </>
      )}
      
      <img
        ref={newImgRef}
        src={backgroundImage || ''}
        alt=""
        className="absolute inset-0 w-full h-full transition-opacity duration-[2500ms] ease-in-out"
        onLoad={() => {
          console.log('[BackgroundImageLayer] Image loaded:', backgroundImage);
          onImageLoad();
        }}
        style={{ 
          objectFit: backgroundObjectFit,
          objectPosition: backgroundObjectPosition,
          opacity: showTransition ? 0 : 1,
          zIndex: 3
        }}
      />

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