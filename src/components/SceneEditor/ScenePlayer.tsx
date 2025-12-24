import { useRef, useEffect, useState } from 'react';
import { Scene } from '@/types/scene';
import { useAnimationEngine } from '@/hooks/useAnimationEngine';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ScenePlayerProps {
  scene: Scene;
  onChoiceSelected?: (choiceId: string) => void;
  variables: { [key: string]: any };
}

export default function ScenePlayer({ scene, onChoiceSelected, variables }: ScenePlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useAnimationEngine({ scene, currentTime, isPlaying });
  useAudioEngine({
    audioTracks: scene.audioTracks,
    currentTime,
    isPlaying
  });

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.016;
        if (next >= scene.duration) {
          setIsPlaying(false);
          return scene.duration;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, scene.duration]);

  const sortedLayers = [...scene.layers].sort((a, b) => a.order - b.order);
  const visibleChoices = scene.choices.filter(choice => {
    if (!choice.condition) return true;
    try {
      const fn = new Function('variables', `return ${choice.condition}`);
      return fn(variables);
    } catch {
      return true;
    }
  });

  return (
    <div className="relative w-full h-full bg-[#1a1a2e]" ref={containerRef}>
      {sortedLayers.map(layer => {
        if (!layer.visible) return null;

        return (
          <div
            key={layer.id}
            id={`layer-${layer.id}`}
            className="absolute"
            style={{
              left: layer.x,
              top: layer.y,
              width: layer.width,
              height: layer.height,
              transform: `rotate(${layer.rotation}deg) scale(${layer.scale})`,
              opacity: layer.opacity,
              filter: layer.blur ? `blur(${layer.blur}px)` : undefined,
              zIndex: layer.order
            }}
          >
            {layer.type === 'text' && (
              <div
                className="w-full h-full flex items-center overflow-hidden"
                style={{
                  fontSize: layer.fontSize,
                  fontFamily: layer.fontFamily,
                  fontWeight: layer.fontWeight,
                  color: layer.color,
                  textAlign: layer.textAlign,
                  justifyContent: 
                    layer.textAlign === 'center' ? 'center' :
                    layer.textAlign === 'right' ? 'flex-end' : 'flex-start'
                }}
              >
                {layer.textContent}
              </div>
            )}

            {layer.type === 'image' && layer.imageUrl && (
              <img
                src={layer.imageUrl}
                alt={layer.name}
                className="w-full h-full object-cover"
              />
            )}

            {layer.type === 'video' && layer.videoUrl && (
              <video
                src={layer.videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
              />
            )}

            {(layer.type === 'shape' || layer.type === 'background') && (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: layer.backgroundColor
                }}
              />
            )}
          </div>
        );
      })}

      {visibleChoices.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 flex-wrap justify-center max-w-[90%]">
          {visibleChoices.map(choice => (
            <Button
              key={choice.id}
              onClick={() => onChoiceSelected?.(choice.id)}
              className="px-6 py-3"
            >
              {choice.text}
            </Button>
          ))}
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          onClick={() => {
            setCurrentTime(0);
            setIsPlaying(true);
          }}
        >
          <Icon name="RotateCcw" size={20} />
        </Button>
      </div>
    </div>
  );
}
