import { useState, useTransition } from 'react';
import { Novel } from '@/types/novel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import NovelVisualization from './NovelVisualization';
import LibraryManager from './LibraryManager';
import HomePageEditor from './HomePageEditor';
import PathsManager from './PathsManager';
import BulkImportDialog from './BulkImportDialog';
import EpisodeEditor from '@/pages/EpisodeEditor';
import BackgroundImagesEditor from './BackgroundImagesEditor';
import AdminPanelHeader from './AdminPanel/AdminPanelHeader';
import EpisodeEditorTab from './AdminPanel/EpisodeEditorTab';
import SystemTab from './AdminPanel/SystemTab';

interface AdminPanelProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
  onLogout: () => void;
}

function AdminPanel({ novel, onUpdate, onLogout }: AdminPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    novel.episodes[0]?.id || null
  );
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [bulkEditEpisodes, setBulkEditEpisodes] = useState(false);
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<string>>(new Set());
  const selectedEpisode = novel.episodes.find(ep => ep.id === selectedEpisodeId);

  const handleEpisodeClickFromVisualization = (episodeId: string) => {
    setSelectedEpisodeId(episodeId);
    setActiveTab('editor');
  };

  const handleAddEpisode = () => {
    const timestamp = Date.now();
    const newEpisode = {
      id: `ep${timestamp}`,
      title: 'Новый эпизод',
      position: { x: 100 + novel.episodes.length * 50, y: 100 + novel.episodes.length * 50 },
      paragraphs: [
        {
          id: `p${timestamp}`,
          type: 'background' as const,
          url: 'https://cdn.poehali.dev/files/result (39)_1.png'
        },
        {
          id: `p${timestamp + 1}`,
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
    if (bulkEditEpisodes && selectedEpisodes.has(episodeId)) {
      const remaining = novel.episodes.filter(ep => !selectedEpisodes.has(ep.id));
      if (remaining.length === 0) {
        alert('Нельзя удалить все эпизоды');
        return;
      }
      const confirmed = confirm(`Удалить ${selectedEpisodes.size} эпизод(ов)?`);
      if (!confirmed) return;
      
      onUpdate({ ...novel, episodes: remaining });
      setSelectedEpisodes(new Set());
      setSelectedEpisodeId(remaining[0]?.id || null);
      return;
    }
    
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

    startTransition(() => {
      if (bulkEditEpisodes && selectedEpisodes.has(updatedEpisode.id)) {
        onUpdate({
          ...novel,
          episodes: novel.episodes.map(ep => {
            if (selectedEpisodes.has(ep.id)) {
              return { 
                ...ep, 
                timeframes: updatedEpisode.timeframes,
                requiredPaths: updatedEpisode.requiredPaths
              };
            }
            return ep;
          })
        });
      } else {
        onUpdate({
          ...novel,
          episodes: novel.episodes.map(ep => 
            ep.id === updatedEpisode.id ? updatedEpisode : ep
          )
        });
      }
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

  const handleToggleEpisodeSelect = (episodeId: string) => {
    const newSelected = new Set(selectedEpisodes);
    if (newSelected.has(episodeId)) {
      newSelected.delete(episodeId);
    } else {
      newSelected.add(episodeId);
    }
    setSelectedEpisodes(newSelected);
  };

  const handleSelectAllEpisodes = () => {
    if (selectedEpisodes.size === novel.episodes.length) {
      setSelectedEpisodes(new Set());
    } else {
      setSelectedEpisodes(new Set(novel.episodes.map(ep => ep.id)));
    }
  };

  const handleBulkEpisodeTimeframeChange = (timeframe: 'present' | 'retrospective', checked: boolean) => {
    const updatedEpisodes = novel.episodes.map(ep => {
      if (!selectedEpisodes.has(ep.id)) return ep;
      
      const current = ep.timeframes || [];
      const updated = checked
        ? [...current.filter(t => t !== timeframe), timeframe]
        : current.filter(t => t !== timeframe);
      
      return { ...ep, timeframes: updated.length > 0 ? updated : undefined };
    });
    
    onUpdate({ ...novel, episodes: updatedEpisodes });
  };

  const handleBulkDeleteEpisodes = () => {
    const remaining = novel.episodes.filter(ep => !selectedEpisodes.has(ep.id));
    if (remaining.length === 0) {
      alert('Нельзя удалить все эпизоды');
      return;
    }
    const confirmed = confirm(`Удалить ${selectedEpisodes.size} эпизод(ов)?`);
    if (!confirmed) return;
    
    onUpdate({ ...novel, episodes: remaining });
    setSelectedEpisodes(new Set());
    setSelectedEpisodeId(remaining[0]?.id || null);
  };

  const handleBulkEditChange = (checked: boolean) => {
    setBulkEditEpisodes(checked);
    if (!checked) setSelectedEpisodes(new Set());
  };

  return (
    <div className="min-h-screen bg-background dark">
      <AdminPanelHeader novelTitle={novel.title} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-5xl grid-cols-8 mb-8">
            <TabsTrigger value="home">
              <Icon name="Home" size={16} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="visual">
              <Icon name="Presentation" size={16} className="mr-2" />
              Слайды
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
            <TabsTrigger value="backgrounds">
              <Icon name="Image" size={16} className="mr-2" />
              Фоны
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

          <TabsContent value="visual">
            <div className="fixed inset-0 z-50 bg-background">
              <EpisodeEditor
                novel={novel}
                onSave={onUpdate}
                onClose={() => setActiveTab('editor')}
              />
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <EpisodeEditorTab
              novel={novel}
              selectedEpisode={selectedEpisode}
              selectedEpisodeId={selectedEpisodeId}
              bulkEditEpisodes={bulkEditEpisodes}
              selectedEpisodes={selectedEpisodes}
              onUpdate={onUpdate}
              onAddEpisode={handleAddEpisode}
              onDeleteEpisode={handleDeleteEpisode}
              onUpdateEpisode={handleUpdateEpisode}
              onMoveEpisode={handleMoveEpisode}
              onSelectEpisode={setSelectedEpisodeId}
              onToggleEpisodeSelect={handleToggleEpisodeSelect}
              onSelectAllEpisodes={handleSelectAllEpisodes}
              onBulkEpisodeTimeframeChange={handleBulkEpisodeTimeframeChange}
              onBulkDeleteEpisodes={handleBulkDeleteEpisodes}
              onShowBulkImport={() => setShowBulkImport(true)}
              onBulkEditChange={handleBulkEditChange}
            />
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

          <TabsContent value="backgrounds">
            <BackgroundImagesEditor novel={novel} onUpdate={onUpdate} />
          </TabsContent>

          <TabsContent value="visualization">
            <NovelVisualization 
              novel={novel} 
              onUpdate={onUpdate}
              onEpisodeClick={handleEpisodeClickFromVisualization}
            />
          </TabsContent>

          <TabsContent value="system">
            <SystemTab novel={novel} onUpdate={onUpdate} />
          </TabsContent>
        </Tabs>
      </div>

      <BulkImportDialog
        open={showBulkImport}
        novel={novel}
        onOpenChange={setShowBulkImport}
        onUpdate={onUpdate}
      />
    </div>
  );
}

export default AdminPanel;