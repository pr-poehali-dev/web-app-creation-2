import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { usePresentationStore } from '@/store/presentationStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SlidesPanel() {
  const presentation = usePresentationStore(s => s.presentation);
  const currentSlideIndex = usePresentationStore(s => s.currentSlideIndex);
  const setCurrentSlide = usePresentationStore(s => s.setCurrentSlide);
  const addSlide = usePresentationStore(s => s.addSlide);
  const duplicateSlide = usePresentationStore(s => s.duplicateSlide);
  const deleteSlide = usePresentationStore(s => s.deleteSlide);
  const moveSlide = usePresentationStore(s => s.moveSlide);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      moveSlide(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderLayersView = () => {
    const currentSlide = presentation.slides[currentSlideIndex];
    if (!currentSlide) return null;

    const selectedObjectIds = usePresentationStore.getState().selectedObjectIds;
    const selectObjects = usePresentationStore.getState().selectObjects;
    const updateObject = usePresentationStore.getState().updateObject;
    const deleteObject = usePresentationStore.getState().deleteObject;

    return (
      <div className="p-2 space-y-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Слои ({currentSlide.objects.length})
          </span>
        </div>
        
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-1">
            {[...currentSlide.objects]
              .sort((a, b) => b.zIndex - a.zIndex)
              .map((obj) => {
                const isSelected = selectedObjectIds.includes(obj.id);
                
                return (
                  <div
                    key={obj.id}
                    className={`
                      flex items-center gap-2 p-2 rounded cursor-pointer
                      transition-colors text-sm
                      ${isSelected ? 'bg-primary/10 border border-primary' : 'hover:bg-accent'}
                    `}
                    onClick={() => selectObjects([obj.id])}
                  >
                    <Icon
                      name={
                        obj.type === 'text' ? 'Type' :
                        obj.type === 'shape' ? 'Square' :
                        obj.type === 'image' ? 'Image' :
                        obj.type === 'video' ? 'Video' :
                        'FileQuestion'
                      }
                      size={16}
                      className="flex-shrink-0"
                    />
                    
                    <span className="flex-1 truncate">{obj.name}</span>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateObject(obj.id, { hidden: !obj.hidden });
                        }}
                      >
                        <Icon
                          name={obj.hidden ? 'EyeOff' : 'Eye'}
                          size={14}
                        />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateObject(obj.id, { locked: !obj.locked });
                        }}
                      >
                        <Icon
                          name={obj.locked ? 'Lock' : 'Unlock'}
                          size={14}
                        />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteObject(obj.id);
                        }}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderSlidesView = () => {
    return (
      <div className="p-2 space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => addSlide()}
          className="w-full"
        >
          <Icon name="Plus" size={16} className="mr-1" />
          Добавить слайд
        </Button>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {presentation.slides.map((slide, index) => (
              <div
                key={slide.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  relative group cursor-pointer rounded border-2 transition-all
                  ${currentSlideIndex === index 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
                onClick={() => setCurrentSlide(index)}
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold text-muted-foreground/20">
                      {index + 1}
                    </span>
                  </div>
                  
                  <div className="absolute top-1 left-1 bg-background/80 px-2 py-0.5 rounded text-xs">
                    {slide.objects.length} объектов
                  </div>
                </div>

                <div className="p-2">
                  <p className="text-xs truncate font-medium">{slide.name}</p>
                </div>

                <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(index);
                    }}
                  >
                    <Icon name="Copy" size={12} />
                  </Button>
                  
                  {presentation.slides.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                    >
                      <Icon name="Trash2" size={12} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="w-64 border-r bg-background">
      <Tabs defaultValue="slides" className="w-full">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="slides" className="flex-1">Слайды</TabsTrigger>
          <TabsTrigger value="layers" className="flex-1">Слои</TabsTrigger>
        </TabsList>

        <TabsContent value="slides" className="m-0">
          {renderSlidesView()}
        </TabsContent>

        <TabsContent value="layers" className="m-0">
          {renderLayersView()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
