import { useState } from 'react';
import { Novel, LibraryItem, LibraryCharacter, LibraryChoice } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      image: newCharacter.image
    };

    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        characters: [...novel.library.characters, character]
      }
    });

    setNewCharacter({});
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

  const handleCharacterImageUpload = async () => {
    const imageBase64 = await selectAndConvertImage();
    if (imageBase64) {
      setNewCharacter({ ...newCharacter, image: imageBase64 });
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
              <div className="flex gap-2">
                <Input
                  placeholder="Название предмета"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="text-foreground"
                />
                <Button onClick={handleItemImageUpload} variant="outline">
                  <Icon name="Upload" size={16} />
                </Button>
              </div>
              {newItem.imageUrl && (
                <div className="flex items-center gap-2">
                  {newItem.imageUrl.startsWith('data:') ? (
                    <img src={newItem.imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded" />
                  ) : (
                    <span className="text-3xl">{newItem.imageUrl}</span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setNewItem({ ...newItem, imageUrl: undefined })}
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              )}
              <Textarea
                placeholder="Описание предмета"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={2}
                className="text-foreground"
              />
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
                        {item.imageUrl?.startsWith('data:') ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl">{item.imageUrl || '📦'}</span>
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
              <div className="flex gap-2">
                <Input
                  placeholder="Имя персонажа"
                  value={newCharacter.name || ''}
                  onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                  className="text-foreground"
                />
                <Button onClick={handleCharacterImageUpload} variant="outline">
                  <Icon name="Upload" size={16} />
                </Button>
              </div>
              {newCharacter.image && (
                <div className="flex items-center gap-2">
                  {newCharacter.image.startsWith('data:') ? (
                    <img src={newCharacter.image} alt="Preview" className="w-12 h-12 object-cover rounded-full" />
                  ) : (
                    <span className="text-3xl">{newCharacter.image}</span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setNewCharacter({ ...newCharacter, image: undefined })}
                  >
                    <Icon name="X" size={14} />
                  </Button>
                </div>
              )}
              <Button onClick={handleAddCharacter} className="w-full">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить персонажа
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {novel.library.characters.map((character) => (
              <Card key={character.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 flex items-center justify-center bg-secondary/30 rounded-full">
                        {character.image?.startsWith('data:') ? (
                          <img src={character.image} alt={character.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-3xl">{character.image || '👤'}</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-foreground">{character.name}</h4>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDeleteCharacter(character.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
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
              <Input
                placeholder="Текст варианта"
                value={newChoice.text || ''}
                onChange={(e) => setNewChoice({ ...newChoice, text: e.target.value })}
                className="text-foreground"
              />
              <Input
                placeholder="ID следующего эпизода (необязательно)"
                value={newChoice.nextEpisodeId || ''}
                onChange={(e) => setNewChoice({ ...newChoice, nextEpisodeId: e.target.value })}
                className="text-foreground"
              />
              <Button onClick={handleAddChoice} className="w-full">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить вариант
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {novel.library.choices.map((choice) => (
              <Card key={choice.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-foreground mb-1">{choice.text}</p>
                      {choice.nextEpisodeId && (
                        <p className="text-xs text-muted-foreground">
                          <Icon name="ArrowRight" size={12} className="inline mr-1" />
                          {choice.nextEpisodeId}
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
