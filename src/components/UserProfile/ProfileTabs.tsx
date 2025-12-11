import { useState } from 'react';
import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { getParagraphNumber } from '@/utils/paragraphNumbers';
import ZoomableImage from '../ZoomableImage';

interface ProfileTabsProps {
  profile: UserProfile;
  novel: Novel;
  achievements: Array<{ id: string; name: string; description: string; completed: boolean }>;
  username?: string;
  onDeleteBookmark: (bookmarkId: string) => void;
  onNavigateTo?: (episodeId: string, paragraphIndex: number) => void;
  onProfileUpdate?: (profile: UserProfile) => void;
}

const AUTH_API = 'https://functions.poehali.dev/f895202d-2b99-4eae-a334-8b273bf2cbd1';

function ProfileTabs({ profile, novel, achievements, username, onDeleteBookmark, onNavigateTo, onProfileUpdate }: ProfileTabsProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Заполните все поля');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('Пароль должен быть минимум 4 символа');
      return;
    }

    if (!username) {
      setPasswordError('Имя пользователя не найдено');
      return;
    }

    try {
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          username,
          old_password: oldPassword,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || 'Ошибка при смене пароля');
        return;
      }

      setPasswordSuccess('Пароль успешно изменен');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError('Ошибка соединения с сервером');
    }
  };

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
      <CardContent className="p-6">
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="achievements" className="flex items-center gap-1">
              <Icon name="Trophy" size={16} />
              <span className="hidden md:inline">Достижения</span>
            </TabsTrigger>
            <TabsTrigger value="paths" className="flex items-center gap-1">
              <Icon name="GitBranch" size={16} />
              <span className="hidden md:inline">Пути</span>
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-1">
              <Icon name="Bookmark" size={16} />
              <span className="hidden md:inline">Закладки</span>
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-1">
              <Icon name="Package" size={16} />
              <span className="hidden md:inline">Предметы</span>
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-1">
              <Icon name="Users" size={16} />
              <span className="hidden md:inline">Персонажи</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Icon name="Lock" size={16} />
              <span className="hidden md:inline">Безопасность</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border transition-all ${
                    achievement.completed
                      ? 'bg-primary/10 border-primary/30'
                      : 'bg-muted/30 border-border opacity-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.completed
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {achievement.completed ? (
                        <Icon name="Trophy" size={20} />
                      ) : (
                        <Icon name="Lock" size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="paths" className="mt-6">
            {profile.activePaths && profile.activePaths.length > 0 ? (
              <div className="space-y-3">
                {profile.activePaths.map((pathId) => {
                  const path = novel.paths?.find(p => p.id === pathId);
                  return path ? (
                    <div key={pathId} className="p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-2">
                        <Icon name="GitBranch" size={16} className="text-primary" />
                        <h4 className="font-semibold text-foreground">{path.name}</h4>
                      </div>
                      {path.description && (
                        <p className="text-sm text-muted-foreground mt-2">{path.description}</p>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Нет активных путей</p>
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6">
            {profile.bookmarks.length > 0 ? (
              profile.bookmarks.map((bookmark) => {
                const episode = novel.episodes.find(ep => ep.id === bookmark.episodeId);
                return (
                  <Card key={bookmark.id} className="mb-3">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="Bookmark" size={16} className="text-primary" />
                            <h4 className="font-semibold text-foreground">{episode?.title || 'Неизвестный эпизод'}</h4>
                            <span className="text-xs text-muted-foreground">
                              {getParagraphNumber(novel, bookmark.episodeId, bookmark.paragraphIndex)}
                            </span>
                          </div>
                          {bookmark.comment && (
                            <p className="text-sm text-muted-foreground">{bookmark.comment}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(bookmark.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {onNavigateTo && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onNavigateTo(bookmark.episodeId, bookmark.paragraphIndex)}
                            >
                              <Icon name="Play" size={16} />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => onDeleteBookmark(bookmark.id)}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p className="text-center py-8 text-muted-foreground">Нет сохранённых закладок</p>
            )}
          </TabsContent>

          <TabsContent value="items" className="mt-6">
            {profile.collectedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.collectedItems.map((item) => {
                  const episode = novel.episodes.find(ep => ep.id === item.episodeId);
                  return (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 flex items-center justify-center bg-secondary/30 rounded-lg">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Icon name="Package" size={24} className="text-secondary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              <Icon name="MapPin" size={12} className="inline mr-1" />
                              {episode?.title || 'Неизвестный эпизод'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Вы ещё не собрали предметов</p>
            )}
          </TabsContent>

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
                                <h2 className="text-2xl font-bold text-foreground mb-1">{character.name}</h2>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Возраст: 20</p>
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
                              <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">Ваши заметки</h3>
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
              <p className="text-center py-8 text-muted-foreground">Вы ещё не встретили персонажей</p>
            )}
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Смена пароля</h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="old-password">Текущий пароль</Label>
                    <Input
                      id="old-password"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Введите текущий пароль"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Новый пароль</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Минимум 4 символа"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Введите пароль еще раз"
                    />
                  </div>
                  {passwordError && (
                    <div className="text-sm text-destructive">{passwordError}</div>
                  )}
                  {passwordSuccess && (
                    <div className="text-sm text-green-500">{passwordSuccess}</div>
                  )}
                  <Button onClick={handlePasswordChange} className="w-full">
                    Изменить пароль
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ProfileTabs;