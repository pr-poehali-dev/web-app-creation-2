import { useState } from 'react';
import { UserProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { selectAndConvertImage } from '@/utils/fileHelpers';

interface ProfileHeaderProps {
  profile: UserProfile;
  completedEpisodes: number;
  totalEpisodes: number;
  formatReadTime: (minutes: number) => string;
  onUpdate: (profile: UserProfile) => void;
}

function ProfileHeader({ profile, completedEpisodes, totalEpisodes, formatReadTime, onUpdate }: ProfileHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);

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

  return (
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
  );
}

export default ProfileHeader;
