import { useState } from 'react';
import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { selectAndConvertImage } from '@/utils/fileHelpers';
import { getParagraphNumber } from '@/utils/paragraphNumbers';

interface UserProfilePanelProps {
  profile: UserProfile;
  novel: Novel;
  onUpdate: (profile: UserProfile) => void;
  onBack: () => void;
  onNavigateTo?: (episodeId: string, paragraphIndex: number) => void;
}

function UserProfilePanel({ profile, novel, onUpdate, onBack, onNavigateTo }: UserProfilePanelProps) {
  const [isEditingName, setIsEditingName] = useState(false);

  const handleDeleteBookmark = (bookmarkId: string) => {
    onUpdate({
      ...profile,
      bookmarks: profile.bookmarks.filter(b => b.id !== bookmarkId)
    });
  };

  const totalEpisodes = novel.episodes.length;
  const completedEpisodes = profile.completedEpisodes.length;
  const progressPercentage = totalEpisodes > 0 ? Math.round((completedEpisodes / totalEpisodes) * 100) : 0;

  const formatReadTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const handleAvatarUpload = async () => {
    const imageBase64 = await selectAndConvertImage();
    if (imageBase64) {
      onUpdate({ ...profile, avatar: imageBase64 });
    }
  };

  const handleNameUpdate = (newName: string) => {
    if (newName.trim()) {
      onUpdate({ ...profile, name: newName.trim() });
    }
    setIsEditingName(false);
  };

  const achievements = [
    { id: 'first_step', name: 'Первый шаг', description: 'Начать чтение', completed: completedEpisodes > 0 || novel.currentParagraphIndex > 0 },
    { id: 'half_way', name: 'На полпути', description: 'Пройти 50% эпизодов', completed: progressPercentage >= 50 },
    { id: 'completionist', name: 'Перфекционист', description: 'Завершить все эпизоды', completed: progressPercentage === 100 },
    { id: 'night_owl', name: 'Ночной читатель', description: 'Читать более 60 минут', completed: profile.totalReadTime >= 60 },
  ];

  return (
    <div className="min-h-screen bg-background p-4 dark">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-8 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Профиль</h1>
          <div className="w-10" />
        </header>

        <Card className="mb-6 animate-fade-in">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative group">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-4xl bg-primary/20 text-primary">
                    {profile.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  onClick={handleAvatarUpload}
                >
                  <Icon name="Camera" size={16} />
                </Button>
              </div>

              <div className="flex-1 text-center md:text-left">
                {isEditingName ? (
                  <Input
                    defaultValue={profile.name}
                    onBlur={(e) => handleNameUpdate(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameUpdate(e.currentTarget.value);
                    }}
                    autoFocus
                    className="text-3xl font-bold mb-2 text-foreground"
                  />
                ) : (
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <h2 className="text-3xl font-bold text-foreground">{profile.name}</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}>
                      <Icon name="Edit" size={16} />
                    </Button>
                  </div>
                )}
                
                <p className="text-muted-foreground mb-4">
                  Читатель с {new Date(profile.createdAt).toLocaleDateString('ru-RU')}
                </p>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{completedEpisodes}</div>
                    <div className="text-xs text-muted-foreground">Пройдено</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">{totalEpisodes}</div>
                    <div className="text-xs text-muted-foreground">Всего</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-foreground">{formatReadTime(profile.totalReadTime)}</div>
                    <div className="text-xs text-muted-foreground">Время</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Прогресс новеллы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {completedEpisodes} из {totalEpisodes} эпизодов
                </span>
                <span className="font-bold text-primary">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold text-foreground mb-3">Пройденные эпизоды</h3>
              {profile.completedEpisodes.length > 0 ? (
                <div className="space-y-2">
                  {profile.completedEpisodes.map((episodeId) => {
                    const episode = novel.episodes.find(ep => ep.id === episodeId);
                    return episode ? (
                      <div key={episodeId} className="flex items-center gap-2 text-sm">
                        <Icon name="CheckCircle" size={16} className="text-green-500" />
                        <span className="text-foreground">{episode.title}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Вы ещё не завершили ни одного эпизода</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <Tabs defaultValue="achievements" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
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
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{achievement.name}</h4>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="paths" className="mt-6">
                {(profile.activePaths && profile.activePaths.length > 0) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(novel.paths || []).filter(path => profile.activePaths?.includes(path.id)).map(path => (
                      <Card key={path.id} className="border-2" style={{ borderColor: path.color || undefined }}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ 
                                backgroundColor: path.color ? `${path.color}20` : undefined,
                                color: path.color || undefined
                              }}
                            >
                              <Icon name="GitBranch" size={20} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">{path.name}</h4>
                              {path.description && (
                                <p className="text-xs text-muted-foreground">{path.description}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="GitBranch" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Вы ещё не активировали ни одного пути</p>
                    <p className="text-xs text-muted-foreground mt-2">Пути активируются при выборе определённых вариантов</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bookmarks" className="mt-6 space-y-3">
                {profile.bookmarks.length > 0 ? (
                  profile.bookmarks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((bookmark) => {
                    const episode = novel.episodes.find(ep => ep.id === bookmark.episodeId);
                    return (
                      <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Icon name="Bookmark" size={16} className="text-primary" />
                                <span className="text-sm font-medium text-foreground">
                                  {episode?.title || 'Неизвестный эпизод'}
                                </span>
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
                                onClick={() => handleDeleteBookmark(bookmark.id)}
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
                                {item.imageUrl?.startsWith('data:') ? (
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  <span className="text-2xl">{item.imageUrl || '📦'}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                                <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                                <p className="text-xs text-muted-foreground">
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
                  <p className="text-center py-8 text-muted-foreground">Предметы ещё не найдены</p>
                )}
              </TabsContent>

              <TabsContent value="characters" className="mt-6">
                {profile.metCharacters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.metCharacters.map((character) => {
                      const episode = novel.episodes.find(ep => ep.id === character.episodeId);
                      return (
                        <Card key={character.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-16 h-16 flex items-center justify-center bg-secondary/30 rounded-full">
                                {character.image?.startsWith('data:') ? (
                                  <img src={character.image} alt={character.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  <span className="text-3xl">{character.image || '👤'}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground mb-1">{character.name}</h4>
                                <p className="text-xs text-muted-foreground mb-2">
                                  Впервые встречен: {new Date(character.firstMetAt).toLocaleDateString('ru-RU')}
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <Icon name="MapPin" size={12} className="inline mr-1" />
                                  {episode?.title || 'Неизвестный эпизод'}
                                </p>
                                {character.comment && (
                                  <p className="text-sm text-foreground mt-2 p-2 bg-secondary/20 rounded">
                                    {character.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">Вы ещё не встретили персонажей</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="animate-fade-in mt-6" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className="text-foreground">Управление прогрессом</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => {
                if (confirm('Сбросить весь прогресс игрока? Это действие нельзя отменить!')) {
                  onUpdate({
                    name: profile.name,
                    avatar: profile.avatar,
                    level: 1,
                    completedEpisodes: [],
                    totalReadTime: 0,
                    bookmarks: [],
                    achievements: [],
                    collectedItems: [],
                    metCharacters: [],
                    createdAt: profile.createdAt
                  });
                }
              }}
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Сбросить весь прогресс
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserProfilePanel;