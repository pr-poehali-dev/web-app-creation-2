import { Paragraph, TextParagraph, DialogueParagraph } from '@/types/novel';
import ComicFrameReader from './ComicFrameReader';

interface ComicGroupData {
  frames: any[];
  layout: 'single' | 'horizontal-2' | 'horizontal-3' | 'vertical-2' | 'grid-4';
}

interface BackgroundContentOverlayProps {
  currentParagraph: Paragraph;
  comicGroupData: ComicGroupData | null;
  showComicFrames: boolean;
  actualIsContentHidden: boolean;
  isTyping: boolean;
  isRetrospective: boolean;
  effectivePastelColor?: string;
  getFilterStyle: (baseFilter: string) => string;
}

function BackgroundContentOverlay({
  currentParagraph,
  comicGroupData,
  showComicFrames,
  actualIsContentHidden,
  isTyping,
  isRetrospective,
  effectivePastelColor,
  getFilterStyle
}: BackgroundContentOverlayProps) {
  return (
    <>
      {currentParagraph.type === 'image' && (
        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 z-10">
          <img 
            src={currentParagraph.url}
            alt={currentParagraph.alt || 'Изображение'}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            style={{
              animation: 'fadeIn 0.8s ease-in-out',
              filter: getFilterStyle('blur(0px)')
            }}
          />
        </div>
      )}
      
      {comicGroupData && showComicFrames && (
        <div 
          key={`comic-group-${currentParagraph.comicGroupId}`}
          className="absolute inset-0 flex items-center justify-center p-4 md:p-8 z-30 transition-all duration-300 ease-in-out"
          style={{ 
            opacity: actualIsContentHidden ? 0 : 1,
            pointerEvents: actualIsContentHidden ? 'none' : 'auto'
          }}
        >
          <div className="w-full h-full max-w-4xl">
            <ComicFrameReader
              key={`comic-group-reader-${currentParagraph.comicGroupId}`}
              paragraph={{
                ...currentParagraph,
                comicFrames: comicGroupData.frames,
                frameLayout: comicGroupData.layout
              } as TextParagraph | DialogueParagraph}
              currentSubParagraphIndex={undefined}
              layout={comicGroupData.layout}
              isTyping={false}
              isRetrospective={isRetrospective}
              pastelColor={effectivePastelColor}
              isComicGroup={true}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default BackgroundContentOverlay;