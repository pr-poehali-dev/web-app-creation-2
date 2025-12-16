import { useEffect } from 'react';
import InteractiveText from './InteractiveText';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  skipTyping?: boolean;
  onComplete?: () => void;
  resetKey?: string;
  subParagraphs?: string[]; // Подпараграфы для навигации
  onSubParagraphChange?: (text: string) => void; // Callback при смене подпараграфа
}

function TypewriterText({ text, onComplete, subParagraphs, onSubParagraphChange }: TypewriterTextProps) {
  useEffect(() => {
    if (onComplete) {
      onComplete();
    }
  }, [text, onComplete]);

  // Если есть подпараграфы, разбиваем текст на части
  if (subParagraphs && subParagraphs.length > 0) {
    return (
      <div className="space-y-4">
        {subParagraphs.map((subText, index) => (
          <div 
            key={index}
            onClick={() => onSubParagraphChange?.(subText)}
            className="cursor-pointer hover:bg-primary/5 p-2 rounded transition-colors"
          >
            <InteractiveText text={subText} />
          </div>
        ))}
      </div>
    );
  }

  return <InteractiveText text={text} />;
}

export default TypewriterText;