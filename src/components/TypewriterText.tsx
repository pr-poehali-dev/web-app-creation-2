import { useState, useEffect } from 'react';
import InteractiveText from './InteractiveText';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  skipTyping?: boolean;
  onComplete?: () => void;
  resetKey?: string; // Добавляем явный ключ для сброса
}

// Функция для получения текста без форматирования для подсчета длины
const getCleanText = (text: string): string => {
  return text
    .replace(/\[([^\|]+)\|([^\]]+)\]/g, '$1') // Интерактивные подсказки
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Жирный
    .replace(/\*([^*]+)\*/g, '$1') // Курсив
    .replace(/__([^_]+)__/g, '$1') // Подчёркивание
    .replace(/~~([^~]+)~~/g, '$1'); // Зачёркивание
};

// Функция для отображения текста с форматированием до определенной позиции
const getDisplayText = (text: string, targetLength: number): string => {
  let visibleChars = 0; // Счетчик видимых символов
  let result = '';
  let i = 0;
  
  while (i < text.length) {
    // Интерактивная подсказка [слово|подсказка]
    if (text[i] === '[') {
      const pipeIdx = text.indexOf('|', i);
      const closeIdx = text.indexOf(']', i);
      
      if (pipeIdx !== -1 && closeIdx !== -1 && pipeIdx < closeIdx) {
        const word = text.substring(i + 1, pipeIdx);
        const hint = text.substring(pipeIdx + 1, closeIdx);
        
        // Посимвольно добавляем слово из подсказки
        for (let j = 0; j < word.length; j++) {
          if (visibleChars >= targetLength) return result;
          if (visibleChars === 0 || visibleChars < targetLength) {
            if (j === 0) result += '[';
            result += word[j];
            visibleChars++;
            if (j === word.length - 1 && visibleChars <= targetLength) {
              result += `|${hint}]`;
            }
          }
        }
        i = closeIdx + 1;
        continue;
      }
    }
    
    // Жирный текст **текст**
    if (text[i] === '*' && text[i + 1] === '*') {
      const endIdx = text.indexOf('**', i + 2);
      if (endIdx !== -1) {
        const content = text.substring(i + 2, endIdx);
        
        // Посимвольно добавляем жирный текст
        for (let j = 0; j < content.length; j++) {
          if (visibleChars >= targetLength) return result;
          if (j === 0) result += '**';
          result += content[j];
          visibleChars++;
          if (j === content.length - 1 && visibleChars <= targetLength) {
            result += '**';
          }
        }
        i = endIdx + 2;
        continue;
      }
    }
    
    // Курсив *текст*
    if (text[i] === '*' && text[i + 1] !== '*') {
      const endIdx = text.indexOf('*', i + 1);
      if (endIdx !== -1) {
        const content = text.substring(i + 1, endIdx);
        
        for (let j = 0; j < content.length; j++) {
          if (visibleChars >= targetLength) return result;
          if (j === 0) result += '*';
          result += content[j];
          visibleChars++;
          if (j === content.length - 1 && visibleChars <= targetLength) {
            result += '*';
          }
        }
        i = endIdx + 1;
        continue;
      }
    }
    
    // Подчёркивание __текст__
    if (text[i] === '_' && text[i + 1] === '_') {
      const endIdx = text.indexOf('__', i + 2);
      if (endIdx !== -1) {
        const content = text.substring(i + 2, endIdx);
        
        for (let j = 0; j < content.length; j++) {
          if (visibleChars >= targetLength) return result;
          if (j === 0) result += '__';
          result += content[j];
          visibleChars++;
          if (j === content.length - 1 && visibleChars <= targetLength) {
            result += '__';
          }
        }
        i = endIdx + 2;
        continue;
      }
    }
    
    // Зачёркивание ~~текст~~
    if (text[i] === '~' && text[i + 1] === '~') {
      const endIdx = text.indexOf('~~', i + 2);
      if (endIdx !== -1) {
        const content = text.substring(i + 2, endIdx);
        
        for (let j = 0; j < content.length; j++) {
          if (visibleChars >= targetLength) return result;
          if (j === 0) result += '~~';
          result += content[j];
          visibleChars++;
          if (j === content.length - 1 && visibleChars <= targetLength) {
            result += '~~';
          }
        }
        i = endIdx + 2;
        continue;
      }
    }
    
    // Обычный символ
    if (visibleChars >= targetLength) return result;
    result += text[i];
    visibleChars++;
    i++;
  }
  
  return result;
};

function TypewriterText({ text, speed = 50, skipTyping = false, onComplete, resetKey }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const cleanText = getCleanText(text);
  const targetLength = cleanText.length;

  useEffect(() => {
    if (skipTyping) {
      console.log('[TypewriterText] Skip typing activated');
      setDisplayedText(text);
      setCurrentIndex(targetLength);
      setHasCompleted(true);
      return;
    }

    if (currentIndex < targetLength) {
      const timeout = setTimeout(() => {
        setDisplayedText(getDisplayText(text, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === targetLength && currentIndex > 0 && !hasCompleted) {
      console.log('[TypewriterText] Typing completed naturally');
      setHasCompleted(true);
    }
  }, [currentIndex, text, targetLength, speed, skipTyping, hasCompleted]);

  useEffect(() => {
    console.log('[TypewriterText] ResetKey changed:', resetKey, 'Text:', text.substring(0, 50));
    setDisplayedText('');
    setCurrentIndex(0);
    setHasCompleted(false);
  }, [resetKey]);

  useEffect(() => {
    if (hasCompleted) {
      console.log('[TypewriterText] Calling onComplete');
      onComplete?.();
    }
  }, [hasCompleted, onComplete]);

  return <InteractiveText text={displayedText} />;
}

export default TypewriterText;