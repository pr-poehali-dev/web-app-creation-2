import { useEffect, useState } from 'react';

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
  const [animate, setAnimate] = useState(false);
  const showTransition = previousBackgroundImage && previousBackgroundImage !== backgroundImage;
  
  useEffect(() => {
    if (showTransition && imageLoaded) {
      // Запускаем анимацию
      setAnimate(true);
      
      // Сбрасываем после завершения
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 2100);
      
      return () => clearTimeout(timer);
    }
  }, [showTransition, imageLoaded]);
  
  return (
    <>
      {/* Старое изображение */}
      {showTransition && (
        <>
          <div
            className="absolute inset-0 w-full h-full"
            style={{ 
              backgroundImage: `url(${previousBackgroundImage})`,
              backgroundSize: backgroundObjectFit,
              backgroundPosition: backgroundObjectPosition,
              opacity: animate ? 0 : 1,
              filter: animate ? 'blur(20px)' : 'blur(0px)',
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
              opacity: animate ? 0 : 1,
              transition: 'opacity 2s ease-in-out',
              zIndex: 2
            }}
          />
        </>
      )}
      
      {/* Новое изображение */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: backgroundObjectFit,
          backgroundPosition: backgroundObjectPosition,
          opacity: (showTransition && !animate) ? 0 : 1,
          transition: 'opacity 2s ease-in-out',
          zIndex: 3
        }}
      >
        <img 
          src={backgroundImage} 
          alt="" 
          onLoad={onImageLoad}
          style={{ display: 'none' }}
        />
      </div>

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
