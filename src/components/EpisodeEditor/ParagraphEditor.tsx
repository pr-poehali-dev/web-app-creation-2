import { useState } from 'react';
import { Paragraph, Novel } from '@/types/novel';
import { Card, CardContent } from '@/components/ui/card';
import { createParagraphEditorHandlers } from './ParagraphEditorLogic';
import ParagraphEditorHeader from './ParagraphEditorHeader';
import ParagraphEditorContent from './ParagraphEditorContent';

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
  isBulkEditMode = false,
  isSelected = false,
  selectedCount = 0
}: ParagraphEditorProps) {
  const [isChangingType, setIsChangingType] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');

  const handlers = createParagraphEditorHandlers(
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
  );

  return (
    <Card className={`animate-fade-in ${isBulkEditMode && isSelected ? 'ring-2 ring-primary' : ''}`}>
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

export default ParagraphEditor;