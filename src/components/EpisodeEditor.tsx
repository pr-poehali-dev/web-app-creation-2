import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { Episode, Paragraph, ParagraphType, Novel, PastelColor } from '@/types/novel';
import EpisodeHeader from '@/components/EpisodeEditor/EpisodeHeader';
import ParagraphTypeButtons from '@/components/EpisodeEditor/ParagraphTypeButtons';
import ParagraphEditor from '@/components/EpisodeEditor/ParagraphEditor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface EpisodeEditorProps {
  episode: Episode;
  novel: Novel;
  onUpdate: (episode: Episode) => void;
  onNovelUpdate: (novel: Novel) => void;
}

function EpisodeEditor({ episode, novel, onUpdate, onNovelUpdate }: EpisodeEditorProps) {
  const [insertingAt, setInsertingAt] = useState<number | null>(null);
  const [selectedParagraphs, setSelectedParagraphs] = useState<Set<number>>(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const episodeRef = useRef(episode);
  
  useEffect(() => {
    const start = performance.now();
    console.log('📝 EpisodeEditor render START:', episode.title, 'paragraphs:', episode.paragraphs.length);
    episodeRef.current = episode;
    
    requestAnimationFrame(() => {
      const end = performance.now();
      console.log(`⏱️ EpisodeEditor rendered in ${(end - start).toFixed(2)}ms`);
    });
  }, [episode]);

  const handleAddParagraph = useCallback((type: ParagraphType, insertIndex?: number) => {
    let newParagraph: Paragraph;
    const id = `p${Date.now()}`;

    switch (type) {
      case 'text':
        newParagraph = { id, type: 'text', content: 'Новый текст' };
        break;
      case 'dialogue':
        newParagraph = { id, type: 'dialogue', characterName: 'Персонаж', text: 'Текст диалога' };
        break;
      case 'choice':
        newParagraph = { 
          id, 
          type: 'choice', 
          question: 'Ваш выбор?',
          options: [
            { id: `opt${Date.now()}1`, text: 'Вариант 1' },
            { id: `opt${Date.now()}2`, text: 'Вариант 2' }
          ]
        };
        break;
      case 'item':
        newParagraph = { id, type: 'item', name: 'Предмет', description: 'Описание предмета' };
        break;
      case 'image':
        newParagraph = { id, type: 'image', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23ddd" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E800×600%3C/text%3E%3C/svg%3E' };
        break;
      case 'background':
        newParagraph = { id, type: 'background', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"%3E%3Crect fill="%23333" width="1920" height="1080"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="48" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E1920×1080%3C/text%3E%3C/svg%3E' };
        break;
      default:
        return;
    }

    const newParagraphs = [...episode.paragraphs];
    if (insertIndex !== undefined) {
      newParagraphs.splice(insertIndex + 1, 0, newParagraph);
    } else {
      newParagraphs.push(newParagraph);
    }

    onUpdate({
      ...episode,
      paragraphs: newParagraphs
    });
    
    setInsertingAt(null);
  }, [episode, onUpdate]);

  const handleUpdateParagraph = useCallback((index: number, updatedParagraph: Paragraph) => {
    const currentEpisode = episodeRef.current;
    const newParagraphs = [...currentEpisode.paragraphs];
    
    // Если режим массового редактирования и параграф выбран - применить к всем выбранным
    if (bulkEditMode && selectedParagraphs.has(index)) {
      newParagraphs.forEach((para, i) => {
        if (selectedParagraphs.has(i)) {
          newParagraphs[i] = { 
            ...para, 
            timeframes: updatedParagraph.timeframes,
            requiredPaths: updatedParagraph.requiredPaths
          };
        }
      });
    } else {
      newParagraphs[index] = updatedParagraph;
    }
    
    onUpdate({ ...currentEpisode, paragraphs: newParagraphs });
  }, [onUpdate, bulkEditMode, selectedParagraphs]);

  const handleDeleteParagraph = useCallback((index: number) => {
    const currentEpisode = episodeRef.current;
    // Если режим массового редактирования и параграф выбран - удалить все выбранные
    if (bulkEditMode && selectedParagraphs.has(index)) {
      const confirmed = confirm(`Удалить ${selectedParagraphs.size} параграф(ов)?`);
      if (!confirmed) return;
      
      onUpdate({
        ...currentEpisode,
        paragraphs: currentEpisode.paragraphs.filter((_, i) => !selectedParagraphs.has(i))
      });
      setSelectedParagraphs(new Set());
    } else {
      onUpdate({
        ...currentEpisode,
        paragraphs: currentEpisode.paragraphs.filter((_, i) => i !== index)
      });
    }
  }, [onUpdate, bulkEditMode, selectedParagraphs]);

  const handleMoveParagraph = useCallback((index: number, direction: 'up' | 'down') => {
    const currentEpisode = episodeRef.current;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentEpisode.paragraphs.length) return;

    const newParagraphs = [...currentEpisode.paragraphs];
    [newParagraphs[index], newParagraphs[newIndex]] = [newParagraphs[newIndex], newParagraphs[index]];
    onUpdate({ ...currentEpisode, paragraphs: newParagraphs });
  }, [onUpdate]);

  const handleToggleInsert = useCallback((index: number) => {
    setInsertingAt(prev => prev === index ? null : index);
  }, []);

  const handleToggleMerge = useCallback((index: number) => {
    const currentEpisode = episodeRef.current;
    const paragraph = currentEpisode.paragraphs[index];
    const nextParagraph = currentEpisode.paragraphs[index + 1];
    
    if (!nextParagraph) return;
    
    const newParagraphs = [...currentEpisode.paragraphs];
    if (paragraph.mergedWith) {
      newParagraphs[index] = { ...paragraph, mergedWith: undefined };
    } else {
      newParagraphs[index] = { ...paragraph, mergedWith: nextParagraph.id };
    }
    
    onUpdate({ ...currentEpisode, paragraphs: newParagraphs });
  }, [onUpdate]);

  const handleToggleSelect = useCallback((index: number) => {
    const newSelected = new Set(selectedParagraphs);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedParagraphs(newSelected);
  }, [selectedParagraphs]);

  const handleSelectAll = useCallback(() => {
    if (selectedParagraphs.size === episode.paragraphs.length) {
      setSelectedParagraphs(new Set());
    } else {
      setSelectedParagraphs(new Set(episode.paragraphs.map((_, i) => i)));
    }
  }, [episode.paragraphs.length, selectedParagraphs.size]);

  const handleBulkTimeframeChange = useCallback((timeframe: 'present' | 'retrospective', checked: boolean) => {
    const newParagraphs = episode.paragraphs.map((para, index) => {
      if (!selectedParagraphs.has(index)) return para;
      
      const current = para.timeframes || [];
      const updated = checked
        ? [...current.filter(t => t !== timeframe), timeframe]
        : current.filter(t => t !== timeframe);
      
      return { ...para, timeframes: updated.length > 0 ? updated : undefined };
    });
    
    onUpdate({ ...episode, paragraphs: newParagraphs });
  }, [episode, onUpdate, selectedParagraphs]);

  const handleBulkDelete = useCallback(() => {
    onUpdate({
      ...episode,
      paragraphs: episode.paragraphs.filter((_, i) => !selectedParagraphs.has(i))
    });
    setSelectedParagraphs(new Set());
  }, [episode, onUpdate, selectedParagraphs]);

  const handleBulkPastelColorChange = useCallback((color: PastelColor) => {
    const newParagraphs = episode.paragraphs.map((para, index) => {
      if (!selectedParagraphs.has(index)) return para;
      return { ...para, pastelColor: color };
    });
    
    onUpdate({ ...episode, paragraphs: newParagraphs });
  }, [episode, onUpdate, selectedParagraphs]);

  const handleCreateComicGroup = useCallback(() => {
    if (selectedParagraphs.size < 2) return;
    
    const selectedIndices = Array.from(selectedParagraphs).sort((a, b) => a - b);
    const groupId = `comic-group-${Date.now()}`;
    
    const newParagraphs = episode.paragraphs.map((para, index) => {
      const groupIndex = selectedIndices.indexOf(index);
      if (groupIndex === -1) return para;
      
      return {
        ...para,
        comicGroupId: groupId,
        comicGroupIndex: groupIndex,
        // Создаём пустой массив фреймов только для первого параграфа
        comicFrames: groupIndex === 0 ? [] : undefined,
        frameLayout: groupIndex === 0 ? 'horizontal-3' as const : undefined
      };
    });
    
    onUpdate({ ...episode, paragraphs: newParagraphs });
    setSelectedParagraphs(new Set());
    setBulkEditMode(false);
  }, [episode, onUpdate, selectedParagraphs]);

  return (
    <div className="space-y-4">
      <EpisodeHeader episode={episode} novel={novel} onUpdate={onUpdate} onNovelUpdate={onNovelUpdate} />

      <div className="flex items-center justify-between gap-4 p-3 bg-secondary/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Switch
            id="bulk-edit-mode"
            checked={bulkEditMode}
            onCheckedChange={(checked) => {
              setBulkEditMode(checked);
              if (!checked) setSelectedParagraphs(new Set());
            }}
          />
          <Label htmlFor="bulk-edit-mode" className="cursor-pointer font-medium">
            Массовое редактирование
          </Label>
          {bulkEditMode && (
            <span className="text-xs text-muted-foreground">
              ({selectedParagraphs.size} выбрано)
            </span>
          )}
        </div>
        {bulkEditMode && selectedParagraphs.size > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border-r pr-2">
              <Checkbox
                id="bulk-present"
                onCheckedChange={(checked) => handleBulkTimeframeChange('present', checked as boolean)}
              />
              <Label htmlFor="bulk-present" className="cursor-pointer flex items-center gap-1">
                <Icon name="Clock" size={14} />
                <span className="text-xs">Настоящее</span>
              </Label>
            </div>
            <div className="flex items-center gap-2 border-r pr-2">
              <Checkbox
                id="bulk-retro"
                onCheckedChange={(checked) => handleBulkTimeframeChange('retrospective', checked as boolean)}
              />
              <Label htmlFor="bulk-retro" className="cursor-pointer flex items-center gap-1">
                <Icon name="History" size={14} className="text-amber-600" />
                <span className="text-xs">Ретроспект.</span>
              </Label>
            </div>
            <div className="border-r pr-2">
              <Select onValueChange={(value) => handleBulkPastelColorChange(value as PastelColor)}>
                <SelectTrigger className="h-8 w-32">
                  <SelectValue placeholder="Оттенок" />
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
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={handleCreateComicGroup}
              disabled={selectedParagraphs.size < 2}
            >
              <Icon name="Film" size={14} className="mr-1" />
              Объединить в комикс
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
            >
              <Icon name="Trash2" size={14} className="mr-1" />
              Удалить
            </Button>
          </div>
        )}
        {bulkEditMode && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSelectAll}
          >
            {selectedParagraphs.size === episode.paragraphs.length ? 'Снять всё' : 'Выбрать всё'}
          </Button>
        )}
      </div>

      <ParagraphTypeButtons onAddParagraph={(type) => handleAddParagraph(type)} />

      <div className="space-y-3">
        {episode.paragraphs.map((paragraph, index) => {
          const isSelected = selectedParagraphs.has(index);
          
          return (
            <div key={paragraph.id}>
              <div className="flex items-start gap-2">
                {bulkEditMode && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleSelect(index)}
                    className="mt-4"
                  />
                )}
                <div className="flex-1">
                  <ParagraphEditor
                    paragraph={paragraph}
                    index={index}
                    episodeId={episode.id}
                    novel={novel}
                    totalParagraphs={episode.paragraphs.length}
                    onUpdate={handleUpdateParagraph}
                    onDelete={handleDeleteParagraph}
                    onMove={handleMoveParagraph}
                    onToggleInsert={handleToggleInsert}
                    onToggleMerge={handleToggleMerge}
                    onNovelUpdate={onNovelUpdate}
                    isBulkEditMode={bulkEditMode}
                    isSelected={isSelected}
                    selectedCount={selectedParagraphs.size}
                  />
                </div>
              </div>
            
            {insertingAt === index ? (
              <div className="flex gap-2 justify-center my-2 p-2 bg-secondary/20 rounded-lg">
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('text', index)}>
                  <Icon name="FileText" size={14} className="mr-1" />
                  Текст
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('dialogue', index)}>
                  <Icon name="MessageSquare" size={14} className="mr-1" />
                  Диалог
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('choice', index)}>
                  <Icon name="GitBranch" size={14} className="mr-1" />
                  Выбор
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('item', index)}>
                  <Icon name="Package" size={14} className="mr-1" />
                  Предмет
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('image', index)}>
                  <Icon name="Image" size={14} className="mr-1" />
                  Картинка
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleAddParagraph('background', index)}>
                  <Icon name="Wallpaper" size={14} className="mr-1" />
                  Фон
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full my-2"
                onClick={() => handleToggleInsert(index)}
              >
                <Icon name="Plus" size={14} className="mr-2" />
                Вставить параграф
              </Button>
            )}
          </div>
        );
        })}
      </div>

      {episode.paragraphs.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Добавьте параграфы к эпизоду или импортируйте из MD файла
        </div>
      )}
    </div>
  );
}

export default EpisodeEditor;