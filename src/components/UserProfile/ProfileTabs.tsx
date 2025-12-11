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
                      <Card 
                        key={character.id} 
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedCharacter(character.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-secondary/30 rounded-full overflow-hidden border-2 border-primary/20">
                              {currentImage ? (
                                currentImage.startsWith('data:') || currentImage.startsWith('http') ? (
                                  <img src={currentImage} alt={character.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="text-4xl md:text-5xl">{currentImage}</div>
                                )
                              ) : (
                                <Icon name="User" size={32} className="text-secondary" />
                              )}
                            </div>
                            <h4 className="font-semibold text-foreground text-sm">{character.name}</h4>
                          </div>
                        </CardContent>
                      </Card>
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
                  <DialogContent className="max-w-md">
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
                        <>
                          <DialogHeader>
                            <DialogTitle className="text-2xl">{character.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-center">
                              <div className="w-32 h-32 flex items-center justify-center bg-secondary/30 rounded-full overflow-hidden border-4 border-primary/30">
                                {currentImage ? (
                                  currentImage.startsWith('data:') || currentImage.startsWith('http') ? (
                                    <ZoomableImage src={currentImage} alt={character.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-6xl">{currentImage}</div>
                                  )
                                ) : (
                                  <Icon name="User" size={64} className="text-secondary" />
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                              {currentDescription && (
                                <div className="p-3 bg-secondary/20 rounded-lg">
                                  <p className="text-muted-foreground">{currentDescription}</p>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon name="Calendar" size={16} />
                                <span>Впервые встречен: {new Date(character.firstMetAt).toLocaleDateString('ru-RU')}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon name="MapPin" size={16} />
                                <span>{episode?.title || 'Неизвестный эпизод'}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold">Ваши заметки:</Label>
                                {onProfileUpdate && !editingComment && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
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
                                <div className="space-y-2">
                                  <Textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Добавьте заметку о персонаже..."
                                    rows={4}
                                    className="text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={handleSaveComment}>
                                      Сохранить
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onClick={() => {
                                        setEditingComment(false);
                                        setCommentText('');
                                      }}
                                    >
                                      Отмена
                                    </Button>
                                  </div>
                                </div>
                              ) : character.comment ? (
                                <div className="p-3 bg-secondary/20 rounded-lg text-sm text-foreground">
                                  {character.comment}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">Нет заметок</p>
                              )}
                            </div>
                          </div>
                        </>
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