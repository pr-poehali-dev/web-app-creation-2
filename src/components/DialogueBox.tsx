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
      <div className={`relative ${shouldAnimate ? 'animate-scale-in' : ''} w-full min-h-[10rem] md:min-h-[12rem]`}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="dialogGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5c8fa3" stopOpacity="0.88" />
              <stop offset="50%" stopColor="#d4c5b0" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#5c8fa3" stopOpacity="0.88" />
            </linearGradient>
            <filter id="dialogShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
              <feOffset dx="0" dy="5" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path d="M 0,120 C 100,70 200,90 350,100 C 500,110 650,95 750,105 C 820,112 870,100 900,115 L 900,280 C 870,300 820,288 750,295 C 650,305 500,290 350,300 C 200,310 100,330 0,280 Z" 
            fill="url(#dialogGrad)" filter="url(#dialogShadow)" opacity="0.9" />
          <ellipse cx="820" cy="130" rx="50" ry="50" fill="#2d2d2d" opacity="0.18" />
          <ellipse cx="100" cy="100" rx="40" ry="60" fill="#d4c5b0" opacity="0.3" />
          <ellipse cx="150" cy="300" rx="55" ry="40" fill="#5c8fa3" opacity="0.22" />
          <path d="M 70,110 C 75,130 80,150 85,170 C 90,190 95,210 100,230" stroke="#2d2d2d" strokeWidth="1.5" fill="none" opacity="0.25" strokeLinecap="round" />
          <path d="M 840,280 C 850,275 860,275 870,280" stroke="#2d2d2d" strokeWidth="1.2" fill="none" opacity="0.2" strokeLinecap="round" />
          <circle cx="450" cy="80" r="15" fill="#2d2d2d" opacity="0.15" />
        </svg>
        
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out"
          style={{
            opacity: isRetrospective ? 1 : 0,
            boxShadow: 'inset 0 0 60px 20px rgba(0, 0, 0, 0.4)',
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.3) 100%)'
          }}
        />
        
        {characterImage && (
          <div className={`absolute left-4 md:left-6 lg:left-8 bottom-4 md:bottom-6 lg:bottom-8 flex flex-col items-center gap-3 z-20 ${shouldAnimate ? 'animate-scale-in' : ''}`}>
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
                    filter: isRetrospective ? 'sepia(0.6) contrast(0.9) brightness(0.85)' : 'none',
                    transition: 'filter 1.2s ease-in-out'
                  }}
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
        
        <div className="p-4 md:p-6 lg:p-8 flex items-start relative z-10">
          <div className={characterImage ? (isTopMerged ? "pl-28 md:pl-36 lg:pl-44" : "pl-32 md:pl-40 lg:pl-52") : ""}>
            {!characterImage && (
              <h3 className={isTopMerged 
                ? "text-sm md:text-base lg:text-lg font-bold mb-1.5 md:mb-2 drop-shadow-sm" 
                : "text-sm md:text-base lg:text-lg font-bold mb-2 md:mb-3 drop-shadow-sm"
              } style={{ color: '#2d2d2d' }}>
                {characterName}
              </h3>
            )}
            <div className={`novel-text leading-relaxed text-foreground drop-shadow-sm ${
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
        </div>
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