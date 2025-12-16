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
        return 'flex flex-row items-center justify-center gap-4';
      
      case 'horizontal-3':
        return 'flex flex-row items-center justify-center gap-4';
      
      case 'horizontal-4':
        return 'flex flex-row items-center justify-center gap-4';
      
      case 'vertical-2':
        return 'flex flex-col items-center justify-center gap-4';
      
      case 'vertical-3':
        return 'flex flex-col items-center justify-center gap-4';
      
      case 'vertical-4':
        return 'flex flex-col items-center justify-center gap-4';
      
      case 'horizontal-2-1':
        return 'grid grid-cols-[2fr_2fr_1fr] gap-4';
      
      case 'horizontal-1-2':
        return 'grid grid-cols-[1fr_2fr_2fr] gap-4';
      
      case 'grid-2x2':
        return 'grid grid-cols-2 grid-rows-2 gap-4';
      
      case 'grid-3x3':
        return 'grid grid-cols-3 grid-rows-3 gap-4';
      
      case 'grid-2x3':
        return 'grid grid-cols-2 grid-rows-3 gap-4';
      
      case 'mosaic-left':
        return 'grid grid-cols-[2fr_1fr] grid-rows-2 gap-4';
      
      case 'mosaic-right':
        return 'grid grid-cols-[1fr_2fr] grid-rows-2 gap-4';
      
      case 'vertical-left-3':
        return 'grid grid-cols-[2fr_1fr] grid-rows-3 gap-4';
      
      case 'vertical-right-3':
        return 'grid grid-cols-[1fr_2fr] grid-rows-3 gap-4';
      
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
      
      case 'pyramid':
        return 'grid grid-cols-2 grid-rows-2 gap-4';
      
      case 'inverted-pyramid':
        return 'grid grid-cols-2 grid-rows-2 gap-4';
      
      case 'sandwich':
        return 'flex flex-col items-center justify-center gap-4';
      
      case 'spotlight':
        return 'grid grid-cols-3 grid-rows-3 gap-4';
      
      case 'filmstrip':
        return 'flex flex-row items-center justify-center gap-2';
      
      case 'diamond-grid':
        return 'grid grid-cols-5 grid-rows-5 gap-3';
      
      case 'triangle-flow':
        return 'grid grid-cols-4 grid-rows-3 gap-3';
      
      case 'diamond-cascade':
        return 'grid grid-cols-4 grid-rows-4 gap-3';
      
      case 'rotated-squares':
        return 'grid grid-cols-3 grid-rows-3 gap-4';
      
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
      
      case 'pyramid':
        if (index === 0) return 'col-span-2';
        return '';
      
      case 'inverted-pyramid':
        if (index === 2) return 'col-span-2';
        return '';
      
      case 'spotlight':
        if (index === 0) return 'col-start-2 row-start-2';
        if (index === 1) return 'col-start-1 row-start-1';
        if (index === 2) return 'col-start-3 row-start-1';
        if (index === 3) return 'col-start-1 row-start-3';
        if (index === 4) return 'col-start-3 row-start-3';
        return '';
      
      case 'diamond-grid':
        // 9 ромбов в форме большого ромба
        if (index === 0) return 'col-start-3 row-start-1 rotate-45';
        if (index === 1) return 'col-start-2 row-start-2 rotate-45';
        if (index === 2) return 'col-start-3 row-start-2 rotate-45';
        if (index === 3) return 'col-start-4 row-start-2 rotate-45';
        if (index === 4) return 'col-start-1 row-start-3 rotate-45';
        if (index === 5) return 'col-start-3 row-start-3 rotate-45';
        if (index === 6) return 'col-start-5 row-start-3 rotate-45';
        if (index === 7) return 'col-start-2 row-start-4 rotate-45';
        if (index === 8) return 'col-start-4 row-start-4 rotate-45';
        return '';
      
      case 'triangle-flow':
        // 6 треугольников в художественной композиции
        if (index === 0) return 'col-start-1 row-start-1 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]';
        if (index === 1) return 'col-start-2 row-start-1 col-span-2 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]';
        if (index === 2) return 'col-start-1 row-start-2 [clip-path:polygon(50%_100%,0%_0%,100%_0%)]';
        if (index === 3) return 'col-start-2 row-start-2 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]';
        if (index === 4) return 'col-start-3 row-start-2 col-span-2 row-span-2 [clip-path:polygon(50%_0%,0%_100%,100%_100%)]';
        if (index === 5) return 'col-start-1 row-start-3 col-span-2 [clip-path:polygon(50%_100%,0%_0%,100%_0%)]';
        return '';
      
      case 'diamond-cascade':
        // 7 ромбов по диагонали с разными размерами
        if (index === 0) return 'col-start-1 row-start-1 rotate-45 scale-75';
        if (index === 1) return 'col-start-2 row-start-1 rotate-45';
        if (index === 2) return 'col-start-2 row-start-2 rotate-45 scale-90';
        if (index === 3) return 'col-start-3 row-start-2 rotate-45 scale-110';
        if (index === 4) return 'col-start-3 row-start-3 rotate-45';
        if (index === 5) return 'col-start-4 row-start-3 rotate-45 scale-90';
        if (index === 6) return 'col-start-4 row-start-4 rotate-45 scale-75';
        return '';
      
      case 'rotated-squares':
        // 5 квадратов повернутых на 45°
        if (index === 0) return 'col-start-2 row-start-1 rotate-45 scale-90';
        if (index === 1) return 'col-start-1 row-start-2 rotate-45 scale-75';
        if (index === 2) return 'col-start-2 row-start-2 rotate-45 scale-110 z-10';
        if (index === 3) return 'col-start-3 row-start-2 rotate-45 scale-75';
        if (index === 4) return 'col-start-2 row-start-3 rotate-45 scale-90';
        return '';
      
      default:
        return '';
    }
  };

  const isFlexLayout = ['single', 'horizontal-2', 'horizontal-3', 'horizontal-4', 'vertical-2', 'vertical-3', 'vertical-4', 'sandwich', 'filmstrip'].includes(layout);

  return (
    <div className={`w-full h-full ${getLayoutClasses()}`}>
      {children.map((child, index) => {
        const aspectRatio = aspectRatios?.[index] || 1;
        
        return (
          <div 
            key={index} 
            className={`${!isFlexLayout ? getItemClasses(index) : ''} overflow-hidden flex items-center justify-center`}
            style={isFlexLayout ? {
              aspectRatio: aspectRatio.toString(),
              flex: '1 1 0',
              minWidth: 0,
              minHeight: 0,
              maxHeight: '100%'
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