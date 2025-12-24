import { Paragraph, Episode, MergeLayoutType } from '@/types/novel';
import { useState, useMemo } from 'react';
import BackgroundImageLayer from '../NovelReader/BackgroundImageLayer';
import BackgroundContentOverlay from '../NovelReader/BackgroundContentOverlay';
import TextContentPanel from '../NovelReader/TextContentPanel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import FrameEditor from './FrameEditor';
import ImageEditor from './ImageEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SlideCanvasProps {
  paragraph: Paragraph | undefined;
  episode: Episode | undefined;
  zoom: number;
  onUpdate: (updates: Partial<Paragraph>) => void;
}

export default function SlideCanvas({ paragraph, episode, zoom, onUpdate }: SlideCanvasProps) {
  const [selectedElement, setSelectedElement] = useState<'background' | 'frame' | 'content' | null>(null);
  const [editingFrameIndex, setEditingFrameIndex] = useState<number | null>(null);
  const [isEditingBackground, setIsEditingBackground] = useState(false);

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
                  transform={paragraph.type === 'background' ? paragraph.transform : undefined}
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
            className="w-1/2 relative bg-[#151d28] cursor-pointer overflow-hidden"
            onClick={() => setSelectedElement('content')}
          >
            <TextContentPanel
              currentParagraph={paragraph}
              currentEpisode={episode}
              currentParagraphIndex={0}
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
              skipTyping={true}
              wasHidden={false}
              handleTypingComplete={() => {}}
              handleChoice={() => {}}
              onProfileUpdate={() => {}}
              paragraphKey={`${episode.id}-0`}
              goToPreviousParagraph={() => {}}
              goToNextParagraph={() => {}}
              actualIsContentHidden={false}
              setWasHidden={() => {}}
              onToggleContentVisibility={() => {}}
              setIsContentHidden={() => {}}
              isContentHidden={false}
              shouldShowContent={paragraph.type !== 'background'}
              isEditorMode={true}
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
              onClick={() => setIsEditingBackground(true)}
            >
              <Icon name="Edit2" size={16} className="mr-2" />
              Редактировать фон
            </Button>
          )}

          {(paragraph.type === 'text' || 
            paragraph.type === 'dialogue' || 
            paragraph.type === 'choice') && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const newFrame = {
                    id: `frame-${Date.now()}`,
                    type: 'image' as const,
                    url: 'https://via.placeholder.com/600x400?text=New+Frame',
                    objectPosition: 'center',
                    objectFit: 'cover' as const,
                    animation: 'fade' as const,
                    paragraphTrigger: 0,
                    shape: 'square' as const,
                    transform: { x: 0, y: 0, scale: 1, rotate: 0 }
                  };
                  onUpdate({
                    comicFrames: [...(paragraph.comicFrames || []), newFrame]
                  });
                }}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить фрейм
              </Button>

              {paragraph.comicFrames && paragraph.comicFrames.length > 0 && (
                <Select
                  value={paragraph.frameLayout || 'horizontal-3'}
                  onValueChange={(value) => onUpdate({ frameLayout: value as MergeLayoutType })}
                >
                  <SelectTrigger className="w-[200px] h-9">
                    <SelectValue placeholder="Макет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Один фрейм</SelectItem>
                    <SelectItem value="horizontal-2">2 в ряд</SelectItem>
                    <SelectItem value="horizontal-3">3 в ряд</SelectItem>
                    <SelectItem value="horizontal-4">4 в ряд</SelectItem>
                    <SelectItem value="vertical-2">2 вертикально</SelectItem>
                    <SelectItem value="vertical-3">3 вертикально</SelectItem>
                    <SelectItem value="grid-2x2">Сетка 2x2</SelectItem>
                    <SelectItem value="grid-3x3">Сетка 3x3</SelectItem>
                    <SelectItem value="mosaic-left">Мозаика слева</SelectItem>
                    <SelectItem value="mosaic-right">Мозаика справа</SelectItem>
                    <SelectItem value="magazine-1">Журнальный 1</SelectItem>
                    <SelectItem value="magazine-2">Журнальный 2</SelectItem>
                    <SelectItem value="center-large">Центр + углы</SelectItem>
                    <SelectItem value="l-shape">L-форма</SelectItem>
                    <SelectItem value="filmstrip">Кинолента</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </>
          )}
        </div>

        {/* Список фреймов для редактирования */}
        {paragraph.comicFrames && paragraph.comicFrames.length > 0 && (
          <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-50 max-w-xs">
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 space-y-2">
              <div className="text-xs text-white/60 font-medium mb-2">Фреймы ({paragraph.comicFrames.length})</div>
              {paragraph.comicFrames.map((frame, index) => (
                <div key={frame.id} className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingFrameIndex(index)}
                    className="flex-1 justify-start text-xs"
                  >
                    <Icon name="Edit2" size={14} className="mr-2" />
                    Фрейм {index + 1}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const updated = [...paragraph.comicFrames!];
                      updated.splice(index, 1);
                      onUpdate({ comicFrames: updated });
                    }}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Редактор фрейма */}
      {editingFrameIndex !== null && paragraph.comicFrames && paragraph.comicFrames[editingFrameIndex] && (
        <FrameEditor
          frame={paragraph.comicFrames[editingFrameIndex]}
          onUpdate={(updates) => {
            const updated = [...paragraph.comicFrames!];
            updated[editingFrameIndex] = { ...updated[editingFrameIndex], ...updates };
            onUpdate({ comicFrames: updated });
          }}
          onClose={() => setEditingFrameIndex(null)}
        />
      )}

      {/* Редактор фонового изображения */}
      {isEditingBackground && paragraph.type === 'background' && (
        <ImageEditor
          image={{
            url: paragraph.url,
            objectPosition: paragraph.objectPosition,
            objectFit: paragraph.objectFit,
            transform: paragraph.transform
          }}
          onUpdate={(updates) => onUpdate(updates)}
          onClose={() => setIsEditingBackground(false)}
        />
      )}
    </div>
  );
}