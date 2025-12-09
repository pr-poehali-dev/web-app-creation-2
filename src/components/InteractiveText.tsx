import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface InteractiveTextProps {
  text: string;
  className?: string;
}

function InteractiveText({ text, className = '' }: InteractiveTextProps) {
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
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>;
        } else {
          return (
            <HoverCard key={index}>
              <HoverCardTrigger asChild>
                <span className="underline decoration-dotted decoration-primary/50 cursor-help text-primary hover:text-primary/80 transition-colors">
                  {part.content}
                </span>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-card/95 backdrop-blur-sm border-primary/20">
                <p className="text-sm text-foreground">{part.hint}</p>
              </HoverCardContent>
            </HoverCard>
          );
        }
      })}
    </span>
  );
}

export default InteractiveText;