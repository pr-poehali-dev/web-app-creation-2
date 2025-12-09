import { useState } from 'react';
import { Episode, Paragraph, ParagraphType, Novel } from '@/types/novel';
import EpisodeHeader from '@/components/EpisodeEditor/EpisodeHeader';
import ParagraphTypeButtons from '@/components/EpisodeEditor/ParagraphTypeButtons';
import ParagraphEditor from '@/components/EpisodeEditor/ParagraphEditor';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface EpisodeEditorProps {
  episode: Episode;
  novel: Novel;
  onUpdate: (episode: Episode) => void;
  onNovelUpdate: (novel: Novel) => void;
}

function EpisodeEditor({ episode, novel, onUpdate, onNovelUpdate }: EpisodeEditorProps) {
  const [insertingAt, setInsertingAt] = useState<number | null>(null);

  const handleAddParagraph = (type: ParagraphType, insertIndex?: number) => {
    let newParagraph: Paragraph;
    const id = `p${Date.now()}`;

    switch (type) {
      case 'text':
        newParagraph = { id, type: 'text', content: 'Новый текст' };
        break;
      case 'dialogue':
        newParagraph = { id, type: 'dialogue', characterName: 'Персонаж', text: 'Текст диалога' };
        // Добавляем персонажа в библиотеку
        const characterExists = novel.library.characters.some(c => c.name === 'Персонаж');
        if (!characterExists) {
          onNovelUpdate({
            ...novel,
            library: {
              ...novel.library,
              characters: [...novel.library.characters, { id: `char${Date.now()}`, name: 'Персонаж' }]
            }
          });
        }
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
        // Добавляем варианты в библиотеку
        const newChoices = [
          { id: `choice${Date.now()}1`, text: 'Вариант 1' },
          { id: `choice${Date.now()}2`, text: 'Вариант 2' }
        ];
        onNovelUpdate({
          ...novel,
          library: {
            ...novel.library,
            choices: [...novel.library.choices, ...newChoices]
          }
        });
        break;
      case 'item':
        newParagraph = { id, type: 'item', name: 'Предмет', description: 'Описание предмета' };
        // Добавляем предмет в библиотеку
        onNovelUpdate({
          ...novel,
          library: {
            ...novel.library,
            items: [...novel.library.items, { id: `item${Date.now()}`, name: 'Предмет', description: 'Описание предмета' }]
          }
        });
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

    const newParagraphs = [...episode.paragraphs];
    if (insertIndex !== undefined) {
      newParagraphs.splice(insertIndex + 1, 0, newParagraph);
    } else {
      newParagraphs.push(newParagraph);
    }

    onUpdate({
      ...episode,
      paragraphs: newParagraphs
    });
    
    setInsertingAt(null);
  };

  const handleUpdateParagraph = (index: number, updatedParagraph: Paragraph) => {
    const newParagraphs = [...episode.paragraphs];
    newParagraphs[index] = updatedParagraph;
    onUpdate({ ...episode, paragraphs: newParagraphs });
  };

  const handleDeleteParagraph = (index: number) => {
    onUpdate({
      ...episode,
      paragraphs: episode.paragraphs.filter((_, i) => i !== index)
    });
  };

  const handleMoveParagraph = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= episode.paragraphs.length) return;

    const newParagraphs = [...episode.paragraphs];
    [newParagraphs[index], newParagraphs[newIndex]] = [newParagraphs[newIndex], newParagraphs[index]];
    onUpdate({ ...episode, paragraphs: newParagraphs });
  };

  const handleToggleInsert = (index: number) => {
    setInsertingAt(insertingAt === index ? null : index);
  };

  return (
    <div className="space-y-4">
      <EpisodeHeader episode={episode} onUpdate={onUpdate} />

      <ParagraphTypeButtons onAddParagraph={(type) => handleAddParagraph(type)} />

      <div className="space-y-3">
        {episode.paragraphs.map((paragraph, index) => (
          <div key={paragraph.id}>
            <ParagraphEditor
              paragraph={paragraph}
              index={index}
              episodeId={episode.id}
              novel={novel}
              totalParagraphs={episode.paragraphs.length}
              onUpdate={handleUpdateParagraph}
              onDelete={handleDeleteParagraph}
              onMove={handleMoveParagraph}
              onToggleInsert={handleToggleInsert}
            />
            
            {insertingAt === index && (
              <div className="flex gap-2 justify-center my-2 p-2 bg-secondary/20 rounded-lg">
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('text', index)}>
                  <Icon name="FileText" size={14} className="mr-1" />
                  Текст
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('dialogue', index)}>
                  <Icon name="MessageSquare" size={14} className="mr-1" />
                  Диалог
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('choice', index)}>
                  <Icon name="GitBranch" size={14} className="mr-1" />
                  Выбор
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('item', index)}>
                  <Icon name="Package" size={14} className="mr-1" />
                  Предмет
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('image', index)}>
                  <Icon name="Image" size={14} className="mr-1" />
                  Картинка
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleAddParagraph('fade', index)}>
                  <Icon name="Minus" size={14} className="mr-1" />
                  Затухание
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {episode.paragraphs.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Добавьте параграфы к эпизоду или импортируйте из MD файла
        </div>
      )}
    </div>
  );
}

export default EpisodeEditor;