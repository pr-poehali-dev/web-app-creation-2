import { useState } from 'react';
import { Novel, LibraryItem } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { selectAndConvertImage } from '@/utils/fileHelpers';

interface ItemsLibraryProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

function ItemsLibrary({ novel, onUpdate }: ItemsLibraryProps) {
  const [newItem, setNewItem] = useState<Partial<LibraryItem>>({});
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddItem = () => {
    if (!newItem.name) return;
    
    const item: LibraryItem = {
      id: `item${Date.now()}`,
      name: newItem.name,
      description: newItem.description || '',
      imageUrl: newItem.imageUrl,
      itemType: newItem.itemType || 'collectible'
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

  const handleUpdateItem = () => {
    if (!editingItem) return;

    onUpdate({
      ...novel,
      library: {
        ...novel.library,
        items: novel.library.items.map(i => i.id === editingItem.id ? editingItem : i)
      }
    });

    setEditingItem(null);
    setIsEditDialogOpen(false);
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

  const handleItemImageUpload = async () => {
    const imageBase64 = await selectAndConvertImage();
    if (imageBase64) {
      setNewItem({ ...newItem, imageUrl: imageBase64 });
    }
  };

  const handleEditItemImageUpload = async () => {
    if (!editingItem) return;
    const imageBase64 = await selectAndConvertImage();
    if (imageBase64) {
      setEditingItem({ ...editingItem, imageUrl: imageBase64 });
    }
  };

  return (
    <div className="space-y-4 mt-6">
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
          <div>
            <Label>Тип предмета</Label>
            <Select
              value={newItem.itemType || 'collectible'}
              onValueChange={(value: 'collectible' | 'story') => {
                setNewItem({ ...newItem, itemType: value });
              }}
            >
              <SelectTrigger className="text-foreground mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collectible">Коллекционный</SelectItem>
                <SelectItem value="story">Сюжетный</SelectItem>
              </SelectContent>
            </Select>
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
                    <p className="text-xs text-muted-foreground mb-1">{item.description}</p>
                    <span className="text-xs px-2 py-0.5 bg-primary/20 rounded-full">
                      {item.itemType === 'story' ? 'Сюжетный' : 'Коллекционный'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Dialog open={isEditDialogOpen && editingItem?.id === item.id} onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) setEditingItem(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingItem(item)}
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Редактировать предмет</DialogTitle>
                      </DialogHeader>
                      {editingItem && (
                        <div className="space-y-3">
                          <div>
                            <Label>Название</Label>
                            <Input
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              className="text-foreground mt-1"
                            />
                          </div>
                          <div>
                            <Label>Изображение (URL)</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                placeholder="https://example.com/item.jpg"
                                value={editingItem.imageUrl || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                                className="text-foreground"
                              />
                              <Button onClick={handleEditItemImageUpload} variant="outline" size="icon">
                                <Icon name="Upload" size={16} />
                              </Button>
                            </div>
                          </div>
                          {editingItem.imageUrl && (
                            <img src={editingItem.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded" />
                          )}
                          <div>
                            <Label>Описание</Label>
                            <Textarea
                              value={editingItem.description}
                              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                              rows={2}
                              className="text-foreground mt-1"
                            />
                          </div>
                          <div>
                            <Label>Тип предмета</Label>
                            <Select
                              value={editingItem.itemType || 'collectible'}
                              onValueChange={(value: 'collectible' | 'story') => {
                                setEditingItem({ ...editingItem, itemType: value });
                              }}
                            >
                              <SelectTrigger className="text-foreground mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="collectible">Коллекционный</SelectItem>
                                <SelectItem value="story">Сюжетный</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={handleUpdateItem} className="w-full">
                            Сохранить изменения
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ItemsLibrary;
