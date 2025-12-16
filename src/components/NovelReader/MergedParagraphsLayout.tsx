import { MergeLayoutType } from '@/types/novel';
import { ReactNode } from 'react';

interface MergedParagraphsLayoutProps {
  layout: MergeLayoutType;
  children: ReactNode[];
}

export default function MergedParagraphsLayout({ layout, children }: MergedParagraphsLayoutProps) {
  const getLayoutClasses = () => {
    switch (layout) {
      case 'single':
        return 'grid grid-cols-1 gap-4';
      
      case 'horizontal-2':
        return 'grid grid-cols-2 gap-4';
      
      case 'horizontal-3':
        return 'grid grid-cols-3 gap-4';
      
      case 'horizontal-2-1':
        return 'grid grid-cols-[2fr_2fr_1fr] gap-4';
      
      case 'horizontal-1-2':
        return 'grid grid-cols-[1fr_2fr_2fr] gap-4';
      
      case 'grid-2x2':
        return 'grid grid-cols-2 grid-rows-2 gap-4';
      
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
      
      case 'grid-3x3':
        return 'grid grid-cols-3 grid-rows-3 gap-4';
      
      case 'asymmetric-1':
        return 'grid grid-cols-4 grid-rows-3 gap-4';
      
      case 'asymmetric-2':
        return 'grid grid-cols-3 grid-rows-4 gap-4';
      
      case 'l-shape':
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
        if (index === 0) return 'col-start-2 row-start-2 col-span-1 row-span-1';
        if (index === 1) return 'col-start-1 row-start-1';
        if (index === 2) return 'col-start-3 row-start-1';
        if (index === 3) return 'col-start-1 row-start-3';
        if (index === 4) return 'col-start-3 row-start-3';
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
      
      case 'l-shape':
        if (index === 0) return 'col-span-2 row-span-2';
        if (index === 1) return 'col-start-3 row-start-1';
        if (index === 2) return 'col-start-3 row-start-2';
        if (index === 3) return 'col-start-1 row-start-3';
        if (index === 4) return 'col-start-2 row-start-3';
        if (index === 5) return 'col-start-3 row-start-3';
        return '';
      
      default:
        return '';
    }
  };

  return (
    <div className={`w-full h-full ${getLayoutClasses()} max-h-full`}>
      {children.map((child, index) => (
        <div key={index} className={`${getItemClasses(index)} bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 overflow-hidden`} style={{ aspectRatio: '1/1' }}>
          {child}
        </div>
      ))}
    </div>
  );
}