import { Episode, Novel, ShapeTransitionType } from '@/types/novel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface EpisodeBasicSettingsProps {
  episode: Episode;
  novel: Novel;
  onUpdate: (episode: Episode) => void;
}

function EpisodeBasicSettings({ episode, novel, onUpdate }: EpisodeBasicSettingsProps) {
  return (
    <>
      <div>
        <Label className="text-foreground">ID эпизода</Label>
        <Input value={episode.id} disabled className="font-mono text-sm mt-1" />
      </div>

      <div>
        <Label className="text-foreground">Фигурный переход</Label>
        <Select
          value={episode.shapeTransition || 'organic'}
          onValueChange={(value: ShapeTransitionType) =>
            onUpdate({ ...episode, shapeTransition: value })
          }
        >
          <SelectTrigger className="text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wave">🌊 Волна</SelectItem>
            <SelectItem value="diagonal">📐 Диагональ</SelectItem>
            <SelectItem value="organic">🍃 Органика</SelectItem>
            <SelectItem value="curved">🌙 Изгиб</SelectItem>
            <SelectItem value="liquid">💧 Жидкость</SelectItem>
            <SelectItem value="triangle">▲ Треугольник</SelectItem>
            <SelectItem value="hexagon">⬡ Шестиугольник</SelectItem>
            <SelectItem value="arc">⌒ Арка</SelectItem>
            <SelectItem value="stairs">📊 Лестница</SelectItem>
            <SelectItem value="zigzag">⚡ Зигзаг</SelectItem>
            <SelectItem value="rounded">◉ Округлая</SelectItem>
            <SelectItem value="sharp">◆ Острая</SelectItem>
            <SelectItem value="double-wave">〰️ Двойная волна</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Анимированная форма перехода между экранами
        </p>
      </div>

      <div>
        <Label className="text-foreground">Требуемые пути (опционально)</Label>
        <div className="space-y-2 mt-2">
          {novel.paths && novel.paths.length > 0 ? (
            novel.paths.map((path) => (
              <div key={path.id} className="flex items-center space-x-2">
                <Switch
                  id={`path-${path.id}`}
                  checked={episode.requiredPaths?.includes(path.id) ?? false}
                  onCheckedChange={(checked) => {
                    const current = episode.requiredPaths || [];
                    const updated = checked
                      ? [...current, path.id]
                      : current.filter(p => p !== path.id);
                    onUpdate({ ...episode, requiredPaths: updated.length > 0 ? updated : undefined });
                  }}
                />
                <Label htmlFor={`path-${path.id}`} className="flex items-center gap-2 cursor-pointer">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: path.color }}
                  />
                  {path.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Создайте пути во вкладке "Пути"</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Если выбраны пути, эпизод доступен только игрокам с хотя бы одним активным путём
        </p>
      </div>

      <div className="flex items-center justify-between space-x-2">
        <div className="space-y-1">
          <Label className="text-foreground">Разблокирован для всех</Label>
          <p className="text-xs text-muted-foreground">
            Эпизод доступен всем игрокам независимо от прохождения
          </p>
        </div>
        <Switch
          checked={episode.unlockedForAll || false}
          onCheckedChange={(checked) => onUpdate({ ...episode, unlockedForAll: checked })}
        />
      </div>
    </>
  );
}

export default EpisodeBasicSettings;
