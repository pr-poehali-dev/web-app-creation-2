import { VisualEpisode } from '@/types/visual-slide';
import { Novel } from '@/types/novel';
import Icon from '@/components/ui/icon';

interface SlideTimelineProps {
  episode: VisualEpisode | undefined;
  novel: Novel;
  selectedSlideId: string;
  onSelectSlide: (id: string) => void;
}

export default function SlideTimeline({
  episode,
  novel,
  selectedSlideId,
  onSelectSlide
}: SlideTimelineProps) {
  if (!episode) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p className="text-sm">Выберите эпизод</p>
      </div>
    );
  }

  const textEpisode = novel.episodes.find(ep => ep.id === episode.episodeId);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Film" size={16} />
        <h3 className="font-semibold text-sm">
          {textEpisode?.title || 'Эпизод'}
        </h3>
        <span className="text-xs text-muted-foreground">
          {episode.slides.length} слайдов
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {episode.slides.map((slide, index) => {
          const paragraph = textEpisode?.paragraphs.find(p => p.id === slide.paragraphId);

          return (
            <div
              key={slide.id}
              className={`
                flex-shrink-0 w-32 h-24 rounded-lg cursor-pointer transition-all
                border-2
                ${selectedSlideId === slide.id
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-border hover:border-primary/50'
                }
              `}
              onClick={() => onSelectSlide(slide.id)}
              style={{
                backgroundColor: slide.backgroundColor,
                backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="w-full h-full p-2 bg-black/40 rounded-lg flex flex-col justify-between">
                <div className="text-xs font-medium text-white">
                  #{index + 1}
                </div>
                {paragraph && (
                  <div className="text-xs text-white/90 truncate">
                    {paragraph.type === 'text' && paragraph.content.slice(0, 20)}
                    {paragraph.type === 'dialogue' && paragraph.characterName}
                    {paragraph.type === 'choice' && '🔀 Выбор'}
                    {paragraph.type === 'item' && '📦 ' + paragraph.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
