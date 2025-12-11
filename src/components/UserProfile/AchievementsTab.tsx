import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { getParagraphNumber } from '@/utils/paragraphNumbers';

interface AchievementsTabProps {
  profile: UserProfile;
  novel: Novel;
  achievements: Array<{ id: string; name: string; description: string; completed: boolean }>;
  onDeleteBookmark: (bookmarkId: string) => void;
  onNavigateTo?: (episodeId: string, paragraphIndex: number) => void;
}

function AchievementsTab({ profile, novel, achievements, onDeleteBookmark, onNavigateTo }: AchievementsTabProps) {
  return (
    <>
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
                        <button
                          onClick={() => onNavigateTo(bookmark.episodeId, bookmark.paragraphIndex)}
                          className="p-2 hover:bg-accent rounded-md transition-colors"
                        >
                          <Icon name="Play" size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteBookmark(bookmark.id)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
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
              const libraryItem = novel.library.items.find(i => i.id === item.id);
              const itemName = libraryItem?.name || item.name;
              const itemDescription = libraryItem?.description || item.description;
              const itemImage = libraryItem?.imageUrl || item.imageUrl;
              const itemType = libraryItem?.itemType || item.itemType || 'collectible';
              
              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-secondary/30 rounded-lg">
                        {itemImage ? (
                          <img src={itemImage} alt={itemName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Icon name="Package" size={24} className="text-secondary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{itemName}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            itemType === 'story' ? 'bg-blue-500/20 text-blue-600' : 'bg-primary/20 text-primary'
                          }`}>
                            {itemType === 'story' ? 'Сюжетный' : 'Коллекционный'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{itemDescription}</p>
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
    </>
  );
}

export default AchievementsTab;