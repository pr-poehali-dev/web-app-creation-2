import { Layer } from '@/types/scene';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string) => void;
  onUpdateLayer: (layerId: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (layerId: string) => void;
}

export default function LayersPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer
}: LayersPanelProps) {
  const sortedLayers = [...layers].sort((a, b) => b.order - a.order);

  const moveLayer = (layerId: string, direction: 'up' | 'down') => {
    const currentIndex = layers.findIndex(l => l.id === layerId);
    const targetIndex = direction === 'up' ? currentIndex + 1 : currentIndex - 1;
    
    if (targetIndex < 0 || targetIndex >= layers.length) return;

    const currentLayer = layers[currentIndex];
    const targetLayer = layers[targetIndex];

    onUpdateLayer(currentLayer.id, { order: targetLayer.order });
    onUpdateLayer(targetLayer.id, { order: currentLayer.order });
  };

  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'text': return 'Type';
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'shape': return 'Square';
      case 'background': return 'ImagePlus';
      case 'sprite': return 'Sparkles';
      default: return 'FileQuestion';
    }
  };

  return (
    <div className="w-64 border-r flex flex-col">
      <div className="h-12 border-b flex items-center justify-between px-4">
        <span className="text-sm font-semibold">Слои</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedLayers.map((layer) => (
            <div
              key={layer.id}
              className={cn(
                'group rounded-lg p-2 cursor-pointer hover:bg-accent transition-colors',
                selectedLayerId === layer.id && 'bg-accent'
              )}
              onClick={() => onSelectLayer(layer.id)}
            >
              <div className="flex items-center gap-2">
                <Icon name={getLayerIcon(layer.type)} size={16} />
                <span className="text-sm flex-1 truncate">{layer.name}</span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateLayer(layer.id, { visible: !layer.visible });
                    }}
                  >
                    <Icon name={layer.visible ? 'Eye' : 'EyeOff'} size={14} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateLayer(layer.id, { locked: !layer.locked });
                    }}
                  >
                    <Icon name={layer.locked ? 'Lock' : 'Unlock'} size={14} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(layer.id, 'up');
                    }}
                  >
                    <Icon name="ArrowUp" size={14} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(layer.id, 'down');
                    }}
                  >
                    <Icon name="ArrowDown" size={14} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLayer(layer.id);
                    }}
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
