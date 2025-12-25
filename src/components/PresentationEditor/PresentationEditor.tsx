import { useEffect } from 'react';
import { EditorToolbar } from './EditorToolbar';
import { SlideCanvas } from './SlideCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { SlidesPanel } from './SlidesPanel';
import { usePresentationStore } from '@/store/presentationStore';

export function PresentationEditor() {
  const saveToHistory = usePresentationStore(s => s.saveToHistory);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        usePresentationStore.getState().undo();
      }
      
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        usePresentationStore.getState().redo();
      }
      
      if (ctrl && e.key === 'c') {
        e.preventDefault();
        usePresentationStore.getState().copy();
      }
      
      if (ctrl && e.key === 'v') {
        e.preventDefault();
        usePresentationStore.getState().paste();
        saveToHistory();
      }
      
      if (ctrl && e.key === 'x') {
        e.preventDefault();
        usePresentationStore.getState().cut();
        saveToHistory();
      }
      
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        const selectedIds = usePresentationStore.getState().selectedObjectIds;
        selectedIds.forEach(id => {
          usePresentationStore.getState().duplicateObject(id);
        });
        saveToHistory();
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const selectedIds = usePresentationStore.getState().selectedObjectIds;
        selectedIds.forEach(id => {
          usePresentationStore.getState().deleteObject(id);
        });
        saveToHistory();
      }

      if (e.key === 't' && !ctrl) {
        e.preventDefault();
      }

      if (e.key === 'r' && !ctrl) {
        e.preventDefault();
      }

      if (e.key === 'c' && !ctrl) {
        e.preventDefault();
      }

      if (e.key === 'i' && !ctrl) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    saveToHistory();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [saveToHistory]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorToolbar />
      
      <div className="flex-1 flex overflow-hidden">
        <SlidesPanel />
        
        <div className="flex-1 overflow-hidden">
          <SlideCanvas />
        </div>
        
        <PropertiesPanel />
      </div>
    </div>
  );
}
