import { useState, useEffect } from 'react';
import InteractiveText from './InteractiveText';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  skipTyping?: boolean;
  onComplete?: () => void;
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
  let cleanPos = 0;
  let result = '';
  let i = 0;
  
  while (i < text.length && cleanPos < targetLength) {
    // Интерактивная подсказка [слово|подсказка]
    if (text[i] === '[' && text.indexOf('|', i) !== -1 && text.indexOf(']', i) !== -1) {
      const pipeIdx = text.indexOf('|', i);
      const closeIdx = text.indexOf(']', i);
      
      if (pipeIdx < closeIdx) {
        const word = text.substring(i + 1, pipeIdx);
        const hint = text.substring(pipeIdx + 1, closeIdx);
        
        if (cleanPos + word.length <= targetLength) {
          result += `[${word}|${hint}]`;
          cleanPos += word.length;
          i = closeIdx + 1;
        } else {
          const remaining = targetLength - cleanPos;
          result += word.substring(0, remaining);
          cleanPos = targetLength;
        }
        continue;
      }
    }
    
    // Жирный текст **текст**
    if (text[i] === '*' && text[i + 1] === '*') {
      const endIdx = text.indexOf('**', i + 2);
      if (endIdx !== -1) {
        const content = text.substring(i + 2, endIdx);
        if (cleanPos + content.length <= targetLength) {
          result += `**${content}**`;
          cleanPos += content.length;
          i = endIdx + 2;
          continue;
        } else {
          const remaining = targetLength - cleanPos;
          result += `**${content.substring(0, remaining)}**`;
          cleanPos = targetLength;
          continue;
        }
      }
    }
    
    // Курсив *текст*
    if (text[i] === '*' && text[i + 1] !== '*') {
      const endIdx = text.indexOf('*', i + 1);
      if (endIdx !== -1) {
        const content = text.substring(i + 1, endIdx);
        if (cleanPos + content.length <= targetLength) {
          result += `*${content}*`;
          cleanPos += content.length;
          i = endIdx + 1;
          continue;
        } else {
          const remaining = targetLength - cleanPos;
          result += `*${content.substring(0, remaining)}*`;
          cleanPos = targetLength;
          continue;
        }
      }
    }
    
    // Подчёркивание __текст__
    if (text[i] === '_' && text[i + 1] === '_') {
      const endIdx = text.indexOf('__', i + 2);
      if (endIdx !== -1) {
        const content = text.substring(i + 2, endIdx);
        if (cleanPos + content.length <= targetLength) {
          result += `__${content}__`;
          cleanPos += content.length;
          i = endIdx + 2;
          continue;
        } else {
          const remaining = targetLength - cleanPos;
          result += `__${content.substring(0, remaining)}__`;
          cleanPos = targetLength;
          continue;
        }
      }
    }
    
    // Зачёркивание ~~текст~~
    if (text[i] === '~' && text[i + 1] === '~') {
      const endIdx = text.indexOf('~~', i + 2);
      if (endIdx !== -1) {
        const content = text.substring(i + 2, endIdx);
        if (cleanPos + content.length <= targetLength) {
          result += `~~${content}~~`;
          cleanPos += content.length;
          i = endIdx + 2;
          continue;
        } else {
          const remaining = targetLength - cleanPos;
          result += `~~${content.substring(0, remaining)}~~`;
          cleanPos = targetLength;
          continue;
        }
      }
    }
    
    result += text[i];
    cleanPos++;
    i++;
  }
  
  return result;
};

function TypewriterText({ text, speed = 50, skipTyping = false, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const cleanText = getCleanText(text);
  const targetLength = cleanText.length;
  
  console.log('[TypewriterText] Render:', { 
    textPreview: text.substring(0, 30) + '...', 
    currentIndex, 
    targetLength, 
    skipTyping,
    displayedLength: displayedText.length 
  });

  useEffect(() => {
    console.log('[TypewriterText] Main Effect Triggered:', { 
      skipTyping, 
      currentIndex, 
      targetLength,
      isComplete: currentIndex === targetLength,
      shouldType: currentIndex < targetLength
    });
    
    if (skipTyping) {
      console.log('[TypewriterText] ⚡ SKIP MODE - showing full text immediately');
      setDisplayedText(text);
      setCurrentIndex(targetLength);
      if (currentIndex < targetLength) {
        console.log('[TypewriterText] ⚡ Calling onComplete from skip');
        onComplete?.();
      }
      return;
    }

    if (currentIndex < targetLength) {
      console.log('[TypewriterText] ⌨️ Typing character', currentIndex + 1, 'of', targetLength);
      const timeout = setTimeout(() => {
        setDisplayedText(getDisplayText(text, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === targetLength && currentIndex > 0) {
      console.log('[TypewriterText] ✅ Typing COMPLETE - calling onComplete');
      onComplete?.();
    }
  }, [currentIndex, text, targetLength, speed, skipTyping]);

  useEffect(() => {
    console.log('[TypewriterText] 🔄 TEXT CHANGED - resetting state. New text:', text.substring(0, 30) + '...');
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return <InteractiveText text={displayedText} />;
}

export default TypewriterText;