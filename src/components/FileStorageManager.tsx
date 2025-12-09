import { useState } from 'react';
import { Novel } from '@/types/novel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { selectAndConvertImage, selectAndConvertAudio } from '@/utils/fileHelpers';

interface FileStorageManagerProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

function FileStorageManager({ novel, onUpdate }: FileStorageManagerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);

  const handleAddImage = async () => {
    const imageBase64 = await selectAndConvertImage();
    if (imageBase64) {
      const newImage = {
        id: `img${Date.now()}`,
        name: `Изображение ${novel.fileStorage.images.length + 1}`,
        url: imageBase64
      };

      onUpdate({
        ...novel,
        fileStorage: {
          ...novel.fileStorage,
          images: [...novel.fileStorage.images, newImage]
        }
      });
    }
  };

  const handleAddAudio = async () => {
    const audioBase64 = await selectAndConvertAudio();
    if (audioBase64) {
      const newAudio = {
        id: `aud${Date.now()}`,
        name: `Аудио ${novel.fileStorage.audio.length + 1}`,
        url: audioBase64
      };

      onUpdate({
        ...novel,
        fileStorage: {
          ...novel.fileStorage,
          audio: [...novel.fileStorage.audio, newAudio]
        }
      });
    }
  };

  const handleDeleteImage = (id: string) => {
    onUpdate({
      ...novel,
      fileStorage: {
        ...novel.fileStorage,
        images: novel.fileStorage.images.filter(img => img.id !== id)
      }
    });
    setSelectedImage(null);
  };

  const handleDeleteAudio = (id: string) => {
    onUpdate({
      ...novel,
      fileStorage: {
        ...novel.fileStorage,
        audio: novel.fileStorage.audio.filter(aud => aud.id !== id)
      }
    });
    setSelectedAudio(null);
  };

  const handleRenameImage = (id: string, name: string) => {
    onUpdate({
      ...novel,
      fileStorage: {
        ...novel.fileStorage,
        images: novel.fileStorage.images.map(img => img.id === id ? { ...img, name } : img)
      }
    });
  };

  const handleRenameAudio = (id: string, name: string) => {
    onUpdate({
      ...novel,
      fileStorage: {
        ...novel.fileStorage,
        audio: novel.fileStorage.audio.map(aud => aud.id === id ? { ...aud, name } : aud)
      }
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL скопирован в буфер обмена');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="images">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="images">
            <Icon name="Image" size={16} className="mr-2" />
            Изображения ({novel.fileStorage.images.length})
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Icon name="Music" size={16} className="mr-2" />
            Аудио ({novel.fileStorage.audio.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-4">
          <Button onClick={handleAddImage}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить изображение
          </Button>

          {novel.fileStorage.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {novel.fileStorage.images.map((image) => (
                <Card 
                  key={image.id}
                  className={`cursor-pointer transition-all ${
                    selectedImage === image.id ? 'border-primary ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedImage(image.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <img 
                      src={image.url} 
                      alt={image.name}
                      className="w-full h-40 object-cover rounded"
                    />
                    <Input
                      value={image.name}
                      onChange={(e) => handleRenameImage(image.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-foreground"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(image.url);
                        }}
                      >
                        <Icon name="Copy" size={14} className="mr-1" />
                        Копировать
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image.id);
                        }}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Нет изображений. Добавьте первое изображение.
            </div>
          )}
        </TabsContent>

        <TabsContent value="audio" className="space-y-4">
          <Button onClick={handleAddAudio}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить аудио
          </Button>

          {novel.fileStorage.audio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {novel.fileStorage.audio.map((audio) => (
                <Card 
                  key={audio.id}
                  className={`cursor-pointer transition-all ${
                    selectedAudio === audio.id ? 'border-primary ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedAudio(audio.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-center h-24 bg-secondary/20 rounded">
                      <Icon name="Music" size={48} className="text-muted-foreground" />
                    </div>
                    <Input
                      value={audio.name}
                      onChange={(e) => handleRenameAudio(audio.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="text-foreground"
                    />
                    <audio controls className="w-full" src={audio.url} />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(audio.url);
                        }}
                      >
                        <Icon name="Copy" size={14} className="mr-1" />
                        Копировать
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAudio(audio.id);
                        }}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Нет аудио файлов. Добавьте первый аудио файл.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FileStorageManager;
