import { useEffect } from 'react';
import InteractiveText from './InteractiveText';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  skipTyping?: boolean;
  onComplete?: () => void;
  resetKey?: string;
}

function TypewriterText({ text, onComplete }: TypewriterTextProps) {
  useEffect(() => {
    if (onComplete) {
      onComplete();
    }
  }, [text, onComplete]);

  return <InteractiveText text={text} />;
}

export default TypewriterText;