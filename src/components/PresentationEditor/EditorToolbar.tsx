import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { usePresentationStore } from '@/store/presentationStore';
import type { TextObject, ShapeObject, ImageObject } from '@/types/presentation';

export function EditorToolbar() {
  const addObject = usePresentationStore(s => s.addObject);
  const selectedObjectIds = usePresentationStore(s => s.selectedObjectIds);
  const currentSlide = usePresentationStore(s => 
    s.presentation.slides[s.currentSlideIndex]
  );
  const updateObject = usePresentationStore(s => s.updateObject);
  const deleteObject = usePresentationStore(s => s.deleteObject);
  const duplicateObject = usePresentationStore(s => s.duplicateObject);
  const copy = usePresentationStore(s => s.copy);
  const paste = usePresentationStore(s => s.paste);
  const cut = usePresentationStore(s => s.cut);
  const undo = usePresentationStore(s => s.undo);
  const redo = usePresentationStore(s => s.redo);
  const saveToHistory = usePresentationStore(s => s.saveToHistory);
  const zoom = usePresentationStore(s => s.zoom);
  const setZoom = usePresentationStore(s => s.setZoom);

  const selectedObjects = currentSlide?.objects.filter(obj =>
    selectedObjectIds.includes(obj.id)
  ) || [];

  const addTextObject = () => {
    const textObj: TextObject = {
      id: `text-${Date.now()}`,
      type: 'text',
      name: 'Text',
      content: 'Введите текст',
      transform: {
        x: 100,
        y: 100,
        width: 300,
        height: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      },
      style: {
        fontFamily: 'Inter',
        fontSize: 24,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        textAlign: 'left',
        lineHeight: 1.5,
        letterSpacing: 0,
        textDecoration: 'none'
      },
      locked: false,
      hidden: false,
      opacity: 1,
      zIndex: currentSlide.objects.length,
      animations: []
    };
    addObject(textObj);
    saveToHistory();
  };

  const addShape = (shapeType: 'rectangle' | 'circle' | 'triangle') => {
    const shapeObj: ShapeObject = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      name: shapeType,
      shapeType,
      transform: {
        x: 150,
        y: 150,
        width: 200,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
      },
      style: {
        fill: '#3b82f6',
        stroke: '#1e40af',
        strokeWidth: 2,
        opacity: 1
      },
      locked: false,
      hidden: false,
      opacity: 1,
      zIndex: currentSlide.objects.length,
      animations: []
    };
    addObject(shapeObj);
    saveToHistory();
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const imageObj: ImageObject = {
          id: `image-${Date.now()}`,
          type: 'image',
          name: 'Image',
          url: reader.result as string,
          transform: {
            x: 100,
            y: 100,
            width: 400,
            height: 300,
            rotation: 0,
            scaleX: 1,
            scaleY: 1
          },
          locked: false,
          hidden: false,
          opacity: 1,
          zIndex: currentSlide.objects.length,
          animations: []
        };
        addObject(imageObj);
        saveToHistory();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleDelete = () => {
    if (selectedObjectIds.length > 0) {
      selectedObjectIds.forEach(id => deleteObject(id));
      saveToHistory();
    }
  };

  const handleDuplicate = () => {
    if (selectedObjectIds.length > 0) {
      selectedObjectIds.forEach(id => duplicateObject(id));
      saveToHistory();
    }
  };

  const handleCopy = () => {
    copy();
  };

  const handlePaste = () => {
    paste();
    saveToHistory();
  };

  const handleCut = () => {
    cut();
    saveToHistory();
  };

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  const handleZoomIn = () => {
    setZoom(zoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom(zoom - 0.1);
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background border-b">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleUndo} title="Undo (Ctrl+Z)">
          <Icon name="Undo" size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleRedo} title="Redo (Ctrl+Y)">
          <Icon name="Redo" size={18} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={addTextObject} title="Add Text (T)">
          <Icon name="Type" size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => addShape('rectangle')} title="Add Rectangle (R)">
          <Icon name="Square" size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => addShape('circle')} title="Add Circle (C)">
          <Icon name="Circle" size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => addShape('triangle')} title="Add Triangle">
          <Icon name="Triangle" size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleImageUpload} title="Add Image (I)">
          <Icon name="Image" size={18} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy} 
          disabled={selectedObjectIds.length === 0}
          title="Copy (Ctrl+C)"
        >
          <Icon name="Copy" size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePaste}
          title="Paste (Ctrl+V)"
        >
          <Icon name="Clipboard" size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCut}
          disabled={selectedObjectIds.length === 0}
          title="Cut (Ctrl+X)"
        >
          <Icon name="Scissors" size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDuplicate}
          disabled={selectedObjectIds.length === 0}
          title="Duplicate (Ctrl+D)"
        >
          <Icon name="CopyPlus" size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDelete}
          disabled={selectedObjectIds.length === 0}
          title="Delete (Del)"
        >
          <Icon name="Trash2" size={18} />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out">
          <Icon name="ZoomOut" size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleZoomReset} title="Reset Zoom">
          <span className="text-xs font-medium w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In">
          <Icon name="ZoomIn" size={18} />
        </Button>
      </div>
    </div>
  );
}
