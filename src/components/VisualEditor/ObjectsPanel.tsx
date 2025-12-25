import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { SlideObject, ImageObject, TextObject, ShapeObject, ShapeType } from '@/types/visual-slide';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ObjectsPanelProps {
  onAddObject: (object: SlideObject) => void;
}

export default function ObjectsPanel({ onAddObject }: ObjectsPanelProps) {
  const addImage = () => {
    const newImage: ImageObject = {
      id: `img-${Date.now()}`,
      type: 'image',
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
      transform: { rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 },
      zIndex: Date.now(),
      url: 'https://via.placeholder.com/400x300',
      objectFit: 'cover'
    };

    onAddObject(newImage);
  };

  const addText = () => {
    const newText: TextObject = {
      id: `text-${Date.now()}`,
      type: 'text',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 100 },
      transform: { rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 },
      zIndex: Date.now(),
      content: 'Новый текст',
      fontSize: 24,
      color: '#000000',
      textAlign: 'left'
    };

    onAddObject(newText);
  };

  const addShape = (shapeType: ShapeType) => {
    const newShape: ShapeObject = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 200 },
      transform: { rotation: 0, scaleX: 1, scaleY: 1, opacity: 1 },
      zIndex: Date.now(),
      shapeType,
      fillColor: '#3b82f6',
      strokeColor: '#1e40af',
      strokeWidth: 2
    };

    onAddObject(newShape);
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-sm">Объекты</h3>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Основные</TabsTrigger>
          <TabsTrigger value="shapes">Фигуры</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-2 mt-4">
          <Button
            onClick={addImage}
            className="w-full justify-start"
            variant="outline"
          >
            <Icon name="Image" size={16} className="mr-2" />
            Изображение
          </Button>

          <Button
            onClick={addText}
            className="w-full justify-start"
            variant="outline"
          >
            <Icon name="Type" size={16} className="mr-2" />
            Текст
          </Button>
        </TabsContent>

        <TabsContent value="shapes" className="space-y-2 mt-4">
          <Button
            onClick={() => addShape('rectangle')}
            className="w-full justify-start"
            variant="outline"
          >
            <Icon name="Square" size={16} className="mr-2" />
            Прямоугольник
          </Button>

          <Button
            onClick={() => addShape('circle')}
            className="w-full justify-start"
            variant="outline"
          >
            <Icon name="Circle" size={16} className="mr-2" />
            Круг
          </Button>

          <Button
            onClick={() => addShape('triangle')}
            className="w-full justify-start"
            variant="outline"
          >
            <Icon name="Triangle" size={16} className="mr-2" />
            Треугольник
          </Button>

          <Button
            onClick={() => addShape('star')}
            className="w-full justify-start"
            variant="outline"
          >
            <Icon name="Star" size={16} className="mr-2" />
            Звезда
          </Button>
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t">
        <h4 className="font-semibold text-sm mb-3">Шаблоны</h4>
        <div className="space-y-2">
          <Button
            className="w-full justify-start"
            variant="outline"
            size="sm"
            disabled
          >
            <Icon name="Quote" size={14} className="mr-2" />
            Цитата
          </Button>
          <Button
            className="w-full justify-start"
            variant="outline"
            size="sm"
            disabled
          >
            <Icon name="TrendingUp" size={14} className="mr-2" />
            Статистика
          </Button>
          <Button
            className="w-full justify-start"
            variant="outline"
            size="sm"
            disabled
          >
            <Icon name="CreditCard" size={14} className="mr-2" />
            Карточка
          </Button>
        </div>
      </div>
    </div>
  );
}
