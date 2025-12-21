import { useState } from 'react';
import { Episode } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { selectAndConvertAudio } from '@/utils/fileHelpers';

interface EpisodeMusicSettingsProps {
  episode: Episode;
  onUpdate: (episode: Episode) => void;
}

function EpisodeMusicSettings({ episode, onUpdate }: EpisodeMusicSettingsProps) {
  const [showMusicDialog, setShowMusicDialog] = useState(false);
  const [musicUrl, setMusicUrl] = useState('');

  const handleMusicUpload = async () => {
    const audioBase64 = await selectAndConvertAudio();
    if (audioBase64) {
      onUpdate({ ...episode, backgroundMusic: audioBase64 });
      setShowMusicDialog(false);
    }
  };

  const handleMusicUrl = () => {
    if (musicUrl) {
      onUpdate({ ...episode, backgroundMusic: musicUrl });
      setMusicUrl('');
      setShowMusicDialog(false);
    }
  };

  return (
    <div>
      <Label className="text-foreground">Фоновая музыка</Label>
      <div className="flex gap-2 mt-2">
        <Dialog open={showMusicDialog} onOpenChange={setShowMusicDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Icon name="Music" size={14} className="mr-1" />
              {episode.backgroundMusic ? 'Изменить музыку' : 'Добавить музыку'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить музыку</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>URL аудио</Label>
                <Input
                  placeholder="https://example.com/music.mp3"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  className="text-foreground mt-1"
                />
                <Button onClick={handleMusicUrl} className="w-full mt-2">
                  Добавить по URL
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">или</span>
                </div>
              </div>
              <Button onClick={handleMusicUpload} variant="outline" className="w-full">
                <Icon name="Upload" size={14} className="mr-2" />
                Загрузить файл
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {episode.backgroundMusic && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => onUpdate({ ...episode, backgroundMusic: undefined })}
          >
            <Icon name="X" size={14} className="mr-1" />
            Удалить
          </Button>
        )}
      </div>
    </div>
  );
}

export default EpisodeMusicSettings;
