import { Episode, Paragraph } from '@/types/novel';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SlidesListProps {
  episode: Episode | undefined;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function SlidesList({
  episode,
  selectedIndex,
  onSelect
}: SlidesListProps) {
  if (!episode) return null;

  const getSlideIcon = (type: Paragraph['type']) => {
    switch (type) {
      case 'text':
        return 'Type';
      case 'dialogue':
        return 'MessageSquare';
      case 'background':
        return 'Image';
      case 'image':
        return 'ImagePlus';
      case 'choice':
        return 'GitBranch';
      case 'item':
        return 'Package';
      default:
        return 'FileText';
    }
  };

  const getSlideLabel = (paragraph: Paragraph) => {
    switch (paragraph.type) {
      case 'text':
        return paragraph.content?.slice(0, 30) || 'Текст';
      case 'dialogue':
        return paragraph.characterName || 'Диалог';
      case 'background':
        return 'Фон';
      case 'image':
        return paragraph.alt || 'Изображение';
      case 'choice':
        return paragraph.question?.slice(0, 30) || 'Выбор';
      default:
        return 'Слайд';
    }
  };

  return (
    <div className="w-64 border-r flex flex-col">
      <div className="h-12 border-b flex items-center justify-between px-4">
        <span className="text-sm font-semibold">
          Слайды ({episode.paragraphs.length})
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {episode.paragraphs.map((paragraph, index) => (
            <div
              key={paragraph.id}
              className={cn(
                'group rounded-lg p-3 cursor-pointer hover:bg-accent transition-colors',
                selectedIndex === index && 'bg-accent ring-2 ring-primary'
              )}
              onClick={() => onSelect(index)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={getSlideIcon(paragraph.type)} size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-muted">
                      {paragraph.type}
                    </span>
                  </div>
                  <p className="text-sm truncate mt-1">
                    {getSlideLabel(paragraph)}
                  </p>
                </div>
              </div>

              {/* Preview thumbnail */}
              <div className="mt-2 aspect-video bg-muted/50 rounded overflow-hidden">
                {paragraph.type === 'background' && paragraph.url && (
                  <img
                    src={paragraph.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                {paragraph.type === 'image' && paragraph.url && (
                  <img
                    src={paragraph.url}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                )}
                {(paragraph.type === 'text' || paragraph.type === 'dialogue') && (
                  <div className="p-2 text-xs text-muted-foreground">
                    {paragraph.type === 'text'
                      ? paragraph.content?.slice(0, 80)
                      : paragraph.text?.slice(0, 80)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
