import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import AchievementsTab from './AchievementsTab';
import CharactersTab from './CharactersTab';
import SecurityTab from './SecurityTab';

interface ProfileTabsProps {
  profile: UserProfile;
  novel: Novel;
  achievements: Array<{ id: string; name: string; description: string; completed: boolean }>;
  username?: string;
  onDeleteBookmark: (bookmarkId: string) => void;
  onNavigateTo?: (episodeId: string, paragraphIndex: number) => void;
  onProfileUpdate?: (profile: UserProfile) => void;
}

function ProfileTabs({ profile, novel, achievements, username, onDeleteBookmark, onNavigateTo, onProfileUpdate }: ProfileTabsProps) {
  return (
    <Card className="animate-fade-in" style={{ animationDelay: '200ms' }}>
      <CardContent className="p-6">
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="achievements" className="flex items-center gap-1">
              <Icon name="Trophy" size={16} />
              <span className="hidden md:inline">Достижения</span>
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

          <AchievementsTab
            profile={profile}
            novel={novel}
            achievements={achievements}
            onDeleteBookmark={onDeleteBookmark}
            onNavigateTo={onNavigateTo}
          />

          <CharactersTab
            profile={profile}
            novel={novel}
            onProfileUpdate={onProfileUpdate}
          />

          <SecurityTab username={username} />
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ProfileTabs;