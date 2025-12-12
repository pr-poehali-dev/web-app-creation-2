import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import ProfileHeader from './UserProfile/ProfileHeader';
import ProfileProgress from './UserProfile/ProfileProgress';
import ProfileTabs from './UserProfile/ProfileTabs';
import ProfileActions from './UserProfile/ProfileActions';

interface UserProfilePanelProps {
  profile: UserProfile;
  novel: Novel;
  onUpdate: (profile: UserProfile) => void;
  onBack: () => void;
  onNavigateTo?: (episodeId: string, paragraphIndex: number) => void;
  username?: string;
}

function UserProfilePanel({ profile, novel, onUpdate, onBack, onNavigateTo, username }: UserProfilePanelProps) {
  const handleDeleteBookmark = (bookmarkId: string) => {
    onUpdate({
      ...profile,
      bookmarks: profile.bookmarks.filter(b => b.id !== bookmarkId)
    });
  };

  const totalEpisodes = novel.episodes.length;
  
  // Вычисляем прочитанные эпизоды на основе readParagraphs
  const readParagraphsSet = new Set(profile.readParagraphs || []);
  const completedEpisodesCount = novel.episodes.filter(episode => {
    for (let i = 0; i < episode.paragraphs.length; i++) {
      const paragraphId = `${episode.id}-${i}`;
      if (!readParagraphsSet.has(paragraphId)) {
        return false;
      }
    }
    return true;
  }).length;
  
  const progressPercentage = totalEpisodes > 0 ? Math.round((completedEpisodesCount / totalEpisodes) * 100) : 0;

  const formatReadTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const achievements = [
    { id: 'first_step', name: 'Первый шаг', description: 'Начать чтение', completed: completedEpisodesCount > 0 || novel.currentParagraphIndex > 0 },
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

        <ProfileHeader
          profile={profile}
          completedEpisodes={completedEpisodesCount}
          totalEpisodes={totalEpisodes}
          formatReadTime={formatReadTime}
          onUpdate={onUpdate}
        />

        <ProfileProgress
          profile={profile}
          novel={novel}
          completedEpisodes={completedEpisodesCount}
          totalEpisodes={totalEpisodes}
          progressPercentage={progressPercentage}
        />

        <ProfileTabs
          profile={profile}
          novel={novel}
          achievements={achievements}
          username={username}
          onDeleteBookmark={handleDeleteBookmark}
          onNavigateTo={onNavigateTo}
          onProfileUpdate={onUpdate}
        />

        <ProfileActions onUpdate={onUpdate} />
      </div>
    </div>
  );
}

export default UserProfilePanel;