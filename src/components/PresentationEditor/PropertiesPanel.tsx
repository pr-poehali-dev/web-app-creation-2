import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePresentationStore } from '@/store/presentationStore';
import type { TextObject, ShapeObject, ImageObject } from '@/types/presentation';

export function PropertiesPanel() {
  const selectedObjectIds = usePresentationStore(s => s.selectedObjectIds);
  const currentSlide = usePresentationStore(s => 
    s.presentation.slides[s.currentSlideIndex]
  );
  const updateObject = usePresentationStore(s => s.updateObject);
  const moveObject = usePresentationStore(s => s.moveObject);

  const selectedObjects = currentSlide?.objects.filter(obj =>
    selectedObjectIds.includes(obj.id)
  ) || [];

  const selectedObject = selectedObjects[0];

  if (!selectedObject) {
    return (
      <div className="w-80 border-l bg-background p-4">
        <p className="text-sm text-muted-foreground">
          Выберите объект для редактирования
        </p>
      </div>
    );
  }

  const handleTransformChange = (key: string, value: number) => {
    updateObject(selectedObject.id, {
      transform: {
        ...selectedObject.transform,
        [key]: value
      }
    });
  };

  const handleOpacityChange = (value: number[]) => {
    updateObject(selectedObject.id, { opacity: value[0] });
  };

  const handleLockToggle = () => {
    updateObject(selectedObject.id, { locked: !selectedObject.locked });
  };

  const handleVisibilityToggle = () => {
    updateObject(selectedObject.id, { hidden: !selectedObject.hidden });
  };

  const renderTextProperties = (obj: TextObject) => {
    return (
      <div className="space-y-4">
        <div>
          <Label>Текст</Label>
          <Input
            value={obj.content}
            onChange={(e) => updateObject(obj.id, { content: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Шрифт</Label>
          <Select
            value={obj.style.fontFamily}
            onValueChange={(value) => updateObject(obj.id, {
              style: { ...obj.style, fontFamily: value }
            })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Courier New">Courier New</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Размер шрифта</Label>
          <Input
            type="number"
            value={obj.style.fontSize}
            onChange={(e) => updateObject(obj.id, {
              style: { ...obj.style, fontSize: Number(e.target.value) }
            })}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Цвет</Label>
          <Input
            type="color"
            value={obj.style.color}
            onChange={(e) => updateObject(obj.id, {
              style: { ...obj.style, color: e.target.value }
            })}
            className="mt-1 h-10"
          />
        </div>

        <div>
          <Label>Выравнивание</Label>
          <Select
            value={obj.style.textAlign}
            onValueChange={(value: 'left' | 'center' | 'right' | 'justify') => 
              updateObject(obj.id, {
                style: { ...obj.style, textAlign: value }
              })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Слева</SelectItem>
              <SelectItem value="center">По центру</SelectItem>
              <SelectItem value="right">Справа</SelectItem>
              <SelectItem value="justify">По ширине</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderShapeProperties = (obj: ShapeObject) => {
    return (
      <div className="space-y-4">
        <div>
          <Label>Заливка</Label>
          <Input
            type="color"
            value={obj.style.fill}
            onChange={(e) => updateObject(obj.id, {
              style: { ...obj.style, fill: e.target.value }
            })}
            className="mt-1 h-10"
          />
        </div>

        <div>
          <Label>Обводка</Label>
          <Input
            type="color"
            value={obj.style.stroke}
            onChange={(e) => updateObject(obj.id, {
              style: { ...obj.style, stroke: e.target.value }
            })}
            className="mt-1 h-10"
          />
        </div>

        <div>
          <Label>Толщина обводки</Label>
          <Input
            type="number"
            value={obj.style.strokeWidth}
            onChange={(e) => updateObject(obj.id, {
              style: { ...obj.style, strokeWidth: Number(e.target.value) }
            })}
            className="mt-1"
          />
        </div>
      </div>
    );
  };

  const renderImageProperties = (obj: ImageObject) => {
    return (
      <div className="space-y-4">
        <div>
          <Label>URL изображения</Label>
          <Input
            value={obj.url}
            onChange={(e) => updateObject(obj.id, { url: e.target.value })}
            className="mt-1"
          />
        </div>

        {obj.filters && (
          <>
            <div>
              <Label>Яркость: {obj.filters.brightness}%</Label>
              <Slider
                value={[obj.filters.brightness]}
                onValueChange={(value) => updateObject(obj.id, {
                  filters: { ...obj.filters, brightness: value[0] }
                })}
                min={0}
                max={200}
                step={1}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Контраст: {obj.filters.contrast}%</Label>
              <Slider
                value={[obj.filters.contrast]}
                onValueChange={(value) => updateObject(obj.id, {
                  filters: { ...obj.filters, contrast: value[0] }
                })}
                min={0}
                max={200}
                step={1}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Насыщенность: {obj.filters.saturation}%</Label>
              <Slider
                value={[obj.filters.saturation]}
                onValueChange={(value) => updateObject(obj.id, {
                  filters: { ...obj.filters, saturation: value[0] }
                })}
                min={0}
                max={200}
                step={1}
                className="mt-1"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 border-l bg-background overflow-auto">
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="properties" className="flex-1">Свойства</TabsTrigger>
          <TabsTrigger value="position" className="flex-1">Позиция</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="p-4 space-y-4">
          <div>
            <Label>Имя</Label>
            <Input
              value={selectedObject.name}
              onChange={(e) => updateObject(selectedObject.id, { name: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Прозрачность: {Math.round(selectedObject.opacity * 100)}%</Label>
            <Slider
              value={[selectedObject.opacity]}
              onValueChange={handleOpacityChange}
              min={0}
              max={1}
              step={0.01}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={selectedObject.locked ? 'default' : 'outline'}
              size="sm"
              onClick={handleLockToggle}
              className="flex-1"
            >
              {selectedObject.locked ? 'Разблокировать' : 'Заблокировать'}
            </Button>
            <Button
              variant={selectedObject.hidden ? 'default' : 'outline'}
              size="sm"
              onClick={handleVisibilityToggle}
              className="flex-1"
            >
              {selectedObject.hidden ? 'Показать' : 'Скрыть'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveObject(selectedObject.id, -1)}
              className="flex-1"
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => moveObject(selectedObject.id, 1)}
              className="flex-1"
            >
              Вперёд
            </Button>
          </div>

          {selectedObject.type === 'text' && renderTextProperties(selectedObject)}
          {selectedObject.type === 'shape' && renderShapeProperties(selectedObject)}
          {selectedObject.type === 'image' && renderImageProperties(selectedObject)}
        </TabsContent>

        <TabsContent value="position" className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>X</Label>
              <Input
                type="number"
                value={Math.round(selectedObject.transform.x)}
                onChange={(e) => handleTransformChange('x', Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Y</Label>
              <Input
                type="number"
                value={Math.round(selectedObject.transform.y)}
                onChange={(e) => handleTransformChange('y', Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ширина</Label>
              <Input
                type="number"
                value={Math.round(selectedObject.transform.width)}
                onChange={(e) => handleTransformChange('width', Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Высота</Label>
              <Input
                type="number"
                value={Math.round(selectedObject.transform.height)}
                onChange={(e) => handleTransformChange('height', Number(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Поворот: {selectedObject.transform.rotation}°</Label>
            <Slider
              value={[selectedObject.transform.rotation]}
              onValueChange={(value) => handleTransformChange('rotation', value[0])}
              min={0}
              max={360}
              step={1}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Scale X: {selectedObject.transform.scaleX.toFixed(2)}</Label>
              <Slider
                value={[selectedObject.transform.scaleX]}
                onValueChange={(value) => handleTransformChange('scaleX', value[0])}
                min={0.1}
                max={3}
                step={0.1}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Scale Y: {selectedObject.transform.scaleY.toFixed(2)}</Label>
              <Slider
                value={[selectedObject.transform.scaleY]}
                onValueChange={(value) => handleTransformChange('scaleY', value[0])}
                min={0.1}
                max={3}
                step={0.1}
                className="mt-1"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
