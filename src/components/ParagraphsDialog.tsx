import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ParagraphsDialogProps {
  open: boolean;
  novel: Novel;
  profile: UserProfile;
  selectedEpisodeId: string | null;
  onOpenChange: (open: boolean) => void;
  onEpisodeSelect: (episodeId: string, paragraphIndex: number) => void;
  isAdmin?: boolean;
  isGuest?: boolean;
}

function ParagraphsDialog({
  open,
  novel,
  profile,
  selectedEpisodeId,
  onOpenChange,
  onEpisodeSelect,
  isAdmin,
  isGuest
}: ParagraphsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] md:ml-16">
        <DialogHeader>
          <DialogTitle>
            Параграфы: {novel.episodes.find(ep => ep.id === selectedEpisodeId)?.title}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh] space-y-2 pr-2">
          {selectedEpisodeId && novel.episodes.find(ep => ep.id === selectedEpisodeId)?.paragraphs.map((para, pIndex) => {
            // Показываем только текстовые и диалоговые параграфы
            if (para.type !== 'text' && para.type !== 'dialogue') {
              return null;
            }
            
            const isCurrentPara = profile.currentEpisodeId === selectedEpisodeId && profile.currentParagraphIndex === pIndex;
            const paragraphId = `${selectedEpisodeId}-${pIndex}`;
            const isVisited = pIndex === 0 || (profile.readParagraphs || []).includes(paragraphId) || (profile.readParagraphs || []).includes(`${selectedEpisodeId}-${pIndex - 1}`);
            
            // Для гостей параграфы доступны только в разблокированных эпизодах
            const episode = novel.episodes.find(ep => ep.id === selectedEpisodeId);
            const episodeIndex = novel.episodes.findIndex(ep => ep.id === selectedEpisodeId);
            const isEpisodeAccessibleForGuest = episodeIndex === 0 || episode?.unlockedForAll;
            
            let isLocked = false;
            if (isAdmin) {
              isLocked = false;
            } else if (isGuest && !isEpisodeAccessibleForGuest) {
              isLocked = true;
            } else {
              isLocked = !isVisited;
            }
            
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
                    ? 'bg-muted text-gray-200 cursor-not-allowed'
                    : 'bg-muted hover:bg-muted/80 text-gray-200 hover:shadow-md'
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