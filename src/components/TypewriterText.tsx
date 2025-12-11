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
    console.log('[TypewriterText] Text changed, resetting. New text:', text.substring(0, 50));
    setDisplayedText('');
    setCurrentIndex(0);
    setHasCompleted(false);
  }, [text]);
  
  useEffect(() => {
    console.log('[TypewriterText] SkipTyping changed:', skipTyping);
  }, [skipTyping]);

  useEffect(() => {
    if (hasCompleted) {
      console.log('[TypewriterText] Calling onComplete');
      onComplete?.();
    }
  }, [hasCompleted, onComplete]);

  return <InteractiveText text={displayedText} />;
}

export default TypewriterText;