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
    <div className="min-h-screen dark flex">
      {/* Левая часть - фоновое изображение */}
      <div 
        className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        style={{
          backgroundImage: novel.backgroundImages?.profile 
            ? `url(${novel.backgroundImages.profile})` 
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
        
        {/* Плавный градиент */}
        <div className="absolute top-0 right-0 h-full w-64 pointer-events-none z-20">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#151d28]/50 to-[#151d28]" />
        </div>
      </div>

      {/* Правая часть - контент профиля */}
      <div className="w-full lg:w-1/2 p-4 overflow-y-auto dark relative" style={{ backgroundColor: '#151d28' }}>
      {/* Декоративные элементы */}
      <div className="absolute top-16 left-10 w-28 h-28 bg-primary/15 blur-2xl" />
      <svg className="absolute top-40 right-16 w-20 h-20 text-primary/25" viewBox="0 0 100 100">
        <polygon points="50,5 95,75 5,75" fill="currentColor" />
      </svg>
      <div className="absolute bottom-32 left-20 w-36 h-36 bg-accent/10 rounded-full blur-3xl" />
      <svg className="absolute bottom-10 right-10 w-14 h-14 text-accent/20" viewBox="0 0 100 100">
        <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="currentColor" />
      </svg>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <header className="mb-8 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-white">Профиль</h1>
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
    </div>
  );
}

export default UserProfilePanel;