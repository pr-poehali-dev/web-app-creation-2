import { Episode, Novel } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { parseMarkdownToEpisode, getMarkdownTemplate } from '@/utils/markdownImport';

interface EpisodeImportExportProps {
  episode: Episode;
  novel: Novel;
  onNovelUpdate: (novel: Novel) => void;
}

function EpisodeImportExport({ episode, novel, onNovelUpdate }: EpisodeImportExportProps) {
  const handleImportMarkdown = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const importedEpisode = parseMarkdownToEpisode(text, episode.id);
      
      // Автоматический импорт в библиотеку
      const newCharacters = [...novel.library.characters];
      const newItems = [...novel.library.items];
      const newChoices = [...novel.library.choices];

      // Сначала собираем уникальных персонажей для генерации изображений
      const charactersToGenerate: { name: string; needsImage: boolean }[] = [];
      
      importedEpisode.paragraphs.forEach(para => {
        // Импорт персонажей из диалогов
        if (para.type === 'dialogue' && para.characterName) {
          const exists = newCharacters.some(c => c.name === para.characterName);
          const shouldGenerate = !para.characterImage || (!para.characterImage.startsWith('data:') && 
                                 !para.characterImage.startsWith('http') && para.characterImage.length <= 2);
          
          console.log(`Персонаж "${para.characterName}": изображение="${para.characterImage}", генерировать=${shouldGenerate}`);
          
          if (!exists) {
            const charId = `char${Date.now()}_${para.characterName}`;
            newCharacters.push({
              id: charId,
              name: para.characterName,
              images: para.characterImage && !shouldGenerate ? [{ id: `img${Date.now()}`, url: para.characterImage }] : []
            });
          } else if (para.characterImage && !shouldGenerate) {
            // Добавляем изображение к существующему персонажу
            const char = newCharacters.find(c => c.name === para.characterName);
            if (char && !char.images?.some(img => img.url === para.characterImage)) {
              char.images = [...(char.images || []), { id: `img${Date.now()}`, url: para.characterImage }];
            }
          }
          
          // Добавляем в список для генерации, если нужно
          if (shouldGenerate && !charactersToGenerate.some(c => c.name === para.characterName)) {
            charactersToGenerate.push({ name: para.characterName, needsImage: true });
          }
        }

        // Импорт предметов
        if (para.type === 'item' && para.name) {
          const exists = newItems.some(i => i.name === para.name);
          if (!exists) {
            newItems.push({
              id: `item${Date.now()}_${para.name}`,
              name: para.name,
              description: para.description,
              imageUrl: para.imageUrl
            });
          }
        }

        // Импорт выборов
        if (para.type === 'choice' && para.options) {
          para.options.forEach(opt => {
            const exists = newChoices.some(c => c.text === opt.text);
            if (!exists) {
              newChoices.push({
                id: `choice${Date.now()}_${opt.id}`,
                text: opt.text,
                nextEpisodeId: opt.nextEpisodeId
              });
            }
          });
        }
      });
      
      // Обновляем без генерации - генерация будет позже через DialogueBox
      console.log('Персонажи добавлены в библиотеку. Генерация изображений будет при первом показе диалога.');

      // Обновляем novel с новой библиотекой И эпизод одновременно
      console.log('Импортировано в библиотеку:');
      console.log('Characters:', newCharacters);
      console.log('Items:', newItems);
      console.log('Choices:', newChoices);
      console.log('Всего параграфов для импорта:', importedEpisode.paragraphs.length);
      
      // Сохраняем первый параграф-фон, если он уже был создан
      const existingBackground = episode.paragraphs[0]?.type === 'background' ? episode.paragraphs[0] : null;
      let mergedParagraphs = importedEpisode.paragraphs;
      
      if (existingBackground) {
        // Проверяем, есть ли фон в импортированных параграфах
        const hasImportedBackground = importedEpisode.paragraphs[0]?.type === 'background';
        if (hasImportedBackground) {
          // Заменяем импортированный фон на существующий
          mergedParagraphs = [existingBackground, ...importedEpisode.paragraphs.slice(1)];
        } else {
          // Добавляем существующий фон в начало
          mergedParagraphs = [existingBackground, ...importedEpisode.paragraphs];
        }
      }
      
      const updatedEpisode = {
        ...episode,
        title: importedEpisode.title,
        paragraphs: mergedParagraphs,
        backgroundMusic: importedEpisode.backgroundMusic || episode.backgroundMusic
      };
      
      onNovelUpdate({
        ...novel,
        library: {
          characters: newCharacters,
          items: newItems,
          choices: newChoices
        },
        episodes: novel.episodes.map(ep => 
          ep.id === episode.id ? updatedEpisode : ep
        )
      });
    };
    input.click();
  };

  const handleExportTemplate = () => {
    const template = getMarkdownTemplate();
    const blob = new Blob([template], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'episode_template.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={handleImportMarkdown}>
        <Icon name="FileUp" size={14} className="mr-1" />
        Импорт из MD
      </Button>
      <Button size="sm" variant="outline" onClick={handleExportTemplate}>
        <Icon name="FileDown" size={14} className="mr-1" />
        Скачать шаблон
      </Button>
    </div>
  );
}

export default EpisodeImportExport;
