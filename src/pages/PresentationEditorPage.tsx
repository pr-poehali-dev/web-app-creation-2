import { useState, useEffect } from 'react';
import { PresentationEditor } from '@/components/PresentationEditor/PresentationEditor';
import type { Novel } from '@/types/novel';

export default function PresentationEditorPage() {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedNovel = localStorage.getItem('novelData');
      if (savedNovel) {
        const parsed = JSON.parse(savedNovel);
        setNovel(parsed);
      }
    } catch (error) {
      console.error('Error loading novel:', error);
    }
    setIsLoading(false);
  }, []);

  const handleNovelUpdate = (updatedNovel: Novel) => {
    setNovel(updatedNovel);
    try {
      localStorage.setItem('novelData', JSON.stringify(updatedNovel));
    } catch (error) {
      console.error('Error saving novel:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <PresentationEditor 
        novel={novel || undefined}
        onNovelUpdate={novel ? handleNovelUpdate : undefined}
      />
    </div>
  );
}