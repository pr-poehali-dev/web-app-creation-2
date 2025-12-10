import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface MusicPlayerProps {
  audioSrc: string;
  volume?: number;
  isPlaying: boolean;
  onToggle: () => void;
}

function MusicPlayer({ audioSrc, volume: initialVolume = 70, isPlaying, onToggle }: MusicPlayerProps) {
  const [volume, setVolume] = useState(initialVolume);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setVolume(initialVolume);
  }, [initialVolume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.loop = true;
      
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          console.error('Failed to play audio');
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, volume, audioSrc]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <>
      <audio ref={audioRef} src={audioSrc} />
      
      <div 
        className="fixed top-4 right-4 z-50"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {showControls ? (
          <Card className="p-3 bg-card/95 backdrop-blur-sm animate-scale-in">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Icon name="Pause" size={20} />
                ) : (
                  <Icon name="Play" size={20} />
                )}
              </Button>
              
              <div className="flex items-center gap-2 w-24">
                <Icon name="Volume2" size={16} className="text-muted-foreground" />
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </Card>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="bg-card/50 backdrop-blur-sm hover:bg-card/80"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Icon name="Music" size={20} className="animate-pulse" />
            ) : (
              <Icon name="MusicOff" size={20} />
            )}
          </Button>
        )}
      </div>
    </>
  );
}

export default MusicPlayer;