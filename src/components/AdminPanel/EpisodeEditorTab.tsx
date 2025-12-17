import { Episode, Novel } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import EpisodeEditor from '../EpisodeEditor';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, memo } from 'react';

interface EpisodeEditorTabProps {
  novel: Novel;
  selectedEpisode: Episode | undefined;
  selectedEpisodeId: string | null;
  bulkEditEpisodes: boolean;
  selectedEpisodes: Set<string>;
  onUpdate: (novel: Novel) => void;
  onAddEpisode: () => void;
  onDeleteEpisode: (episodeId: string) => void;
  onUpdateEpisode: (updatedEpisode: Episode | undefined) => void;
  onMoveEpisode: (episodeId: string, direction: 'up' | 'down') => void;
  onSelectEpisode: (episodeId: string) => void;
  onToggleEpisodeSelect: (episodeId: string) => void;
  onSelectAllEpisodes: () => void;
  onBulkEpisodeTimeframeChange: (timeframe: 'present' | 'retrospective', checked: boolean) => void;
  onBulkDeleteEpisodes: () => void;
  onShowBulkImport: () => void;
  onBulkEditChange: (checked: boolean) => void;
}

const EpisodeCard = memo(({ 
  episode, 
  idx, 
  selectedEpisodeId, 
  bulkEditEpisodes, 
  selectedEpisodes, 
  totalEpisodes,
  onSelectEpisode, 
  onToggleEpisodeSelect, 
  onMoveEpisode, 
  onDeleteEpisode 
}: {
  episode: Episode;
  idx: number;
  selectedEpisodeId: string | null;
  bulkEditEpisodes: boolean;
  selectedEpisodes: Set<string>;
  totalEpisodes: number;
  onSelectEpisode: (id: string) => void;
  onToggleEpisodeSelect: (id: string) => void;
  onMoveEpisode: (id: string, dir: 'up' | 'down') => void;
  onDeleteEpisode: (id: string) => void;
}) => (
  <div 
    key={episode.id}
    className={`relative p-4 rounded-lg cursor-pointer transition-all ${
      episode.id === selectedEpisodeId 
        ? 'bg-primary text-primary-foreground shadow-md' 
        : 'bg-card hover:bg-secondary/50 text-card-foreground'
    } ${
      bulkEditEpisodes && selectedEpisodes.has(episode.id)
        ? 'ring-2 ring-primary'
        : ''
    }`}
    onClick={() => onSelectEpisode(episode.id)}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-2 flex-1 min-w-0">
        {bulkEditEpisodes && (
          <Checkbox
            checked={selectedEpisodes.has(episode.id)}
            onCheckedChange={() => onToggleEpisodeSelect(episode.id)}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm mb-1 ${episode.id === selectedEpisodeId ? 'text-slate-50' : 'text-slate-100'} truncate`}>
            {episode.title}
          </p>
          <div className="flex flex-wrap gap-1">
            {episode.timeframes?.includes('present') && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                <Icon name="Clock" size={10} className="inline mr-0.5" />
                Настоящее
              </span>
            )}
            {episode.timeframes?.includes('retrospective') && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                <Icon name="History" size={10} className="inline mr-0.5" />
                Воспоминание
              </span>
            )}
            {episode.requiredPaths && episode.requiredPaths.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                <Icon name="GitBranch" size={10} className="inline mr-0.5" />
                {episode.requiredPaths.length}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onMoveEpisode(episode.id, 'up');
          }}
          disabled={idx === 0}
        >
          <Icon name="ChevronUp" size={14} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onMoveEpisode(episode.id, 'down');
          }}
          disabled={idx === totalEpisodes - 1}
        >
          <Icon name="ChevronDown" size={14} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 relative"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteEpisode(episode.id);
          }}
        >
          <Icon name="Trash2" size={14} />
          {bulkEditEpisodes && selectedEpisodes.has(episode.id) && selectedEpisodes.size > 1 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {selectedEpisodes.size}
            </span>
          )}
        </Button>
      </div>
    </div>
    <p className="text-xs opacity-70 mt-1 text-slate-50">
      {episode.paragraphs.length} параграфов
    </p>
  </div>
), (prev, next) => (
  prev.episode.id === next.episode.id &&
  prev.episode.title === next.episode.title &&
  prev.episode.paragraphs.length === next.episode.paragraphs.length &&
  prev.selectedEpisodeId === next.selectedEpisodeId &&
  prev.bulkEditEpisodes === next.bulkEditEpisodes &&
  prev.selectedEpisodes.has(prev.episode.id) === next.selectedEpisodes.has(next.episode.id) &&
  prev.selectedEpisodes.size === next.selectedEpisodes.size &&
  prev.idx === next.idx &&
  prev.totalEpisodes === next.totalEpisodes
));

const EpisodeList = memo(({ 
  episodes, 
  selectedEpisodeId, 
  bulkEditEpisodes, 
  selectedEpisodes, 
  onSelectEpisode, 
  onToggleEpisodeSelect, 
  onMoveEpisode, 
  onDeleteEpisode 
}: {
  episodes: Episode[];
  selectedEpisodeId: string | null;
  bulkEditEpisodes: boolean;
  selectedEpisodes: Set<string>;
  onSelectEpisode: (id: string) => void;
  onToggleEpisodeSelect: (id: string) => void;
  onMoveEpisode: (id: string, dir: 'up' | 'down') => void;
  onDeleteEpisode: (id: string) => void;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: episodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5
  });

  return (
    <div 
      ref={parentRef} 
      className="lg:col-span-1 h-[calc(100vh-300px)] overflow-auto space-y-2"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const episode = episodes[virtualRow.index];
          return (
            <div
              key={episode.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <div className="pb-2">
                <EpisodeCard
                  episode={episode}
                  idx={virtualRow.index}
                  selectedEpisodeId={selectedEpisodeId}
                  bulkEditEpisodes={bulkEditEpisodes}
                  selectedEpisodes={selectedEpisodes}
                  totalEpisodes={episodes.length}
                  onSelectEpisode={onSelectEpisode}
                  onToggleEpisodeSelect={onToggleEpisodeSelect}
                  onMoveEpisode={onMoveEpisode}
                  onDeleteEpisode={onDeleteEpisode}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

function EpisodeEditorTab({
  novel,
  selectedEpisode,
  selectedEpisodeId,
  bulkEditEpisodes,
  selectedEpisodes,
  onUpdate,
  onAddEpisode,
  onDeleteEpisode,
  onUpdateEpisode,
  onMoveEpisode,
  onSelectEpisode,
  onToggleEpisodeSelect,
  onSelectAllEpisodes,
  onBulkEpisodeTimeframeChange,
  onBulkDeleteEpisodes,
  onShowBulkImport,
  onBulkEditChange
}: EpisodeEditorTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Эпизоды</h2>
        <div className="flex gap-2">
          <Button onClick={onShowBulkImport} variant="outline">
            <Icon name="Upload" size={16} className="mr-2" />
            Массовый импорт
          </Button>
          <Button onClick={onAddEpisode}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить эпизод
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 p-3 bg-secondary/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Switch
            id="bulk-edit-episodes"
            checked={bulkEditEpisodes}
            onCheckedChange={onBulkEditChange}
          />
          <Label htmlFor="bulk-edit-episodes" className="cursor-pointer font-medium">
            Массовое редактирование эпизодов
          </Label>
          {bulkEditEpisodes && (
            <span className="text-xs text-muted-foreground">
              ({selectedEpisodes.size} выбрано)
            </span>
          )}
        </div>
        {bulkEditEpisodes && selectedEpisodes.size > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border-r pr-2">
              <Checkbox
                id="bulk-episodes-present"
                onCheckedChange={(checked) => onBulkEpisodeTimeframeChange('present', checked as boolean)}
              />
              <Label htmlFor="bulk-episodes-present" className="cursor-pointer flex items-center gap-1">
                <Icon name="Clock" size={14} />
                <span className="text-xs">Настоящее</span>
              </Label>
            </div>
            <div className="flex items-center gap-2 border-r pr-2">
              <Checkbox
                id="bulk-episodes-retro"
                onCheckedChange={(checked) => onBulkEpisodeTimeframeChange('retrospective', checked as boolean)}
              />
              <Label htmlFor="bulk-episodes-retro" className="cursor-pointer flex items-center gap-1">
                <Icon name="History" size={14} className="text-amber-600" />
                <span className="text-xs">Воспоминания</span>
              </Label>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDeleteEpisodes}
            >
              <Icon name="Trash2" size={14} className="mr-1" />
              Удалить
            </Button>
          </div>
        )}
      </div>

      {bulkEditEpisodes && (
        <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded">
          <Checkbox
            id="select-all-episodes"
            checked={selectedEpisodes.size === novel.episodes.length && novel.episodes.length > 0}
            onCheckedChange={onSelectAllEpisodes}
          />
          <Label htmlFor="select-all-episodes" className="cursor-pointer text-sm font-medium">
            Выбрать все эпизоды
          </Label>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <EpisodeList
          episodes={novel.episodes}
          selectedEpisodeId={selectedEpisodeId}
          bulkEditEpisodes={bulkEditEpisodes}
          selectedEpisodes={selectedEpisodes}
          onSelectEpisode={onSelectEpisode}
          onToggleEpisodeSelect={onToggleEpisodeSelect}
          onMoveEpisode={onMoveEpisode}
          onDeleteEpisode={onDeleteEpisode}
        />

        <div className="lg:col-span-3">
          {selectedEpisode ? (
            <>
              {bulkEditEpisodes && selectedEpisodes.has(selectedEpisode.id) && selectedEpisodes.size > 1 && (
                <div className="mb-4 p-3 bg-primary/10 rounded-lg text-primary font-medium border-2 border-primary">
                  <Icon name="Info" size={16} className="inline mr-2" />
                  Изменения временных слоёв и путей применятся к {selectedEpisodes.size} выбранным эпизодам
                </div>
              )}
              <EpisodeEditor
                episode={selectedEpisode}
                novel={novel}
                onUpdate={onUpdateEpisode}
                onNovelUpdate={onUpdate}
              />
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Выберите эпизод для редактирования
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EpisodeEditorTab;