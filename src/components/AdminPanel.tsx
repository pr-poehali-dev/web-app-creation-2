import { useState } from 'react';
import { Novel } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import EpisodeEditor from './EpisodeEditor';
import NovelVisualization from './NovelVisualization';
import LibraryManager from './LibraryManager';
import HomePageEditor from './HomePageEditor';
import PathsManager from './PathsManager';

interface AdminPanelProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
  onLogout: () => void;
}

function AdminPanel({ novel, onUpdate, onLogout }: AdminPanelProps) {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    novel.episodes[0]?.id || null
  );

  const selectedEpisode = novel.episodes.find(ep => ep.id === selectedEpisodeId);

  const handleAddEpisode = () => {
    const newEpisode = {
      id: `ep${Date.now()}`,
      title: 'Новый эпизод',
      position: { x: 100 + novel.episodes.length * 50, y: 100 + novel.episodes.length * 50 },
      paragraphs: [
        {
          id: `p${Date.now()}`,
          type: 'text' as const,
          content: 'Новый текст'
        }
      ]
    };

    onUpdate({
      ...novel,
      episodes: [...novel.episodes, newEpisode]
    });
    setSelectedEpisodeId(newEpisode.id);
  };

  const handleDeleteEpisode = (episodeId: string) => {
    if (novel.episodes.length <= 1) {
      alert('Нельзя удалить последний эпизод');
      return;
    }

    const confirmed = confirm('Удалить этот эпизод?');
    if (!confirmed) return;

    const updatedEpisodes = novel.episodes.filter(ep => ep.id !== episodeId);
    onUpdate({
      ...novel,
      episodes: updatedEpisodes,
      currentEpisodeId: updatedEpisodes[0]?.id || novel.currentEpisodeId
    });
    setSelectedEpisodeId(updatedEpisodes[0]?.id || null);
  };

  const handleUpdateEpisode = (updatedEpisode: typeof selectedEpisode) => {
    if (!updatedEpisode) return;

    onUpdate({
      ...novel,
      episodes: novel.episodes.map(ep => 
        ep.id === updatedEpisode.id ? updatedEpisode : ep
      )
    });
  };

  const handleMoveEpisode = (episodeId: string, direction: 'up' | 'down') => {
    const currentIndex = novel.episodes.findIndex(ep => ep.id === episodeId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= novel.episodes.length) return;
    
    const newEpisodes = [...novel.episodes];
    const [movedEpisode] = newEpisodes.splice(currentIndex, 1);
    newEpisodes.splice(newIndex, 0, movedEpisode);
    
    onUpdate({
      ...novel,
      episodes: newEpisodes
    });
  };

  return (
    <div className="min-h-screen bg-background dark">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
            <p className="text-sm text-muted-foreground">{novel.title}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full max-w-4xl grid-cols-6 mb-8">
            <TabsTrigger value="home">
              <Icon name="Home" size={16} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="editor">
              <Icon name="Edit" size={16} className="mr-2" />
              Редактор
            </TabsTrigger>
            <TabsTrigger value="paths">
              <Icon name="GitBranch" size={16} className="mr-2" />
              Пути
            </TabsTrigger>
            <TabsTrigger value="library">
              <Icon name="BookMarked" size={16} className="mr-2" />
              Библиотека
            </TabsTrigger>
            <TabsTrigger value="visualization">
              <Icon name="Network" size={16} className="mr-2" />
              Визуализация
            </TabsTrigger>
            <TabsTrigger value="system">
              <Icon name="Settings" size={16} className="mr-2" />
              Система
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <HomePageEditor 
              homePage={novel.homePage || { greeting: 'Добро пожаловать', news: [] }} 
              onUpdate={(homePage) => onUpdate({ ...novel, homePage })}
            />
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Эпизоды</h2>
              <Button onClick={handleAddEpisode}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить эпизод
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-2">
                {novel.episodes.map((episode, index) => (
                  <div
                    key={episode.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEpisodeId === episode.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedEpisodeId(episode.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate flex-1 text-slate-50">{episode.title}</span>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveEpisode(episode.id, 'up');
                          }}
                        >
                          <Icon name="ChevronUp" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === novel.episodes.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveEpisode(episode.id, 'down');
                          }}
                        >
                          <Icon name="ChevronDown" size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEpisode(episode.id);
                          }}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs opacity-70 mt-1 text-slate-50">
                      {episode.paragraphs.length} параграфов
                    </p>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-3">
                {selectedEpisode ? (
                  <EpisodeEditor
                    episode={selectedEpisode}
                    novel={novel}
                    onUpdate={handleUpdateEpisode}
                    onNovelUpdate={onUpdate}
                  />
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    Выберите эпизод для редактирования
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="paths">
            <PathsManager 
              novel={novel}
              onUpdate={onUpdate} 
            />
          </TabsContent>

          <TabsContent value="library">
            <LibraryManager novel={novel} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="visualization">
            <NovelVisualization novel={novel} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="system">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Системные действия</h3>
                <div className="space-y-4">
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={() => {
                      if (confirm('Удалить все данные? Это действие нельзя отменить!')) {
                        localStorage.removeItem('visualNovel');
                        localStorage.removeItem('userSettings');
                        localStorage.removeItem('userProfile');
                        window.location.reload();
                      }
                    }}
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Очистить все данные приложения
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Удаляет все данные новеллы, настройки и профиль игрока. Приложение вернется к начальному состоянию.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminPanel;