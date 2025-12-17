import { UserSettings } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Novel } from '@/types/novel';

interface SettingsPanelProps {
  settings: UserSettings;
  novel: Novel;
  onUpdate: (settings: UserSettings) => void;
  onBack: () => void;
}

function SettingsPanel({ settings, novel, onUpdate, onBack }: SettingsPanelProps) {
  const handleTextSpeedChange = (value: number[]) => {
    onUpdate({ ...settings, textSpeed: value[0] });
  };

  const handleMusicVolumeChange = (value: number[]) => {
    onUpdate({ ...settings, musicVolume: value[0] });
  };

  const handleSoundEffectsToggle = (checked: boolean) => {
    onUpdate({ ...settings, soundEffects: checked });
  };

  const handleAutoPlayToggle = (checked: boolean) => {
    onUpdate({ ...settings, autoPlay: checked });
  };

  const handleTextSizeChange = (value: string) => {
    onUpdate({ ...settings, textSize: value as 'small' | 'medium' | 'large' });
  };

  const handleResetSettings = () => {
    if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
      onUpdate({
        textSpeed: 50,
        musicVolume: 70,
        soundEffects: true,
        autoPlay: false,
        textSize: 'medium',
        theme: 'dark',
        fontFamily: 'merriweather',
        uiFontFamily: 'system'
      });
    }
  };

  const textSpeedLabel = settings.textSpeed < 30 ? 'Медленно' : 
                         settings.textSpeed < 70 ? 'Средне' : 'Быстро';

  return (
    <div className="min-h-screen dark flex">
      {/* Левая часть - фоновое изображение */}
      <div 
        className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        style={{
          backgroundImage: novel.backgroundImages?.settings 
            ? `url(${novel.backgroundImages.settings})` 
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
        
        {/* Плавный градиент */}
        <div className="absolute top-0 right-0 h-full w-64 pointer-events-none z-20">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#151d28]/50 to-[#151d28]" />
        </div>
      </div>

      {/* Правая часть - контент настроек */}
      <div className="w-full lg:w-1/2 p-4 overflow-y-auto dark relative" style={{ backgroundColor: '#151d28' }}>
      {/* Декоративные элементы */}
      <div className="absolute top-24 right-16 w-32 h-32 bg-primary/20 blur-3xl" />
      <svg className="absolute top-10 left-16 w-18 h-18 text-primary/30" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="50" r="30" fill="currentColor" opacity="0.3" />
      </svg>
      <div className="absolute bottom-40 left-10 w-28 h-28 bg-accent/15 blur-2xl" />
      <svg className="absolute bottom-16 right-20 w-16 h-16 text-accent/25" viewBox="0 0 100 100">
        <rect x="10" y="10" width="80" height="80" rx="10" fill="currentColor" />
      </svg>
      
      <div className="container mx-auto max-w-3xl relative z-10">
        <header className="mb-8 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-white">Настройки</h1>
          <div className="w-10" />
        </header>

        <div className="space-y-6">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground">Чтение</CardTitle>
              <CardDescription>Параметры отображения текста</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-foreground">
                  Скорость печати: <span className="text-primary font-semibold">{textSpeedLabel}</span>
                </Label>
                <Slider
                  value={[settings.textSpeed]}
                  onValueChange={handleTextSpeedChange}
                  max={100}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Медленнее</span>
                  <span>Быстрее</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Размер текста</Label>
                <Select value={settings.textSize} onValueChange={handleTextSizeChange}>
                  <SelectTrigger className="text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Маленький</SelectItem>
                    <SelectItem value="medium">Средний</SelectItem>
                    <SelectItem value="large">Большой</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Предпросмотр: <span className={
                    settings.textSize === 'small' ? 'text-base' :
                    settings.textSize === 'large' ? 'text-2xl' : 'text-xl'
                  }>Пример текста новеллы</span>
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Шрифт текста новеллы</Label>
                <Select value={settings.fontFamily} onValueChange={(value) => onUpdate({ ...settings, fontFamily: value as any })}>
                  <SelectTrigger className="text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merriweather">Merriweather (Serif)</SelectItem>
                    <SelectItem value="playfair">Playfair Display (Serif)</SelectItem>
                    <SelectItem value="lora">Lora (Serif)</SelectItem>
                    <SelectItem value="georgia">Georgia (Serif)</SelectItem>
                    <SelectItem value="montserrat">Montserrat (Sans)</SelectItem>
                    <SelectItem value="roboto">Roboto (Sans)</SelectItem>
                    <SelectItem value="opensans">Open Sans (Sans)</SelectItem>
                    <SelectItem value="ptsans">PT Sans (Sans)</SelectItem>
                    <SelectItem value="Inter">Inter (Sans)</SelectItem>
                    <SelectItem value="arial">Arial (Sans)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground" style={{
                  fontFamily: settings.fontFamily === 'merriweather' ? '"Merriweather", serif' :
                             settings.fontFamily === 'playfair' ? '"Playfair Display", serif' :
                             settings.fontFamily === 'lora' ? '"Lora", serif' :
                             settings.fontFamily === 'georgia' ? 'Georgia, serif' :
                             settings.fontFamily === 'montserrat' ? '"Montserrat", sans-serif' :
                             settings.fontFamily === 'roboto' ? '"Roboto", sans-serif' :
                             settings.fontFamily === 'opensans' ? '"Open Sans", sans-serif' :
                             settings.fontFamily === 'ptsans' ? '"PT Sans", sans-serif' :
                             settings.fontFamily === 'Inter' ? '"Inter", sans-serif' :
                             'Arial, sans-serif'
                }}>
                  Предпросмотр: Пример текста новеллы с этим шрифтом
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Шрифт интерфейса</Label>
                <Select value={settings.uiFontFamily || 'system'} onValueChange={(value) => onUpdate({ ...settings, uiFontFamily: value as any })}>
                  <SelectTrigger className="text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Системный</SelectItem>
                    <SelectItem value="montserrat">Montserrat</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="opensans">Open Sans</SelectItem>
                    <SelectItem value="ptsans">PT Sans</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="playfair">Playfair Display</SelectItem>
                    <SelectItem value="lora">Lora</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground" style={{
                  fontFamily: !settings.uiFontFamily || settings.uiFontFamily === 'system' ? 'system-ui, -apple-system, sans-serif' :
                             settings.uiFontFamily === 'montserrat' ? '"Montserrat", sans-serif' :
                             settings.uiFontFamily === 'roboto' ? '"Roboto", sans-serif' :
                             settings.uiFontFamily === 'opensans' ? '"Open Sans", sans-serif' :
                             settings.uiFontFamily === 'ptsans' ? '"PT Sans", sans-serif' :
                             settings.uiFontFamily === 'Inter' ? '"Inter", sans-serif' :
                             settings.uiFontFamily === 'playfair' ? '"Playfair Display", serif' :
                             settings.uiFontFamily === 'lora' ? '"Lora", serif' :
                             'system-ui, sans-serif'
                }}>
                  Предпросмотр: Меню, кнопки и элементы управления
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Авто-продолжение</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматически переходить к следующему параграфу
                  </p>
                </div>
                <Switch
                  checked={settings.autoPlay}
                  onCheckedChange={handleAutoPlayToggle}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="text-foreground">Звук</CardTitle>
              <CardDescription>Настройки аудио</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Громкость музыки</Label>
                  <span className="text-sm text-primary font-semibold">{settings.musicVolume}%</span>
                </div>
                <Slider
                  value={[settings.musicVolume]}
                  onValueChange={handleMusicVolumeChange}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon name="Volume2" size={14} />
                  <span>Громкость фоновой музыки в эпизодах</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Звуковые эффекты</Label>
                  <p className="text-xs text-muted-foreground">
                    Звуки при выборе и переходах
                  </p>
                </div>
                <Switch
                  checked={settings.soundEffects}
                  onCheckedChange={handleSoundEffectsToggle}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="text-foreground">Данные</CardTitle>
              <CardDescription>Управление данными приложения</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start text-foreground"
                onClick={() => {
                  const data = {
                    novel: localStorage.getItem('visualNovel'),
                    settings: localStorage.getItem('userSettings'),
                    profile: localStorage.getItem('userProfile')
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'novel-backup.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Icon name="Download" size={16} className="mr-2" />
                Экспортировать данные
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-foreground"
                onClick={handleResetSettings}
              >
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Сбросить настройки
              </Button>


            </CardContent>
          </Card>

          <div className="text-center text-xs text-muted-foreground py-4">
            <p>Визуальная новелла v1.0</p>
            <p className="mt-1">Все изменения сохраняются автоматически</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default SettingsPanel;