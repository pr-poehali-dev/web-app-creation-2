import { useState, useEffect } from 'react';
import InteractiveText from './InteractiveText';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  skipTyping?: boolean;
  onComplete?: () => void;
}

// Функция для удаления интерактивных подсказок из текста
const removeHints = (text: string): string => {
  return text.replace(/\[([^\|]+)\|([^\]]+)\]/g, '$1');
};

function TypewriterText({ text, speed = 50, skipTyping = false, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Текст без подсказок для эффекта печати
  const cleanText = removeHints(text);

  useEffect(() => {
    if (skipTyping) {
      setDisplayedText(cleanText);
      setCurrentIndex(cleanText.length);
      onComplete?.();
      return;
    }

    if (currentIndex < cleanText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(cleanText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === cleanText.length && currentIndex > 0) {
      onComplete?.();
    }
  }, [currentIndex, cleanText, speed, skipTyping, onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  // Показываем полный текст с подсказками когда печать завершена
  const finalText = currentIndex === cleanText.length ? text : displayedText;

  return <InteractiveText text={finalText} />;
}

export default TypewriterText;