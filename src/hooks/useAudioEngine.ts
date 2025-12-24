import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { AudioTrack } from '@/types/scene';

interface UseAudioEngineProps {
  audioTracks: AudioTrack[];
  currentTime: number;
  isPlaying: boolean;
  onTimecodeHit?: (timecode: number, track: AudioTrack) => void;
}

export function useAudioEngine({
  audioTracks,
  currentTime,
  isPlaying,
  onTimecodeHit
}: UseAudioEngineProps) {
  const howlsRef = useRef<Map<string, Howl>>(new Map());
  const lastTimecodeRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    howlsRef.current.forEach(howl => howl.unload());
    howlsRef.current.clear();

    audioTracks.forEach(track => {
      const howl = new Howl({
        src: [track.url],
        volume: track.volume,
        loop: track.loop,
        preload: true,
        onload: () => {
          console.log(`Audio loaded: ${track.name}`);
        },
        onloaderror: (id, error) => {
          console.error(`Failed to load audio: ${track.name}`, error);
        }
      });

      howlsRef.current.set(track.id, howl);
    });

    return () => {
      howlsRef.current.forEach(howl => howl.unload());
      howlsRef.current.clear();
    };
  }, [audioTracks]);

  useEffect(() => {
    audioTracks.forEach(track => {
      const howl = howlsRef.current.get(track.id);
      if (!howl) return;

      if (isPlaying) {
        if (!howl.playing()) {
          howl.seek(currentTime);
          
          if (track.crossfadeIn && currentTime < track.crossfadeIn) {
            howl.fade(0, track.volume, track.crossfadeIn * 1000);
          }
          
          howl.play();
        }

        track.timecodes.forEach(timecode => {
          const lastHit = lastTimecodeRef.current.get(`${track.id}-${timecode.time}`) || 0;
          
          if (currentTime >= timecode.time && currentTime < timecode.time + 0.1 && lastHit !== currentTime) {
            lastTimecodeRef.current.set(`${track.id}-${timecode.time}`, currentTime);
            onTimecodeHit?.(timecode.time, track);

            if (timecode.action === 'highlight' && timecode.layerId) {
              const element = document.getElementById(`layer-${timecode.layerId}`);
              if (element) {
                element.classList.add('highlight-animation');
                setTimeout(() => element.classList.remove('highlight-animation'), 500);
              }
            }
          }
        });
      } else {
        howl.pause();
      }
    });
  }, [isPlaying, currentTime, audioTracks, onTimecodeHit]);

  useEffect(() => {
    audioTracks.forEach(track => {
      const howl = howlsRef.current.get(track.id);
      if (!howl || !howl.playing()) return;

      howl.seek(currentTime);
    });
  }, [currentTime, audioTracks]);

  const crossfadeToTrack = (fromTrackId: string, toTrackId: string, duration = 1000) => {
    const fromHowl = howlsRef.current.get(fromTrackId);
    const toHowl = howlsRef.current.get(toTrackId);
    
    const fromTrack = audioTracks.find(t => t.id === fromTrackId);
    const toTrack = audioTracks.find(t => t.id === toTrackId);

    if (fromHowl && toTrack) {
      fromHowl.fade(fromTrack?.volume || 1, 0, duration);
      setTimeout(() => fromHowl.stop(), duration);
    }

    if (toHowl && toTrack) {
      toHowl.volume(0);
      toHowl.play();
      toHowl.fade(0, toTrack.volume, duration);
    }
  };

  return {
    howlsRef,
    crossfadeToTrack
  };
}
