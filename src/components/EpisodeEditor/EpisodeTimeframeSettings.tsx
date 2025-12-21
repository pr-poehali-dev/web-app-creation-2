import { Episode } from '@/types/novel';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface EpisodeTimeframeSettingsProps {
  episode: Episode;
  onUpdate: (episode: Episode) => void;
}

function EpisodeTimeframeSettings({ episode, onUpdate }: EpisodeTimeframeSettingsProps) {
  return (
    <>
      <div>
        <Label className="text-foreground">Временные слои</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="timeframe-present"
              checked={episode.timeframes?.includes('present') ?? true}
              onCheckedChange={(checked) => {
                const current = episode.timeframes || ['present'];
                const updated = checked 
                  ? [...current.filter(t => t !== 'present'), 'present']
                  : current.filter(t => t !== 'present');
                onUpdate({ ...episode, timeframes: updated.length > 0 ? updated : ['present'] });
              }}
            />
            <Label htmlFor="timeframe-present" className="flex items-center gap-2 cursor-pointer">
              <Icon name="Clock" size={14} />
              Настоящее
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="timeframe-retrospective"
              checked={episode.timeframes?.includes('retrospective') ?? false}
              onCheckedChange={(checked) => {
                const current = episode.timeframes || ['present'];
                const updated = checked 
                  ? [...current.filter(t => t !== 'retrospective'), 'retrospective']
                  : current.filter(t => t !== 'retrospective');
                onUpdate({ ...episode, timeframes: updated.length > 0 ? updated : ['present'] });
              }}
            />
            <Label htmlFor="timeframe-retrospective" className="flex items-center gap-2 cursor-pointer">
              <Icon name="History" size={14} className="text-amber-600" />
              Ретроспектива
            </Label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Можно выбрать несколько. Ретроспектива отображается с сепия-эффектом и виньеткой.
        </p>
      </div>

      {episode.timeframes?.includes('retrospective') && (
        <div>
          <Label className="text-foreground">Оттенок ретроспективы для эпизода</Label>
          <Select
            value={episode.pastelColor || 'peach'}
            onValueChange={(value) => onUpdate({ ...episode, pastelColor: value as any })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pink">🌸 Розовый</SelectItem>
              <SelectItem value="blue">💙 Голубой</SelectItem>
              <SelectItem value="peach">🍑 Персиковый</SelectItem>
              <SelectItem value="lavender">💜 Лавандовый</SelectItem>
              <SelectItem value="mint">🍃 Мятный</SelectItem>
              <SelectItem value="yellow">💛 Жёлтый</SelectItem>
              <SelectItem value="coral">🪸 Коралловый</SelectItem>
              <SelectItem value="sky">☁️ Небесный</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            Этот оттенок будет применён ко всем параграфам с ретроспективой в этом эпизоде (если у параграфа не задан свой цвет)
          </p>
        </div>
      )}
    </>
  );
}

export default EpisodeTimeframeSettings;
