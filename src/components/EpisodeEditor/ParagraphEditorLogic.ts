import { Paragraph, Novel, ParagraphType } from '@/types/novel';
import { selectAndUploadImage } from '@/utils/imageUpload';

export interface ParagraphEditorHandlers {
  handleTypeChange: (newType: ParagraphType) => void;
  handleImageUpload: (target: 'dialogue' | 'item' | 'image' | 'background') => Promise<void>;
  handleMobileImageUpload: (target: 'image' | 'background') => Promise<void>;
  handleImageUrl: (target: 'dialogue' | 'item' | 'image' | 'background') => void;
  handleMobileImageUrl: (target: 'image' | 'background') => void;
  handleSelectCharacter: (characterId: string) => void;
  handleSelectItem: (itemId: string) => void;
  handleSelectChoice: (optIndex: number, choiceId: string) => void;
  addItemToLibrary: () => void;
  addChoiceToLibrary: (optIndex: number) => void;
}

export function createParagraphEditorHandlers(
  paragraph: Paragraph,
  index: number,
  novel: Novel,
  imageUrl: string,
  setImageUrl: (url: string) => void,
  mobileImageUrl: string,
  setMobileImageUrl: (url: string) => void,
  setIsChangingType: (value: boolean) => void,
  onUpdate: (index: number, updatedParagraph: Paragraph) => void,
  onNovelUpdate: (novel: Novel) => void
): ParagraphEditorHandlers {
  const handleTypeChange = (newType: ParagraphType) => {
    let newParagraph: Paragraph;
    const id = paragraph.id;

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
          url: paragraph.type === 'image' ? paragraph.url : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23ddd" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E800×600%3C/text%3E%3C/svg%3E',
          alt: paragraph.type === 'image' ? paragraph.alt : undefined
        };
        break;
      case 'background':
        newParagraph = { 
          id, 
          type: 'background', 
          url: paragraph.type === 'background' ? paragraph.url : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"%3E%3Crect fill="%23333" width="1920" height="1080"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="48" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E1920×1080%3C/text%3E%3C/svg%3E',
          alt: paragraph.type === 'background' ? paragraph.alt : undefined
        };
        break;
      case 'pause':
        newParagraph = {
          id,
          type: 'pause',
          duration: paragraph.type === 'pause' ? paragraph.duration : 500
        };
        break;
      default:
        return;
    }

    onUpdate(index, newParagraph);
    setIsChangingType(false);
  };

  const handleImageUpload = async (target: 'dialogue' | 'item' | 'image' | 'background') => {
    const imageUrl = await selectAndUploadImage();
    if (imageUrl) {
      if (target === 'dialogue' && paragraph.type === 'dialogue') {
        onUpdate(index, { ...paragraph, characterImage: imageUrl });
      } else if (target === 'item' && paragraph.type === 'item') {
        onUpdate(index, { ...paragraph, imageUrl });
      } else if (target === 'image' && paragraph.type === 'image') {
        onUpdate(index, { ...paragraph, url: imageUrl });
      } else if (target === 'background' && paragraph.type === 'background') {
        onUpdate(index, { ...paragraph, url: imageUrl });
      }
    }
    setImageUrl('');
  };

  const handleMobileImageUpload = async (target: 'image' | 'background') => {
    const imageUrl = await selectAndUploadImage();
    if (imageUrl) {
      if (target === 'image' && paragraph.type === 'image') {
        onUpdate(index, { ...paragraph, mobileUrl: imageUrl });
      } else if (target === 'background' && paragraph.type === 'background') {
        onUpdate(index, { ...paragraph, mobileUrl: imageUrl });
      }
    }
    setMobileImageUrl('');
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

  const handleMobileImageUrl = (target: 'image' | 'background') => {
    if (!mobileImageUrl) return;
    
    if (target === 'image' && paragraph.type === 'image') {
      onUpdate(index, { ...paragraph, mobileUrl: mobileImageUrl });
    } else if (target === 'background' && paragraph.type === 'background') {
      onUpdate(index, { ...paragraph, mobileUrl: mobileImageUrl });
    }
    setMobileImageUrl('');
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

  return {
    handleTypeChange,
    handleImageUpload,
    handleMobileImageUpload,
    handleImageUrl,
    handleMobileImageUrl,
    handleSelectCharacter,
    handleSelectItem,
    handleSelectChoice,
    addItemToLibrary,
    addChoiceToLibrary
  };
}