import { useState, memo } from 'react';
import equal from 'fast-deep-equal';
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
  mobileImageUrl: string;
  setMobileImageUrl: (url: string) => void;
  onUpdate: (index: number, updatedParagraph: ImageParagraph | BackgroundParagraph) => void;
  handleImageUrl: () => void;
  handleImageUpload: () => Promise<void>;
  handleMobileImageUrl: () => void;
  handleMobileImageUpload: () => Promise<void>;
  label?: string;
}

function ImageEditor({ 
  paragraph, 
  index, 
  imageUrl, 
  setImageUrl,
  mobileImageUrl,
  setMobileImageUrl,
  onUpdate, 
  handleImageUrl, 
  handleImageUpload,
  handleMobileImageUrl,
  handleMobileImageUpload,
  label = 'Изменить изображение'
}: ImageEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleUrlSubmit = () => {
    handleImageUrl();
    setIsOpen(false);
  };

  const handleFileUpload = async () => {
    await handleImageUpload();
    setIsOpen(false);
  };

  const handleMobileUrlSubmit = () => {
    handleMobileImageUrl();
    setIsMobileOpen(false);
  };

  const handleMobileFileUpload = async () => {
    await handleMobileImageUpload();
    setIsMobileOpen(false);
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
            <Button size="sm" variant="outline" title="Десктоп изображение">
              <Icon name="Monitor" size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{label} (Десктоп)</DialogTitle>
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
        <Dialog open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" title="Мобильное изображение">
              <Icon name="Smartphone" size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{label} (Мобильная версия)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>URL изображения для мобильных</Label>
                <Input
                  placeholder="https://example.com/mobile-image.jpg"
                  value={mobileImageUrl}
                  onChange={(e) => setMobileImageUrl(e.target.value)}
                  className="text-foreground mt-1"
                />
                <Button onClick={handleMobileUrlSubmit} className="w-full mt-2" disabled={!mobileImageUrl}>
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
              <Button onClick={handleMobileFileUpload} variant="outline" className="w-full">
                <Icon name="Upload" size={14} className="mr-2" />
                Загрузить файл
              </Button>
              {paragraph.mobileUrl && (
                <Button 
                  onClick={() => onUpdate(index, { ...paragraph, mobileUrl: undefined })} 
                  variant="destructive" 
                  className="w-full"
                >
                  Удалить мобильное изображение
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {paragraph.url && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1">Десктоп</Label>
            <img src={paragraph.url} alt={paragraph.alt || 'Preview'} className="w-full max-h-48 object-contain rounded border" />
          </div>
        )}
        {paragraph.mobileUrl && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1">Мобильная</Label>
            <img src={paragraph.mobileUrl} alt={paragraph.alt || 'Mobile Preview'} className="w-full max-h-48 object-contain rounded border" />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ImageEditor, (prevProps, nextProps) => {
  return (
    prevProps.paragraph.id === nextProps.paragraph.id &&
    equal(prevProps.paragraph, nextProps.paragraph) &&
    prevProps.index === nextProps.index
  );
});