import { useState, useMemo, useCallback, memo } from 'react';
import { Paragraph, Novel, Episode } from '@/types/novel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createParagraphEditorHandlers } from './ParagraphEditorLogic';
import ParagraphEditorHeader from './ParagraphEditorHeader';
import ParagraphEditorContent from './ParagraphEditorContent';
import Icon from '@/components/ui/icon';
import equal from 'fast-deep-equal';

interface ParagraphEditorProps {
  paragraph: Paragraph;
  index: number;
  episodeId: string;
  novel: Novel;
  totalParagraphs: number;
  onUpdate: (index: number, updatedParagraph: Paragraph) => void;
  onDelete: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onToggleInsert: (index: number) => void;
  onToggleMerge: (index: number) => void;
  onNovelUpdate: (novel: Novel) => void;
  onUngroupComic?: (groupId: string) => void;
  isBulkEditMode?: boolean;
  isSelected?: boolean;
  selectedCount?: number;
}

function ParagraphEditor({
  paragraph,
  index,
  episodeId,
  novel,
  totalParagraphs,
  onUpdate,
  onDelete,
  onMove,
  onToggleInsert,
  onToggleMerge,
  onNovelUpdate,
  onUngroupComic,
  isBulkEditMode = false,
  isSelected = false,
  selectedCount = 0
}: ParagraphEditorProps) {
  const [isChangingType, setIsChangingType] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');

  const handlers = useMemo(
    () => createParagraphEditorHandlers(
      paragraph,
      index,
      novel,
      imageUrl,
      setImageUrl,
      mobileImageUrl,
      setMobileImageUrl,
      setIsChangingType,
      onUpdate,
      onNovelUpdate
    ),
    [paragraph, index, novel, imageUrl, mobileImageUrl, onUpdate, onNovelUpdate]
  );

  const isInComicGroup = !!paragraph.comicGroupId;
  const isFirstInGroup = isInComicGroup && paragraph.comicGroupIndex === 0;
  const groupBorderClass = isInComicGroup 
    ? 'border-l-4 border-l-primary/50' 
    : '';
  
  // Находим текущий эпизод
  const currentEpisode = novel.episodes.find(ep => ep.id === episodeId);

  return (
    <Card className={`animate-fade-in ${isBulkEditMode && isSelected ? 'ring-2 ring-primary' : ''} ${groupBorderClass}`}>
      {isInComicGroup && (
        <div className="bg-primary/10 px-4 py-1 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="Film" size={12} className="text-primary" />
            <span className="font-medium">Комикс-группа</span>
            <span className="text-muted-foreground">Параграф {(paragraph.comicGroupIndex || 0) + 1}</span>
          </div>
          {onUngroupComic && paragraph.comicGroupId && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUngroupComic(paragraph.comicGroupId!)}
              className="h-6 px-2 text-[10px] hover:bg-destructive/10 hover:text-destructive"
            >
              <Icon name="Unlink" size={10} className="mr-1" />
              Разгруппировать
            </Button>
          )}
        </div>
      )}
      <CardContent className="p-4">
        <ParagraphEditorHeader
          paragraph={paragraph}
          index={index}
          episodeId={episodeId}
          novel={novel}
          totalParagraphs={totalParagraphs}
          isChangingType={isChangingType}
          isBulkEditMode={isBulkEditMode}
          isSelected={isSelected}
          selectedCount={selectedCount}
          setIsChangingType={setIsChangingType}
          handleTypeChange={handlers.handleTypeChange}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onMove={onMove}
          onToggleInsert={onToggleInsert}
          onToggleMerge={onToggleMerge}
        />

        <div className="space-y-3">
          <ParagraphEditorContent
            paragraph={paragraph}
            index={index}
            novel={novel}
            episode={currentEpisode}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            mobileImageUrl={mobileImageUrl}
            setMobileImageUrl={setMobileImageUrl}
            handlers={handlers}
            onUpdate={onUpdate}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(ParagraphEditor, (prevProps, nextProps) => {
  if (prevProps.paragraph.id !== nextProps.paragraph.id) return false;
  
  return (
    prevProps.index === nextProps.index &&
    prevProps.totalParagraphs === nextProps.totalParagraphs &&
    prevProps.isBulkEditMode === nextProps.isBulkEditMode &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.selectedCount === nextProps.selectedCount &&
    equal(prevProps.paragraph, nextProps.paragraph)
  );
});