import { useState } from 'react';
import { AudioTrack, AudioTimecode } from '@/types/scene';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AudioEditorProps {
  audioTracks: AudioTrack[];
  layers: { id: string; name: string }[];
  onUpdate: (tracks: AudioTrack[]) => void;
}

export default function AudioEditor({ audioTracks, layers, onUpdate }: AudioEditorProps) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(
    audioTracks.length > 0 ? audioTracks[0].id : null
  );

  const addTrack = () => {
    const newTrack: AudioTrack = {
      id: `audio-${Date.now()}`,
      url: '',
      name: `Трек ${audioTracks.length + 1}`,
      volume: 0.8,
      loop: false,
      timecodes: [],
      crossfadeIn: 0,
      crossfadeOut: 0
    };

    onUpdate([...audioTracks, newTrack]);
    setSelectedTrackId(newTrack.id);
  };

  const updateTrack = (trackId: string, updates: Partial<AudioTrack>) => {
    onUpdate(audioTracks.map(t => (t.id === trackId ? { ...t, ...updates } : t)));
  };

  const deleteTrack = (trackId: string) => {
    onUpdate(audioTracks.filter(t => t.id !== trackId));
    if (selectedTrackId === trackId) {
      setSelectedTrackId(audioTracks.length > 1 ? audioTracks[0].id : null);
    }
  };

  const addTimecode = (trackId: string) => {
    const track = audioTracks.find(t => t.id === trackId);
    if (!track) return;

    const newTimecode: AudioTimecode = {
      time: 0,
      text: 'Текст',
      action: 'highlight'
    };

    updateTrack(trackId, {
      timecodes: [...track.timecodes, newTimecode]
    });
  };

  const updateTimecode = (trackId: string, index: number, updates: Partial<AudioTimecode>) => {
    const track = audioTracks.find(t => t.id === trackId);
    if (!track) return;

    const newTimecodes = [...track.timecodes];
    newTimecodes[index] = { ...newTimecodes[index], ...updates };

    updateTrack(trackId, { timecodes: newTimecodes });
  };

  const deleteTimecode = (trackId: string, index: number) => {
    const track = audioTracks.find(t => t.id === trackId);
    if (!track) return;

    updateTrack(trackId, {
      timecodes: track.timecodes.filter((_, i) => i !== index)
    });
  };

  const selectedTrack = audioTracks.find(t => t.id === selectedTrackId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Аудио-треки и синхронизация</h3>
        <Button onClick={addTrack}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить трек
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 col-span-1">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {audioTracks.map(track => (
                <div
                  key={track.id}
                  className={`p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                    selectedTrackId === track.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedTrackId(track.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Icon name="Music" size={16} className="inline mr-2" />
                      <span className="text-sm">{track.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTrack(track.id);
                      }}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {selectedTrack && (
          <Card className="p-4 col-span-3">
            <ScrollArea className="h-96">
              <div className="space-y-6">
                <div>
                  <Label className="text-xs">Название трека</Label>
                  <Input
                    value={selectedTrack.name}
                    onChange={(e) => updateTrack(selectedTrack.id, { name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">URL аудио</Label>
                  <Input
                    value={selectedTrack.url}
                    onChange={(e) => updateTrack(selectedTrack.id, { url: e.target.value })}
                    placeholder="https://example.com/audio.mp3"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Громкость: {Math.round(selectedTrack.volume * 100)}%</Label>
                  <Slider
                    value={[selectedTrack.volume]}
                    onValueChange={([v]) => updateTrack(selectedTrack.id, { volume: v })}
                    min={0}
                    max={1}
                    step={0.01}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Crossfade In (сек)</Label>
                    <Input
                      type="number"
                      value={selectedTrack.crossfadeIn}
                      onChange={(e) => updateTrack(selectedTrack.id, { crossfadeIn: parseFloat(e.target.value) })}
                      step={0.1}
                      min={0}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Crossfade Out (сек)</Label>
                    <Input
                      type="number"
                      value={selectedTrack.crossfadeOut}
                      onChange={(e) => updateTrack(selectedTrack.id, { crossfadeOut: parseFloat(e.target.value) })}
                      step={0.1}
                      min={0}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTrack.loop}
                    onChange={(e) => updateTrack(selectedTrack.id, { loop: e.target.checked })}
                    className="rounded"
                  />
                  <Label className="text-xs">Зациклить</Label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold">Таймкоды</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimecode(selectedTrack.id)}
                    >
                      <Icon name="Plus" size={14} className="mr-1" />
                      Добавить
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {selectedTrack.timecodes.map((timecode, index) => (
                      <Card key={index} className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Время (сек)</Label>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => deleteTimecode(selectedTrack.id, index)}
                            >
                              <Icon name="X" size={14} />
                            </Button>
                          </div>
                          
                          <Input
                            type="number"
                            value={timecode.time}
                            onChange={(e) =>
                              updateTimecode(selectedTrack.id, index, {
                                time: parseFloat(e.target.value)
                              })
                            }
                            step={0.1}
                            className="text-xs"
                          />

                          <div>
                            <Label className="text-xs">Текст</Label>
                            <Input
                              value={timecode.text || ''}
                              onChange={(e) =>
                                updateTimecode(selectedTrack.id, index, { text: e.target.value })
                              }
                              className="mt-1 text-xs"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Действие</Label>
                            <select
                              value={timecode.action}
                              onChange={(e) =>
                                updateTimecode(selectedTrack.id, index, {
                                  action: e.target.value as any
                                })
                              }
                              className="w-full mt-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                            >
                              <option value="highlight">Подсветить</option>
                              <option value="show">Показать</option>
                              <option value="hide">Скрыть</option>
                              <option value="animate">Анимировать</option>
                            </select>
                          </div>

                          {timecode.action !== undefined && (
                            <div>
                              <Label className="text-xs">Слой</Label>
                              <select
                                value={timecode.layerId || ''}
                                onChange={(e) =>
                                  updateTimecode(selectedTrack.id, index, {
                                    layerId: e.target.value || undefined
                                  })
                                }
                                className="w-full mt-1 rounded-md border border-input bg-background px-2 py-1 text-xs"
                              >
                                <option value="">Не выбрано</option>
                                {layers.map(layer => (
                                  <option key={layer.id} value={layer.id}>
                                    {layer.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}
