import { useState, useEffect } from 'react';
import ZoomableImage from './ZoomableImage';

interface ImageBoxProps {
  url: string;
  mobileUrl?: string;
  alt?: string;
  isTopMerged?: boolean;
  isRetrospective?: boolean;
}

function ImageBox({ url, mobileUrl, alt, isTopMerged = false, isRetrospective = false }: ImageBoxProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const imageUrl = isMobile && mobileUrl ? mobileUrl : url;
  return (
    <div className="animate-fade-in flex justify-center">
      <ZoomableImage
        src={imageUrl}
        alt={alt || 'Novel image'}
        className={isTopMerged 
          ? "max-w-full max-h-[30vh] md:max-h-[45vh] rounded-xl md:rounded-2xl shadow-xl object-contain"
          : "max-w-full max-h-[60vh] md:max-h-[80vh] rounded-2xl md:rounded-3xl shadow-2xl object-contain"
        }
        style={{
          filter: isRetrospective ? 'sepia(0.6) contrast(0.9) brightness(0.85)' : 'none',
          transition: 'filter 1.2s ease-in-out'
        }}
      />
    </div>
  );
}

export default ImageBox;