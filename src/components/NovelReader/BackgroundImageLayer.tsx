import { useEffect, useState, useRef } from 'react';

interface BackgroundImageLayerProps {
  backgroundImage: string;
  previousBackgroundImage: string | null;
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
  backgroundObjectFit,
  backgroundObjectPosition,
  isRetrospective,
  effectivePastelColor,
  getFilterStyle,
  getPastelColor
}: BackgroundImageLayerProps) {
  const [transitionState, setTransitionState] = useState<'idle' | 'loading' | 'ready' | 'animating'>('idle');
  const showTransition = previousBackgroundImage && previousBackgroundImage !== backgroundImage;
  const preloadedRef = useRef<string | null>(null);
  
  // Предзагрузка нового изображения
  useEffect(() => {
    if (showTransition && backgroundImage !== preloadedRef.current) {
      setTransitionState('loading');
      
      const img = new Image();
      img.onload = () => {
        preloadedRef.current = backgroundImage;
        setTransitionState('ready');
        
        // Даём 2 фрейма на установку начального состояния
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitionState('animating');
          });
        });
      };
      img.onerror = () => {
        setTransitionState('animating');
      };
      img.src = backgroundImage;
    } else if (!showTransition) {
      setTransitionState('idle');
      preloadedRef.current = backgroundImage;
    }
  }, [backgroundImage, showTransition]);
  
  const isAnimating = transitionState === 'animating';
  const showNewImage = transitionState === 'ready' || transitionState === 'animating' || !showTransition;
  
  return (
    <>
      {/* Старое изображение */}
      {showTransition && (
        <>
          <img
            src={previousBackgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ 
              objectFit: backgroundObjectFit,
              objectPosition: backgroundObjectPosition,
              opacity: isAnimating ? 0 : 1,
              filter: isAnimating ? 'blur(20px)' : 'blur(0px)',
              transition: 'opacity 2s ease-in-out, filter 2s ease-in-out',
              zIndex: 1
            }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: isRetrospective 
                ? `radial-gradient(circle at center, ${getPastelColor(effectivePastelColor)} 0%, ${getPastelColor(effectivePastelColor).replace('0.4', '0.15')} 60%, rgba(0, 0, 0, 0.3) 100%)`
                : 'rgba(0, 0, 0, 0.2)',
              opacity: isAnimating ? 0 : 1,
              transition: 'opacity 2s ease-in-out',
              zIndex: 2
            }}
          />
        </>
      )}
      
      {/* Новое изображение */}
      {showNewImage && (
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ 
            objectFit: backgroundObjectFit,
            objectPosition: backgroundObjectPosition,
            opacity: (showTransition && !isAnimating) ? 0 : 1,
            transition: 'opacity 2s ease-in-out',
            zIndex: 3
          }}
        />
      )}

      {/* Оверлей */}
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