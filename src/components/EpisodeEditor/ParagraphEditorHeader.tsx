import { Paragraph, Novel, ParagraphType, MergeLayoutType } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { getParagraphNumber } from '@/utils/paragraphNumbers';

interface ParagraphEditorHeaderProps {
  paragraph: Paragraph;
  index: number;
  episodeId: string;
  novel: Novel;
  totalParagraphs: number;
  isChangingType: boolean;
  isBulkEditMode: boolean;
  isSelected: boolean;
  selectedCount: number;
  setIsChangingType: (value: boolean) => void;
  handleTypeChange: (newType: ParagraphType) => void;
  onUpdate: (index: number, updatedParagraph: Paragraph) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onToggleInsert: (index: number) => void;
  onToggleMerge: (index: number) => void;
}

function ParagraphEditorHeader({
  paragraph,
  index,
  episodeId,
  novel,
  totalParagraphs,
  isChangingType,
  isBulkEditMode,
  isSelected,
  selectedCount,
  setIsChangingType,
  handleTypeChange,
  onUpdate,
  onDelete,
  onMove,
  onToggleInsert,
  onToggleMerge
}: ParagraphEditorHeaderProps) {
  return (
    <>
      {isBulkEditMode && isSelected && selectedCount > 1 && (
        <div className="mb-2 px-2 py-1 bg-primary/10 rounded text-xs text-primary font-medium">
          Выбрано параграфов: {selectedCount}
        </div>
      )}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {getParagraphNumber(novel, episodeId, index)}
          </span>
          {isChangingType ? (
            <Select
              value={paragraph.type}
              onValueChange={(value) => handleTypeChange(value as ParagraphType)}
            >
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">text</SelectItem>
                <SelectItem value="dialogue">dialogue</SelectItem>
                <SelectItem value="choice">choice</SelectItem>
                <SelectItem value="item">item</SelectItem>
                <SelectItem value="image">image</SelectItem>
                <SelectItem value="background">background</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <button
              onClick={() => setIsChangingType(true)}
              className="text-xs font-medium text-muted-foreground uppercase hover:text-primary transition-colors cursor-pointer"
            >
              {paragraph.type}
            </button>
          )}
          <div className="flex items-center gap-1">
            <Checkbox
              id={`timeframe-present-${index}`}
              checked={paragraph.timeframes?.includes('present') ?? true}
              onCheckedChange={(checked) => {
                const current = paragraph.timeframes || [];
                const updated = checked 
                  ? [...current.filter(t => t !== 'present'), 'present']
                  : current.filter(t => t !== 'present');
                onUpdate(index, { ...paragraph, timeframes: updated.length > 0 ? updated : undefined });
              }}
              className="h-4 w-4"
            />
            <Label htmlFor={`timeframe-present-${index}`} className="cursor-pointer">
              <Icon name="Clock" size={12} />
            </Label>
            <Checkbox
              id={`timeframe-retro-${index}`}
              checked={paragraph.timeframes?.includes('retrospective') ?? false}
              onCheckedChange={(checked) => {
                const current = paragraph.timeframes || [];
                const updated = checked 
                  ? [...current.filter(t => t !== 'retrospective'), 'retrospective']
                  : current.filter(t => t !== 'retrospective');
                onUpdate(index, { ...paragraph, timeframes: updated.length > 0 ? updated : undefined });
              }}
              className="h-4 w-4"
            />
            <Label htmlFor={`timeframe-retro-${index}`} className="cursor-pointer">
              <Icon name="History" size={12} className="text-amber-600" />
            </Label>
          </div>
        </div>
        <div className="flex gap-1">
          {novel.paths && novel.paths.length > 0 && (
            <div className="flex items-center gap-1 mr-2 border-l pl-2">
              {novel.paths.map((path) => (
                <Checkbox
                  key={path.id}
                  id={`para-path-${index}-${path.id}`}
                  checked={paragraph.requiredPaths?.includes(path.id) ?? false}
                  onCheckedChange={(checked) => {
                    const current = paragraph.requiredPaths || [];
                    const updated = checked
                      ? [...current, path.id]
                      : current.filter(p => p !== path.id);
                    onUpdate(index, { ...paragraph, requiredPaths: updated.length > 0 ? updated : undefined });
                  }}
                  className="h-4 w-4"
                  style={{ 
                    borderColor: path.color,
                    backgroundColor: paragraph.requiredPaths?.includes(path.id) ? path.color : undefined
                  }}
                  title={path.name}
                />
              ))}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggleMerge(index)}
            title={paragraph.mergedWith ? "Отменить объединение" : "Объединить со следующим"}
          >
            <Icon name="Link" size={14} className={paragraph.mergedWith ? "text-primary" : ""} />
          </Button>
          {paragraph.mergedWith && (
            <Select
              value={paragraph.mergeLayout || 'horizontal-3'}
              onValueChange={(value) => onUpdate(index, { ...paragraph, mergeLayout: value as MergeLayoutType })}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal-3">3 в ряд</SelectItem>
                <SelectItem value="horizontal-2-1">2+1</SelectItem>
                <SelectItem value="horizontal-1-2">1+2</SelectItem>
                <SelectItem value="grid-2x2">Сетка 2×2</SelectItem>
                <SelectItem value="mosaic-left">Мозаика ←</SelectItem>
                <SelectItem value="mosaic-right">Мозаика →</SelectItem>
                <SelectItem value="vertical-left-3">← + 3</SelectItem>
                <SelectItem value="vertical-right-3">3 + →</SelectItem>
                <SelectItem value="center-large">Центр большой</SelectItem>
                <SelectItem value="grid-3x3">Сетка 3×3</SelectItem>
                <SelectItem value="asymmetric-1">Асимметрия 1</SelectItem>
                <SelectItem value="asymmetric-2">Асимметрия 2</SelectItem>
                <SelectItem value="l-shape">L-форма</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(index, 'up')}
            disabled={index === 0}
            className="h-8 w-8"
          >
            <Icon name="ChevronUp" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMove(index, 'down')}
            disabled={index === totalParagraphs - 1}
            className="h-8 w-8"
          >
            <Icon name="ChevronDown" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(index)}
            className="h-8 w-8 hover:text-destructive"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </div>
    </>
  );
}

export default ParagraphEditorHeader;