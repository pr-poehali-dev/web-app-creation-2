import { useState, memo } from 'react';
import { DialogueParagraph, Novel } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import SubParagraphsEditor from '../SubParagraphsEditor';
import ComicFrameEditor from '../ComicFrameEditor';

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
  const character = novel.library.characters.find(c => c.name === paragraph.characterName);
  const allImages = character ? [
    ...(character.defaultImage ? [{ id: 'default', url: character.defaultImage, name: 'По умолчанию' }] : []),
    ...(character.images || [])
  ] : [];

  const selectedCharacterId = character?.id || "manual";

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          value={selectedCharacterId}
          onValueChange={(value) => {
            if (value === 'manual') {
              onUpdate(index, { ...paragraph, characterName: 'Персонаж', characterImage: undefined });
            } else {
              handleSelectCharacter(value);
            }
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
              {allImages.length > 0 && (
                <div>
                  <Label>Выбрать изображение</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {allImages.map((img) => (
                      <div
                        key={img.id}
                        className={`cursor-pointer border-2 rounded hover:border-primary transition-colors ${
                          paragraph.characterImage === img.url ? 'border-primary' : 'border-transparent'
                        }`}
                        onClick={() => {
                          onUpdate(index, { ...paragraph, characterImage: img.url });
                        }}
                      >
                        <img src={img.url} alt={img.name || ''} className="w-full h-20 object-contain rounded" />
                        <p className="text-xs text-center p-1 truncate">{img.name}</p>
                      </div>
                    ))}
                  </div>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">или добавить новое</span>
                    </div>
                  </div>
                </div>
              )}
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
              <Button onClick={() => handleImageUpload('dialogue')} className="w-full">
                <Icon name="Upload" size={14} className="mr-2" />
                Загрузить файл
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {paragraph.characterImage && allImages.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded">
          <img src={paragraph.characterImage} alt="Character" className="w-12 h-12 object-contain rounded" />
          <div className="flex-1 flex gap-1 overflow-x-auto">
            {allImages.map((img) => (
              <Button
                key={img.id}
                size="sm"
                variant={paragraph.characterImage === img.url ? "default" : "outline"}
                className="flex-shrink-0"
                onClick={() => onUpdate(index, { ...paragraph, characterImage: img.url })}
              >
                {img.name}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUpdate(index, { ...paragraph, characterImage: undefined })}
          >
            <Icon name="X" size={14} />
          </Button>
        </div>
      )}
      {paragraph.characterImage && allImages.length === 0 && (
        <div className="flex items-center gap-2">
          <img src={paragraph.characterImage} alt="Character" className="w-12 h-12 object-contain rounded" />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onUpdate(index, { ...paragraph, characterImage: undefined })}
          >
            <Icon name="X" size={14} />
          </Button>
        </div>
      )}
      <div className="space-y-3">
        <Textarea
          placeholder="Текст диалога"
          value={paragraph.text}
          onChange={(e) =>
            onUpdate(index, { ...paragraph, text: e.target.value })
          }
          rows={3}
          className="text-foreground"
        />
        <p className="text-xs text-muted-foreground">
          💡 Подсказка: используйте <code className="bg-secondary px-1 rounded">[слово|подсказка]</code> для интерактивных подсказок
        </p>

        <SubParagraphsEditor
          subParagraphs={paragraph.subParagraphs || []}
          onSubParagraphsChange={(subParagraphs) =>
            onUpdate(index, { ...paragraph, subParagraphs: subParagraphs.length > 0 ? subParagraphs : undefined })
          }
        />

        <ComicFrameEditor
          frames={paragraph.comicFrames || []}
          layout={paragraph.frameLayout || 'horizontal-3'}
          defaultAnimation={paragraph.frameAnimation}
          subParagraphs={paragraph.subParagraphs}
          onFramesChange={(frames) =>
            onUpdate(index, { ...paragraph, comicFrames: frames.length > 0 ? frames : undefined })
          }
          onLayoutChange={(layout) =>
            onUpdate(index, { ...paragraph, frameLayout: layout })
          }
          onAnimationChange={(animation) =>
            onUpdate(index, { ...paragraph, frameAnimation: animation })
          }
          onBothChange={(layout, frames) =>
            onUpdate(index, { 
              ...paragraph, 
              frameLayout: layout, 
              comicFrames: frames.length > 0 ? frames : undefined 
            })
          }
        />
      </div>
    </div>
  );
}

export default memo(DialogueEditor, (prevProps, nextProps) => {
  return (
    prevProps.paragraph.id === nextProps.paragraph.id &&
    JSON.stringify(prevProps.paragraph) === JSON.stringify(nextProps.paragraph) &&
    prevProps.index === nextProps.index
  );
});