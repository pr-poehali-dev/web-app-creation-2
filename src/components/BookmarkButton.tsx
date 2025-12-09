import { useState } from 'react';
import { Bookmark } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface BookmarkButtonProps {
  episodeId: string;
  paragraphIndex: number;
  existingBookmark?: Bookmark;
  onAdd: (comment: string) => void;
  onRemove: () => void;
}

function BookmarkButton({ episodeId, paragraphIndex, existingBookmark, onAdd, onRemove }: BookmarkButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [comment, setComment] = useState(existingBookmark?.comment || '');

  const handleSave = () => {
    onAdd(comment);
    setShowDialog(false);
  };

  const handleRemove = () => {
    onRemove();
    setShowDialog(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`bg-card/50 backdrop-blur-sm hover:bg-card/80 ${existingBookmark ? 'text-primary' : ''}`}
        onClick={() => setShowDialog(!showDialog)}
      >
        <Icon name={existingBookmark ? 'Bookmark' : 'BookmarkPlus'} size={20} />
      </Button>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground mb-4">
              {existingBookmark ? 'Редактировать закладку' : 'Создать закладку'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Комментарий (необязательно)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Добавьте заметку к этому месту..."
                  rows={3}
                  className="mt-2 text-foreground"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1">
                  <Icon name={existingBookmark ? 'Save' : 'Plus'} size={16} className="mr-2" />
                  {existingBookmark ? 'Сохранить' : 'Создать'}
                </Button>
                {existingBookmark && (
                  <Button variant="destructive" onClick={handleRemove}>
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setShowDialog(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BookmarkButton;
