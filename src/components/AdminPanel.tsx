import { useState } from 'react';
import { Novel } from '@/types/novel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import EpisodeEditor from './EpisodeEditor';
import NovelVisualization from './NovelVisualization';

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
    <div className="min-h-screen bg-background dark">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Админ-панель</h1>
            <p className="text-sm text-muted-foreground">{novel.title}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="editor">
              <Icon name="Edit" size={16} className="mr-2" />
              Редактор
            </TabsTrigger>
            <TabsTrigger value="visualization">
              <Icon name="Network" size={16} className="mr-2" />
              Визуализация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Эпизоды</h2>
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
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedEpisodeId === episode.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border hover:border-primary/50'
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
                    onUpdate={handleUpdateEpisode}
                  />
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    Выберите эпизод для редактирования
                  </div>
                )}
              </div>
            </div>
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
