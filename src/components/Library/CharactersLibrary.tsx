import { useState } from 'react';
import { Novel, LibraryCharacter } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { selectAndConvertImage } from '@/utils/fileHelpers';

interface CharactersLibraryProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

function CharactersLibrary({ novel, onUpdate }: CharactersLibraryProps) {
  const [newCharacter, setNewCharacter] = useState<Partial<LibraryCharacter>>({});
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');

  const handleAddCharacter = () => {
    if (!newCharacter.name) return;

    const character: LibraryCharacter = {
      id: `char${Date.now()}`,
      name: newCharacter.name,
      images: [],
      description: newCharacter.description
    };

    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        characters: [...novel.library.characters, character]
      }
    });

    setNewCharacter({});
    setEditingCharacter(character.id);
  };

  const handleDeleteCharacter = (charId: string) => {
    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        characters: novel.library.characters.filter(c => c.id !== charId)
      }
    });
  };

  const handleUpdateCharacter = (charId: string, updates: Partial<LibraryCharacter>) => {
    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        characters: novel.library.characters.map(c => c.id === charId ? { ...c, ...updates } : c)
      }
    });
  };

  const handleAddCharacterImage = async (charId: string, method: 'url' | 'upload') => {
    const character = novel.library.characters.find(c => c.id === charId);
    if (!character) return;

    if (method === 'url' && newImageUrl) {
      const newImage = {
        id: `img${Date.now()}`,
        url: newImageUrl,
        name: newImageName || `Изображение ${character.images.length + 1}`
      };
      handleUpdateCharacter(charId, {
        images: [...character.images, newImage]
      });
      setNewImageUrl('');
      setNewImageName('');
    } else if (method === 'upload') {
      const imageBase64 = await selectAndConvertImage();
      if (imageBase64) {
        const newImage = {
          id: `img${Date.now()}`,
          url: imageBase64,
          name: `Изображение ${character.images.length + 1}`
        };
        handleUpdateCharacter(charId, {
          images: [...character.images, newImage]
        });
      }
    }
  };

  const handleDeleteCharacterImage = (charId: string, imageId: string) => {
    const character = novel.library.characters.find(c => c.id === charId);
    if (!character) return;

    handleUpdateCharacter(charId, {
      images: character.images.filter(img => img.id !== imageId)
    });
  };

  return (
    <div className="space-y-6 mt-6">
      <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-2 border-accent/20 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground text-xl">Добавить персонажа</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Имя персонажа</Label>
            <Input
              placeholder="Имя персонажа"
              value={newCharacter.name || ''}
              onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
              className="text-foreground mt-1"
            />
          </div>
          <div>
            <Label>Описание</Label>
            <Textarea
              placeholder="Описание персонажа"
              value={newCharacter.description || ''}
              onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
              rows={2}
              className="text-foreground mt-1"
            />
          </div>
          <Button onClick={handleAddCharacter} className="w-full">
            <Icon name="Plus" size={16} className="mr-2" />
            Создать персонажа
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {novel.library.characters.map((character) => (
          <Card key={character.id} className="bg-card/50 backdrop-blur-sm border-2 border-border/50 shadow-lg rounded-2xl hover:shadow-xl hover:border-accent/30 hover:scale-[1.01] transition-all">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingCharacter === character.id ? (
                      <div className="space-y-2">
                        <Input
                          value={character.name}
                          onChange={(e) => handleUpdateCharacter(character.id, { name: e.target.value })}
                          className="text-foreground font-semibold"
                        />
                        <Textarea
                          value={character.description || ''}
                          onChange={(e) => handleUpdateCharacter(character.id, { description: e.target.value })}
                          placeholder="Описание персонажа"
                          rows={2}
                          className="text-foreground text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold text-foreground text-lg">{character.name}</h4>
                        {character.description && (
                          <p className="text-sm text-muted-foreground mt-1">{character.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {character.images?.length || 0} изображений
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingCharacter(editingCharacter === character.id ? null : character.id)}
                    >
                      <Icon name={editingCharacter === character.id ? "Check" : "Edit"} size={16} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDeleteCharacter(character.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>

                {editingCharacter === character.id && (
                  <div className="space-y-3">
                    <div className="border-t pt-3">
                      <Label className="text-sm font-semibold">Изображения персонажа</Label>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="w-full mt-2">
                            <Icon name="Plus" size={14} className="mr-2" />
                            Добавить изображение
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Добавить изображение</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Название изображения</Label>
                              <Input
                                placeholder="Например: Счастливый, Грустный"
                                value={newImageName}
                                onChange={(e) => setNewImageName(e.target.value)}
                                className="text-foreground mt-1"
                              />
                            </div>
                            <div>
                              <Label>URL изображения</Label>
                              <Input
                                placeholder="https://example.com/character.jpg"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                className="text-foreground mt-1"
                              />
                              <Button 
                                onClick={() => handleAddCharacterImage(character.id, 'url')} 
                                className="w-full mt-2"
                                disabled={!newImageUrl}
                              >
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
                            <Button 
                              onClick={() => handleAddCharacterImage(character.id, 'upload')} 
                              variant="outline" 
                              className="w-full"
                            >
                              <Icon name="Upload" size={14} className="mr-2" />
                              Загрузить файл
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {character.images?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {character.images.map((image) => (
                          <div key={image.id} className="relative group">
                            <img 
                              src={image.url} 
                              alt={image.name || 'Character'} 
                              className="w-full h-24 object-cover rounded border"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col items-center justify-center">
                              <p className="text-white text-xs mb-2 px-1 text-center">{image.name}</p>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCharacterImage(character.id, image.id)}
                              >
                                <Icon name="Trash2" size={12} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default CharactersLibrary;