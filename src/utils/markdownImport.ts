import { Episode, Paragraph } from '@/types/novel';

export const parseMarkdownToEpisode = (markdown: string, episodeId: string): Episode => {
  const lines = markdown.split('\n');
  let title = 'Импортированный эпизод';
  let backgroundMusic: string | undefined;
  const paragraphs: Paragraph[] = [];
  
  // Первый параграф всегда с фоном
  paragraphs.push({
    id: `p${Date.now()}_bg`,
    type: 'background',
    url: 'https://cdn.poehali.dev/files/result (39)_1.png'
  } as any);
  
  let i = 0;
  let consecutiveEmptyLines = 0;
  let currentParagraphIndex: number = -1; // Индекс параграфа для подпараграфов
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (line.startsWith('# ')) {
      title = line.substring(2).trim();
      i++;
      consecutiveEmptyLines = 0;
      continue;
    }
    
    if (line.startsWith('[MUSIC:') && line.endsWith(']')) {
      backgroundMusic = line.substring(7, line.length - 1).trim();
      i++;
      consecutiveEmptyLines = 0;
      continue;
    }
    
    if (!line) {
      consecutiveEmptyLines++;
      i++;
      continue;
    }
    
    // Сбрасываем счетчик пустых строк
    consecutiveEmptyLines = 0;
    
    // Проверка на подпараграф (начинается с >)
    if (line.startsWith('>')) {
      const subContent = line.substring(1).trim();
      
      console.log('[Import Debug] Found subparagraph:', subContent);
      console.log('[Import Debug] currentParagraphIndex:', currentParagraphIndex);
      
      // Если есть предыдущий текстовый/диалоговый параграф, добавляем к нему подпараграф
      if (currentParagraphIndex >= 0 && currentParagraphIndex < paragraphs.length) {
        const para = paragraphs[currentParagraphIndex] as any;
        if (para.type === 'text' || para.type === 'dialogue') {
          if (!para.subParagraphs) {
            para.subParagraphs = [];
          }
          para.subParagraphs.push({
            id: `sub${Date.now()}_${para.subParagraphs.length}`,
            text: subContent
          });
          console.log('[Import Debug] Added subparagraph to index', currentParagraphIndex, 'total:', para.subParagraphs.length);
          console.log('[Import Debug] Paragraph after adding:', para);
        }
      } else {
        console.log('[Import Debug] No valid parent paragraph for subparagraph');
      }
      i++;
      continue;
    }
    
    if (!line.startsWith('[')) {
      // Обычный текст без тега - каждая строка = отдельный параграф
      // Проверяем наличие символа ^ для ретроспективы
      let content = line;
      let isRetrospective = false;
      
      if (line.startsWith('^')) {
        content = line.substring(1).trim();
        isRetrospective = true;
      }
      
      const textPara: any = {
        id: `p${Date.now()}_${paragraphs.length}`,
        type: 'text' as const,
        content: content
      };
      
      if (isRetrospective) {
        textPara.timeframes = ['retrospective'];
      }
      
      paragraphs.push(textPara);
      currentParagraphIndex = paragraphs.length - 1;
      console.log('[Import Debug] Created text paragraph:', content, 'Index:', currentParagraphIndex, 'Retrospective:', isRetrospective);
      i++;
      continue;
    }
    
    if (line.startsWith('[TEXT]')) {
      i++;
      // В блоке [TEXT] каждая строка = отдельный параграф
      while (i < lines.length && !lines[i].trim().startsWith('[')) {
        const currentLine = lines[i].trim();
        
        if (currentLine) {
          // Проверка на подпараграф
          if (currentLine.startsWith('>')) {
            const subContent = currentLine.substring(1).trim();
            if (currentParagraphIndex >= 0 && currentParagraphIndex < paragraphs.length) {
              const para = paragraphs[currentParagraphIndex] as any;
              if (para.type === 'text' || para.type === 'dialogue') {
                if (!para.subParagraphs) {
                  para.subParagraphs = [];
                }
                para.subParagraphs.push({
                  id: `sub${Date.now()}_${para.subParagraphs.length}`,
                  text: subContent
                });
              }
            }
          } else {
            // Каждая непустая строка = текстовый параграф
            // Проверяем наличие символа ^ для ретроспективы
            let content = currentLine;
            let isRetrospective = false;
            
            if (currentLine.startsWith('^')) {
              content = currentLine.substring(1).trim();
              isRetrospective = true;
            }
            
            const textPara: any = {
              id: `p${Date.now()}_${paragraphs.length}`,
              type: 'text' as const,
              content: content
            };
            
            if (isRetrospective) {
              textPara.timeframes = ['retrospective'];
            }
            
            paragraphs.push(textPara);
            currentParagraphIndex = paragraphs.length - 1;
          }
        }
        i++;
      }
      continue;
    }
    
    if (line.startsWith('[DIALOGUE:')) {
      const characterName = line.substring(10, line.indexOf(']')).trim();
      const characterImageMatch = line.match(/\[IMG:(.*?)\]/);
      const characterImage = characterImageMatch ? characterImageMatch[1].trim() : undefined;
      
      i++;
      let text = '';
      let emptyLinesCount = 0;
      const subParagraphs: any[] = [];
      let isRetrospective = false;
      
      while (i < lines.length && !lines[i].trim().startsWith('[')) {
        const currentLine = lines[i].trim();
        
        if (!currentLine) {
          emptyLinesCount++;
          // Две пустые строки = конец блока диалога
          if (emptyLinesCount >= 2) {
            break;
          }
        } else {
          emptyLinesCount = 0;
          
          // Проверка на подпараграф
          if (currentLine.startsWith('>')) {
            const subContent = currentLine.substring(1).trim();
            subParagraphs.push({
              id: `sub${Date.now()}_${subParagraphs.length}`,
              text: subContent
            });
          } else if (currentLine.startsWith('^')) {
            // Ретроспектива в диалоге
            isRetrospective = true;
            text += (text ? '\n' : '') + currentLine.substring(1).trim();
          } else {
            text += (text ? '\n' : '') + currentLine;
          }
        }
        i++;
      }
      
      if (text) {
        const dialoguePara: any = {
          id: `p${Date.now()}_${paragraphs.length}`,
          type: 'dialogue' as const,
          characterName,
          characterImage,
          text
        };
        
        if (subParagraphs.length > 0) {
          dialoguePara.subParagraphs = subParagraphs;
        }
        
        if (isRetrospective) {
          dialoguePara.timeframes = ['retrospective'];
        }
        
        paragraphs.push(dialoguePara);
        currentParagraphIndex = paragraphs.length - 1;
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
      let emptyLinesCount = 0;
      
      while (i < lines.length && !lines[i].trim().startsWith('[')) {
        const currentLine = lines[i].trim();
        
        if (!currentLine) {
          emptyLinesCount++;
          // Две пустые строки = конец блока предмета
          if (emptyLinesCount >= 2) {
            break;
          }
        } else {
          emptyLinesCount = 0;
          description += (description ? '\n' : '') + currentLine;
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
      let emptyLinesCount = 0;
      
      while (i < lines.length && !lines[i].trim().startsWith('[')) {
        const choiceLine = lines[i].trim();
        
        if (!choiceLine) {
          emptyLinesCount++;
          // Две пустые строки = конец блока выбора
          if (emptyLinesCount >= 2) {
            break;
          }
        } else {
          emptyLinesCount = 0;
          
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
  
  // Отладка: выводим результат
  console.log('[Import Debug] Parsed paragraphs:', JSON.stringify(paragraphs, null, 2));
  
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

Первая строка текста
> Это подпараграф первой строки
> Ещё один подпараграф

Вторая строка текста
Третья строка текста (после пустой строки)

[DIALOGUE:Имя персонажа] [IMG:эмодзи_или_url]
Текст диалога персонажа.
Может быть многострочным.
> Подпараграф диалога
> Ещё подпараграф


Четвертая строка текста
Пятая строка текста

[TEXT]
В блоке [TEXT] каждая строка = отдельный параграф
> Подпараграф
Это второй параграф

Пустая строка = разделитель (fade)

[ITEM:Название предмета] [IMG:эмодзи_или_url]
Описание предмета.


Продолжение текста после предмета

[CHOICE]
Вопрос для выбора?
- Вариант 1 [GOTO:episode_id]
- Вариант 2 [GOTO:another_episode_id]
- Вариант 3


Продолжение текста после выбора

💡 Первым параграфом автоматически создаётся фон
💡 Строки начинающиеся с > это подпараграфы (привязаны к предыдущему тексту/диалогу)
💡 Две пустые строки после [DIALOGUE], [ITEM], [CHOICE] возвращают к обычному тексту
💡 Интерактивные подсказки: [слово|текст подсказки]`;
};