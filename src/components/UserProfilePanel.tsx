import { useState } from 'react';
import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { selectAndConvertImage } from '@/utils/fileHelpers';

interface UserProfilePanelProps {
  profile: UserProfile;
  novel: Novel;
  onUpdate: (profile: UserProfile) => void;
  onBack: () => void;
}

function UserProfilePanel({ profile, novel, onUpdate, onBack }: UserProfilePanelProps) {
  const [isEditingName, setIsEditingName] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 dark">
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
          <CardHeader>
            <CardTitle className="text-foreground">Достижения</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserProfilePanel;
