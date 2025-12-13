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
  if (targetLength <= 0) return '';
  
  const cleanText = getCleanText(text);
  if (targetLength >= cleanText.length) return text;
  
  let result = '';
  let visibleCount = 0;
  let i = 0;
  
  // Стек открытых форматов для правильного закрытия
  const openFormats: string[] = [];
  
  while (i < text.length && visibleCount < targetLength) {
    let consumed = false;
    
    // [слово|подсказка]
    if (text[i] === '[') {
      const pipeIdx = text.indexOf('|', i);
      const closeIdx = text.indexOf(']', i);
      if (pipeIdx > i && closeIdx > pipeIdx) {
        const word = text.substring(i + 1, pipeIdx);
        const hint = text.substring(pipeIdx + 1, closeIdx);
        
        // Добавляем посимвольно
        let addedChars = 0;
        for (let j = 0; j < word.length && visibleCount < targetLength; j++) {
          if (addedChars === 0) result += '[';
          result += word[j];
          visibleCount++;
          addedChars++;
        }
        
        if (addedChars > 0 && addedChars === word.length) {
          result += `|${hint}]`;
        }
        
        i = closeIdx + 1;
        consumed = true;
      }
    }
    
    // **жирный**
    if (!consumed && text.substring(i, i + 2) === '**') {
      const endIdx = text.indexOf('**', i + 2);
      if (endIdx > i + 2) {
        const content = text.substring(i + 2, endIdx);
        result += '**';
        openFormats.push('**');
        
        for (let j = 0; j < content.length && visibleCount < targetLength; j++) {
          result += content[j];
          visibleCount++;
        }
        
        if (visibleCount < targetLength || visibleCount === targetLength) {
          result += '**';
          openFormats.pop();
          i = endIdx + 2;
        } else {
          i = endIdx + 2;
        }
        consumed = true;
      }
    }
    
    // *курсив*
    if (!consumed && text[i] === '*') {
      const endIdx = text.indexOf('*', i + 1);
      if (endIdx > i + 1) {
        const content = text.substring(i + 1, endIdx);
        result += '*';
        openFormats.push('*');
        
        for (let j = 0; j < content.length && visibleCount < targetLength; j++) {
          result += content[j];
          visibleCount++;
        }
        
        if (visibleCount < targetLength || visibleCount === targetLength) {
          result += '*';
          openFormats.pop();
          i = endIdx + 1;
        } else {
          i = endIdx + 1;
        }
        consumed = true;
      }
    }
    
    // __подчёркнутый__
    if (!consumed && text.substring(i, i + 2) === '__') {
      const endIdx = text.indexOf('__', i + 2);
      if (endIdx > i + 2) {
        const content = text.substring(i + 2, endIdx);
        result += '__';
        openFormats.push('__');
        
        for (let j = 0; j < content.length && visibleCount < targetLength; j++) {
          result += content[j];
          visibleCount++;
        }
        
        if (visibleCount < targetLength || visibleCount === targetLength) {
          result += '__';
          openFormats.pop();
          i = endIdx + 2;
        } else {
          i = endIdx + 2;
        }
        consumed = true;
      }
    }
    
    // ~~зачёркнутый~~
    if (!consumed && text.substring(i, i + 2) === '~~') {
      const endIdx = text.indexOf('~~', i + 2);
      if (endIdx > i + 2) {
        const content = text.substring(i + 2, endIdx);
        result += '~~';
        openFormats.push('~~');
        
        for (let j = 0; j < content.length && visibleCount < targetLength; j++) {
          result += content[j];
          visibleCount++;
        }
        
        if (visibleCount < targetLength || visibleCount === targetLength) {
          result += '~~';
          openFormats.pop();
          i = endIdx + 2;
        } else {
          i = endIdx + 2;
        }
        consumed = true;
      }
    }
    
    // Обычный символ
    if (!consumed) {
      result += text[i];
      visibleCount++;
      i++;
    }
  }
  
  // Закрываем все незакрытые форматы
  while (openFormats.length > 0) {
    result += openFormats.pop();
  }
  
  return result;
};

function TypewriterText({ text, speed = 50, skipTyping = false, onComplete, resetKey }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const cleanText = getCleanText(text);
  const totalLength = cleanText.length;

  // Сброс при изменении resetKey
  useEffect(() => {
    console.log('[TypewriterText] ResetKey changed:', resetKey);
    if (skipTyping) {
      setDisplayedText(text);
      setCurrentIndex(totalLength);
      setHasCompleted(true);
    } else {
      setDisplayedText('');
      setCurrentIndex(0);
      setHasCompleted(false);
    }
  }, [resetKey, text, totalLength, skipTyping]);

  // Эффект печати
  useEffect(() => {
    // Пропускаем, если уже завершено
    if (hasCompleted) return;
    
    // Если skipTyping, показываем весь текст
    if (skipTyping) {
      console.log('[TypewriterText] Skip typing activated');
      setDisplayedText(text);
      setCurrentIndex(totalLength);
      setHasCompleted(true);
      return;
    }

    // Если еще не напечатали всё
    if (currentIndex < totalLength) {
      const timeout = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        const newText = getDisplayText(text, nextIndex);
        console.log(`[TypewriterText] Typing ${nextIndex}/${totalLength}, displayed length: ${newText.length}, visible: ${getCleanText(newText).length}`);
        setDisplayedText(newText);
        setCurrentIndex(nextIndex);
        
        // Проверяем завершение
        if (nextIndex >= totalLength) {
          setHasCompleted(true);
        }
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, totalLength, speed, skipTyping, hasCompleted]);

  // Вызов onComplete
  useEffect(() => {
    if (hasCompleted && onComplete) {
      console.log('[TypewriterText] Calling onComplete');
      onComplete();
    }
  }, [hasCompleted, onComplete]);

  return <InteractiveText text={displayedText} />;
}

export default TypewriterText;