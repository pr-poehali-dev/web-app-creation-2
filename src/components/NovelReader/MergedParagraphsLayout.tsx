import { MergeLayoutType } from '@/types/novel';
import { ReactNode } from 'react';

interface MergedParagraphsLayoutProps {
  layout: MergeLayoutType;
  children: ReactNode[];
  aspectRatios?: number[];
}

export default function MergedParagraphsLayout({ layout, children, aspectRatios }: MergedParagraphsLayoutProps) {
  const getLayoutClasses = () => {
    switch (layout) {
      case 'single':
        return 'flex items-center justify-center gap-4';
      
      case 'horizontal-2':
        return 'flex flex-row items-center justify-center gap-2';
      
      case 'horizontal-3':
        return 'flex flex-row items-center justify-center gap-2';
      
      case 'horizontal-4':
        return 'flex flex-row items-center justify-center gap-2';
      
      case 'vertical-2':
        return 'flex flex-col items-center justify-center gap-4';
      
      case 'vertical-3':
        return 'flex flex-col items-center justify-center gap-4';
      
      case 'vertical-4':
        return 'flex flex-col items-center justify-center gap-4';
      
      case 'horizontal-2-1':
        return 'grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1fr)] gap-2';
      
      case 'horizontal-1-2':
        return 'grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,2fr)] gap-2';
      
      case 'grid-2x2':
        return 'grid grid-cols-2 grid-rows-2 gap-2';
      
      case 'grid-3x3':
        return 'grid grid-cols-3 grid-rows-3 gap-4';
      
      case 'grid-2x3':
        return 'grid grid-cols-2 grid-rows-3 gap-2';
      
      case 'mosaic-left':
        return 'grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid-rows-2 gap-2';
      
      case 'mosaic-right':
        return 'grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] grid-rows-2 gap-2';
      
      case 'vertical-left-3':
        return 'grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid-rows-3 gap-2';
      
      case 'vertical-right-3':
        return 'grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] grid-rows-3 gap-2';
      
      case 'center-large':
        return 'grid grid-cols-3 grid-rows-3 gap-4';
      
      case 'asymmetric-1':
        return 'grid grid-cols-4 grid-rows-3 gap-4';
      
      case 'asymmetric-2':
        return 'grid grid-cols-3 grid-rows-4 gap-4';
      
      case 'asymmetric-3':
        return 'grid grid-cols-5 grid-rows-2 gap-4';
      
      case 'l-shape':
        return 'grid grid-cols-3 grid-rows-3 gap-4';
      
      case 'sandwich':
        return 'flex flex-col items-center justify-center gap-4';
      
      case 'spotlight':
        return 'grid grid-cols-3 grid-rows-3 gap-4';
      
      case 'filmstrip':
        return 'flex flex-row items-center justify-center gap-2';
      
      case 'magazine-1':
        return 'grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3';
      
      case 'magazine-2':
        return 'grid grid-cols-4 grid-rows-4 gap-3';
      
      case 'magazine-3':
        return 'grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3';
      
      case 'magazine-4':
        return 'grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3';
      
      case 'magazine-5':
        return 'grid grid-cols-4 grid-rows-[minmax(0,2fr)_minmax(0,1fr)] gap-3';
      
      case 'magazine-6':
        return 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3';
      
      case 'magazine-7':
        return 'grid grid-cols-3 grid-rows-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3';
      
      case 'magazine-8':
        return 'grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] gap-3';
      
      case 'magazine-9':
        return 'grid grid-cols-4 grid-rows-4 gap-3';
      
      case 'diagonal-left':
        return 'grid grid-cols-2 grid-rows-3 gap-2';
      
      case 'diagonal-right':
        return 'grid grid-cols-2 grid-rows-3 gap-2';
      
      case 'triangle-top':
        return 'grid grid-cols-2 grid-rows-2 gap-2';
      
      case 'triangle-bottom':
        return 'grid grid-cols-2 grid-rows-2 gap-2';
      
      case 'triangle-left':
        return 'grid grid-cols-2 grid-rows-2 gap-2';
      
      case 'triangle-right':
        return 'grid grid-cols-2 grid-rows-2 gap-2';
      
      default:
        return 'grid grid-cols-3 gap-4';
    }
  };

  const getItemClasses = (index: number) => {
    switch (layout) {
      case 'mosaic-left':
        if (index === 0) return 'row-span-2';
        return '';
      
      case 'mosaic-right':
        if (index === 1) return 'row-span-2';
        return '';
      
      case 'vertical-left-3':
        if (index === 0) return 'row-span-3';
        return '';
      
      case 'vertical-right-3':
        if (index === children.length - 1) return 'row-span-3';
        return '';
      
      case 'center-large':
        if (index === 0) return 'col-start-2 row-start-2 col-span-1 row-span-1 z-10';
        if (index === 1) return 'col-start-1 row-start-1 col-span-1 row-span-1';
        if (index === 2) return 'col-start-3 row-start-1 col-span-1 row-span-1';
        if (index === 3) return 'col-start-1 row-start-3 col-span-1 row-span-1';
        if (index === 4) return 'col-start-3 row-start-3 col-span-1 row-span-1';
        return '';
      
      case 'asymmetric-1':
        if (index === 0) return 'col-span-2 row-span-2';
        if (index === 1) return 'col-span-2';
        if (index === 2) return 'col-span-1 row-span-2';
        if (index === 3) return 'col-span-1';
        return '';
      
      case 'asymmetric-2':
        if (index === 0) return 'row-span-2';
        if (index === 1) return 'col-span-2 row-span-2';
        if (index === 2) return 'row-span-2';
        if (index === 3) return 'col-span-2';
        return '';
      
      case 'asymmetric-3':
        if (index === 0) return 'col-span-3 row-span-1';
        if (index === 1) return 'col-span-2 row-span-1';
        return '';
      
      case 'l-shape':
        if (index === 0) return 'col-span-2 row-span-2';
        if (index === 1) return 'col-start-3 row-start-1';
        if (index === 2) return 'col-start-3 row-start-2';
        if (index === 3) return 'col-start-1 row-start-3';
        if (index === 4) return 'col-start-2 row-start-3';
        if (index === 5) return 'col-start-3 row-start-3';
        return '';
      
      case 'spotlight':
        if (index === 0) return 'col-start-2 row-start-2 col-span-1 row-span-1';
        if (index === 1) return 'col-start-1 row-start-1';
        if (index === 2) return 'col-start-3 row-start-1';
        if (index === 3) return 'col-start-1 row-start-3';
        if (index === 4) return 'col-start-3 row-start-3';
        return '';
      
      case 'magazine-1':
        if (index === 0) return 'col-start-1 row-start-1 row-span-3 rounded-full aspect-square';
        if (index === 1) return 'col-start-2 row-start-1';
        if (index === 2) return 'col-start-2 row-start-2';
        if (index === 3) return 'col-start-2 row-start-3';
        if (index === 4) return 'col-start-2 row-start-4';
        if (index === 5) return 'col-start-1 row-start-4';
        return '';
      
      case 'magazine-2':
        if (index === 0) return 'col-start-2 col-span-2 row-start-2 row-span-2 rounded-full aspect-square';
        if (index === 1) return 'col-start-1 row-start-1';
        if (index === 2) return 'col-start-2 row-start-1';
        if (index === 3) return 'col-start-3 row-start-1';
        if (index === 4) return 'col-start-4 row-start-1';
        if (index === 5) return 'col-start-4 row-start-2';
        if (index === 6) return 'col-start-4 row-start-3';
        if (index === 7) return 'col-start-1 row-start-4';
        if (index === 8) return 'col-start-4 row-start-4';
        return '';
      
      case 'magazine-3':
        if (index === 0) return 'col-start-2 row-start-1 row-span-3 rounded-full aspect-square';
        if (index === 1) return 'col-start-1 row-start-1';
        if (index === 2) return 'col-start-1 row-start-2';
        if (index === 3) return 'col-start-1 row-start-3';
        if (index === 4) return 'col-start-1 row-start-4';
        if (index === 5) return 'col-start-2 row-start-4 col-span-1';
        if (index === 6) return 'col-start-1 row-start-1 col-span-2';
        if (index === 7) return 'col-start-1 row-start-1 col-span-2';
        return '';
      
      case 'magazine-4':
        if (index === 0) return 'col-start-1 row-start-1 row-span-3 rounded-full aspect-square';
        if (index === 1) return 'col-start-2 row-start-1';
        if (index === 2) return 'col-start-3 row-start-1';
        if (index === 3) return 'col-start-2 row-start-2';
        if (index === 4) return 'col-start-3 row-start-2';
        if (index === 5) return 'col-start-2 row-start-3';
        if (index === 6) return 'col-start-3 row-start-3';
        if (index === 7) return 'col-start-2 row-start-1 col-span-2';
        return '';
      
      case 'magazine-5':
        if (index === 0) return 'col-start-2 col-span-2 row-start-1 rounded-full aspect-square';
        if (index === 1) return 'col-start-1 row-start-1';
        if (index === 2) return 'col-start-4 row-start-1';
        if (index === 3) return 'col-start-1 row-start-2';
        if (index === 4) return 'col-start-2 row-start-2';
        if (index === 5) return 'col-start-3 row-start-2';
        if (index === 6) return 'col-start-4 row-start-2';
        if (index === 7) return 'col-start-1 row-start-1 col-span-4';
        return '';
      
      case 'magazine-6':
        if (index === 0) return 'col-start-3 col-span-2 row-start-1 row-span-2 rounded-full aspect-square';
        if (index === 1) return 'col-start-1 row-start-1';
        if (index === 2) return 'col-start-2 row-start-1';
        if (index === 3) return 'col-start-1 row-start-2';
        if (index === 4) return 'col-start-2 row-start-2';
        if (index === 5) return 'col-start-1 row-start-3';
        if (index === 6) return 'col-start-2 row-start-3';
        if (index === 7) return 'col-start-3 row-start-3 col-span-2';
        return '';
      
      case 'magazine-7':
        if (index === 0) return 'col-start-1 row-start-1';
        if (index === 1) return 'col-start-2 row-start-1';
        if (index === 2) return 'col-start-3 row-start-1';
        if (index === 3) return 'col-start-1 row-start-2';
        if (index === 4) return 'col-start-2 row-start-2';
        if (index === 5) return 'col-start-3 row-start-2';
        if (index === 6) return 'col-start-1 row-start-3 col-span-2';
        if (index === 7) return 'col-start-3 row-start-3';
        return '';
      
      case 'magazine-8':
        if (index === 0) return 'col-start-1 row-start-1 row-span-2 rounded-full aspect-square';
        if (index === 1) return 'col-start-2 row-start-1';
        if (index === 2) return 'col-start-1 row-start-3';
        if (index === 3) return 'col-start-2 row-start-2 row-span-2';
        if (index === 4) return 'col-start-2 row-start-3';
        if (index === 5) return 'col-start-2 row-start-1 row-span-3';
        return '';
      
      case 'magazine-9':
        if (index === 0) return 'col-start-2 col-span-2 row-start-2 row-span-2 rounded-full aspect-square z-10';
        if (index === 1) return 'col-start-1 row-start-1';
        if (index === 2) return 'col-start-4 row-start-1';
        if (index === 3) return 'col-start-1 row-start-4';
        if (index === 4) return 'col-start-4 row-start-4';
        if (index === 5) return 'col-start-1 row-start-2';
        if (index === 6) return 'col-start-4 row-start-2';
        if (index === 7) return 'col-start-2 row-start-1';
        return '';
      
      case 'diagonal-left':
        if (index === 0) return 'col-start-1 row-start-1 row-span-2';
        if (index === 1) return 'col-start-2 row-start-2 row-span-2';
        return '';
      
      case 'diagonal-right':
        if (index === 0) return 'col-start-2 row-start-1 row-span-2';
        if (index === 1) return 'col-start-1 row-start-2 row-span-2';
        return '';
      
      case 'triangle-top':
        if (index === 0) return 'col-start-1 col-span-2 row-start-1';
        if (index === 1) return 'col-start-1 row-start-2';
        if (index === 2) return 'col-start-2 row-start-2';
        return '';
      
      case 'triangle-bottom':
        if (index === 0) return 'col-start-1 row-start-1';
        if (index === 1) return 'col-start-2 row-start-1';
        if (index === 2) return 'col-start-1 col-span-2 row-start-2';
        return '';
      
      case 'triangle-left':
        if (index === 0) return 'col-start-1 row-start-1 row-span-2';
        if (index === 1) return 'col-start-2 row-start-1';
        if (index === 2) return 'col-start-2 row-start-2';
        return '';
      
      case 'triangle-right':
        if (index === 0) return 'col-start-1 row-start-1';
        if (index === 1) return 'col-start-1 row-start-2';
        if (index === 2) return 'col-start-2 row-start-1 row-span-2';
        return '';
      
      default:
        return '';
    }
  };

  const isFlexLayout = ['single', 'horizontal-2', 'horizontal-3', 'horizontal-4', 'vertical-2', 'vertical-3', 'vertical-4', 'sandwich', 'filmstrip'].includes(layout);

  const isVerticalLayout = ['vertical-2', 'vertical-3', 'vertical-4'].includes(layout);

  return (
    <div className={`w-full h-full ${isVerticalLayout ? 'max-w-full' : ''} ${getLayoutClasses()}`}>
      {children.map((child, index) => {
        const aspectRatio = aspectRatios?.[index] || 1;
        
        return (
          <div 
            key={index} 
            className={`${!isFlexLayout ? getItemClasses(index) : ''} ${isVerticalLayout ? 'max-w-full' : ''} overflow-hidden flex items-center justify-center`}
            style={isFlexLayout ? {
              aspectRatio: aspectRatio.toString(),
              flex: '1 1 0',
              minWidth: 0,
              minHeight: 0,
              maxHeight: '100%',
              maxWidth: isVerticalLayout ? '100%' : undefined
            } : undefined}
          >
            <div 
              className="flex items-center justify-center w-full h-full"
              style={!isFlexLayout ? { 
                aspectRatio: aspectRatio.toString(),
                maxWidth: '100%',
                maxHeight: '100%'
              } : undefined}
            >
              {child}
            </div>
          </div>
        );
      })}
    </div>
  );
}