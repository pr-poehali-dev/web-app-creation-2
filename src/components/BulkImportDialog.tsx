import { useState } from 'react';
import { Novel, Episode } from '@/types/novel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { parseMarkdownToEpisode } from '@/utils/markdownImport';

interface BulkImportDialogProps {
  open: boolean;
  novel: Novel;
  onOpenChange: (open: boolean) => void;
  onUpdate: (novel: Novel) => void;
}

interface ImportResult {
  fileName: string;
  status: 'pending' | 'success' | 'error';
  episodeTitle?: string;
  error?: string;
}

function BulkImportDialog({ open, novel, onOpenChange, onUpdate }: BulkImportDialogProps) {
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [progress, setProgress] = useState(0);

  const handleBulkImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      setImporting(true);
      setResults(files.map(f => ({ fileName: f.name, status: 'pending' })));
      setProgress(0);

      const newEpisodes: Episode[] = [];
      const newCharacters = [...novel.library.characters];
      const newItems = [...novel.library.items];
      const newChoices = [...novel.library.choices];
      const importResults: ImportResult[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const text = await file.text();
          const episodeId = `ep${Date.now()}_${i}`;
          const importedEpisode = parseMarkdownToEpisode(text, episodeId);

          // Добавляем эпизод
          newEpisodes.push({
            ...importedEpisode,
            position: { 
              x: 100 + (i % 5) * 250, 
              y: 100 + Math.floor(i / 5) * 200 
            }
          });

          // Импортируем в библиотеку
          importedEpisode.paragraphs.forEach(para => {
            if (para.type === 'dialogue' && para.characterName) {
              const exists = newCharacters.some(c => c.name === para.characterName);
              if (!exists) {
                const shouldGenerate = !para.characterImage || 
                  (!para.characterImage.startsWith('data:') && 
                   !para.characterImage.startsWith('http') && 
                   para.characterImage.length <= 2);
                
                newCharacters.push({
                  id: `char${Date.now()}_${para.characterName}`,
                  name: para.characterName,
                  images: para.characterImage && !shouldGenerate 
                    ? [{ id: `img${Date.now()}`, url: para.characterImage }] 
                    : []
                });
              }
            }

            if (para.type === 'item' && para.name) {
              const exists = newItems.some(i => i.name === para.name);
              if (!exists) {
                newItems.push({
                  id: `item${Date.now()}_${para.name}`,
                  name: para.name,
                  description: para.description,
                  imageUrl: para.imageUrl
                });
              }
            }

            if (para.type === 'choice' && para.options) {
              para.options.forEach(opt => {
                const exists = newChoices.some(c => 
                  c.options && c.options.some(o => o.text === opt.text)
                );
                if (!exists && opt.text) {
                  // Создаем полноценный выбор с вопросом и опциями
                  const choiceExists = newChoices.some(c => c.question === para.question);
                  if (!choiceExists) {
                    newChoices.push({
                      id: `choice${Date.now()}_${para.id}`,
                      question: para.question,
                      options: para.options.map(o => ({
                        id: o.id,
                        text: o.text,
                        nextEpisodeId: o.nextEpisodeId,
                        nextParagraphIndex: o.nextParagraphIndex
                      }))
                    });
                  }
                }
              });
            }
          });

          importResults.push({
            fileName: file.name,
            status: 'success',
            episodeTitle: importedEpisode.title
          });
        } catch (error) {
          importResults.push({
            fileName: file.name,
            status: 'error',
            error: error instanceof Error ? error.message : 'Неизвестная ошибка'
          });
        }

        setProgress(((i + 1) / files.length) * 100);
        setResults([...importResults]);
      }

      // Обновляем новеллу
      onUpdate({
        ...novel,
        episodes: [...novel.episodes, ...newEpisodes],
        library: {
          characters: newCharacters,
          items: newItems,
          choices: newChoices
        }
      });

      setImporting(false);
    };

    input.click();
  };

  const handleReset = () => {
    setResults([]);
    setProgress(0);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Массовый импорт эпизодов</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-muted-foreground">
                <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Выберите несколько .md или .txt файлов для импорта</p>
                <p className="text-sm mt-2">Каждый файл будет создан как отдельный эпизод</p>
              </div>
              <Button onClick={handleBulkImport} disabled={importing}>
                <Icon name="Upload" size={16} className="mr-2" />
                Выбрать файлы
              </Button>
            </div>
          ) : (
            <>
              {importing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Импорт...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {!importing && (
                <div className="flex items-center gap-4 p-3 bg-muted/30 rounded">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                    <span>Успешно: {successCount}</span>
                  </div>
                  {errorCount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Icon name="XCircle" size={16} className="text-red-500" />
                      <span>Ошибки: {errorCount}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded border ${
                      result.status === 'success'
                        ? 'bg-green-500/10 border-green-500/30'
                        : result.status === 'error'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-muted/20 border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.status === 'success' && (
                        <Icon name="CheckCircle" size={16} className="text-green-500 mt-0.5" />
                      )}
                      {result.status === 'error' && (
                        <Icon name="XCircle" size={16} className="text-red-500 mt-0.5" />
                      )}
                      {result.status === 'pending' && (
                        <Icon name="Loader2" size={16} className="animate-spin mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{result.fileName}</p>
                        {result.episodeTitle && (
                          <p className="text-xs text-muted-foreground">→ {result.episodeTitle}</p>
                        )}
                        {result.error && (
                          <p className="text-xs text-red-500 mt-1">{result.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Сбросить
                </Button>
                <Button onClick={handleBulkImport} disabled={importing} className="flex-1">
                  <Icon name="Upload" size={16} className="mr-2" />
                  Импортировать ещё
                </Button>
              </div>
            </>
          )}

          <div className="p-4 bg-muted/50 rounded text-sm space-y-2">
            <p className="font-medium flex items-center gap-2">
              <Icon name="Info" size={14} />
              Как это работает:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Каждый файл создаёт новый эпизод</li>
              <li>Персонажи, предметы и выборы автоматически добавляются в библиотеку</li>
              <li>Эпизоды размещаются на карте автоматически</li>
              <li>Формат файлов должен соответствовать шаблону импорта</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BulkImportDialog;
