import { UserProfile, defaultProfile } from '@/types/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ProfileActionsProps {
  onUpdate: (profile: UserProfile) => void;
}

function ProfileActions({ onUpdate }: ProfileActionsProps) {
  return (
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
                ...defaultProfile,
                name: 'Игрок',
                createdAt: new Date().toISOString()
              });
            }
          }}
        >
          <Icon name="RotateCcw" size={16} className="mr-2" />
          Сбросить весь прогресс
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProfileActions;
