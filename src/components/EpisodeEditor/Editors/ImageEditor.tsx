import { useState } from 'react';
import { ImageParagraph, BackgroundParagraph } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ImageEditorProps {
  paragraph: ImageParagraph | BackgroundParagraph;
  index: number;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  onUpdate: (index: number, updatedParagraph: ImageParagraph | BackgroundParagraph) => void;
  handleImageUrl: () => void;
  handleImageUpload: () => Promise<void>;
  label?: string;
}

function ImageEditor({ 
  paragraph, 
  index, 
  imageUrl, 
  setImageUrl, 
  onUpdate, 
  handleImageUrl, 
  handleImageUpload,
  label = 'Изменить изображение'
}: ImageEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleUrlSubmit = () => {
    handleImageUrl();
    setIsOpen(false);
  };

  const handleFileUpload = async () => {
    await handleImageUpload();
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Alt текст (описание)"
          value={paragraph.alt || ''}
          onChange={(e) =>
            onUpdate(index, { ...paragraph, alt: e.target.value })
          }
          className="text-foreground"
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Icon name="Image" size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{label}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>URL изображения</Label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-foreground mt-1"
                />
                <Button onClick={handleUrlSubmit} className="w-full mt-2" disabled={!imageUrl}>
                  Добавить по URL
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">или</span>
                </div>
              </div>
              <Button onClick={handleFileUpload} variant="outline" className="w-full">
                <Icon name="Upload" size={14} className="mr-2" />
                Загрузить файл
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {paragraph.url && (
        <img src={paragraph.url} alt={paragraph.alt || 'Preview'} className="w-full max-h-64 object-contain rounded" />
      )}
    </div>
  );
}

export default ImageEditor;