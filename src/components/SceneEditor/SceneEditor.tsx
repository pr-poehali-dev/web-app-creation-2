import { useState, useRef, useEffect } from 'react';
import { Scene, Layer, Animation, SceneProject } from '@/types/scene';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LayersPanel from './LayersPanel';
import Timeline from './Timeline';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';

interface SceneEditorProps {
  project: SceneProject;
  onSave: (project: SceneProject) => void;
  onClose: () => void;
}

export default function SceneEditor({ project, onSave, onClose }: SceneEditorProps) {
  const [currentScene, setCurrentScene] = useState<Scene>(
    project.scenes.find(s => s.id === project.currentSceneId) || project.scenes[0]
  );
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 0.016;
        if (next >= currentScene.duration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, currentScene.duration]);

  const updateScene = (updates: Partial<Scene>) => {
    const updatedScene = { ...currentScene, ...updates };
    setCurrentScene(updatedScene);
    
    const updatedProject = {
      ...project,
      scenes: project.scenes.map(s => s.id === currentScene.id ? updatedScene : s)
    };
    onSave(updatedProject);
  };

  const addLayer = (type: Layer['type']) => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `${type} ${currentScene.layers.length + 1}`,
      type,
      order: currentScene.layers.length,
      visible: true,
      locked: false,
      x: project.settings.width / 2 - 100,
      y: project.settings.height / 2 - 100,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 1,
      scale: 1,
      ...(type === 'text' && {
        textContent: 'Новый текст',
        fontSize: 24,
        fontFamily: project.settings.defaultFontFamily,
        color: '#ffffff',
        textAlign: 'center'
      }),
      ...(type === 'shape' && {
        backgroundColor: '#3b82f6'
      })
    };

    updateScene({
      layers: [...currentScene.layers, newLayer]
    });
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (layerId: string, updates: Partial<Layer>) => {
    updateScene({
      layers: currentScene.layers.map(l => 
        l.id === layerId ? { ...l, ...updates } : l
      )
    });
  };

  const deleteLayer = (layerId: string) => {
    updateScene({
      layers: currentScene.layers.filter(l => l.id !== layerId)
    });
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
  };

  const addAnimation = (layerId: string) => {
    const newAnimation: Animation = {
      id: `anim-${Date.now()}`,
      layerId,
      name: `Animation ${currentScene.animations.length + 1}`,
      keyframes: [],
      duration: 1,
      trigger: 'onLoad'
    };

    updateScene({
      animations: [...currentScene.animations, newAnimation]
    });
  };

  const selectedLayer = currentScene.layers.find(l => l.id === selectedLayerId);

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      <div className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{project.name}</h1>
            <p className="text-xs text-muted-foreground">{currentScene.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={currentScene.id}
            onValueChange={(id) => {
              const scene = project.scenes.find(s => s.id === id);
              if (scene) setCurrentScene(scene);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {project.scenes.map(scene => (
                <SelectItem key={scene.id} value={scene.id}>
                  {scene.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
          </Button>

          <div className="flex items-center gap-2">
            <Icon name="ZoomOut" size={16} />
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={0.25}
              max={2}
              step={0.25}
              className="w-24"
            />
            <Icon name="ZoomIn" size={16} />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <Button onClick={() => onSave(project)}>
            Сохранить
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-16 border-r flex flex-col items-center py-4 gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addLayer('text')}
            title="Добавить текст"
          >
            <Icon name="Type" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addLayer('image')}
            title="Добавить изображение"
          >
            <Icon name="Image" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addLayer('video')}
            title="Добавить видео"
          >
            <Icon name="Video" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addLayer('shape')}
            title="Добавить фигуру"
          >
            <Icon name="Square" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addLayer('background')}
            title="Добавить фон"
          >
            <Icon name="ImagePlus" size={20} />
          </Button>
        </div>

        <LayersPanel
          layers={currentScene.layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onUpdateLayer={updateLayer}
          onDeleteLayer={deleteLayer}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto bg-[#0a0f14] p-8">
            <Canvas
              scene={currentScene}
              selectedLayerId={selectedLayerId}
              onSelectLayer={setSelectedLayerId}
              onUpdateLayer={updateLayer}
              zoom={zoom}
              currentTime={currentTime}
              width={project.settings.width}
              height={project.settings.height}
            />
          </div>

          <Timeline
            scene={currentScene}
            currentTime={currentTime}
            duration={currentScene.duration}
            onTimeChange={setCurrentTime}
            selectedLayerId={selectedLayerId}
            onAddAnimation={addAnimation}
            onUpdateAnimation={(animId, updates) => {
              updateScene({
                animations: currentScene.animations.map(a =>
                  a.id === animId ? { ...a, ...updates } : a
                )
              });
            }}
          />
        </div>

        {selectedLayer && (
          <PropertiesPanel
            layer={selectedLayer}
            onUpdate={(updates) => updateLayer(selectedLayer.id, updates)}
            animations={currentScene.animations.filter(a => a.layerId === selectedLayer.id)}
          />
        )}
      </div>
    </div>
  );
}
