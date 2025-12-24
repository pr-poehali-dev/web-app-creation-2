import { Scene, Animation } from '@/types/scene';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';

interface TimelineProps {
  scene: Scene;
  currentTime: number;
  duration: number;
  onTimeChange: (time: number) => void;
  selectedLayerId: string | null;
  onAddAnimation: (layerId: string) => void;
  onUpdateAnimation: (animId: string, updates: Partial<Animation>) => void;
}

export default function Timeline({
  scene,
  currentTime,
  duration,
  onTimeChange,
  selectedLayerId,
  onAddAnimation
}: TimelineProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-48 border-t bg-background">
      <div className="h-12 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">Timeline</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {selectedLayerId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddAnimation(selectedLayerId)}
          >
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить анимацию
          </Button>
        )}
      </div>

      <div className="p-4">
        <div className="relative">
          <Slider
            value={[currentTime]}
            onValueChange={([v]) => onTimeChange(v)}
            min={0}
            max={duration}
            step={0.01}
            className="w-full"
          />
          
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
              <span key={i}>{i}s</span>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {scene.layers.map(layer => {
            const layerAnimations = scene.animations.filter(a => a.layerId === layer.id);
            
            return (
              <div key={layer.id} className="flex items-center gap-2">
                <span className="text-xs w-32 truncate">{layer.name}</span>
                <div className="flex-1 h-6 bg-muted/30 rounded relative">
                  {layerAnimations.map(anim => {
                    const startPercent = ((anim.delay || 0) / duration) * 100;
                    const widthPercent = (anim.duration / duration) * 100;
                    
                    return (
                      <div
                        key={anim.id}
                        className="absolute h-full bg-primary/50 rounded cursor-pointer hover:bg-primary/70 transition-colors"
                        style={{
                          left: `${startPercent}%`,
                          width: `${widthPercent}%`
                        }}
                        title={anim.name}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
