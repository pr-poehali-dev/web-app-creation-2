import { Paragraph, Episode } from "@/types/novel"

// Форматирование времени чтения в минутах
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'меньше минуты';
  if (minutes === 1) return '1 минута';
  if (minutes < 5) return `${minutes} минуты`;
  return `${minutes} минут`;
}

// Подсчет времени чтения эпизода (примерно 200 слов в минуту)
export function calculateEpisodeReadingTime(paragraphs: Paragraph[]): number {
  let totalWords = 0;
  
  paragraphs.forEach(p => {
    if (p.type === 'text') {
      totalWords += p.content.split(/\s+/).length;
    } else if (p.type === 'dialogue') {
      totalWords += p.text.split(/\s+/).length;
    } else if (p.type === 'choice') {
      totalWords += p.question.split(/\s+/).length;
      p.options.forEach(opt => {
        totalWords += opt.text.split(/\s+/).length;
      });
    }
  });
  
  return Math.max(1, Math.ceil(totalWords / 200));
}

// Проверка активного таймфрейма
export function isRetroActive(timeframes?: ('present' | 'retrospective')[]): boolean {
  return timeframes?.includes('retrospective') || false;
}

// Получить доминирующий таймфрейм эпизода
export function getEpisodeTimeframe(episode: Episode): 'retrospective' | 'present' | 'mixed' {
  if (episode.timeframes?.includes('retrospective')) return 'retrospective';
  
  const retroCount = episode.paragraphs.filter(p => 
    p.timeframes?.includes('retrospective')
  ).length;
  
  if (retroCount === 0) return 'present';
  if (retroCount === episode.paragraphs.length) return 'retrospective';
  return 'mixed';
}

// Проверка доступности эпизода по путям
export function isEpisodeAccessible(
  episode: Episode, 
  activePaths: string[], 
  isAdmin: boolean = false
): boolean {
  if (isAdmin || episode.unlockedForAll) return true;
  if (!episode.requiredPath && !episode.requiredPaths) return true;
  
  if (episode.requiredPaths && episode.requiredPaths.length > 0) {
    return episode.requiredPaths.some(path => activePaths.includes(path));
  }
  
  if (episode.requiredPath) {
    return activePaths.includes(episode.requiredPath);
  }
  
  return true;
}

// Проверка доступности параграфа по путям
export function isParagraphAccessible(
  paragraph: Paragraph,
  activePaths: string[]
): boolean {
  if (!paragraph.requiredPaths || paragraph.requiredPaths.length === 0) return true;
  return paragraph.requiredPaths.some(path => activePaths.includes(path));
}

// Получить цвет пути по ID
export function getPathColor(pathId: string, paths: Array<{id: string, color?: string}>): string {
  const path = paths.find(p => p.id === pathId);
  return path?.color || '#9333ea';
}

// Форматировать список путей для отображения
export function formatPathsList(pathIds: string[], paths: Array<{id: string, name: string}>): string {
  if (!pathIds || pathIds.length === 0) return '';
  const pathNames = pathIds.map(id => paths.find(p => p.id === id)?.name || id);
  return pathNames.join(', ');
}
