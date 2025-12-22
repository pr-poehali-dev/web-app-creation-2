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
  return (
    <>
      {previousBackgroundImage && previousBackgroundImage !== backgroundImage && (
        <>
          <img
            src={previousBackgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full"
            style={{ 
              objectFit: backgroundObjectFit,
              objectPosition: backgroundObjectPosition,
              opacity: imageLoaded ? 0 : 1,
              filter: getFilterStyle(imageLoaded ? 'blur(16px)' : 'blur(0px)'),
              transition: 'opacity 2.4s ease-in-out, filter 2.4s ease-in-out',
              willChange: 'opacity, filter',
              zIndex: 1
            }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: isRetrospective 
                ? `radial-gradient(circle at center, ${getPastelColor(effectivePastelColor)} 0%, ${getPastelColor(effectivePastelColor).replace('0.4', '0.15')} 60%, rgba(0, 0, 0, 0.3) 100%)`
                : 'rgba(0, 0, 0, 0.2)',
              opacity: imageLoaded ? 0 : 1,
              transition: 'opacity 2.4s ease-in-out',
              willChange: 'opacity',
              zIndex: 2
            }}
          />
        </>
      )}
      
      <img
        src={backgroundImage || ''}
        alt=""
        className="absolute inset-0 w-full h-full"
        onLoad={() => {
          console.log('[BackgroundImageLayer] Image loaded:', backgroundImage);
          onImageLoad();
        }}
        style={{ 
          objectFit: backgroundObjectFit,
          objectPosition: backgroundObjectPosition,
          opacity: !imageLoaded ? 0 : 1,
          transition: 'opacity 2.4s ease-in-out',
          willChange: 'opacity',
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