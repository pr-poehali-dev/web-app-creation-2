import { Paragraph, Episode } from '@/types/novel';
import { useState, useMemo } from 'react';
import BackgroundImageLayer from '../NovelReader/BackgroundImageLayer';
import BackgroundContentOverlay from '../NovelReader/BackgroundContentOverlay';
import TextContentPanel from '../NovelReader/TextContentPanel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SlideCanvasProps {
  paragraph: Paragraph | undefined;
  episode: Episode | undefined;
  zoom: number;
  onUpdate: (updates: Partial<Paragraph>) => void;
}

export default function SlideCanvas({ paragraph, episode, zoom, onUpdate }: SlideCanvasProps) {
  const [selectedElement, setSelectedElement] = useState<'background' | 'frame' | 'content' | null>(null);

  if (!paragraph || !episode) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Выберите слайд для редактирования</p>
      </div>
    );
  }

  // Получаем фоновое изображение
  const backgroundImage = paragraph.type === 'background' 
    ? paragraph.url 
    : episode.paragraphs.slice(0, episode.paragraphs.indexOf(paragraph) + 1)
        .reverse()
        .find(p => p.type === 'background')?.url || null;

  // Подготавливаем данные для комикс-фреймов
  const comicGroupData = useMemo(() => {
    if (!paragraph.comicFrames || paragraph.comicFrames.length === 0) return null;

    return {
      frames: paragraph.comicFrames.map(frame => ({
        ...frame,
        _isVisible: true
      })),
      layout: paragraph.frameLayout || 'horizontal-3' as const
    };
  }, [paragraph.comicFrames, paragraph.frameLayout]);

  const timeframes = paragraph.timeframes || episode.timeframes || ['present'];
  const isRetrospective = timeframes.includes('retrospective');
  const effectivePastelColor = paragraph.pastelColor || episode.pastelColor;

  const getPastelColor = (color?: string) => {
    const colors = {
      pink: 'rgba(255, 182, 193, 0.4)',
      blue: 'rgba(173, 216, 230, 0.4)',
      peach: 'rgba(255, 218, 185, 0.4)',
      lavender: 'rgba(221, 160, 221, 0.4)',
      mint: 'rgba(152, 255, 152, 0.4)',
      yellow: 'rgba(255, 255, 153, 0.4)',
      coral: 'rgba(255, 160, 122, 0.4)',
      sky: 'rgba(135, 206, 235, 0.4)'
    };
    return colors[color as keyof typeof colors] || colors.pink;
  };

  const getFilterStyle = (baseFilter: string) => {
    const contrastAmount = isRetrospective ? 0.95 : 1;
    const brightnessAmount = isRetrospective ? 1.05 : 1;
    const saturationAmount = isRetrospective ? 1.2 : 1;
    return `${baseFilter} contrast(${contrastAmount}) brightness(${brightnessAmount}) saturate(${saturationAmount})`;
  };

  return (
    <div className="flex items-center justify-center p-8 min-h-full bg-[#0a0f14]">
      <div
        className="relative shadow-2xl overflow-hidden"
        style={{
          width: 1200 * zoom,
          height: 720 * zoom,
          transformOrigin: 'center'
        }}
      >
        {/* Полная копия читалки */}
        <div className="w-full h-full flex">
          {/* Левая часть - визуал (как в читалке) */}
          <div 
            className="w-1/2 relative overflow-hidden cursor-pointer"
            onClick={() => setSelectedElement('background')}
          >
            {backgroundImage ? (
              <>
                <BackgroundImageLayer
                  backgroundImage={backgroundImage}
                  previousBackgroundImage={null}
                  backgroundObjectFit={
                    paragraph.type === 'background' 
                      ? paragraph.objectFit || 'cover'
                      : 'cover'
                  }
                  backgroundObjectPosition={
                    paragraph.type === 'background'
                      ? paragraph.objectPosition || 'center'
                      : 'center'
                  }
                  isRetrospective={isRetrospective}
                  effectivePastelColor={effectivePastelColor}
                  getFilterStyle={getFilterStyle}
                  getPastelColor={getPastelColor}
                />
                
                <BackgroundContentOverlay
                  currentParagraph={paragraph}
                  comicGroupData={comicGroupData}
                  showComicFrames={true}
                  actualIsContentHidden={false}
                  isTyping={false}
                  isRetrospective={isRetrospective}
                  effectivePastelColor={effectivePastelColor}
                  getFilterStyle={getFilterStyle}
                />

                {/* Градиент для перехода */}
                <div className="absolute bottom-0 left-0 right-0 h-80 pointer-events-none z-10">
                  <div className="w-full h-full bg-gradient-to-b from-transparent via-[#151d28]/50 to-[#151d28]" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <Icon name="ImagePlus" size={64} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Добавьте фон через параграф типа "background"
                  </p>
                </div>
              </div>
            )}

            {/* Overlay для выделения */}
            {selectedElement === 'background' && (
              <div className="absolute inset-0 ring-4 ring-primary pointer-events-none z-50" />
            )}
          </div>

          {/* Правая часть - текстовый контент (как в читалке) */}
          <div 
            className="w-1/2 relative bg-[#151d28] cursor-pointer"
            onClick={() => setSelectedElement('content')}
          >
            <TextContentPanel
              currentParagraph={paragraph}
              currentEpisode={episode}
              currentParagraphIndex={0}
              isTyping={false}
              novel={{ episodes: [episode], library: { items: [], characters: [], choices: [] }, title: '' }}
              settings={{
                textSize: 'medium',
                textSpeed: 'medium',
                theme: 'dark',
                fontFamily: 'lora',
                uiFontFamily: 'system'
              }}
              profile={{
                currentEpisodeId: episode.id,
                currentParagraphIndex: 0,
                unlockedEpisodes: [episode.id],
                collectedItems: [],
                selectedChoices: [],
                bookmarks: [],
                activePaths: []
              }}
              skipTyping={false}
              handleTypingComplete={() => {}}
              handleChoice={() => {}}
              onProfileUpdate={() => {}}
              paragraphKey={`${episode.id}-0`}
              goToPreviousParagraph={() => {}}
              goToNextParagraph={() => {}}
              existingBookmark={null}
              handleAddBookmark={() => {}}
              handleRemoveBookmark={() => {}}
              isContentHidden={false}
              onToggleContentVisibility={() => {}}
            />

            {/* Overlay для выделения */}
            {selectedElement === 'content' && (
              <div className="absolute inset-0 ring-4 ring-primary pointer-events-none z-50" />
            )}
          </div>
        </div>

        {/* Кнопки редактирования */}
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          {paragraph.type === 'background' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const url = prompt('URL фона:', paragraph.url || '');
                if (url !== null) onUpdate({ url });
              }}
            >
              <Icon name="Image" size={16} className="mr-2" />
              Изменить фон
            </Button>
          )}

          {(paragraph.type === 'text' || 
            paragraph.type === 'dialogue' || 
            paragraph.type === 'choice') && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const newFrame = {
                  id: `frame-${Date.now()}`,
                  type: 'image' as const,
                  url: '',
                  objectPosition: 'center',
                  objectFit: 'cover' as const,
                  animation: 'fade' as const,
                  paragraphTrigger: 0
                };
                onUpdate({
                  comicFrames: [...(paragraph.comicFrames || []), newFrame]
                });
              }}
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить фрейм
            </Button>
          )}
        </div>

        {/* Подсказка */}
        <div className="absolute bottom-4 left-4 bg-black/90 text-white text-xs rounded-lg p-3 z-50 max-w-xs">
          <p className="font-semibold mb-1">💡 Редактор</p>
          <p className="text-white/70">
            Левая часть — визуал (фон + фреймы)
            <br />
            Правая часть — текстовый контент
            <br />
            Редактируйте через панель свойств справа →
          </p>
        </div>
      </div>
    </div>
  );
}
