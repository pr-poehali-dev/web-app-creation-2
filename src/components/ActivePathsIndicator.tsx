import { Novel } from '@/types/novel';
import { UserProfile } from '@/types/settings';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ActivePathsIndicatorProps {
  novel: Novel;
  profile: UserProfile;
}

function ActivePathsIndicator({ novel, profile }: ActivePathsIndicatorProps) {
  const activePaths = (novel.paths || []).filter(path => 
    profile.activePaths.includes(path.id)
  );

  // Считаем прогресс для неактивированных путей
  const pathsProgress = (novel.paths || [])
    .filter(path => !profile.activePaths.includes(path.id))
    .map(path => {
      const pathChoices = profile.pathChoices?.[path.id] || [];
      
      // Считаем общее количество активирующих выборов для этого пути
      let totalChoices = 0;
      novel.episodes.forEach(ep => {
        ep.paragraphs.forEach(para => {
          if (para.type === 'choice') {
            para.options.forEach(opt => {
              if (opt.activatesPath === path.id) {
                totalChoices++;
              }
            });
          }
        });
      });
      
      const progress = totalChoices > 0 ? Math.floor((pathChoices.length / totalChoices) * 100) : 0;
      const threshold = Math.ceil(totalChoices * 0.9);
      
      return {
        path,
        progress,
        current: pathChoices.length,
        total: totalChoices,
        threshold
      };
    })
    .filter(p => p.progress > 0); // Показываем только если есть прогресс

  if (activePaths.length === 0 && pathsProgress.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-40 max-w-xs">
      <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 space-y-3">
        {activePaths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="GitBranch" size={14} className="text-primary" />
              <span className="text-xs font-bold text-foreground">Активные пути</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activePaths.map(path => (
                <Badge 
                  key={path.id}
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: path.color ? `${path.color}20` : undefined,
                    borderColor: path.color || undefined,
                    color: path.color || undefined
                  }}
                >
                  {path.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {pathsProgress.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Loader" size={14} className="text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground">Прогресс путей</span>
            </div>
            <div className="space-y-2">
              {pathsProgress.map(({ path, progress, current, threshold }) => (
                <div key={path.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: path.color }}>{path.name}</span>
                    <span className="text-xs text-muted-foreground">{current}/{threshold}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: path.color || '#9333ea'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivePathsIndicator;