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
// Теперь работает строго посимвольно - каждый вызов добавляет ровно 1 символ
const getDisplayText = (text: string, targetLength: number): string => {
  if (targetLength <= 0) return '';
  
  const cleanText = getCleanText(text);
  if (targetLength >= cleanText.length) return text;
  
  // Создаем массив видимых символов с их позициями в оригинальном тексте
  const visibleChars: { char: string; originalStart: number; originalEnd: number; wrapper?: string }[] = [];
  let i = 0;
  
  while (i < text.length) {
    // Интерактивная подсказка [слово|подсказка]
    if (text[i] === '[') {
      const pipeIdx = text.indexOf('|', i);
      const closeIdx = text.indexOf(']', i);
      
      if (pipeIdx !== -1 && closeIdx !== -1 && pipeIdx < closeIdx) {
        const word = text.substring(i + 1, pipeIdx);
        const hint = text.substring(pipeIdx + 1, closeIdx);
        
        for (let j = 0; j < word.length; j++) {
          visibleChars.push({ 
            char: word[j], 
            originalStart: i, 
            originalEnd: closeIdx + 1,
            wrapper: `[|${hint}]`
          });
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
        for (let j = 0; j < content.length; j++) {
          visibleChars.push({ 
            char: content[j], 
            originalStart: i, 
            originalEnd: endIdx + 2,
            wrapper: '****'
          });
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
          visibleChars.push({ 
            char: content[j], 
            originalStart: i, 
            originalEnd: endIdx + 1,
            wrapper: '**'
          });
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
          visibleChars.push({ 
            char: content[j], 
            originalStart: i, 
            originalEnd: endIdx + 2,
            wrapper: '____'
          });
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
          visibleChars.push({ 
            char: content[j], 
            originalStart: i, 
            originalEnd: endIdx + 2,
            wrapper: '~~~~'
          });
        }
        i = endIdx + 2;
        continue;
      }
    }
    
    // Обычный символ
    visibleChars.push({ char: text[i], originalStart: i, originalEnd: i + 1 });
    i++;
  }
  
  // Теперь собираем результат из первых targetLength видимых символов
  let result = '';
  let lastWrapperType = '';
  let isInsideWrapper = false;
  
  for (let idx = 0; idx < targetLength && idx < visibleChars.length; idx++) {
    const item = visibleChars[idx];
    
    if (item.wrapper) {
      const wrapperType = item.wrapper;
      
      if (wrapperType !== lastWrapperType) {
        // Закрываем предыдущий wrapper
        if (isInsideWrapper && lastWrapperType) {
          if (lastWrapperType === '****') result += '**';
          else if (lastWrapperType === '**') result += '*';
          else if (lastWrapperType === '____') result += '__';
          else if (lastWrapperType === '~~~~') result += '~~';
          else if (lastWrapperType.startsWith('[|')) result += lastWrapperType.substring(1);
        }
        
        // Открываем новый wrapper
        if (wrapperType === '****') result += '**';
        else if (wrapperType === '**') result += '*';
        else if (wrapperType === '____') result += '__';
        else if (wrapperType === '~~~~') result += '~~';
        else if (wrapperType.startsWith('[|')) result += '[';
        
        lastWrapperType = wrapperType;
        isInsideWrapper = true;
      }
    } else if (isInsideWrapper) {
      // Закрываем wrapper перед обычным символом
      if (lastWrapperType === '****') result += '**';
      else if (lastWrapperType === '**') result += '*';
      else if (lastWrapperType === '____') result += '__';
      else if (lastWrapperType === '~~~~') result += '~~';
      else if (lastWrapperType.startsWith('[|')) result += lastWrapperType.substring(1);
      
      isInsideWrapper = false;
      lastWrapperType = '';
    }
    
    result += item.char;
  }
  
  // Закрываем последний wrapper если нужно
  if (isInsideWrapper && lastWrapperType) {
    if (lastWrapperType === '****') result += '**';
    else if (lastWrapperType === '**') result += '*';
    else if (lastWrapperType === '____') result += '__';
    else if (lastWrapperType === '~~~~') result += '~~';
    else if (lastWrapperType.startsWith('[|')) result += lastWrapperType.substring(1);
  }
  
  return result;
};

function TypewriterText({ text, speed = 50, skipTyping = false, onComplete, resetKey }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const cleanText = getCleanText(text);
  const targetLength = cleanText.length;

  // Сброс при изменении resetKey
  useEffect(() => {
    console.log('[TypewriterText] ResetKey changed:', resetKey, 'Text:', text.substring(0, 50));
    if (skipTyping) {
      // Если skipTyping активен, сразу показываем весь текст
      setDisplayedText(text);
      setCurrentIndex(targetLength);
      setHasCompleted(true);
    } else {
      // Иначе начинаем печать с начала
      setDisplayedText('');
      setCurrentIndex(0);
      setHasCompleted(false);
    }
  }, [resetKey, text, targetLength, skipTyping]);

  // Обработка skipTyping в реальном времени
  useEffect(() => {
    if (skipTyping && displayedText !== text) {
      console.log('[TypewriterText] Skip typing activated');
      setDisplayedText(text);
      setCurrentIndex(targetLength);
      setHasCompleted(true);
      return;
    }

    if (!skipTyping && currentIndex < targetLength) {
      const timeout = setTimeout(() => {
        setDisplayedText(getDisplayText(text, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === targetLength && currentIndex > 0 && !hasCompleted) {
      console.log('[TypewriterText] Typing completed naturally');
      setHasCompleted(true);
    }
  }, [currentIndex, text, targetLength, speed, skipTyping, hasCompleted, displayedText]);

  useEffect(() => {
    if (hasCompleted) {
      console.log('[TypewriterText] Calling onComplete');
      onComplete?.();
    }
  }, [hasCompleted, onComplete]);

  return <InteractiveText text={displayedText} />;
}

export default TypewriterText;