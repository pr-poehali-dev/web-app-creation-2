import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface ProfileProgressProps {
  profile: UserProfile;
  novel: Novel;
  completedEpisodes: number;
  totalEpisodes: number;
  progressPercentage: number;
}

function ProfileProgress({ profile, novel, completedEpisodes, totalEpisodes, progressPercentage }: ProfileProgressProps) {
  return (
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
          {(() => {
            // Вычисляем прочитанные эпизоды на основе readParagraphs
            const readParagraphsSet = new Set(profile.readParagraphs || []);
            const fullyReadEpisodes = novel.episodes.filter(episode => {
              for (let i = 0; i < episode.paragraphs.length; i++) {
                const paragraphId = `${episode.id}-${i}`;
                if (!readParagraphsSet.has(paragraphId)) {
                  return false;
                }
              }
              return true;
            });
            
            return fullyReadEpisodes.length > 0 ? (
              <div className="space-y-2">
                {fullyReadEpisodes.map((episode) => (
                  <div key={episode.id} className="flex items-center gap-2 text-sm">
                    <Icon name="CheckCircle" size={16} className="text-green-500" />
                    <span className="text-foreground">{episode.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Вы ещё не завершили ни одного эпизода</p>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileProgress;