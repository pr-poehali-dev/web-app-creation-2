import { ParagraphType } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ParagraphTypeButtonsProps {
  onAddParagraph: (type: ParagraphType) => void;
}

function ParagraphTypeButtons({ onAddParagraph }: ParagraphTypeButtonsProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <Button size="sm" onClick={() => onAddParagraph('text')}>
        <Icon name="FileText" size={14} className="mr-1" />
        Текст
      </Button>
      <Button size="sm" onClick={() => onAddParagraph('dialogue')}>
        <Icon name="MessageSquare" size={14} className="mr-1" />
        Диалог
      </Button>
      <Button size="sm" onClick={() => onAddParagraph('choice')}>
        <Icon name="GitBranch" size={14} className="mr-1" />
        Выбор
      </Button>
      <Button size="sm" onClick={() => onAddParagraph('item')}>
        <Icon name="Package" size={14} className="mr-1" />
        Предмет
      </Button>
      <Button size="sm" onClick={() => onAddParagraph('image')}>
        <Icon name="Image" size={14} className="mr-1" />
        Картинка
      </Button>
      <Button size="sm" onClick={() => onAddParagraph('fade')}>
        <Icon name="Minus" size={14} className="mr-1" />
        Затухание
      </Button>
    </div>
  );
}

export default ParagraphTypeButtons;