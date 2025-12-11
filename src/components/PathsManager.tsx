import { useState, useMemo } from 'react';
import { Novel, Path } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface PathsManagerProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

function PathsManager({ novel, onUpdate }: PathsManagerProps) {
  const paths = novel.paths || [];
  const [selectedPathId, setSelectedPathId] = useState<string | null>(paths[0]?.id || null);
  const selectedPath = paths.find(p => p.id === selectedPathId);

  const pathUsage = useMemo(() => {
    if (!selectedPath) return { episodes: [], choices: [], activatingChoices: [] };

    const linkedEpisodes = novel.episodes.filter(ep => ep.requiredPath === selectedPath.id);
    
    const linkedChoices: Array<{ episodeTitle: string; question: string; optionText: string }> = [];
    const activatingChoices: Array<{ episodeTitle: string; question: string; optionText: string }> = [];
    
    novel.episodes.forEach(ep => {
      ep.paragraphs.forEach(para => {
        if (para.type === 'choice') {
          para.options.forEach(opt => {
            if (opt.requiredPath === selectedPath.id) {
              linkedChoices.push({
                episodeTitle: ep.title,
                question: para.question,
                optionText: opt.text
              });
            }
            if (opt.activatesPath === selectedPath.id) {
              activatingChoices.push({
                episodeTitle: ep.title,
                question: para.question,
                optionText: opt.text
              });
            }
          });
        }
      });
    });

    return { episodes: linkedEpisodes, choices: linkedChoices, activatingChoices };
  }, [selectedPath, novel.episodes]);

  const handleAddPath = () => {
    const newPath: Path = {
      id: `path${Date.now()}`,
      name: 'Новый путь',
      description: '',
      color: '#9333ea'
    };
    onUpdate({
      ...novel,
      paths: [...paths, newPath]
    });
    setSelectedPathId(newPath.id);
  };

  const handleUpdatePath = (updates: Partial<Path>) => {
    if (!selectedPath) return;
    onUpdate({
      ...novel,
      paths: paths.map(p => p.id === selectedPath.id ? { ...p, ...updates } : p)
    });
  };

  const handleDeletePath = (pathId: string) => {
    const confirmed = confirm('Удалить этот путь? Все привязки к эпизодам и выборам будут потеряны.');
    if (!confirmed) return;
    
    onUpdate({
      ...novel,
      paths: paths.filter(p => p.id !== pathId)
    });
    if (selectedPathId === pathId) {
      setSelectedPathId(paths[0]?.id || null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Управление путями</h2>
          <p className="text-sm text-muted-foreground">
            Создавайте пути для разных сюжетных линий. Игроки могут активировать пути через выборы.
          </p>
        </div>
        <Button onClick={handleAddPath}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить путь
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          {paths.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Нет путей. Создайте первый путь!</p>
              </CardContent>
            </Card>
          ) : (
            paths.map(path => (
              <Card
                key={path.id}
                className={`cursor-pointer transition-all ${
                  selectedPathId === path.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPathId(path.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: path.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{path.name}</p>
                      {path.description && (
                        <p className="text-xs text-muted-foreground truncate">{path.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedPath ? (
            <Card>
              <CardHeader>
                <CardTitle>Редактирование пути</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="path-name">Название</Label>
                  <Input
                    id="path-name"
                    value={selectedPath.name}
                    onChange={e => handleUpdatePath({ name: e.target.value })}
                    placeholder="Название пути"
                  />
                </div>

                <div>
                  <Label htmlFor="path-description">Описание</Label>
                  <Textarea
                    id="path-description"
                    value={selectedPath.description || ''}
                    onChange={e => handleUpdatePath({ description: e.target.value })}
                    placeholder="Описание пути для админа"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="path-color">Цвет</Label>
                  <div className="flex gap-2">
                    <Input
                      id="path-color"
                      type="color"
                      value={selectedPath.color || '#9333ea'}
                      onChange={e => handleUpdatePath({ color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      value={selectedPath.color || '#9333ea'}
                      onChange={e => handleUpdatePath({ color: e.target.value })}
                      placeholder="#9333ea"
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Icon name="GitBranch" size={14} />
                      Связанные элементы
                    </h3>
                    
                    {pathUsage.episodes.length === 0 && pathUsage.choices.length === 0 && pathUsage.activatingChoices.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Нет элементов, связанных с этим путём</p>
                    ) : (
                      <div className="space-y-3">
                        {pathUsage.episodes.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Эпизоды, требующие путь ({pathUsage.episodes.length})
                            </p>
                            <div className="space-y-1">
                              {pathUsage.episodes.map(ep => (
                                <div key={ep.id} className="text-sm p-2 bg-muted/30 rounded flex items-center gap-2">
                                  <Icon name="Book" size={12} />
                                  {ep.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {pathUsage.choices.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Варианты, требующие путь ({pathUsage.choices.length})
                            </p>
                            <div className="space-y-1">
                              {pathUsage.choices.map((choice, idx) => (
                                <div key={idx} className="text-sm p-2 bg-muted/30 rounded">
                                  <div className="flex items-start gap-2">
                                    <Icon name="Lock" size={12} className="mt-0.5" />
                                    <div>
                                      <p className="font-medium">{choice.episodeTitle}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {choice.question} → {choice.optionText}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {pathUsage.activatingChoices.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Варианты, активирующие путь ({pathUsage.activatingChoices.length})
                            </p>
                            <div className="space-y-1">
                              {pathUsage.activatingChoices.map((choice, idx) => (
                                <div key={idx} className="text-sm p-2 bg-muted/30 rounded">
                                  <div className="flex items-start gap-2">
                                    <Icon name="GitBranch" size={12} className="mt-0.5" />
                                    <div>
                                      <p className="font-medium">{choice.episodeTitle}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {choice.question} → {choice.optionText}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="destructive"
                    onClick={() => handleDeletePath(selectedPath.id)}
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить путь
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Выберите путь для редактирования</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Info" size={16} />
            Как использовать пути
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>1. Создайте пути</strong> - например: "Путь добра", "Путь зла", "Секретная ветка"</p>
          <p><strong>2. Привяжите выборы к путям</strong> - в редакторе выбора укажите путь, чтобы активировать его при выборе опции</p>
          <p><strong>3. Ограничьте доступ к эпизодам</strong> - укажите путь в эпизоде, чтобы он был доступен только игрокам с активным путём</p>
          <p><strong>4. Одноразовые выборы</strong> - включите oneTime в выборе, чтобы он был доступен только один раз</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PathsManager;