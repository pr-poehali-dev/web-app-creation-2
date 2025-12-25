import { VisualSlide, SlideObject, ImageObject, TextObject, ShapeObject } from '@/types/visual-slide';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface PropertiesPanelProps {
  slide: VisualSlide | undefined;
  selectedObject: SlideObject | undefined;
  onUpdateSlide: (updates: Partial<VisualSlide>) => void;
  onUpdateObject: (updates: Partial<SlideObject>) => void;
  onDuplicateObject: () => void;
  onDeleteObject: () => void;
}

export default function PropertiesPanel({
  slide,
  selectedObject,
  onUpdateSlide,
  onUpdateObject,
  onDuplicateObject,
  onDeleteObject
}: PropertiesPanelProps) {
  if (!slide) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Icon name="Settings" size={32} className="mx-auto opacity-20 mb-2" />
        <p className="text-sm">Выберите слайд</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Tabs defaultValue={selectedObject ? 'object' : 'slide'}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="slide">Слайд</TabsTrigger>
          <TabsTrigger value="object" disabled={!selectedObject}>
            Объект
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slide" className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">Цвет фона</Label>
            <Input
              type="color"
              value={slide.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdateSlide({ backgroundColor: e.target.value })}
              className="mt-2 h-10"
            />
          </div>

          <div>
            <Label className="text-xs">Фоновое изображение (URL)</Label>
            <Input
              value={slide.backgroundImage || ''}
              onChange={(e) => onUpdateSlide({ backgroundImage: e.target.value })}
              placeholder="https://..."
              className="mt-2"
            />
          </div>
        </TabsContent>

        <TabsContent value="object" className="space-y-4 mt-4">
          {selectedObject && (
            <>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDuplicateObject}
                  className="flex-1"
                >
                  <Icon name="Copy" size={14} className="mr-2" />
                  Дублировать
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onDeleteObject}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>

              <CommonProperties object={selectedObject} onUpdate={onUpdateObject} />

              {selectedObject.type === 'image' && (
                <ImageProperties object={selectedObject as ImageObject} onUpdate={onUpdateObject} />
              )}

              {selectedObject.type === 'text' && (
                <TextProperties object={selectedObject as TextObject} onUpdate={onUpdateObject} />
              )}

              {selectedObject.type === 'shape' && (
                <ShapeProperties object={selectedObject as ShapeObject} onUpdate={onUpdateObject} />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CommonProperties({
  object,
  onUpdate
}: {
  object: SlideObject;
  onUpdate: (updates: Partial<SlideObject>) => void;
}) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">X</Label>
          <Input
            type="number"
            value={Math.round(object.position.x)}
            onChange={(e) => onUpdate({ position: { ...object.position, x: Number(e.target.value) } })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Y</Label>
          <Input
            type="number"
            value={Math.round(object.position.y)}
            onChange={(e) => onUpdate({ position: { ...object.position, y: Number(e.target.value) } })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Ширина</Label>
          <Input
            type="number"
            value={Math.round(object.size.width)}
            onChange={(e) => onUpdate({ size: { ...object.size, width: Number(e.target.value) } })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Высота</Label>
          <Input
            type="number"
            value={Math.round(object.size.height)}
            onChange={(e) => onUpdate({ size: { ...object.size, height: Number(e.target.value) } })}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Поворот: {object.transform.rotation}°</Label>
        <Slider
          value={[object.transform.rotation]}
          onValueChange={([value]) => onUpdate({ transform: { ...object.transform, rotation: value } })}
          min={0}
          max={360}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs">Прозрачность: {Math.round(object.transform.opacity * 100)}%</Label>
        <Slider
          value={[object.transform.opacity * 100]}
          onValueChange={([value]) => onUpdate({ transform: { ...object.transform, opacity: value / 100 } })}
          min={0}
          max={100}
          step={1}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function ImageProperties({
  object,
  onUpdate
}: {
  object: ImageObject;
  onUpdate: (updates: Partial<SlideObject>) => void;
}) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div>
        <Label className="text-xs">URL изображения</Label>
        <Input
          value={object.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="https://..."
          className="mt-2"
        />
      </div>
    </div>
  );
}

function TextProperties({
  object,
  onUpdate
}: {
  object: TextObject;
  onUpdate: (updates: Partial<SlideObject>) => void;
}) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div>
        <Label className="text-xs">Текст</Label>
        <Textarea
          value={object.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          rows={3}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs">Размер: {object.fontSize}px</Label>
        <Slider
          value={[object.fontSize]}
          onValueChange={([value]) => onUpdate({ fontSize: value })}
          min={12}
          max={120}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs">Цвет текста</Label>
        <Input
          type="color"
          value={object.color}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function ShapeProperties({
  object,
  onUpdate
}: {
  object: ShapeObject;
  onUpdate: (updates: Partial<SlideObject>) => void;
}) {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div>
        <Label className="text-xs">Цвет заливки</Label>
        <Input
          type="color"
          value={object.fillColor || '#3b82f6'}
          onChange={(e) => onUpdate({ fillColor: e.target.value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs">Цвет обводки</Label>
        <Input
          type="color"
          value={object.strokeColor || '#1e40af'}
          onChange={(e) => onUpdate({ strokeColor: e.target.value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-xs">Толщина обводки: {object.strokeWidth}px</Label>
        <Slider
          value={[object.strokeWidth || 0]}
          onValueChange={([value]) => onUpdate({ strokeWidth: value })}
          min={0}
          max={20}
          step={1}
          className="mt-2"
        />
      </div>
    </div>
  );
}
