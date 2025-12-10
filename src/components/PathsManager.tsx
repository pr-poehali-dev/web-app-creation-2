import { useState } from 'react';
import { Path } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface PathsManagerProps {
  paths: Path[];
  onUpdate: (paths: Path[]) => void;
}

function PathsManager({ paths, onUpdate }: PathsManagerProps) {
  const [selectedPathId, setSelectedPathId] = useState<string | null>(paths[0]?.id || null);
  const selectedPath = paths.find(p => p.id === selectedPathId);

  const handleAddPath = () => {
    const newPath: Path = {
      id: `path${Date.now()}`,
      name: 'Новый путь',
      description: '',
      color: '#9333ea'
    };
    onUpdate([...paths, newPath]);
    setSelectedPathId(newPath.id);
  };

  const handleUpdatePath = (updates: Partial<Path>) => {
    if (!selectedPath) return;
    onUpdate(paths.map(p => p.id === selectedPath.id ? { ...p, ...updates } : p));
  };

  const handleDeletePath = (pathId: string) => {
    const confirmed = confirm('Удалить этот путь? Все привязки к эпизодам и выборам будут потеряны.');
    if (!confirmed) return;
    
    onUpdate(paths.filter(p => p.id !== pathId));
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
        {/* Список путей */}
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

        {/* Редактор пути */}
        <div className="lg:col-span-2">
          {selectedPath ? (
            <Card>
              <CardHeader>
                <CardTitle>Редактирование пути</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="path-id">ID пути</Label>
                  <Input
                    id="path-id"
                    value={selectedPath.id}
                    disabled
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Используйте этот ID при настройке эпизодов и выборов
                  </p>
                </div>

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

                <div className="pt-4 border-t">
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

      {/* Инструкция */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Info" size={16} />
            Как использовать пути
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>1. Создайте пути</strong> - например: "Путь добра", "Путь зла", "Секретная ветка"</p>
          <p><strong>2. Привяжите выборы к путям</strong> - в редакторе выбора укажите requiredPath, чтобы активировать путь при выборе опции</p>
          <p><strong>3. Ограничьте доступ к эпизодам</strong> - укажите requiredPath в эпизоде, чтобы он был доступен только игрокам с активным путём</p>
          <p><strong>4. Одноразовые выборы</strong> - включите oneTime в выборе, чтобы он был доступен только один раз</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PathsManager;
