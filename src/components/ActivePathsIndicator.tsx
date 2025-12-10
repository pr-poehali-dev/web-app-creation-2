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

  if (activePaths.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 max-w-xs">
      <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3">
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
    </div>
  );
}

export default ActivePathsIndicator;
