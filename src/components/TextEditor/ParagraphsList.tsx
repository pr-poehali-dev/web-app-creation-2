import { Paragraph } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ParagraphsListProps {
  paragraphs: Paragraph[];
  selectedParagraphId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const paragraphIcons: Record<Paragraph['type'], string> = {
  text: 'FileText',
  dialogue: 'MessageCircle',
  choice: 'GitBranch',
  item: 'Package'
};

const paragraphLabels: Record<Paragraph['type'], string> = {
  text: 'Текст',
  dialogue: 'Диалог',
  choice: 'Выбор',
  item: 'Предмет'
};

function getParagraphPreview(paragraph: Paragraph): string {
  switch (paragraph.type) {
    case 'text':
      return paragraph.content.slice(0, 50);
    case 'dialogue':
      return `${paragraph.characterName}: ${paragraph.text.slice(0, 40)}`;
    case 'choice':
      return paragraph.question;
    case 'item':
      return paragraph.name;
  }
}

export default function ParagraphsList({
  paragraphs,
  selectedParagraphId,
  onSelect,
  onDelete
}: ParagraphsListProps) {
  if (paragraphs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icon name="FileText" size={32} className="mx-auto opacity-20 mb-2" />
        <p className="text-sm">Нет параграфов</p>
        <p className="text-xs mt-1">Добавьте первый параграф</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {paragraphs.map((paragraph, index) => (
        <div
          key={paragraph.id}
          className={`
            group relative p-3 rounded-lg cursor-pointer transition-colors
            ${selectedParagraphId === paragraph.id
              ? 'bg-primary/10 border border-primary'
              : 'border border-transparent hover:bg-muted'
            }
          `}
          onClick={() => onSelect(paragraph.id)}
        >
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-medium">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <Icon name={paragraphIcons[paragraph.type]} size={12} />
                <span className="text-xs font-medium text-muted-foreground">
                  {paragraphLabels[paragraph.type]}
                </span>
              </div>
              <div className="text-sm truncate">
                {getParagraphPreview(paragraph)}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(paragraph.id);
              }}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive"
            >
              <Icon name="Trash2" size={12} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
