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
  pastelColor?: string;
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
  pastelColor,
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
      <Card className={`relative bg-card/95 backdrop-blur-sm border-0 shadow-xl ${shouldAnimate ? 'animate-scale-in' : ''} rounded-xl md:rounded-2xl w-full min-h-[10rem] md:min-h-[12rem]`}>
        <div 
          className="absolute inset-0 pointer-events-none rounded-xl md:rounded-2xl transition-all duration-1000 ease-in-out"
          style={{
            opacity: isRetrospective ? 1 : 0,
            background: `radial-gradient(circle at center, ${
              pastelColor === 'pink' ? 'rgba(255, 182, 193, 0.5)' :
              pastelColor === 'blue' ? 'rgba(173, 216, 230, 0.5)' :
              pastelColor === 'peach' ? 'rgba(255, 218, 185, 0.5)' :
              pastelColor === 'lavender' ? 'rgba(221, 160, 221, 0.5)' :
              pastelColor === 'mint' ? 'rgba(152, 255, 152, 0.5)' :
              pastelColor === 'yellow' ? 'rgba(255, 255, 153, 0.5)' :
              pastelColor === 'coral' ? 'rgba(255, 160, 122, 0.5)' :
              pastelColor === 'sky' ? 'rgba(135, 206, 235, 0.5)' :
              'rgba(255, 182, 193, 0.5)'
            } 0%, ${
              pastelColor === 'pink' ? 'rgba(255, 182, 193, 0.2)' :
              pastelColor === 'blue' ? 'rgba(173, 216, 230, 0.2)' :
              pastelColor === 'peach' ? 'rgba(255, 218, 185, 0.2)' :
              pastelColor === 'lavender' ? 'rgba(221, 160, 221, 0.2)' :
              pastelColor === 'mint' ? 'rgba(152, 255, 152, 0.2)' :
              pastelColor === 'yellow' ? 'rgba(255, 255, 153, 0.2)' :
              pastelColor === 'coral' ? 'rgba(255, 160, 122, 0.2)' :
              pastelColor === 'sky' ? 'rgba(135, 206, 235, 0.2)' :
              'rgba(255, 182, 193, 0.2)'
            } 50%, transparent 100%)`,
            backdropFilter: isRetrospective ? 'saturate(1.2) brightness(1.05)' : 'none'
          }}
        />
        
        {characterImage && (
          <div className={`absolute left-4 md:left-6 lg:left-8 bottom-4 md:bottom-6 lg:bottom-8 flex flex-col items-center gap-3 z-10 ${shouldAnimate ? 'animate-scale-in' : ''}`}>
            <div className="flex items-center justify-center relative">
              {characterImage.startsWith('data:') || characterImage.startsWith('http') ? (
                <ZoomableImage
                  src={characterImage}
                  alt={characterName}
                  className={isTopMerged 
                    ? "max-w-[6rem] max-h-[8rem] md:max-w-[8rem] md:max-h-[10rem] lg:max-w-[10rem] lg:max-h-[13rem] object-contain"
                    : "max-w-[7rem] max-h-[9rem] md:max-w-[9rem] md:max-h-[12rem] lg:max-w-[12rem] lg:max-h-[16rem] object-contain"
                  }
                  style={{
                    filter: isRetrospective ? 'saturate(1.2) brightness(1.05) contrast(0.95)' : 'none',
                    transition: 'filter 1.2s ease-in-out'
                  }}
                  overlayStyle={isRetrospective ? {
                    background: `radial-gradient(circle at center, ${
                      pastelColor === 'pink' ? 'rgba(255, 182, 193, 0.3)' :
                      pastelColor === 'blue' ? 'rgba(173, 216, 230, 0.3)' :
                      pastelColor === 'peach' ? 'rgba(255, 218, 185, 0.3)' :
                      pastelColor === 'lavender' ? 'rgba(221, 160, 221, 0.3)' :
                      pastelColor === 'mint' ? 'rgba(152, 255, 152, 0.3)' :
                      pastelColor === 'yellow' ? 'rgba(255, 255, 153, 0.3)' :
                      pastelColor === 'coral' ? 'rgba(255, 160, 122, 0.3)' :
                      pastelColor === 'sky' ? 'rgba(135, 206, 235, 0.3)' :
                      'rgba(255, 182, 193, 0.3)'
                    } 0%, transparent 70%)`,
                    mixBlendMode: 'soft-light' as const
                  } : undefined}
                />
              ) : (
                <div className={isTopMerged ? "text-5xl md:text-6xl lg:text-8xl" : "text-6xl md:text-7xl lg:text-9xl"}>{characterImage}</div>
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
        
        <CardContent className="p-4 md:p-6 lg:p-8 flex items-start">
          <div className={characterImage ? (isTopMerged ? "pl-28 md:pl-36 lg:pl-44" : "pl-32 md:pl-40 lg:pl-52") : ""}>
            {!characterImage && (
              <h3 className={isTopMerged 
                ? "text-sm md:text-base lg:text-lg font-bold text-primary mb-1.5 md:mb-2"
                : "text-sm md:text-base lg:text-lg font-bold text-primary mb-2 md:mb-3"
              }>
                {characterName}
              </h3>
            )}
            <div className={`novel-text leading-relaxed text-foreground ${
              isTopMerged 
                ? "text-sm md:text-base lg:text-lg" 
                : "text-sm md:text-base lg:text-lg"
            }`} style={{ fontFamily }}>
              <TypewriterText 
                text={text}
                speed={textSpeed}
                skipTyping={skipTyping}
                onComplete={onComplete}
                resetKey={resetKey}
              />
            </div>
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