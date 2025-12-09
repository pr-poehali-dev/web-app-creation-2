import { useState, useEffect } from 'react';
import InteractiveText from './InteractiveText';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  skipTyping?: boolean;
  onComplete?: () => void;
}

// Функция для получения текста без подсказок для подсчета длины
const getCleanText = (text: string): string => {
  return text.replace(/\[([^\|]+)\|([^\]]+)\]/g, '$1');
};

// Функция для отображения текста с подсказками до определенной позиции
const getDisplayText = (text: string, targetLength: number): string => {
  let cleanPos = 0;
  let result = '';
  let i = 0;
  
  while (i < text.length && cleanPos < targetLength) {
    if (text[i] === '[' && text.indexOf('|', i) !== -1 && text.indexOf(']', i) !== -1) {
      const pipeIdx = text.indexOf('|', i);
      const closeIdx = text.indexOf(']', i);
      
      if (pipeIdx < closeIdx) {
        // Это интерактивная подсказка
        const word = text.substring(i + 1, pipeIdx);
        const hint = text.substring(pipeIdx + 1, closeIdx);
        
        if (cleanPos + word.length <= targetLength) {
          // Показываем всю подсказку
          result += `[${word}|${hint}]`;
          cleanPos += word.length;
          i = closeIdx + 1;
        } else {
          // Показываем часть слова
          const remaining = targetLength - cleanPos;
          result += word.substring(0, remaining);
          cleanPos = targetLength;
        }
        continue;
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

  useEffect(() => {
    if (skipTyping) {
      setDisplayedText(text);
      setCurrentIndex(targetLength);
      onComplete?.();
      return;
    }

    if (currentIndex < targetLength) {
      const timeout = setTimeout(() => {
        setDisplayedText(getDisplayText(text, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === targetLength && currentIndex > 0) {
      onComplete?.();
    }
  }, [currentIndex, text, targetLength, speed, skipTyping, onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return <InteractiveText text={displayedText} />;
}

export default TypewriterText;