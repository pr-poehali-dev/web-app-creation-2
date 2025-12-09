import { useState } from 'react';
import { Paragraph, Novel, ParagraphType } from '@/types/novel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

    switch (newType) {
      case 'text':
        newParagraph = { id, type: 'text', content: 'Новый текст' };
        break;
      case 'dialogue':
        newParagraph = { id, type: 'dialogue', characterName: 'Персонаж', text: 'Текст диалога' };
        break;
      case 'choice':
        newParagraph = { 
          id, 
          type: 'choice', 
          question: 'Ваш выбор?',
          options: [
            { id: `opt${Date.now()}1`, text: 'Вариант 1' },
            { id: `opt${Date.now()}2`, text: 'Вариант 2' }
          ]
        };
        break;
      case 'item':
        newParagraph = { id, type: 'item', name: 'Предмет', description: 'Описание предмета' };
        break;
      case 'image':
        newParagraph = { id, type: 'image', url: 'https://via.placeholder.com/800x600' };
        break;
      case 'fade':
        newParagraph = { id, type: 'fade' };
        break;
      default:
        return;
    }

    onUpdate(index, newParagraph);
    setIsChangingType(false);
  };

  const handleImageUpload = async (target: 'dialogue' | 'item' | 'image') => {
    const imageBase64 = await selectAndConvertImage();
    if (imageBase64) {
      if (target === 'dialogue' && paragraph.type === 'dialogue') {
        onUpdate(index, { ...paragraph, characterImage: imageBase64 });
      } else if (target === 'item' && paragraph.type === 'item') {
        onUpdate(index, { ...paragraph, imageUrl: imageBase64 });
      } else if (target === 'image' && paragraph.type === 'image') {
        onUpdate(index, { ...paragraph, url: imageBase64 });
      }
    }
    setImageUrl('');
  };

  const handleImageUrl = (target: 'dialogue' | 'item' | 'image') => {
    if (!imageUrl) return;
    
    if (target === 'dialogue' && paragraph.type === 'dialogue') {
      onUpdate(index, { ...paragraph, characterImage: imageUrl });
    } else if (target === 'item' && paragraph.type === 'item') {
      onUpdate(index, { ...paragraph, imageUrl });
    } else if (target === 'image' && paragraph.type === 'image') {
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
        characterImage: character.images?.[0]?.url
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
      const newOptions = [...paragraph.options];
      newOptions[optIndex] = { 
        ...newOptions[optIndex], 
        text: choice.text, 
        nextEpisodeId: choice.nextEpisodeId 
      };
      onUpdate(index, { ...paragraph, options: newOptions });
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
    const option = paragraph.options[optIndex];
    const newChoice = {
      id: `choice${Date.now()}`,
      text: option.text,
      nextEpisodeId: option.nextEpisodeId
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
                      <SelectItem value="fade">FADE</SelectItem>
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

            {paragraph.type === 'fade' && (
              <div className="text-center py-4 text-muted-foreground">
                <Icon name="Minus" size={24} className="mx-auto mb-2" />
                <p className="text-sm">Затухание (пустая строка в MD)</p>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ParagraphEditor;