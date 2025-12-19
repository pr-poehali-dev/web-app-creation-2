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
            className="cursor-pointer hover:opacity-90 transition-all bg-card/90 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-xl border border-border p-6 md:p-8 lg:p-10"
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