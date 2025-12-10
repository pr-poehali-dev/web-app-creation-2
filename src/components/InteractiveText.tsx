import { useState, useEffect } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface InteractiveTextProps {
  text: string;
  className?: string;
}

function InteractiveText({ text, className = '' }: InteractiveTextProps) {
  const [mobileHint, setMobileHint] = useState<{ content: string; hint: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const parseText = (input: string) => {
    const parts: Array<{ 
      type: 'text' | 'hint' | 'bold' | 'italic' | 'underline' | 'strikethrough'; 
      content: string; 
      hint?: string;
      children?: any[];
    }> = [];
    
    const regex = /\[([^\|]+)\|([^\]]+)\]|\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__|~~([^~]+)~~/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(input)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: input.substring(lastIndex, match.index)
        });
      }
      
      // Проверяем какой тип совпадения
      if (match[1] && match[2]) {
        // Интерактивная подсказка [слово|подсказка]
        parts.push({
          type: 'hint',
          content: match[1],
          hint: match[2]
        });
      } else if (match[3]) {
        // Жирный текст **текст**
        parts.push({
          type: 'bold',
          content: match[3]
        });
      } else if (match[4]) {
        // Курсив *текст*
        parts.push({
          type: 'italic',
          content: match[4]
        });
      } else if (match[5]) {
        // Подчёркивание __текст__
        parts.push({
          type: 'underline',
          content: match[5]
        });
      } else if (match[6]) {
        // Зачёркнутый ~~текст~~
        parts.push({
          type: 'strikethrough',
          content: match[6]
        });
      }
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < input.length) {
      parts.push({
        type: 'text',
        content: input.substring(lastIndex)
      });
    }
    
    return parts;
  };

  const parts = parseText(text);

  return (
    <>
      <span className={className}>
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index}>{part.content}</span>;
          } else if (part.type === 'bold') {
            return <strong key={index}>{part.content}</strong>;
          } else if (part.type === 'italic') {
            return <em key={index}>{part.content}</em>;
          } else if (part.type === 'underline') {
            return <u key={index}>{part.content}</u>;
          } else if (part.type === 'strikethrough') {
            return <s key={index}>{part.content}</s>;
          } else if (part.type === 'hint') {
            // На мобильных показываем Dialog при клике
            if (isMobile) {
              return (
                <span
                  key={index}
                  className="underline decoration-dotted decoration-primary/50 cursor-pointer text-primary active:text-primary/60 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileHint({ content: part.content, hint: part.hint || '' });
                  }}
                >
                  {part.content}
                </span>
              );
            }
            
            // На десктопе оставляем HoverCard
            return (
              <HoverCard key={index}>
                <HoverCardTrigger asChild>
                  <span className="underline decoration-dotted decoration-primary/50 cursor-help text-primary hover:text-primary/80 transition-colors">
                    {part.content}
                  </span>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 bg-card/95 backdrop-blur-sm border-primary/20 mr-20">
                  <p className="text-sm text-foreground">{part.hint}</p>
                </HoverCardContent>
              </HoverCard>
            );
          }
          return null;
        })}
      </span>

      {/* Dialog для мобильных */}
      {mobileHint && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setMobileHint(null); }}>
          <DialogContent onClick={(e) => e.stopPropagation()} className="max-w-[90vw]">
            <DialogHeader>
              <DialogTitle className="text-left text-white">{mobileHint.content}</DialogTitle>
              <DialogDescription className="text-white text-left">
                {mobileHint.hint}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default InteractiveText;