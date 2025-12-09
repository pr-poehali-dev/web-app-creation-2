import { useState, useEffect } from 'react';
import InteractiveText from './InteractiveText';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  skipTyping?: boolean;
  onComplete?: () => void;
}

function TypewriterText({ text, speed = 50, skipTyping = false, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (skipTyping) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      onComplete?.();
      return;
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && currentIndex > 0) {
      onComplete?.();
    }
  }, [currentIndex, text, speed, skipTyping, onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return <InteractiveText text={displayedText} />;
}

export default TypewriterText;