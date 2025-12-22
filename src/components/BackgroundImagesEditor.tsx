import { Novel } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BackgroundImagesEditorProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

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
        </CardContent>
      </Card>
    </div>
  );
}

export default BackgroundImagesEditor;