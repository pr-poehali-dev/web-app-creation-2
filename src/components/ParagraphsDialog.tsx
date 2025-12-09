import { Novel } from '@/types/novel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ParagraphsDialogProps {
  open: boolean;
  novel: Novel;
  selectedEpisodeId: string | null;
  onOpenChange: (open: boolean) => void;
  onEpisodeSelect: (episodeId: string, paragraphIndex: number) => void;
}

function ParagraphsDialog({
  open,
  novel,
  selectedEpisodeId,
  onOpenChange,
  onEpisodeSelect
}: ParagraphsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Параграфы: {novel.episodes.find(ep => ep.id === selectedEpisodeId)?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh] space-y-2 pr-2">
          {selectedEpisodeId && novel.episodes.find(ep => ep.id === selectedEpisodeId)?.paragraphs.map((para, pIndex) => {
            const isCurrentPara = novel.currentEpisodeId === selectedEpisodeId && novel.currentParagraphIndex === pIndex;
            const isVisited = novel.currentEpisodeId === selectedEpisodeId && pIndex <= novel.currentParagraphIndex;
            const isLocked = !isVisited;
            
            return (
              <button
                key={para.id}
                onClick={() => {
                  if (!isLocked) {
                    onEpisodeSelect(selectedEpisodeId, pIndex);
                    onOpenChange(false);
                  }
                }}
                disabled={isLocked}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  isCurrentPara
                    ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                    : isLocked
                    ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    : 'bg-muted hover:bg-muted/80 text-foreground hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold">#{pIndex + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="uppercase text-xs font-bold opacity-70">{para.type}</span>
                      {isLocked && <Icon name="Lock" size={12} />}
                    </div>
                    {para.type === 'text' && para.content && (
                      <p className="text-sm opacity-80 line-clamp-2">{para.content}</p>
                    )}
                    {para.type === 'dialogue' && para.characterName && (
                      <p className="text-sm opacity-80">{para.characterName}: {para.text?.slice(0, 50)}...</p>
                    )}
                    {para.type === 'item' && para.name && (
                      <p className="text-sm opacity-80">{para.name}</p>
                    )}
                    {para.type === 'choice' && para.question && (
                      <p className="text-sm opacity-80">{para.question}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ParagraphsDialog;