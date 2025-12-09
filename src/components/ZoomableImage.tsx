import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
}

function ZoomableImage({ src, alt, className = '' }: ZoomableImageProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`${className} cursor-zoom-in hover:opacity-90 transition-opacity`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      />

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
