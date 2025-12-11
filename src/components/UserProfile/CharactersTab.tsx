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
            <DialogContent className="max-w-lg bg-card/95 backdrop-blur-sm border-2 border-primary/30">
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
                  <div className="space-y-6">
                    <div className="flex gap-6">
                      <div className="w-40 h-52 flex-shrink-0 rounded-lg overflow-hidden border-2 border-primary/30 bg-muted/20">
                        {currentImage ? (
                          currentImage.startsWith('data:') || currentImage.startsWith('http') ? (
                            <ZoomableImage src={currentImage} alt={character.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-8xl">{currentImage}</div>
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="User" size={64} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold text-white">{character.name}</h2>
                        </div>
                        
                        {currentDescription && (
                          <div className="p-3 bg-card/50 border border-border rounded-lg">
                            <p className="text-sm text-muted-foreground leading-relaxed">{currentDescription}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="Calendar" size={16} />
                        <span>Впервые встречен: {new Date(character.firstMetAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="MapPin" size={16} />
                        <span>{episode?.title || 'Неизвестный эпизод'}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wide">Ваши заметки</h3>
                        {onProfileUpdate && !editingComment && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-primary/10"
                            onClick={() => {
                              setEditingComment(true);
                              setCommentText(character.comment || '');
                            }}
                          >
                            <Icon name={character.comment ? "Edit" : "Plus"} size={16} />
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
                          <Button 
                            size="sm" 
                            onClick={handleSaveComment}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                          >
                            <Icon name="Save" size={16} className="mr-2" />
                            Сохранить
                          </Button>
                          <p className="text-xs text-muted-foreground text-center">
                            Заметки сохраняются в вашем профиле и доступны с любого устройства.
                          </p>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="w-full" 
                            onClick={() => {
                              setEditingComment(false);
                              setCommentText('');
                            }}
                          >
                            Отмена
                          </Button>
                        </div>
                      ) : character.comment ? (
                        <div className="p-4 bg-card/30 border border-border rounded-lg text-sm text-foreground leading-relaxed">
                          {character.comment}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic text-center p-4 bg-muted/10 rounded-lg">
                          Здесь вы можете написать свои мысли о персонаже...
                        </p>
                      )}
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
