import { Novel, Episode } from '@/types/novel';

export const getParagraphNumber = (
  novel: Novel,
  episodeId: string,
  paragraphIndex: number
): string => {
  const episodeIndex = novel.episodes.findIndex(ep => ep.id === episodeId);
  if (episodeIndex === -1) return `0.${paragraphIndex + 1}`;
  return `${episodeIndex + 1}.${paragraphIndex + 1}`;
};

export const reorderParagraphs = (episode: Episode): Episode => {
  const reorderedParagraphs = episode.paragraphs.map((p, index) => ({
    ...p,
    order: index + 1
  }));
  return { ...episode, paragraphs: reorderedParagraphs };
};
