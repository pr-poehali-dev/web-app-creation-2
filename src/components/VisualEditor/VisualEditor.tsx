import { useState, useEffect } from 'react';
import { Novel } from '@/types/novel';
import { VisualStory, VisualEpisode, VisualSlide, SlideObject } from '@/types/visual-slide';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SlideCanvas from './SlideCanvas';
import SlideTimeline from './SlideTimeline';
import ObjectsPanel from './ObjectsPanel';
import PropertiesPanel from './PropertiesPanel';

interface VisualEditorProps {
  novel: Novel;
  visualStory: VisualStory | null;
  onUpdate: (visualStory: VisualStory) => void;
  onClose: () => void;
  onBackToText: () => void;
}

export default function VisualEditor({
  novel,
  visualStory: initialVisualStory,
  onUpdate,
  onClose,
  onBackToText
}: VisualEditorProps) {
  const [visualStory, setVisualStory] = useState<VisualStory>(() => {
    if (initialVisualStory) return initialVisualStory;

    const episodes: VisualEpisode[] = novel.episodes.map(episode => ({
      id: `visual-${episode.id}`,
      episodeId: episode.id,
      slides: episode.paragraphs.map(paragraph => ({
        id: `slide-${paragraph.id}`,
        paragraphId: paragraph.id,
        backgroundColor: '#ffffff',
        objects: []
      }))
    }));

    return {
      id: `visual-story-${Date.now()}`,
      novelId: novel.id || '',
      episodes,
      version: 1
    };
  });

  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(
    visualStory.episodes[0]?.id || ''
  );
  const [selectedSlideId, setSelectedSlideId] = useState<string>('');
  const [selectedObjectId, setSelectedObjectId] = useState<string>('');
  const [zoom, setZoom] = useState(1);

  const currentEpisode = visualStory.episodes.find(ep => ep.id === selectedEpisodeId);
  const currentSlide = currentEpisode?.slides.find(s => s.id === selectedSlideId);
  const selectedObject = currentSlide?.objects.find(obj => obj.id === selectedObjectId);

  useEffect(() => {
    if (currentEpisode && !selectedSlideId && currentEpisode.slides.length > 0) {
      setSelectedSlideId(currentEpisode.slides[0].id);
    }
  }, [currentEpisode, selectedSlideId]);

  const updateSlide = (updates: Partial<VisualSlide>) => {
    if (!currentEpisode || !currentSlide) return;

    const updatedEpisode: VisualEpisode = {
      ...currentEpisode,
      slides: currentEpisode.slides.map(s =>
        s.id === currentSlide.id ? { ...s, ...updates } : s
      )
    };

    const updatedStory: VisualStory = {
      ...visualStory,
      episodes: visualStory.episodes.map(ep =>
        ep.id === selectedEpisodeId ? updatedEpisode : ep
      ),
      version: visualStory.version + 1
    };

    setVisualStory(updatedStory);
    onUpdate(updatedStory);
  };

  const addObject = (object: SlideObject) => {
    if (!currentSlide) return;

    updateSlide({
      objects: [...currentSlide.objects, object]
    });

    setSelectedObjectId(object.id);
  };

  const updateObject = (objectId: string, updates: Partial<SlideObject>) => {
    if (!currentSlide) return;

    updateSlide({
      objects: currentSlide.objects.map(obj =>
        obj.id === objectId ? { ...obj, ...updates } : obj
      )
    });
  };

  const deleteObject = (objectId: string) => {
    if (!currentSlide) return;

    updateSlide({
      objects: currentSlide.objects.filter(obj => obj.id !== objectId)
    });

    if (selectedObjectId === objectId) {
      setSelectedObjectId('');
    }
  };

  const duplicateObject = (objectId: string) => {
    if (!currentSlide) return;

    const objectToDuplicate = currentSlide.objects.find(obj => obj.id === objectId);
    if (!objectToDuplicate) return;

    const newObject: SlideObject = {
      ...objectToDuplicate,
      id: `object-${Date.now()}`,
      position: {
        x: objectToDuplicate.position.x + 20,
        y: objectToDuplicate.position.y + 20
      }
    };

    addObject(newObject);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Хедер */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-semibold">Визуальный редактор</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                disabled={zoom <= 0.25}
              >
                <Icon name="ZoomOut" size={14} />
              </Button>
              <span className="text-sm font-medium min-w-[4ch] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                disabled={zoom >= 2}
              >
                <Icon name="ZoomIn" size={14} />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onBackToText}
            >
              <Icon name="FileText" size={16} className="mr-2" />
              Текстовый редактор
            </Button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex overflow-hidden">
        {/* Левая панель - Объекты */}
        <div className="w-64 border-r bg-muted/30 flex flex-col">
          <ObjectsPanel onAddObject={addObject} />
        </div>

        {/* Центральная область - Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden bg-muted/50">
            {currentSlide ? (
              <SlideCanvas
                slide={currentSlide}
                selectedObjectId={selectedObjectId}
                zoom={zoom}
                onSelectObject={setSelectedObjectId}
                onUpdateObject={updateObject}
                onDeleteObject={deleteObject}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <Icon name="Image" size={48} className="mx-auto opacity-20" />
                  <p className="text-sm">Выберите слайд для редактирования</p>
                </div>
              </div>
            )}
          </div>

          {/* Timeline слайдов */}
          <div className="border-t bg-card">
            <SlideTimeline
              episode={currentEpisode}
              novel={novel}
              selectedSlideId={selectedSlideId}
              onSelectSlide={setSelectedSlideId}
            />
          </div>
        </div>

        {/* Правая панель - Свойства */}
        <div className="w-80 border-l bg-card overflow-y-auto">
          <PropertiesPanel
            slide={currentSlide}
            selectedObject={selectedObject}
            onUpdateSlide={updateSlide}
            onUpdateObject={(updates) => {
              if (selectedObject) {
                updateObject(selectedObject.id, updates);
              }
            }}
            onDuplicateObject={() => {
              if (selectedObject) {
                duplicateObject(selectedObject.id);
              }
            }}
            onDeleteObject={() => {
              if (selectedObject) {
                deleteObject(selectedObject.id);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
