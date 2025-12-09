import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import TypewriterText from './TypewriterText';

interface DialogueBoxProps {
  characterName: string;
  characterImage?: string;
  text: string;
  skipTyping?: boolean;
  onComplete?: () => void;
  textSpeed?: number;
  onCommentSave?: (comment: string) => void;
  existingComment?: string;
}

function DialogueBox({ 
  characterName, 
  characterImage, 
  text, 
  skipTyping, 
  onComplete, 
  textSpeed = 50,
  onCommentSave,
  existingComment
}: DialogueBoxProps) {
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState(existingComment || '');

  const handleSaveComment = () => {
    onCommentSave?.(comment);
    setShowCommentDialog(false);
  };

  return (
    <>
      <div className="relative flex items-center gap-6">
        {characterImage && (
          <div className="flex flex-col items-center gap-3 animate-scale-in">
            <div className="flex items-center justify-center">
              {characterImage.startsWith('data:') ? (
                <img 
                  src={characterImage} 
                  alt={characterName}
                  className="w-48 h-48 object-cover rounded-lg shadow-2xl"
                />
              ) : (
                <div className="text-9xl">{characterImage}</div>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentDialog(true);
              }}
              className="text-sm font-bold text-primary bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full border border-primary/30 hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {characterName}
            </button>
          </div>
        )}
        
        <Card className="flex-1 bg-card/95 backdrop-blur-sm border-primary/30 shadow-2xl animate-scale-in">
          <CardContent className="p-6">
            {!characterImage && (
              <h3 className="text-lg font-bold text-primary mb-3">
                {characterName}
              </h3>
            )}
            <p className="novel-text text-lg leading-relaxed text-foreground">
              <TypewriterText 
                text={text}
                speed={textSpeed}
                skipTyping={skipTyping}
                onComplete={onComplete}
              />
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Комментарий о персонаже: {characterName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Добавьте свои заметки о персонаже..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="text-foreground"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCommentDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleSaveComment}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DialogueBox;