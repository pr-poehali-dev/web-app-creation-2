import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Scene, Animation, Layer } from '@/types/scene';

interface UseAnimationEngineProps {
  scene: Scene;
  currentTime: number;
  isPlaying: boolean;
}

export function useAnimationEngine({ scene, currentTime, isPlaying }: UseAnimationEngineProps) {
  const timelinesRef = useRef<Map<string, gsap.core.Timeline>>(new Map());

  useEffect(() => {
    timelinesRef.current.forEach(tl => tl.kill());
    timelinesRef.current.clear();

    scene.animations.forEach(animation => {
      const layer = scene.layers.find(l => l.id === animation.layerId);
      if (!layer) return;

      const elementId = `layer-${layer.id}`;
      const element = document.getElementById(elementId);
      if (!element) return;

      const timeline = gsap.timeline({
        paused: true,
        delay: animation.delay || 0
      });

      const keyframesByProperty = new Map<string, typeof animation.keyframes>();
      animation.keyframes.forEach(kf => {
        if (!keyframesByProperty.has(kf.property)) {
          keyframesByProperty.set(kf.property, []);
        }
        keyframesByProperty.get(kf.property)!.push(kf);
      });

      keyframesByProperty.forEach((keyframes, property) => {
        const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);

        sortedKeyframes.forEach((kf, index) => {
          const nextKf = sortedKeyframes[index + 1];
          const duration = nextKf ? (nextKf.time - kf.time) : 0;

          if (duration > 0) {
            const cssProperty = mapPropertyToCSS(property);
            const value = mapValueToCSS(property, kf.value);

            timeline.to(element, {
              [cssProperty]: value,
              duration,
              ease: mapEasingToGSAP(kf.easing, kf.easingParams),
            }, kf.time);
          }
        });
      });

      timelinesRef.current.set(animation.id, timeline);
    });

    return () => {
      timelinesRef.current.forEach(tl => tl.kill());
      timelinesRef.current.clear();
    };
  }, [scene]);

  useEffect(() => {
    timelinesRef.current.forEach(timeline => {
      if (isPlaying) {
        timeline.play();
      } else {
        timeline.pause();
      }
      timeline.time(currentTime);
    });
  }, [currentTime, isPlaying]);

  return { timelinesRef };
}

function mapPropertyToCSS(property: string): string {
  const mapping: Record<string, string> = {
    x: 'x',
    y: 'y',
    scale: 'scale',
    scaleX: 'scaleX',
    scaleY: 'scaleY',
    rotation: 'rotation',
    opacity: 'opacity',
    blur: 'filter',
    width: 'width',
    height: 'height'
  };
  return mapping[property] || property;
}

function mapValueToCSS(property: string, value: number | string): string | number {
  if (property === 'blur') {
    return `blur(${value}px)`;
  }
  if (property === 'rotation') {
    return `${value}deg`;
  }
  if (['width', 'height'].includes(property)) {
    return `${value}px`;
  }
  return value;
}

function mapEasingToGSAP(easing: string, params?: number[]): string {
  const easingMap: Record<string, string> = {
    'linear': 'none',
    'ease-in': 'power2.in',
    'ease-out': 'power2.out',
    'ease-in-out': 'power2.inOut',
    'bounce': 'bounce.out',
    'elastic': 'elastic.out',
    'back': 'back.out'
  };

  if (easing === 'cubic-bezier' && params && params.length === 4) {
    return `cubic-bezier(${params.join(',')})`;
  }

  if (easing === 'steps' && params && params.length >= 1) {
    return `steps(${params[0]})`;
  }

  return easingMap[easing] || 'none';
}
