import { Novel, ShapeTransitionType } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BackgroundImagesEditorProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

const shapeTypes: { value: ShapeTransitionType; label: string }[] = [
  { value: 'wave', label: 'Волна' },
  { value: 'diagonal', label: 'Диагональ' },
  { value: 'organic', label: 'Органика' },
  { value: 'curved', label: 'Изгибы' },
  { value: 'liquid', label: 'Жидкость' },
  { value: 'triangle', label: 'Треугольники' },
  { value: 'hexagon', label: 'Шестиугольники' },
  { value: 'arc', label: 'Дуга' },
  { value: 'stairs', label: 'Ступеньки' },
  { value: 'zigzag', label: 'Зигзаг' },
  { value: 'rounded', label: 'Округлая' },
  { value: 'sharp', label: 'Острая' },
  { value: 'double-wave', label: 'Двойная волна' }
];

function BackgroundImagesEditor({ novel, onUpdate }: BackgroundImagesEditorProps) {
  const updateBackgroundImage = (page: 'episodes' | 'profile' | 'settings', url: string) => {
    onUpdate({
      ...novel,
      backgroundImages: {
        ...novel.backgroundImages,
        [page]: url
      }
    });
  };

  const updateShapeTransition = (page: 'episodes' | 'profile' | 'settings' | 'home', shape: ShapeTransitionType) => {
    const key = `${page}ShapeTransition` as 'episodesShapeTransition' | 'profileShapeTransition' | 'settingsShapeTransition' | 'homeShapeTransition';
    onUpdate({
      ...novel,
      [key]: shape
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Главная страница</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Фоновое изображение</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={novel.homePage?.greetingImage || ''}
              onChange={(e) => onUpdate({
                ...novel,
                homePage: { ...novel.homePage!, greetingImage: e.target.value }
              })}
              className="text-foreground mt-1"
            />
            {novel.homePage?.greetingImage && (
              <img src={novel.homePage.greetingImage} alt="Home background" className="w-full max-w-xs rounded mt-2" />
            )}
          </div>
          <div>
            <Label>Фигурный переход</Label>
            <Select
              value={novel.homeShapeTransition || 'rounded'}
              onValueChange={(value: ShapeTransitionType) => updateShapeTransition('home', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите форму" />
              </SelectTrigger>
              <SelectContent>
                {shapeTypes.map((shape) => (
                  <SelectItem key={shape.value} value={shape.value}>
                    {shape.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Страница эпизодов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Фоновое изображение</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={novel.backgroundImages?.episodes || ''}
              onChange={(e) => updateBackgroundImage('episodes', e.target.value)}
              className="text-foreground mt-1"
            />
            {novel.backgroundImages?.episodes && (
              <img src={novel.backgroundImages.episodes} alt="Episodes background" className="w-full max-w-xs rounded mt-2" />
            )}
          </div>
          <div>
            <Label>Фигурный переход</Label>
            <Select
              value={novel.episodesShapeTransition || 'triangle'}
              onValueChange={(value: ShapeTransitionType) => updateShapeTransition('episodes', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите форму" />
              </SelectTrigger>
              <SelectContent>
                {shapeTypes.map((shape) => (
                  <SelectItem key={shape.value} value={shape.value}>
                    {shape.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Страница профиля</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Фоновое изображение</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={novel.backgroundImages?.profile || ''}
              onChange={(e) => updateBackgroundImage('profile', e.target.value)}
              className="text-foreground mt-1"
            />
            {novel.backgroundImages?.profile && (
              <img src={novel.backgroundImages.profile} alt="Profile background" className="w-full max-w-xs rounded mt-2" />
            )}
          </div>
          <div>
            <Label>Фигурный переход</Label>
            <Select
              value={novel.profileShapeTransition || 'hexagon'}
              onValueChange={(value: ShapeTransitionType) => updateShapeTransition('profile', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите форму" />
              </SelectTrigger>
              <SelectContent>
                {shapeTypes.map((shape) => (
                  <SelectItem key={shape.value} value={shape.value}>
                    {shape.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Страница настроек</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Фоновое изображение</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={novel.backgroundImages?.settings || ''}
              onChange={(e) => updateBackgroundImage('settings', e.target.value)}
              className="text-foreground mt-1"
            />
            {novel.backgroundImages?.settings && (
              <img src={novel.backgroundImages.settings} alt="Settings background" className="w-full max-w-xs rounded mt-2" />
            )}
          </div>
          <div>
            <Label>Фигурный переход</Label>
            <Select
              value={novel.settingsShapeTransition || 'arc'}
              onValueChange={(value: ShapeTransitionType) => updateShapeTransition('settings', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Выберите форму" />
              </SelectTrigger>
              <SelectContent>
                {shapeTypes.map((shape) => (
                  <SelectItem key={shape.value} value={shape.value}>
                    {shape.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BackgroundImagesEditor;