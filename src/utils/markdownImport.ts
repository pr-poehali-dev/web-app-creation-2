import { Episode, Paragraph } from '@/types/novel';

export const parseMarkdownToEpisode = (markdown: string, episodeId: string): Episode => {
  const lines = markdown.split('\n');
  let title = 'Импортированный эпизод';
  let backgroundMusic: string | undefined;
  const paragraphs: Paragraph[] = [];
  
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (line.startsWith('# ')) {
      title = line.substring(2).trim();
      i++;
      continue;
    }
    
    if (line.startsWith('[MUSIC:') && line.endsWith(']')) {
      backgroundMusic = line.substring(7, line.length - 1).trim();
      i++;
      continue;
    }
    
    if (!line) {
      // Пустая строка - пропускаем
      i++;
      continue;
    }
    
    if (!line.startsWith('[')) {
      // Обычный текст без тега - один абзац = один параграф
      let content = '';
      while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('[')) {
        content += (content ? ' ' : '') + lines[i].trim();
        i++;
      }
      if (content) {
        paragraphs.push({
          id: `p${Date.now()}_${paragraphs.length}`,
          type: 'text',
          content
        });
      }
      continue;
    }
    
    if (line.startsWith('[TEXT]')) {
      i++;
      let content = '';
      while (i < lines.length && !lines[i].trim().startsWith('[')) {
        if (lines[i].trim()) {
          content += (content ? '\n\n' : '') + lines[i].trim();
        }
        i++;
      }
      if (content) {
        paragraphs.push({
          id: `p${Date.now()}_${paragraphs.length}`,
          type: 'text',
          content
        });
      }
      continue;
    }
    
    if (line.startsWith('[DIALOGUE:')) {
      const characterName = line.substring(10, line.indexOf(']')).trim();
      const characterImageMatch = line.match(/\[IMG:(.*?)\]/);
      const characterImage = characterImageMatch ? characterImageMatch[1].trim() : undefined;
      
      i++;
      let text = '';
      while (i < lines.length && !lines[i].trim().startsWith('[')) {
        if (lines[i].trim()) {
          text += (text ? '\n\n' : '') + lines[i].trim();
        }
        i++;
      }
      
      if (text) {
        paragraphs.push({
          id: `p${Date.now()}_${paragraphs.length}`,
          type: 'dialogue',
          characterName,
          characterImage,
          text
        });
      }
      continue;
    }
    
    if (line.startsWith('[IMAGE:') && line.endsWith(']')) {
      const url = line.substring(7, line.length - 1).trim();
      paragraphs.push({
        id: `p${Date.now()}_${paragraphs.length}`,
        type: 'image',
        url
      });
      i++;
      continue;
    }
    
    if (line.startsWith('[ITEM:')) {
      const nameMatch = line.match(/\[ITEM:(.*?)\]/);
      const imageMatch = line.match(/\[IMG:(.*?)\]/);
      const name = nameMatch ? nameMatch[1].trim() : 'Предмет';
      const imageUrl = imageMatch ? imageMatch[1].trim() : undefined;
      
      i++;
      let description = '';
      while (i < lines.length && !lines[i].trim().startsWith('[')) {
        if (lines[i].trim()) {
          description += (description ? '\n\n' : '') + lines[i].trim();
        }
        i++;
      }
      
      paragraphs.push({
        id: `p${Date.now()}_${paragraphs.length}`,
        type: 'item',
        name,
        description: description || 'Описание предмета',
        imageUrl
      });
      continue;
    }
    
    if (line.startsWith('[CHOICE]')) {
      i++;
      let question = '';
      const options: { id: string; text: string; nextEpisodeId?: string }[] = [];
      
      while (i < lines.length && !lines[i].trim().startsWith('[')) {
        const choiceLine = lines[i].trim();
        
        if (!choiceLine.startsWith('-') && !question) {
          question = choiceLine;
        } else if (choiceLine.startsWith('- ')) {
          const optionText = choiceLine.substring(2);
          const linkMatch = optionText.match(/\[GOTO:(.*?)\]/);
          const text = linkMatch 
            ? optionText.substring(0, optionText.indexOf('[GOTO:')).trim()
            : optionText;
          const nextEpisodeId = linkMatch ? linkMatch[1].trim() : undefined;
          
          options.push({
            id: `opt${Date.now()}_${options.length}`,
            text,
            nextEpisodeId
          });
        }
        i++;
      }
      
      if (options.length > 0) {
        paragraphs.push({
          id: `p${Date.now()}_${paragraphs.length}`,
          type: 'choice',
          question: question || 'Ваш выбор?',
          options
        });
      }
      continue;
    }
    
    i++;
  }
  
  return {
    id: episodeId,
    title,
    paragraphs,
    position: { x: 100, y: 100 },
    backgroundMusic
  };
};

export const getMarkdownTemplate = (): string => {
  return `# Название эпизода

[MUSIC:url_или_base64_музыки]

Обычный текст параграфа. Можно писать несколько строк.
Пустая строка создаёт новый текстовый параграф.

Это уже второй параграф.

[DIALOGUE:Имя персонажа] [IMG:эмодзи_или_url]
Текст диалога персонажа.
Может быть многострочным.

[IMAGE:url_или_base64_изображения]

[ITEM:Название предмета] [IMG:эмодзи_или_url]
Описание предмета.

[CHOICE]
Вопрос для выбора?
- Вариант 1 [GOTO:episode_id]
- Вариант 2 [GOTO:another_episode_id]
- Вариант 3

Продолжение текста после выбора...`;
};