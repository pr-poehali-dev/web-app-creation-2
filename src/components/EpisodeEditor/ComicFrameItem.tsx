import { memo, useState } from 'react';
import { ComicFrame, FrameAnimationType, SubParagraph } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface ComicFrameItemProps {
  frame: ComicFrame;
  index: number;
  subParagraphs?: SubParagraph[];
  onUpdate: (index: number, updates: Partial<ComicFrame>) => void;
  onRemove: (index: number) => void;
}

function ComicFrameItem({ frame, index, subParagraphs, onUpdate, onRemove }: ComicFrameItemProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  
  return (
    <div className="border border-border/50 rounded p-2 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Фрейм {index + 1}</Label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="h-6 w-6 p-0 text-destructive"
        >
          <Icon name="X" size={12} />
        </Button>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">URL изображения</Label>
        <Input
          value={frame.url}
          onChange={(e) => onUpdate(index, { url: e.target.value })}
          placeholder="https://..."
          className="h-8 text-xs"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Триггер (подпараграф для показа)</Label>
        {subParagraphs && subParagraphs.length > 0 ? (
          <>
            <select
              value={frame.subParagraphTrigger || 'none'}
              onChange={(e) => {
                const v = e.target.value;
                const newTrigger = v === 'none' ? undefined : v;
                onUpdate(index, { subParagraphTrigger: newTrigger });
              }}
              className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="none">⚫ Показывать всегда</option>
              {subParagraphs.map((sp, idx) => (
                <option key={sp.id} value={sp.id}>
                  {idx + 1}. {sp.text ? (sp.text.substring(0, 40) + (sp.text.length > 40 ? '...' : '')) : '(пустой)'}
                </option>
              ))}
            </select>
            <div className="text-[10px] text-muted-foreground mt-1">
              Триггер: {frame.subParagraphTrigger || '(нет)'}
            </div>
          </>
        ) : (
          <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded border border-border/50">
            Нет подпараграфов. Фрейм будет показан сразу.
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Анимация (своя для фрейма)</Label>
        <Select value={frame.animation || 'default'} onValueChange={(v) => onUpdate(index, { animation: v === 'default' ? undefined : v as FrameAnimationType })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="default">⚙️ По умолчанию</SelectItem>
            <SelectItem value="none">⚫ Без анимации</SelectItem>
            <SelectItem value="fade">✨ Плавное</SelectItem>
            <SelectItem value="blur-in">🌫️ Размытие</SelectItem>
            <SelectItem value="slide-up">⬆️ Вверх</SelectItem>
            <SelectItem value="slide-down">⬇️ Вниз</SelectItem>
            <SelectItem value="slide-left">⬅️ Влево</SelectItem>
            <SelectItem value="slide-right">➡️ Вправо</SelectItem>
            <SelectItem value="zoom">🔍 Увеличение</SelectItem>
            <SelectItem value="zoom-out">🔎 Уменьшение</SelectItem>
            <SelectItem value="flip">🔄 Переворот</SelectItem>
            <SelectItem value="flip-x">↕️ Переворот X</SelectItem>
            <SelectItem value="rotate-in">🌀 Вращение</SelectItem>
            <SelectItem value="bounce">🏀 Прыжок</SelectItem>
            <SelectItem value="shake">⚡ Тряска</SelectItem>
            <SelectItem value="wave">🌊 Волна</SelectItem>
            <SelectItem value="split-v">⬍⬌ Разд. ↕️</SelectItem>
            <SelectItem value="split-h">⬍⬌ Разд. ↔️</SelectItem>
            <SelectItem value="glitch">📺 Глитч</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {frame.url && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <Label className="text-xs font-semibold">Позиционирование картинки</Label>
          
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Режим отображения</Label>
            <Select 
              value={frame.objectFit || 'cover'} 
              onValueChange={(v) => onUpdate(index, { objectFit: v as 'cover' | 'contain' | 'fill' })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">🖼️ Обрезать (cover)</SelectItem>
                <SelectItem value="contain">📦 Вместить (contain)</SelectItem>
                <SelectItem value="fill">⬛ Растянуть (fill)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Позиция</Label>
            <div className="grid grid-cols-3 gap-1">
              {['top', 'center', 'bottom'].map(row => (
                ['left', 'center', 'right'].map(col => {
                  const position = row === 'center' && col === 'center' ? 'center' : `${row} ${col}`;
                  const isActive = (frame.objectPosition || 'center') === position;
                  return (
                    <Button
                      key={position}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdate(index, { objectPosition: position })}
                      className="h-8 text-[10px] p-1"
                    >
                      {row === 'top' && col === 'left' && '↖️'}
                      {row === 'top' && col === 'center' && '⬆️'}
                      {row === 'top' && col === 'right' && '↗️'}
                      {row === 'center' && col === 'left' && '⬅️'}
                      {row === 'center' && col === 'center' && '🎯'}
                      {row === 'center' && col === 'right' && '➡️'}
                      {row === 'bottom' && col === 'left' && '↙️'}
                      {row === 'bottom' && col === 'center' && '⬇️'}
                      {row === 'bottom' && col === 'right' && '↘️'}
                    </Button>
                  );
                })
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Предпросмотр</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewOpen(true)}
                className="h-6 text-[10px] px-2"
              >
                <Icon name="Maximize2" size={12} className="mr-1" />
                Открыть
              </Button>
            </div>
            <div 
              className="relative w-full h-32 bg-muted rounded border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setPreviewOpen(true)}
            >
              <img
                src={frame.url}
                alt="Preview"
                className="w-full h-full"
                style={{
                  objectFit: frame.objectFit || 'cover',
                  objectPosition: frame.objectPosition || 'center'
                }}
              />
            </div>
          </div>

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-4">
              <div className="space-y-3">
                <div className="text-sm font-medium">Полный предпросмотр позиционирования</div>
                <div className="relative w-full h-[70vh] bg-muted rounded border border-border overflow-hidden">
                  <img
                    src={frame.url}
                    alt="Full Preview"
                    className="w-full h-full"
                    style={{
                      objectFit: frame.objectFit || 'cover',
                      objectPosition: frame.objectPosition || 'center'
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Режим: <span className="font-medium">{frame.objectFit || 'cover'}</span></div>
                  <div>Позиция: <span className="font-medium">{frame.objectPosition || 'center'}</span></div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default memo(ComicFrameItem, (prevProps, nextProps) => {
  return (
    prevProps.frame.url === nextProps.frame.url &&
    prevProps.frame.animation === nextProps.frame.animation &&
    prevProps.frame.subParagraphTrigger === nextProps.frame.subParagraphTrigger &&
    prevProps.index === nextProps.index &&
    prevProps.subParagraphs === nextProps.subParagraphs
  );
});