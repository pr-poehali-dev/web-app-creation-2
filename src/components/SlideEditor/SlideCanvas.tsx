import { Paragraph, ComicFrame, FrameAnimationType } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface SlideCanvasProps {
  paragraph: Paragraph | undefined;
  zoom: number;
  onUpdate: (updates: Partial<Paragraph>) => void;
}

export default function SlideCanvas({ paragraph, zoom, onUpdate }: SlideCanvasProps) {
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);

  if (!paragraph) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Выберите слайд для редактирования</p>
      </div>
    );
  }

  const addComicFrame = () => {
    const newFrame: ComicFrame = {
      id: `frame-${Date.now()}`,
      type: 'image',
      url: '',
      objectPosition: 'center',
      objectFit: 'cover',
      animation: 'fade',
      paragraphTrigger: 0
    };

    onUpdate({
      comicFrames: [...(paragraph.comicFrames || []), newFrame]
    });
    setSelectedFrameId(newFrame.id);
  };

  const updateFrame = (frameId: string, updates: Partial<ComicFrame>) => {
    if (!paragraph.comicFrames) return;

    onUpdate({
      comicFrames: paragraph.comicFrames.map(f =>
        f.id === frameId ? { ...f, ...updates } : f
      )
    });
  };

  const deleteFrame = (frameId: string) => {
    if (!paragraph.comicFrames) return;

    onUpdate({
      comicFrames: paragraph.comicFrames.filter(f => f.id !== frameId)
    });
    setSelectedFrameId(null);
  };

  const selectedFrame = paragraph.comicFrames?.find(f => f.id === selectedFrameId);

  return (
    <div className="flex items-center justify-center p-8 min-h-full">
      <div
        className="relative shadow-2xl"
        style={{
          width: 1000 * zoom,
          height: 600 * zoom,
          transform: `scale(${zoom})`,
          transformOrigin: 'center'
        }}
      >
        {/* Background Layer */}
        <div className="absolute inset-0 bg-background">
          {paragraph.type === 'background' && paragraph.url && (
            <img
              src={paragraph.url}
              alt=""
              className="w-full h-full"
              style={{
                objectFit: paragraph.objectFit || 'cover',
                objectPosition: paragraph.objectPosition || 'center'
              }}
            />
          )}
        </div>

        {/* Comic Frames Layer */}
        {paragraph.comicFrames?.map((frame) => (
          <div
            key={frame.id}
            className={`absolute inset-0 cursor-pointer transition-all ${
              selectedFrameId === frame.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedFrameId(frame.id)}
          >
            {frame.url && (
              <img
                src={frame.url}
                alt={frame.alt || ''}
                className="w-full h-full"
                style={{
                  objectFit: frame.objectFit || 'cover',
                  objectPosition: frame.objectPosition || 'center'
                }}
              />
            )}
            {!frame.url && (
              <div className="w-full h-full flex items-center justify-center bg-muted/50">
                <Icon name="ImagePlus" size={48} className="text-muted-foreground" />
              </div>
            )}

            {selectedFrameId === frame.id && (
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFrame(frame.id);
                  }}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Content Layer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 pointer-events-none">
          {paragraph.type === 'text' && (
            <div className="bg-black/70 backdrop-blur-sm rounded-xl p-8 max-w-3xl text-center">
              <p className="text-white text-xl leading-relaxed">
                {paragraph.content || 'Введите текст'}
              </p>
            </div>
          )}

          {paragraph.type === 'dialogue' && (
            <div className="w-full max-w-4xl">
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-6">
                {paragraph.characterImage && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={paragraph.characterImage}
                      alt={paragraph.characterName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                    />
                  </div>
                )}
                <h3 className="text-primary text-lg font-semibold mb-2 text-center">
                  {paragraph.characterName || 'Персонаж'}
                </h3>
                <p className="text-white text-lg leading-relaxed text-center">
                  {paragraph.text || 'Введите текст диалога'}
                </p>
              </div>
            </div>
          )}

          {paragraph.type === 'choice' && (
            <div className="w-full max-w-2xl">
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-white text-xl font-semibold mb-6 text-center">
                  {paragraph.question || 'Вопрос'}
                </h3>
                <div className="space-y-3">
                  {paragraph.options?.map((option, idx) => (
                    <div
                      key={option.id}
                      className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-center text-white transition-colors"
                    >
                      {idx + 1}. {option.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Frame Button */}
        {(paragraph.type === 'text' ||
          paragraph.type === 'dialogue' ||
          paragraph.type === 'choice') && (
          <button
            onClick={addComicFrame}
            className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
            title="Добавить фрейм"
          >
            <Icon name="Plus" size={20} />
          </button>
        )}

        {/* Frame Info Overlay */}
        {selectedFrame && (
          <div className="absolute top-4 left-4 bg-black/90 text-white rounded-lg p-3 text-sm">
            <p className="font-semibold mb-1">
              Фрейм: {selectedFrame.type === 'image' ? 'Изображение' : 'Фон'}
            </p>
            <p className="text-xs text-white/70">
              Анимация: {selectedFrame.animation || 'fade'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
