import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

function ZoomableImage({ src, alt, className = '' }: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {hasError ? (
        <div className={`${className} flex flex-col items-center justify-center bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg`}>
          <Icon name="ImageOff" size={48} className="text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground text-center px-2">Не удалось загрузить изображение</p>
          <p className="text-[10px] text-muted-foreground/60 text-center px-2 mt-1 break-all max-w-full">{src}</p>
        </div>
      ) : (
        <div className="relative inline-block">
          {isLoading && (
            <div className={`${className} flex items-center justify-center bg-muted/30 animate-pulse`}>
              <Icon name="Loader2" size={32} className="text-muted-foreground animate-spin" />
            </div>
          )}
          <img
            src={src}
            alt={alt}
            className={`${className} cursor-zoom-in hover:opacity-90 transition-opacity ${isLoading ? 'hidden' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              console.error('[ZoomableImage] Failed to load image:', src);
              setHasError(true);
              setIsLoading(false);
            }}
          />
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-[95vw] max-h-[95vh] p-4 overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={src}
            alt={alt}
            className="w-auto h-auto max-w-full max-h-full mx-auto object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ZoomableImage;