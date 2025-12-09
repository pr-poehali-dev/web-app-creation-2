interface ImageBoxProps {
  url: string;
  alt?: string;
}

function ImageBox({ url, alt }: ImageBoxProps) {
  return (
    <div className="animate-fade-in">
      <img 
        src={url} 
        alt={alt || 'Novel image'} 
        className="max-w-full max-h-[80vh] mx-auto rounded-lg shadow-2xl object-contain"
      />
    </div>
  );
}

export default ImageBox;
