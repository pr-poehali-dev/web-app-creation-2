import { Novel } from '@/types/novel';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OverviewStatisticsProps {
  novel: Novel;
  choicesStatsLength: number;
}

function OverviewStatistics({ novel, choicesStatsLength }: OverviewStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Icon name="Map" size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{novel.episodes.length}</p>
              <p className="text-xs text-muted-foreground">Эпизодов</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Icon name="GitBranch" size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{novel.paths?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Путей</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Icon name="Package" size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{novel.library.items.length}</p>
              <p className="text-xs text-muted-foreground">Предметов</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Icon name="GitMerge" size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{choicesStatsLength}</p>
              <p className="text-xs text-muted-foreground">Выборов</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OverviewStatistics;
