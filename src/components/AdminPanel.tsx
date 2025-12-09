import { useState } from 'react';
import { Novel } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import EpisodeEditor from './EpisodeEditor';
import NovelVisualization from './NovelVisualization';
import LibraryManager from './LibraryManager';
import HomePageEditor from './HomePageEditor';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Админ-панель</h1>
            <p className="text-sm text-muted-foreground mt-1">{novel.title}</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="border-2 hover:bg-primary/10">
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full max-w-4xl grid-cols-4 mb-8 bg-card/50 backdrop-blur-sm border border-border/50 p-2 rounded-2xl shadow-xl">
            <TabsTrigger value="home">
              <Icon name="Home" size={16} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="editor">
              <Icon name="Edit" size={16} className="mr-2" />
              Редактор
            </TabsTrigger>
            <TabsTrigger value="library">
              <Icon name="BookMarked" size={16} className="mr-2" />
              Библиотека
            </TabsTrigger>
            <TabsTrigger value="visualization">
              <Icon name="Network" size={16} className="mr-2" />
              Визуализация
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
                {novel.episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all shadow-lg hover:shadow-xl ${
                      selectedEpisodeId === episode.id
                        ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary shadow-primary/30'
                        : 'bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:scale-[1.02]'
                    }`}
                    onClick={() => setSelectedEpisodeId(episode.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{episode.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEpisode(episode.id);
                        }}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                    <p className="text-xs opacity-70 mt-1">
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

          <TabsContent value="library">
            <LibraryManager novel={novel} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="visualization">
            <NovelVisualization novel={novel} onUpdate={onUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AdminPanel;