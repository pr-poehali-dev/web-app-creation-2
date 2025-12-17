import { useState } from 'react';
import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import ZoomableImage from '../ZoomableImage';

interface CharactersTabProps {
  profile: UserProfile;
  novel: Novel;
  onProfileUpdate?: (profile: UserProfile) => void;
}

function CharactersTab({ profile, novel, onProfileUpdate }: CharactersTabProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState(false);
  const [commentText, setCommentText] = useState('');

  return (
    <TabsContent value="characters" className="mt-6">
      {profile.metCharacters.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profile.metCharacters.map((character) => {
              // Синхронизируем изображение с библиотекой
              const libraryCharacter = novel.library.characters.find(
                c => c.name === character.name
              );
              const currentImage = libraryCharacter?.defaultImage || character.image;
              
              return (
                <div
                  key={character.id}
                  className="cursor-pointer group relative"
                  onClick={() => setSelectedCharacter(character.id)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg border-2 border-border bg-card/50 backdrop-blur-sm transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20">
                    {currentImage ? (
                      currentImage.startsWith('data:') || currentImage.startsWith('http') ? (
                        <img src={currentImage} alt={character.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl md:text-8xl">{currentImage}</div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/30">
                        <Icon name="User" size={48} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="font-bold text-white text-sm md:text-base drop-shadow-lg">{character.name}</h4>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Dialog open={!!selectedCharacter} onOpenChange={(open) => {
            if (!open) {
              setSelectedCharacter(null);
              setEditingComment(false);
              setCommentText('');
            }
          }}>
            <DialogContent className="max-w-6xl bg-card/95 backdrop-blur-sm border-2 border-primary/30 p-0 overflow-hidden">
              {selectedCharacter && (() => {
                const character = profile.metCharacters.find(c => c.id === selectedCharacter);
                const episode = novel.episodes.find(ep => ep.id === character?.episodeId);
                if (!character) return null;
                
                // Синхронизируем изображение и описание с библиотекой
                const libraryCharacter = novel.library.characters.find(
                  c => c.name === character.name
                );
                const currentImage = libraryCharacter?.defaultImage || character.image;
                const currentDescription = libraryCharacter?.description;
                const characterImages = libraryCharacter?.images || [];
                
                const handleSaveComment = () => {
                  if (!onProfileUpdate) return;
                  
                  const updatedCharacters = profile.metCharacters.map(c => 
                    c.id === character.id ? { ...c, comment: commentText } : c
                  );
                  
                  onProfileUpdate({
                    ...profile,
                    metCharacters: updatedCharacters
                  });
                  
                  setEditingComment(false);
                };
                
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[85vh] lg:max-h-full overflow-y-auto lg:overflow-hidden scrollbar-hide">
                    <div className="relative bg-muted/30 p-6 lg:p-8 flex items-center justify-center min-h-[400px] lg:min-h-[600px]">
                      <div className="w-full h-full max-w-md max-h-[500px] rounded-xl overflow-hidden shadow-2xl border-4 border-primary/20">
                        {currentImage ? (
                          currentImage.startsWith('data:') || currentImage.startsWith('http') ? (
                            <ZoomableImage src={currentImage} alt={character.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-9xl bg-gradient-to-br from-primary/20 to-secondary/20">{currentImage}</div>
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                            <Icon name="User" size={120} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col h-full max-h-[80vh] lg:max-h-full">
                      <div className="border-b border-border/50 p-4 lg:p-6 bg-gradient-to-r from-primary/10 to-transparent">
                        {characterImages.length > 0 && (
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {characterImages.slice(0, 6).map((img) => (
                              <div key={img.id} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all cursor-pointer group">
                                <ZoomableImage src={img.url} alt={img.name || character.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              </div>
                            ))}
                            {characterImages.length > 6 && (
                              <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">
                                +{characterImages.length - 6}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scrollbar-hide">
                        <div className="flex gap-4 items-start">
                          {currentImage && (
                            <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg">
                              {currentImage.startsWith('data:') || currentImage.startsWith('http') ? (
                                <img src={currentImage} alt={character.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-primary/20 to-secondary/20">{currentImage}</div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{character.name}</h2>
                            {currentDescription && (
                              <p className="text-sm text-muted-foreground leading-relaxed">{currentDescription}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 bg-card/50 border border-border/50 rounded-lg flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <Icon name="Calendar" size={18} className="text-primary" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider">Первая встреча</div>
                              <div className="text-sm font-semibold text-white">{new Date(character.firstMetAt).toLocaleDateString('ru-RU')}</div>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-card/50 border border-border/50 rounded-lg flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                              <Icon name="MapPin" size={18} className="text-secondary" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider">Локация</div>
                              <div className="text-sm font-semibold text-white">{episode?.title || 'Неизвестно'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/50 p-4 lg:p-6 bg-muted/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Icon name="FileText" size={18} className="text-primary" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ваши заметки</h3>
                          </div>
                          {onProfileUpdate && !editingComment && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-primary/10 h-8 px-3"
                              onClick={() => {
                                setEditingComment(true);
                                setCommentText(character.comment || '');
                              }}
                            >
                              <Icon name={character.comment ? "Edit" : "Plus"} size={14} />
                            </Button>
                          )}
                        </div>
                        
                        {editingComment ? (
                          <div className="space-y-3">
                            <Textarea
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Здесь вы можете написать свои мысли о персонаже..."
                              rows={4}
                              className="text-sm bg-card/30 border-border resize-none"
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={handleSaveComment}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                              >
                                <Icon name="Save" size={16} className="mr-2" />
                                Сохранить
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="px-4" 
                                onClick={() => {
                                  setEditingComment(false);
                                  setCommentText('');
                                }}
                              >
                                Отмена
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-card/30 border border-border/50 rounded-lg min-h-[100px]">
                            {character.comment ? (
                              <p className="text-sm text-muted-foreground leading-relaxed italic">{character.comment}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground/50 italic">Нет заметок о персонаже</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <p className="text-center py-8 text-muted-foreground">Вы еще не встретили ни одного персонажа</p>
      )}
    </TabsContent>
  );
}

export default CharactersTab;