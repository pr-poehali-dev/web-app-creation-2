import { useState } from 'react';
import { Novel, Episode, Paragraph } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SlideCanvas from './SlideCanvas';
import SlidesList from './SlidesList';
import SlideProperties from './SlideProperties';

interface SlideEditorProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
  onClose: () => void;
}

export default function SlideEditor({ novel, onUpdate, onClose }: SlideEditorProps) {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(
    novel.episodes[0]?.id || ''
  );
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number>(0);
  const [zoom, setZoom] = useState(1);

  const currentEpisode = novel.episodes.find(ep => ep.id === selectedEpisodeId);
  const currentParagraph = currentEpisode?.paragraphs[selectedParagraphIndex];

  const updateParagraph = (updates: Partial<Paragraph>) => {
    if (!currentEpisode) return;

    const updatedEpisode: Episode = {
      ...currentEpisode,
      paragraphs: currentEpisode.paragraphs.map((p, idx) =>
        idx === selectedParagraphIndex ? { ...p, ...updates } : p
      )
    };

    const updatedNovel: Novel = {
      ...novel,
      episodes: novel.episodes.map(ep =>
        ep.id === selectedEpisodeId ? updatedEpisode : ep
      )
    };

    onUpdate(updatedNovel);
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
      ...(type === 'background' && {
        url: '',
        objectFit: 'cover',
        objectPosition: 'center'
      }),
      ...(type === 'image' && {
        url: '',
        alt: 'Изображение'
      }),
      ...(type === 'choice' && {
        question: 'Выберите вариант',
        options: []
      })
    } as Paragraph;

    const updatedEpisode: Episode = {
      ...currentEpisode,
      paragraphs: [...currentEpisode.paragraphs, newParagraph]
    };

    const updatedNovel: Novel = {
      ...novel,
      episodes: novel.episodes.map(ep =>
        ep.id === selectedEpisodeId ? updatedEpisode : ep
      )
    };

    onUpdate(updatedNovel);
    setSelectedParagraphIndex(currentEpisode.paragraphs.length);
  };

  const deleteParagraph = () => {
    if (!currentEpisode || currentEpisode.paragraphs.length <= 1) return;

    const updatedEpisode: Episode = {
      ...currentEpisode,
      paragraphs: currentEpisode.paragraphs.filter(
        (_, idx) => idx !== selectedParagraphIndex
      )
    };

    const updatedNovel: Novel = {
      ...novel,
      episodes: novel.episodes.map(ep =>
        ep.id === selectedEpisodeId ? updatedEpisode : ep
      )
    };

    onUpdate(updatedNovel);
    setSelectedParagraphIndex(Math.max(0, selectedParagraphIndex - 1));
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Редактор слайдов</h1>
            <p className="text-xs text-muted-foreground">
              {currentEpisode?.title || 'Эпизод'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEpisodeId}
            onChange={(e) => {
              setSelectedEpisodeId(e.target.value);
              setSelectedParagraphIndex(0);
            }}
            className="px-3 py-1.5 rounded-md border bg-background text-sm"
          >
            {novel.episodes.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.title}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 px-3">
            <Icon name="ZoomOut" size={16} />
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-24"
            />
            <Icon name="ZoomIn" size={16} />
            <span className="text-xs text-muted-foreground w-12">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <div className="w-16 border-r flex flex-col items-center py-4 gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addParagraph('text')}
            title="Добавить текст"
          >
            <Icon name="Type" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addParagraph('dialogue')}
            title="Добавить диалог"
          >
            <Icon name="MessageSquare" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addParagraph('background')}
            title="Добавить фон"
          >
            <Icon name="Image" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addParagraph('image')}
            title="Добавить изображение"
          >
            <Icon name="ImagePlus" size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => addParagraph('choice')}
            title="Добавить выбор"
          >
            <Icon name="GitBranch" size={20} />
          </Button>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={deleteParagraph}
            title="Удалить слайд"
            className="text-destructive"
          >
            <Icon name="Trash2" size={20} />
          </Button>
        </div>

        {/* Slides List */}
        <SlidesList
          episode={currentEpisode}
          selectedIndex={selectedParagraphIndex}
          onSelect={setSelectedParagraphIndex}
        />

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-[#0a0f14]">
          <SlideCanvas
            paragraph={currentParagraph}
            zoom={zoom}
            onUpdate={updateParagraph}
          />
        </div>

        {/* Properties Panel */}
        {currentParagraph && (
          <SlideProperties
            paragraph={currentParagraph}
            onUpdate={updateParagraph}
          />
        )}
      </div>
    </div>
  );
}
