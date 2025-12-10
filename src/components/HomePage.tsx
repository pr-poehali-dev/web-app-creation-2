import { HomePage as HomePageType, Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ZoomableImage from '@/components/ZoomableImage';
import Icon from '@/components/ui/icon';

interface HomePageProps {
  homePage: HomePageType;
  novel: Novel;
  profile: UserProfile;
  onEpisodeSelect: (episodeId: string, paragraphIndex: number) => void;
}

function HomePage({ homePage, novel, profile, onEpisodeSelect }: HomePageProps) {
  // Проверяем доступность эпизодов
  const isEpisodeFullyRead = (episodeId: string) => {
    const episode = novel.episodes.find(ep => ep.id === episodeId);
    if (!episode) return false;
    
    return episode.paragraphs.every((_, idx) => {
      const paragraphId = `${episodeId}-${idx}`;
      return profile.readParagraphs?.includes(paragraphId);
    });
  };

  const isEpisodeAccessible = (index: number) => {
    if (index === 0) return true;
    const episode = novel.episodes[index];
    if (episode.unlockedForAll) return true;
    const prevEpisode = novel.episodes[index - 1];
    return isEpisodeFullyRead(prevEpisode.id);
  };

  const isPathMatching = (episode: typeof novel.episodes[0], index: number) => {
    if (index === 0) return true;
    if (!episode.requiredPath) return true;
    return profile.activePaths?.includes(episode.requiredPath);
  };

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-6">
          {homePage.greetingImage && (
            <ZoomableImage
              src={homePage.greetingImage} 
              alt="Greeting" 
              className="w-full max-w-md mx-auto rounded-lg shadow-lg animate-fade-in"
            />
          )}
          <h1 className="text-5xl font-bold text-foreground animate-scale-in whitespace-pre-wrap leading-tight">
            {homePage.greeting || 'Добро пожаловать'}
          </h1>
        </div>

        {/* Список доступных эпизодов */}
        <div className="space-y-4 mt-12">
          <h2 className="text-2xl font-bold text-foreground text-center">Эпизоды</h2>
          <div className="grid gap-3">
            {novel.episodes.map((episode, index) => {
              const isAccessible = isEpisodeAccessible(index);
              const hasRequiredPath = isPathMatching(episode, index);
              const canPlay = isAccessible && hasRequiredPath;
              const isFullyRead = isEpisodeFullyRead(episode.id);
              
              return (
                <Card 
                  key={episode.id} 
                  className={`transition-all ${
                    canPlay 
                      ? 'cursor-pointer hover:border-primary hover:shadow-lg' 
                      : 'opacity-50 cursor-not-allowed'
                  } ${isFullyRead ? 'border-secondary' : ''}`}
                  onClick={() => canPlay && onEpisodeSelect(episode.id, 0)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isFullyRead ? 'bg-secondary' : canPlay ? 'bg-primary' : 'bg-muted'
                      }`}>
                        {isFullyRead ? (
                          <Icon name="Check" size={20} className="text-white" />
                        ) : canPlay ? (
                          <Icon name="Play" size={20} className="text-white" />
                        ) : (
                          <Icon name="Lock" size={20} className="text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{episode.title}</h3>
                        {!hasRequiredPath && episode.requiredPath && (
                          <p className="text-xs text-muted-foreground">
                            Требуется путь: {novel.paths?.find(p => p.id === episode.requiredPath)?.name || episode.requiredPath}
                          </p>
                        )}
                      </div>
                    </div>
                    {canPlay && (
                      <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {homePage.news && homePage.news.length > 0 && (
          <div className="space-y-4 mt-12">
            <h2 className="text-2xl font-bold text-foreground text-center">Новости</h2>
            {homePage.news.map((item) => (
              <Card key={item.id} className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{item.title}</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {new Date(item.date).toLocaleDateString('ru-RU')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-full rounded-lg" />
                  )}
                  <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;