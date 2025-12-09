import { useState, useEffect } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
    const parts: Array<{ type: 'text' | 'hint'; content: string; hint?: string }> = [];
    const regex = /\[([^\|]+)\|([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(input)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: input.substring(lastIndex, match.index)
        });
      }
      
      parts.push({
        type: 'hint',
        content: match[1],
        hint: match[2]
      });
      
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
          } else {
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
        })}
      </span>

      {/* Dialog для мобильных */}
      {mobileHint && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setMobileHint(null); }}>
          <DialogContent onClick={(e) => e.stopPropagation()} className="max-w-[90vw]">
            <DialogHeader>
              <DialogTitle className="text-left">{mobileHint.content}</DialogTitle>
            </DialogHeader>
            <p className="text-foreground text-left">{mobileHint.hint}</p>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export default InteractiveText;