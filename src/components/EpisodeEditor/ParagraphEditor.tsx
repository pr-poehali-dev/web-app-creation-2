import { useState } from 'react';
import { Paragraph, Novel, ParagraphType } from '@/types/novel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { selectAndConvertImage } from '@/utils/fileHelpers';
import { getParagraphNumber } from '@/utils/paragraphNumbers';
import TextEditor from './Editors/TextEditor';
import DialogueEditor from './Editors/DialogueEditor';
import ChoiceEditor from './Editors/ChoiceEditor';
import ItemEditor from './Editors/ItemEditor';
import ImageEditor from './Editors/ImageEditor';

interface ParagraphEditorProps {
  paragraph: Paragraph;
  index: number;
  episodeId: string;
  novel: Novel;
  totalParagraphs: number;
  onUpdate: (index: number, updatedParagraph: Paragraph) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onToggleInsert: (index: number) => void;
  onNovelUpdate: (novel: Novel) => void;
}

function ParagraphEditor({
  paragraph,
  index,
  episodeId,
  novel,
  totalParagraphs,
  onUpdate,
  onDelete,
  onMove,
  onToggleInsert,
  onNovelUpdate
}: ParagraphEditorProps) {
  const [isChangingType, setIsChangingType] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleTypeChange = (newType: ParagraphType) => {
    let newParagraph: Paragraph;
    const id = paragraph.id;

    // Извлекаем текст из текущего параграфа
    let preservedText = '';
    if (paragraph.type === 'text') {
      preservedText = paragraph.content;
    } else if (paragraph.type === 'dialogue') {
      preservedText = paragraph.text;
    } else if (paragraph.type === 'item') {
      preservedText = paragraph.description;
    } else if (paragraph.type === 'choice') {
      preservedText = paragraph.question;
    }

    switch (newType) {
      case 'text':
        newParagraph = { id, type: 'text', content: preservedText || 'Новый текст' };
        break;
      case 'dialogue':
        newParagraph = { 
          id, 
          type: 'dialogue', 
          characterName: paragraph.type === 'dialogue' ? paragraph.characterName : 'Персонаж',
          characterImage: paragraph.type === 'dialogue' ? paragraph.characterImage : undefined,
          text: preservedText || 'Текст диалога' 
        };
        break;
      case 'choice':
        newParagraph = { 
          id, 
          type: 'choice', 
          question: preservedText || 'Ваш выбор?',
          options: paragraph.type === 'choice' ? paragraph.options : [
            { id: `opt${Date.now()}1`, text: 'Вариант 1' },
            { id: `opt${Date.now()}2`, text: 'Вариант 2' }
          ]
        };
        break;
      case 'item':
        newParagraph = { 
          id, 
          type: 'item', 
          name: paragraph.type === 'item' ? paragraph.name : 'Предмет',
          description: preservedText || 'Описание предмета',
          imageUrl: paragraph.type === 'item' ? paragraph.imageUrl : undefined
        };
        break;
      case 'image':
        newParagraph = { 
          id, 
          type: 'image', 
          url: paragraph.type === 'image' ? paragraph.url : 'https://via.placeholder.com/800x600',
          alt: paragraph.type === 'image' ? paragraph.alt : undefined
        };
        break;
      case 'background':
        newParagraph = { 
          id, 
          type: 'background', 
          url: paragraph.type === 'background' ? paragraph.url : 'https://via.placeholder.com/1920x1080',
          alt: paragraph.type === 'background' ? paragraph.alt : undefined
        };
        break;
      default:
        return;
    }

    onUpdate(index, newParagraph);
    setIsChangingType(false);
  };

  const handleImageUpload = async (target: 'dialogue' | 'item' | 'image' | 'background') => {
    const imageBase64 = await selectAndConvertImage();
    if (imageBase64) {
      if (target === 'dialogue' && paragraph.type === 'dialogue') {
        onUpdate(index, { ...paragraph, characterImage: imageBase64 });
      } else if (target === 'item' && paragraph.type === 'item') {
        onUpdate(index, { ...paragraph, imageUrl: imageBase64 });
      } else if (target === 'image' && paragraph.type === 'image') {
        onUpdate(index, { ...paragraph, url: imageBase64 });
      } else if (target === 'background' && paragraph.type === 'background') {
        onUpdate(index, { ...paragraph, url: imageBase64 });
      }
    }
    setImageUrl('');
  };

  const handleImageUrl = (target: 'dialogue' | 'item' | 'image' | 'background') => {
    if (!imageUrl) return;
    
    if (target === 'dialogue' && paragraph.type === 'dialogue') {
      onUpdate(index, { ...paragraph, characterImage: imageUrl });
    } else if (target === 'item' && paragraph.type === 'item') {
      onUpdate(index, { ...paragraph, imageUrl });
    } else if (target === 'image' && paragraph.type === 'image') {
      onUpdate(index, { ...paragraph, url: imageUrl });
    } else if (target === 'background' && paragraph.type === 'background') {
      onUpdate(index, { ...paragraph, url: imageUrl });
    }
    setImageUrl('');
  };

  const handleSelectCharacter = (characterId: string) => {
    if (paragraph.type !== 'dialogue') return;
    const character = novel.library.characters.find(c => c.id === characterId);
    if (character) {
      onUpdate(index, { 
        ...paragraph, 
        characterName: character.name,
        characterImage: character.defaultImage || character.images?.[0]?.url
      });
    }
  };

  const handleSelectItem = (itemId: string) => {
    if (paragraph.type !== 'item') return;
    const item = novel.library.items.find(i => i.id === itemId);
    if (item) {
      onUpdate(index, { 
        ...paragraph, 
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl
      });
      
      const exists = novel.library.items.some(i => i.id === itemId);
      if (!exists) {
        onNovelUpdate({
          ...novel,
          library: {
            ...novel.library,
            items: [...novel.library.items, { id: itemId, name: item.name, description: item.description, imageUrl: item.imageUrl }]
          }
        });
      }
    }
  };

  const handleSelectChoice = (optIndex: number, choiceId: string) => {
    if (paragraph.type !== 'choice') return;
    const choice = novel.library.choices.find(c => c.id === choiceId);
    if (choice) {
      onUpdate(index, { 
        ...paragraph, 
        question: choice.question,
        options: choice.options.map(opt => ({
          ...opt,
          id: `opt${Date.now()}_${Math.random()}`
        }))
      });
    }
  };

  const addItemToLibrary = () => {
    if (paragraph.type !== 'item') return;
    const newItem = {
      id: `item${Date.now()}`,
      name: paragraph.name,
      description: paragraph.description,
      imageUrl: paragraph.imageUrl
    };
    
    onNovelUpdate({
      ...novel,
      library: {
        ...novel.library,
        items: [...novel.library.items, newItem]
      }
    });
  };

  const addChoiceToLibrary = (optIndex: number) => {
    if (paragraph.type !== 'choice') return;
    const newChoice = {
      id: `choice${Date.now()}`,
      question: paragraph.question,
      options: paragraph.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        nextEpisodeId: opt.nextEpisodeId,
        nextParagraphIndex: opt.nextParagraphIndex
      }))
    };
    
    onNovelUpdate({
      ...novel,
      library: {
        ...novel.library,
        choices: [...novel.library.choices, newChoice]
      }
    });
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMove(index, 'up')}
              disabled={index === 0}
            >
              <Icon name="ChevronUp" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onMove(index, 'down')}
              disabled={index === totalParagraphs - 1}
            >
              <Icon name="ChevronDown" size={16} />
            </Button>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-primary">
                  {getParagraphNumber(novel, episodeId, index)}
                </span>
                {isChangingType ? (
                  <Select value={paragraph.type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="h-7 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">TEXT</SelectItem>
                      <SelectItem value="dialogue">DIALOGUE</SelectItem>
                      <SelectItem value="choice">CHOICE</SelectItem>
                      <SelectItem value="item">ITEM</SelectItem>
                      <SelectItem value="image">IMAGE</SelectItem>
                      <SelectItem value="background">BACKGROUND</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <button
                    onClick={() => setIsChangingType(true)}
                    className="text-xs font-medium text-muted-foreground uppercase hover:text-primary transition-colors cursor-pointer"
                  >
                    {paragraph.type}
                  </button>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToggleInsert(index)}
                >
                  <Icon name="Plus" size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onDelete(index)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            </div>

            {(paragraph.type === 'text' || paragraph.type === 'dialogue' || paragraph.type === 'item') && (
              <div className="flex items-center gap-2 pb-2">
                <Checkbox
                  id={`slow-fade-${index}`}
                  checked={paragraph.slowFade || false}
                  onCheckedChange={(checked) => onUpdate(index, { ...paragraph, slowFade: checked as boolean })}
                />
                <Label htmlFor={`slow-fade-${index}`} className="text-sm text-muted-foreground cursor-pointer">
                  Breathing pause (0.3s)
                </Label>
              </div>
            )}

            {paragraph.type === 'text' && (
              <TextEditor
                paragraph={paragraph}
                index={index}
                onUpdate={onUpdate}
              />
            )}

            {paragraph.type === 'dialogue' && (
              <DialogueEditor
                paragraph={paragraph}
                index={index}
                novel={novel}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                onUpdate={onUpdate}
                handleImageUrl={handleImageUrl}
                handleImageUpload={handleImageUpload}
                handleSelectCharacter={handleSelectCharacter}
              />
            )}

            {paragraph.type === 'choice' && (
              <ChoiceEditor
                paragraph={paragraph}
                index={index}
                novel={novel}
                onUpdate={onUpdate}
                handleSelectChoice={handleSelectChoice}
                addChoiceToLibrary={addChoiceToLibrary}
              />
            )}

            {paragraph.type === 'item' && (
              <ItemEditor
                paragraph={paragraph}
                index={index}
                novel={novel}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                onUpdate={onUpdate}
                handleImageUrl={handleImageUrl}
                handleImageUpload={handleImageUpload}
                handleSelectItem={handleSelectItem}
                addItemToLibrary={addItemToLibrary}
              />
            )}

            {paragraph.type === 'image' && (
              <ImageEditor
                paragraph={paragraph}
                index={index}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                onUpdate={onUpdate}
                handleImageUrl={handleImageUrl}
                handleImageUpload={handleImageUpload}
              />
            )}

            {paragraph.type === 'background' && (
              <ImageEditor
                paragraph={paragraph}
                index={index}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                onUpdate={onUpdate}
                handleImageUrl={() => handleImageUrl('background')}
                handleImageUpload={() => handleImageUpload('background')}
                label="Фоновое изображение"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ParagraphEditor;