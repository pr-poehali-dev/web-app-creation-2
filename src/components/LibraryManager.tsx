import { useState } from 'react';
import { Novel, LibraryItem, LibraryCharacter, LibraryChoice } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { selectAndConvertImage } from '@/utils/fileHelpers';

interface LibraryManagerProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

function LibraryManager({ novel, onUpdate }: LibraryManagerProps) {
  const [newItem, setNewItem] = useState<Partial<LibraryItem>>({});
  const [newCharacter, setNewCharacter] = useState<Partial<LibraryCharacter>>({});
  const [newChoice, setNewChoice] = useState<Partial<LibraryChoice>>({});
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');

  const handleAddItem = () => {
    if (!newItem.name) return;
    
    const item: LibraryItem = {
      id: `item${Date.now()}`,
      name: newItem.name,
      description: newItem.description || '',
      imageUrl: newItem.imageUrl
    };

    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        items: [...novel.library.items, item]
      }
    });

    setNewItem({});
  };

  const handleDeleteItem = (itemId: string) => {
    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        items: novel.library.items.filter(i => i.id !== itemId)
      }
    });
  };

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

  const handleAddChoice = () => {
    if (!newChoice.text) return;

    const choice: LibraryChoice = {
      id: `choice${Date.now()}`,
      text: newChoice.text,
      nextEpisodeId: newChoice.nextEpisodeId
    };

    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        choices: [...novel.library.choices, choice]
      }
    });

    setNewChoice({});
  };

  const handleDeleteChoice = (choiceId: string) => {
    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        choices: novel.library.choices.filter(c => c.id !== choiceId)
      }
    });
  };

  const handleItemImageUpload = async () => {
    const imageBase64 = await selectAndConvertImage();
    if (imageBase64) {
      setNewItem({ ...newItem, imageUrl: imageBase64 });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Библиотека ресурсов</h2>
        <p className="text-sm text-muted-foreground">
          Создавайте предметы, персонажей и варианты выбора для быстрого использования в эпизодах
        </p>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="items">
            <Icon name="Package" size={16} className="mr-2" />
            Предметы
          </TabsTrigger>
          <TabsTrigger value="characters">
            <Icon name="Users" size={16} className="mr-2" />
            Персонажи
          </TabsTrigger>
          <TabsTrigger value="choices">
            <Icon name="GitBranch" size={16} className="mr-2" />
            Выборы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Добавить предмет</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Название</Label>
                <Input
                  placeholder="Название предмета"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="text-foreground mt-1"
                />
              </div>
              <div>
                <Label>Изображение (URL)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="https://example.com/item.jpg"
                    value={newItem.imageUrl || ''}
                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                    className="text-foreground"
                  />
                  <Button onClick={handleItemImageUpload} variant="outline" size="icon">
                    <Icon name="Upload" size={16} />
                  </Button>
                </div>
              </div>
              {newItem.imageUrl && (
                <img src={newItem.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded" />
              )}
              <div>
                <Label>Описание</Label>
                <Textarea
                  placeholder="Описание предмета"
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={2}
                  className="text-foreground mt-1"
                />
              </div>
              <Button onClick={handleAddItem} className="w-full">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить предмет
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {novel.library.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 flex items-center justify-center bg-secondary/30 rounded-lg">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="characters" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Добавить персонажа</CardTitle>
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

          <div className="grid grid-cols-1 gap-4">
            {novel.library.characters.map((character) => (
              <Card key={character.id}>
                <CardContent className="p-4">
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
                              {character.images.length} изображений
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

                        {character.images.length > 0 && (
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
        </TabsContent>

        <TabsContent value="choices" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Добавить вариант выбора</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Текст варианта</Label>
                <Input
                  placeholder="Текст варианта выбора"
                  value={newChoice.text || ''}
                  onChange={(e) => setNewChoice({ ...newChoice, text: e.target.value })}
                  className="text-foreground mt-1"
                />
              </div>
              <div>
                <Label>Следующий эпизод (опционально)</Label>
                <Select
                  value={newChoice.nextEpisodeId || 'none'}
                  onValueChange={(value) => setNewChoice({ ...newChoice, nextEpisodeId: value === 'none' ? undefined : value })}
                >
                  <SelectTrigger className="text-foreground mt-1">
                    <SelectValue placeholder="Не выбран" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не выбран</SelectItem>
                    {novel.episodes.map((ep) => (
                      <SelectItem key={ep.id} value={ep.id}>{ep.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddChoice} className="w-full">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить вариант
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {novel.library.choices.map((choice) => (
              <Card key={choice.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{choice.text}</p>
                      {choice.nextEpisodeId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          → {novel.episodes.find(ep => ep.id === choice.nextEpisodeId)?.title || 'Неизвестный эпизод'}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDeleteChoice(choice.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LibraryManager;
