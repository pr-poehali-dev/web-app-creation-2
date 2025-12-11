import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import TypewriterText from './TypewriterText';
import ZoomableImage from './ZoomableImage';

interface DialogueBoxProps {
  characterName: string;
  characterImage?: string;
  text: string;
  skipTyping?: boolean;
  onComplete?: () => void;
  textSpeed?: number;
  onCommentSave?: (comment: string) => void;
  existingComment?: string;
  fontFamily?: string;
  isTopMerged?: boolean;
}

function DialogueBox({ 
  characterName, 
  characterImage, 
  text, 
  skipTyping, 
  onComplete, 
  textSpeed = 50,
  onCommentSave,
  existingComment,
  fontFamily,
  isTopMerged = false
}: DialogueBoxProps) {
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState(existingComment || '');

  const handleSaveComment = () => {
    onCommentSave?.(comment);
    setShowCommentDialog(false);
  };

  return (
    <>
      <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-6">
        {characterImage && (
          <div className="flex flex-col items-center gap-3 animate-scale-in">
            <div className="flex items-center justify-center">
              {characterImage.startsWith('data:') || characterImage.startsWith('http') ? (
                <ZoomableImage
                  src={characterImage}
                  alt={characterName}
                  className={isTopMerged 
                    ? "w-16 h-16 md:w-28 md:h-28 lg:w-40 lg:h-40 object-contain rounded-xl md:rounded-2xl shadow-xl"
                    : "w-24 h-24 md:w-32 md:h-32 lg:w-48 lg:h-48 object-contain rounded-2xl md:rounded-3xl shadow-2xl"
                  }
                />
              ) : (
                <div className={isTopMerged ? "text-3xl md:text-5xl lg:text-7xl" : "text-5xl md:text-6xl lg:text-9xl"}>{characterImage}</div>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentDialog(true);
              }}
              className="text-xs md:text-sm font-bold text-primary-foreground bg-primary/90 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full border-0 hover:bg-primary transition-all shadow-lg cursor-pointer"
            >
              {characterName}
            </button>
          </div>
        )}
        
        <Card className="flex-1 w-full bg-card/95 backdrop-blur-sm border-0 shadow-xl animate-scale-in rounded-xl md:rounded-2xl">
          <CardContent className={isTopMerged ? "p-2 md:p-4 lg:p-6" : "p-3 md:p-4 lg:p-8"}>
            {!characterImage && (
              <h3 className={isTopMerged 
                ? "text-xs md:text-base lg:text-lg font-bold text-primary mb-1 md:mb-2"
                : "text-sm md:text-base lg:text-lg font-bold text-primary mb-2 md:mb-3"
              }>
                {characterName}
              </h3>
            )}
            <p className={`novel-text leading-snug md:leading-relaxed text-foreground ${isTopMerged ? "text-xs md:text-base lg:text-lg" : "text-sm md:text-base lg:text-lg"}`} style={{ fontFamily }}>
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