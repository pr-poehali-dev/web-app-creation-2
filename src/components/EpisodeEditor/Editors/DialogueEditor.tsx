import { useState } from 'react';
import { DialogueParagraph, Novel } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface DialogueEditorProps {
  paragraph: DialogueParagraph;
  index: number;
  novel: Novel;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  onUpdate: (index: number, updatedParagraph: DialogueParagraph) => void;
  handleImageUrl: (target: 'dialogue' | 'item' | 'image') => void;
  handleImageUpload: (target: 'dialogue' | 'item' | 'image') => Promise<void>;
  handleSelectCharacter: (characterId: string) => void;
}

function DialogueEditor({ 
  paragraph, 
  index, 
  novel, 
  imageUrl, 
  setImageUrl, 
  onUpdate, 
  handleImageUrl, 
  handleImageUpload,
  handleSelectCharacter
}: DialogueEditorProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          value="manual"
          onValueChange={(value) => {
            if (value !== 'manual') handleSelectCharacter(value);
          }}
        >
          <SelectTrigger className="text-foreground">
            <SelectValue placeholder="Выбрать из библиотеки" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Ввести вручную</SelectItem>
            {novel.library.characters.map((char) => (
              <SelectItem key={char.id} value={char.id}>{char.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Имя персонажа"
          value={paragraph.characterName}
          onChange={(e) =>
            onUpdate(index, { ...paragraph, characterName: e.target.value })
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
              <DialogTitle>Добавить изображение персонажа</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {(() => {
                const character = novel.library.characters.find(c => c.name === paragraph.characterName);
                if (character && character.images.length > 0) {
                  return (
                    <div>
                      <Label>Выбрать из персонажа</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {character.images.map((img) => (
                          <div
                            key={img.id}
                            className="cursor-pointer border rounded hover:border-primary transition-colors"
                            onClick={() => {
                              onUpdate(index, { ...paragraph, characterImage: img.url });
                            }}
                          >
                            <img src={img.url} alt={img.name || ''} className="w-full h-20 object-cover rounded" />
                            <p className="text-xs text-center p-1">{img.name}</p>
                          </div>
                        ))}
                      </div>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">или</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              <div>
                <Label>URL изображения</Label>
                <Input
                  placeholder="https://example.com/character.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-foreground mt-1"
                />
                <Button onClick={() => handleImageUrl('dialogue')} className="w-full mt-2" disabled={!imageUrl}>
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
              <Button onClick={() => handleImageUpload('dialogue')} variant="outline" className="w-full">
                <Icon name="Upload" size={14} className="mr-2" />
                Загрузить файл
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {paragraph.characterImage && (
        <div className="flex items-center gap-2">
          <img src={paragraph.characterImage} alt="Character" className="w-12 h-12 object-cover rounded" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUpdate(index, { ...paragraph, characterImage: undefined })}
          >
            <Icon name="X" size={14} />
          </Button>
        </div>
      )}
      <Textarea
        placeholder="Текст диалога"
        value={paragraph.text}
        onChange={(e) =>
          onUpdate(index, { ...paragraph, text: e.target.value })
        }
        rows={3}
        className="text-foreground"
      />
    </div>
  );
}

export default DialogueEditor;
