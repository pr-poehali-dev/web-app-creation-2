import ZoomableImage from './ZoomableImage';

interface ImageBoxProps {
  url: string;
  alt?: string;
}

function ImageBox({ url, alt }: ImageBoxProps) {
  return (
    <div className="animate-fade-in flex justify-center">
      <ZoomableImage
        src={url}
        alt={alt || 'Novel image'}
        className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl object-contain"
      />
    </div>
  );
}

export default ImageBox;