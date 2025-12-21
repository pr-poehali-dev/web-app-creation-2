import { Paragraph, Novel } from '@/types/novel';
import TextEditor from './Editors/TextEditor';
import DialogueEditor from './Editors/DialogueEditor';
import ChoiceEditor from './Editors/ChoiceEditor';
import ItemEditor from './Editors/ItemEditor';
import ImageEditor from './Editors/ImageEditor';
import ComicEditor from './Editors/ComicEditor';
import { ParagraphEditorHandlers } from './ParagraphEditorLogic';

interface ParagraphEditorContentProps {
  paragraph: Paragraph;
  index: number;
  novel: Novel;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  mobileImageUrl: string;
  setMobileImageUrl: (url: string) => void;
  handlers: ParagraphEditorHandlers;
  onUpdate: (index: number, updatedParagraph: Paragraph) => void;
}

function ParagraphEditorContent({
  paragraph,
  index,
  novel,
  imageUrl,
  setImageUrl,
  mobileImageUrl,
  setMobileImageUrl,
  handlers,
  onUpdate
}: ParagraphEditorContentProps) {
  return (
    <div className="space-y-2">
      {paragraph.type === 'text' && (
        <TextEditor
          paragraph={paragraph}
          index={index}
          onUpdate={onUpdate}
        />
      )}

      {paragraph.type === 'dialogue' && (
        <DialogueEditor
          paragraph={paragraph}
          index={index}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          novel={novel}
          onUpdate={onUpdate}
          handleImageUrl={handlers.handleImageUrl}
          handleImageUpload={handlers.handleImageUpload}
          handleSelectCharacter={handlers.handleSelectCharacter}
        />
      )}

      {paragraph.type === 'choice' && (
        <ChoiceEditor
          paragraph={paragraph}
          index={index}
          novel={novel}
          onUpdate={onUpdate}
          handleSelectChoice={handlers.handleSelectChoice}
          addChoiceToLibrary={handlers.addChoiceToLibrary}
        />
      )}

      {paragraph.type === 'item' && (
        <ItemEditor
          paragraph={paragraph}
          index={index}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          novel={novel}
          onUpdate={onUpdate}
          handleImageUrl={handlers.handleImageUrl}
          handleImageUpload={handlers.handleImageUpload}
          handleSelectItem={handlers.handleSelectItem}
          addItemToLibrary={handlers.addItemToLibrary}
        />
      )}

      {paragraph.type === 'image' && (
        <ImageEditor
          paragraph={paragraph}
          index={index}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          mobileImageUrl={mobileImageUrl}
          setMobileImageUrl={setMobileImageUrl}
          onUpdate={onUpdate}
          handleImageUrl={() => handlers.handleImageUrl('image')}
          handleImageUpload={() => handlers.handleImageUpload('image')}
          handleMobileImageUrl={() => handlers.handleMobileImageUrl('image')}
          handleMobileImageUpload={() => handlers.handleMobileImageUpload('image')}
        />
      )}

      {paragraph.type === 'background' && (
        <ImageEditor
          paragraph={paragraph}
          index={index}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          mobileImageUrl={mobileImageUrl}
          setMobileImageUrl={setMobileImageUrl}
          onUpdate={onUpdate}
          handleImageUrl={() => handlers.handleImageUrl('background')}
          handleImageUpload={() => handlers.handleImageUpload('background')}
          handleMobileImageUrl={() => handlers.handleMobileImageUrl('background')}
          handleMobileImageUpload={() => handlers.handleMobileImageUpload('background')}
          label="Фоновое изображение"
        />
      )}

      {paragraph.type === 'comic' && (
        <ComicEditor
          paragraph={paragraph}
          index={index}
          onUpdate={onUpdate}
        />
      )}
    </div>
  );
}

export default ParagraphEditorContent;