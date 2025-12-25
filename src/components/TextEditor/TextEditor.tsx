import { useState } from 'react';
import { Novel, Episode, Paragraph } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EpisodesList from './EpisodesList';
import ParagraphsList from './ParagraphsList';
import ParagraphEditor from './ParagraphEditor';

interface TextEditorProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
  onClose: () => void;
  onOpenVisualEditor: () => void;
}

export default function TextEditor({ novel, onUpdate, onClose, onOpenVisualEditor }: TextEditorProps) {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(
    novel.episodes[0]?.id || ''
  );
  const [selectedParagraphId, setSelectedParagraphId] = useState<string>('');

  const currentEpisode = novel.episodes.find(ep => ep.id === selectedEpisodeId);
  const currentParagraph = currentEpisode?.paragraphs.find(p => p.id === selectedParagraphId);

  const updateEpisode = (updates: Partial<Episode>) => {
    if (!currentEpisode) return;

    const updatedNovel: Novel = {
      ...novel,
      episodes: novel.episodes.map(ep =>
        ep.id === selectedEpisodeId ? { ...ep, ...updates } : ep
      )
    };

    onUpdate(updatedNovel);
  };

  const updateParagraph = (updates: Partial<Paragraph>) => {
    if (!currentEpisode || !currentParagraph) return;

    const updatedEpisode: Episode = {
      ...currentEpisode,
      paragraphs: currentEpisode.paragraphs.map(p =>
        p.id === currentParagraph.id ? { ...p, ...updates } : p
      )
    };

    updateEpisode(updatedEpisode);
  };

  const addParagraph = (type: Paragraph['type']) => {
    if (!currentEpisode) return;

    const newParagraph: Paragraph = {
      id: `para-${Date.now()}`,
      type,
      ...(type === 'text' && { content: 'Новый текст' }),
      ...(type === 'dialogue' && {
        characterName: 'Персонаж',
        text: 'Новый диалог'
      }),
      ...(type === 'choice' && {
        question: 'Выберите вариант',
        options: []
      }),
      ...(type === 'item' && {
        name: 'Предмет',
        description: 'Описание'
      })
    } as Paragraph;

    const updatedEpisode: Episode = {
      ...currentEpisode,
      paragraphs: [...currentEpisode.paragraphs, newParagraph]
    };

    updateEpisode(updatedEpisode);
    setSelectedParagraphId(newParagraph.id);
  };

  const deleteParagraph = (paragraphId: string) => {
    if (!currentEpisode) return;

    const updatedEpisode: Episode = {
      ...currentEpisode,
      paragraphs: currentEpisode.paragraphs.filter(p => p.id !== paragraphId)
    };

    updateEpisode(updatedEpisode);
    
    if (selectedParagraphId === paragraphId) {
      setSelectedParagraphId('');
    }
  };

  const addEpisode = () => {
    const newEpisode: Episode = {
      id: `episode-${Date.now()}`,
      title: 'Новый эпизод',
      paragraphs: [],
      position: { x: 0, y: 0 }
    };

    onUpdate({
      ...novel,
      episodes: [...novel.episodes, newEpisode]
    });

    setSelectedEpisodeId(newEpisode.id);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Хедер */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-semibold">Текстовый редактор</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onOpenVisualEditor}
            >
              <Icon name="Palette" size={16} className="mr-2" />
              Визуальный редактор
            </Button>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 flex overflow-hidden">
        {/* Левая панель - Эпизоды */}
        <div className="w-64 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <Button
              onClick={addEpisode}
              className="w-full"
              size="sm"
            >
              <Icon name="Plus" size={14} className="mr-2" />
              Новый эпизод
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <EpisodesList
              episodes={novel.episodes}
              selectedEpisodeId={selectedEpisodeId}
              onSelect={setSelectedEpisodeId}
              onUpdate={(id, updates) => {
                onUpdate({
                  ...novel,
                  episodes: novel.episodes.map(ep =>
                    ep.id === id ? { ...ep, ...updates } : ep
                  )
                });
              }}
            />
          </div>
        </div>

        {/* Центральная панель - Параграфы */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <Tabs defaultValue="paragraphs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paragraphs">Параграфы</TabsTrigger>
                <TabsTrigger value="add">Добавить</TabsTrigger>
              </TabsList>

              <TabsContent value="paragraphs" className="mt-4">
                {currentEpisode && (
                  <ParagraphsList
                    paragraphs={currentEpisode.paragraphs}
                    selectedParagraphId={selectedParagraphId}
                    onSelect={setSelectedParagraphId}
                    onDelete={deleteParagraph}
                  />
                )}
              </TabsContent>

              <TabsContent value="add" className="mt-4 space-y-2">
                <Button
                  onClick={() => addParagraph('text')}
                  className="w-full justify-start"
                  variant="outline"
                  size="sm"
                >
                  <Icon name="FileText" size={14} className="mr-2" />
                  Текст
                </Button>
                <Button
                  onClick={() => addParagraph('dialogue')}
                  className="w-full justify-start"
                  variant="outline"
                  size="sm"
                >
                  <Icon name="MessageCircle" size={14} className="mr-2" />
                  Диалог
                </Button>
                <Button
                  onClick={() => addParagraph('choice')}
                  className="w-full justify-start"
                  variant="outline"
                  size="sm"
                >
                  <Icon name="GitBranch" size={14} className="mr-2" />
                  Выбор
                </Button>
                <Button
                  onClick={() => addParagraph('item')}
                  className="w-full justify-start"
                  variant="outline"
                  size="sm"
                >
                  <Icon name="Package" size={14} className="mr-2" />
                  Предмет
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Правая панель - Редактор параграфа */}
        <div className="flex-1 overflow-y-auto bg-background">
          {currentParagraph ? (
            <ParagraphEditor
              paragraph={currentParagraph}
              onUpdate={updateParagraph}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <Icon name="FileText" size={48} className="mx-auto opacity-20" />
                <p className="text-sm">Выберите параграф для редактирования</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
