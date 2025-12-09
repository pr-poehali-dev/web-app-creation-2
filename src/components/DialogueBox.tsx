import { useState, useEffect } from 'react';
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
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const shouldGenerate = !characterImage || (!characterImage.startsWith('data:') && characterImage.length <= 2);
    
    if (shouldGenerate && !generatedImage && !isGenerating) {
      setIsGenerating(true);
      
      // Запускаем генерацию через небольшую задержку чтобы не блокировать UI
      setTimeout(async () => {
        try {
          const response = await fetch('https://api.poehali.dev/v1/generate-image', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: `Portrait of character named ${characterName}, fantasy art style, detailed face, dramatic lighting, high quality, professional digital art`
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.url) {
              setGeneratedImage(data.url);
            }
          }
        } catch (err) {
          console.error('Failed to generate image:', err);
        } finally {
          setIsGenerating(false);
        }
      }, 500);
    }
  }, [characterName, characterImage, generatedImage, isGenerating]);

  const handleSaveComment = () => {
    onCommentSave?.(comment);
    setShowCommentDialog(false);
  };

  return (
    <>
      <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-6">
        {(characterImage || generatedImage) && (
          <div className="flex flex-col items-center gap-3 animate-scale-in">
            <div className="flex items-center justify-center">
              {generatedImage ? (
                <ZoomableImage
                  src={generatedImage}
                  alt={characterName}
                  className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-3xl shadow-2xl"
                />
              ) : characterImage && characterImage.startsWith('data:') ? (
                <ZoomableImage
                  src={characterImage}
                  alt={characterName}
                  className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-3xl shadow-2xl"
                />
              ) : isGenerating ? (
                <div className="w-32 h-32 md:w-48 md:h-48 bg-muted rounded-3xl shadow-2xl flex items-center justify-center">
                  <div className="animate-spin text-2xl">⏳</div>
                </div>
              ) : (
                <div className="text-6xl md:text-9xl">{characterImage}</div>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentDialog(true);
              }}
              className="text-sm font-bold text-primary-foreground bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full border-0 hover:bg-primary transition-all shadow-lg cursor-pointer"
            >
              {characterName}
            </button>
          </div>
        )}
        
        <Card className="flex-1 w-full bg-card/95 backdrop-blur-sm border-0 shadow-xl animate-scale-in">
          <CardContent className="p-4 md:p-8">
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