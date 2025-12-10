import { useState, useEffect } from 'react';
import InteractiveText from './InteractiveText';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  skipTyping?: boolean;
  onComplete?: () => void;
}

const getCleanText = (text: string): string => {
  return text
    .replace(/\[([^\|]+)\|([^\]]+)\]/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1');
};

const getDisplayText = (text: string, targetLength: number): string => {
  let cleanPos = 0;
  let result = '';
  let i = 0;
  
  while (i < text.length && cleanPos < targetLength) {
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
  const [isComplete, setIsComplete] = useState(false);
  
  const targetLength = getCleanText(text).length;

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (isComplete) return;

    if (skipTyping) {
      setDisplayedText(text);
      setCurrentIndex(targetLength);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    if (currentIndex < targetLength) {
      const timeout = setTimeout(() => {
        setDisplayedText(getDisplayText(text, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === targetLength && currentIndex > 0 && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, targetLength, speed, skipTyping, text, isComplete, onComplete]);

  return <InteractiveText text={displayedText} />;
}

export default TypewriterText;
