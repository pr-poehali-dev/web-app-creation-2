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
  
  return (
    <>
      {showTransition && (
        <>
          <img
            src={previousBackgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full transition-all duration-[2500ms] ease-in-out"
            style={{ 
              objectFit: backgroundObjectFit,
              objectPosition: backgroundObjectPosition,
              opacity: imageLoaded ? 0 : 1,
              filter: getFilterStyle(imageLoaded ? 'blur(20px)' : 'blur(0px)'),
              zIndex: 1
            }}
          />
          <div 
            className="absolute inset-0 transition-opacity duration-[2500ms] ease-in-out"
            style={{ 
              background: isRetrospective 
                ? `radial-gradient(circle at center, ${getPastelColor(effectivePastelColor)} 0%, ${getPastelColor(effectivePastelColor).replace('0.4', '0.15')} 60%, rgba(0, 0, 0, 0.3) 100%)`
                : 'rgba(0, 0, 0, 0.2)',
              opacity: imageLoaded ? 0 : 1,
              zIndex: 2
            }}
          />
        </>
      )}
      
      <img
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
          opacity: (showTransition && !imageLoaded) ? 0 : 1,
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