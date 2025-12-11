import ZoomableImage from './ZoomableImage';

interface ImageBoxProps {
  url: string;
  alt?: string;
  isMerged?: boolean;
}

function ImageBox({ url, alt, isMerged = false }: ImageBoxProps) {
  return (
    <div className="animate-fade-in flex justify-center">
      <ZoomableImage
        src={url}
        alt={alt || 'Novel image'}
        className={isMerged 
          ? "max-w-full max-h-[40vh] rounded-2xl shadow-xl object-contain"
          : "max-w-full max-h-[80vh] rounded-3xl shadow-2xl object-contain"
        }
      />
    </div>
  );
}

export default ImageBox;