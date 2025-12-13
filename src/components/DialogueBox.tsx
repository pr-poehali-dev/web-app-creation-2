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
  isRetrospective?: boolean;
  shouldAnimate?: boolean;
  resetKey?: string;
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
  isTopMerged = false,
  isRetrospective = false,
  shouldAnimate = true,
  resetKey
}: DialogueBoxProps) {
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [comment, setComment] = useState(existingComment || '');

  const handleSaveComment = () => {
    onCommentSave?.(comment);
    setShowCommentDialog(false);
  };

  return (
    <>
      <Card className={`relative bg-card/95 backdrop-blur-sm border-0 shadow-xl ${shouldAnimate ? 'animate-scale-in' : ''} rounded-xl md:rounded-2xl w-full`}>
        <div 
          className="absolute inset-0 pointer-events-none rounded-xl md:rounded-2xl transition-all duration-1000 ease-in-out"
          style={{
            opacity: isRetrospective ? 1 : 0,
            boxShadow: 'inset 0 0 60px 20px rgba(0, 0, 0, 0.4)',
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.3) 100%)'
          }}
        />
        
        {characterImage && (
          <div className={`absolute left-4 md:left-6 lg:left-8 ${isTopMerged ? '-top-8 md:-top-10 lg:-top-14' : '-top-10 md:-top-12 lg:-top-16'} flex flex-col items-center gap-2 z-10 ${shouldAnimate ? 'animate-scale-in' : ''}`}>
            <div className="flex items-center justify-center relative">
              {characterImage.startsWith('data:') || characterImage.startsWith('http') ? (
                <div className="relative">
                  <ZoomableImage
                    src={characterImage}
                    alt={characterName}
                    className={isTopMerged 
                      ? "w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28 object-contain"
                      : "w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain"
                    }
                    style={{
                      filter: isRetrospective ? 'sepia(0.6) contrast(0.9) brightness(0.85)' : 'none',
                      transition: 'filter 1.2s ease-in-out'
                    }}
                  />
                </div>
              ) : (
                <div className={isTopMerged ? "text-3xl md:text-4xl lg:text-6xl" : "text-4xl md:text-5xl lg:text-7xl"}>{characterImage}</div>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentDialog(true);
              }}
              className="text-[10px] md:text-xs font-bold text-primary-foreground bg-primary/90 backdrop-blur-sm px-2 md:px-3 py-1 md:py-1.5 rounded-full border-0 hover:bg-primary transition-all shadow-lg cursor-pointer whitespace-nowrap"
            >
              {characterName}
            </button>
          </div>
        )}
        
        <CardContent className={isTopMerged ? "p-3 md:p-4 lg:p-6" : "p-4 md:p-6 lg:p-8"}>
          <div className={characterImage ? (isTopMerged ? "pl-20 md:pl-24 lg:pl-32" : "pl-24 md:pl-28 lg:pl-36") : ""}>
            {!characterImage && (
              <h3 className={isTopMerged 
                ? "text-sm md:text-base lg:text-lg font-bold text-primary mb-1.5 md:mb-2"
                : "text-sm md:text-base lg:text-lg font-bold text-primary mb-2 md:mb-3"
              }>
                {characterName}
              </h3>
            )}
            <p className={`novel-text leading-snug md:leading-relaxed text-foreground ${
              isTopMerged 
                ? "text-sm md:text-base lg:text-lg min-h-[10rem] md:min-h-[12rem] flex items-start" 
                : "text-sm md:text-base lg:text-lg min-h-[10rem] md:min-h-[12rem] flex items-start"
            }`} style={{ fontFamily }}>
              <TypewriterText 
                text={text}
                speed={textSpeed}
                skipTyping={skipTyping}
                onComplete={onComplete}
                resetKey={resetKey}
              />
            </p>
          </div>
        </CardContent>
      </Card>

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