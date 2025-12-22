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
  
  // Управление transition при загрузке изображения
  useEffect(() => {
    const newImg = newImgRef.current;
    const oldImg = oldImgRef.current;
    const overlay = overlayRef.current;
    
    if (!newImg) return;
    
    if (showTransition && oldImg && overlay) {
      if (!imageLoaded) {
        // Начальное состояние: старое видно, новое скрыто
        console.log('[BackgroundImageLayer] Setting initial state');
        newImg.style.transition = 'none';
        oldImg.style.transition = 'none';
        overlay.style.transition = 'none';
        
        newImg.style.opacity = '0';
        oldImg.style.opacity = '1';
        overlay.style.opacity = '1';
        oldImg.style.filter = 'blur(0px)';
        
        // Принудительный reflow
        void newImg.offsetHeight;
        
        // Включаем transitions обратно
        newImg.style.transition = '';
        oldImg.style.transition = '';
        overlay.style.transition = '';
      } else {
        // Запускаем переход когда изображение загружено
        console.log('[BackgroundImageLayer] Starting transition');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            newImg.style.opacity = '1';
            oldImg.style.opacity = '0';
            overlay.style.opacity = '0';
            oldImg.style.filter = 'blur(20px)';
          });
        });
      }
    } else if (!showTransition) {
      // Нет перехода - сразу показываем
      newImg.style.opacity = '1';
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