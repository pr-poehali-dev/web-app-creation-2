import { ItemParagraph, Novel } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ItemEditorProps {
  paragraph: ItemParagraph;
  index: number;
  novel: Novel;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  onUpdate: (index: number, updatedParagraph: ItemParagraph) => void;
  handleImageUrl: (target: 'dialogue' | 'item' | 'image') => void;
  handleImageUpload: (target: 'dialogue' | 'item' | 'image') => Promise<void>;
  handleSelectItem: (itemId: string) => void;
  addItemToLibrary: () => void;
}

function ItemEditor({ 
  paragraph, 
  index, 
  novel, 
  imageUrl, 
  setImageUrl, 
  onUpdate, 
  handleImageUrl, 
  handleImageUpload,
  handleSelectItem,
  addItemToLibrary
}: ItemEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          value="manual"
          onValueChange={(value) => {
            if (value !== 'manual') handleSelectItem(value);
          }}
        >
          <SelectTrigger className="text-foreground">
            <SelectValue placeholder="Выбрать из библиотеки" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Ввести вручную</SelectItem>
            {novel.library.items.map((item) => (
              <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={addItemToLibrary}
          title="Добавить в библиотеку"
        >
          <Icon name="BookmarkPlus" size={14} />
        </Button>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Название предмета"
          value={paragraph.name}
          onChange={(e) =>
            onUpdate(index, { ...paragraph, name: e.target.value })
          }
          className="text-foreground"
        />
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Icon name="Image" size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить изображение предмета</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>URL изображения</Label>
                <Input
                  placeholder="https://example.com/item.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-foreground mt-1"
                />
                <Button onClick={() => handleImageUrl('item')} className="w-full mt-2" disabled={!imageUrl}>
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
              <Button onClick={() => handleImageUpload('item')} variant="outline" className="w-full">
                <Icon name="Upload" size={14} className="mr-2" />
                Загрузить файл
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {paragraph.imageUrl && (
        <div className="flex items-center gap-2">
          <img src={paragraph.imageUrl} alt="Item" className="w-12 h-12 object-cover rounded" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUpdate(index, { ...paragraph, imageUrl: undefined })}
          >
            <Icon name="X" size={14} />
          </Button>
        </div>
      )}
      <Textarea
        placeholder="Описание предмета"
        value={paragraph.description}
        onChange={(e) =>
          onUpdate(index, { ...paragraph, description: e.target.value })
        }
        rows={3}
        className="text-foreground"
      />
      
      <div className="space-y-2 p-2 bg-muted/30 rounded">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Тип предмета</Label>
            <Select
              value={paragraph.itemType || 'collectible'}
              onValueChange={(value: 'collectible' | 'story') => {
                onUpdate(index, { ...paragraph, itemType: value });
              }}
            >
              <SelectTrigger className="text-foreground text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collectible">Коллекционный</SelectItem>
                <SelectItem value="story">Сюжетный</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs">Действие</Label>
            <Select
              value={paragraph.action || 'gain'}
              onValueChange={(value: 'gain' | 'lose') => {
                onUpdate(index, { ...paragraph, action: value });
              }}
            >
              <SelectTrigger className="text-foreground text-xs h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gain">Получить</SelectItem>
                <SelectItem value="lose">Потерять</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemEditor;