import { useState, useEffect } from 'react';
import { PresentationEditor } from '@/components/PresentationEditor/PresentationEditor';
import type { Novel } from '@/types/novel';

export default function PresentationEditorPage() {
  const [novel, setNovel] = useState<Novel | null>(null);

  useEffect(() => {
    const loadNovel = () => {
      try {
        const savedNovel = localStorage.getItem('novelData');
        if (savedNovel) {
          setNovel(JSON.parse(savedNovel));
        }
      } catch (error) {
        console.error('Error loading novel:', error);
      }
    };

    loadNovel();
  }, []);

  const handleNovelUpdate = (updatedNovel: Novel) => {
    setNovel(updatedNovel);
    try {
      localStorage.setItem('novelData', JSON.stringify(updatedNovel));
    } catch (error) {
      console.error('Error saving novel:', error);
    }
  };

  return (
    <div className="w-full h-screen">
      {novel ? (
        <PresentationEditor 
          novel={novel}
          onNovelUpdate={handleNovelUpdate}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      )}
    </div>
  );
}