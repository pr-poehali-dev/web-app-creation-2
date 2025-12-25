import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { 
  Presentation, 
  Slide, 
  SlideObject, 
  EditorState,
  Theme 
} from '@/types/presentation';

const defaultTheme: Theme = {
  id: 'default',
  name: 'Default Theme',
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1f2937'
  },
  layouts: []
};

const createEmptySlide = (): Slide => ({
  id: `slide-${Date.now()}`,
  name: 'Untitled Slide',
  objects: [],
  background: {
    type: 'color',
    value: '#ffffff'
  },
  transition: {
    effect: 'fade',
    duration: 500
  },
  notes: ''
});

const createEmptyPresentation = (): Presentation => ({
  id: `pres-${Date.now()}`,
  title: 'Untitled Presentation',
  description: '',
  slides: [createEmptySlide()],
  theme: defaultTheme,
  settings: {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    autoAdvance: false,
    autoAdvanceDelay: 5000
  },
  variables: {},
  metadata: {
    author: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  }
});

interface PresentationStore extends EditorState {
  setPresentation: (presentation: Presentation) => void;
  setCurrentSlide: (index: number) => void;
  
  addSlide: (index?: number) => void;
  duplicateSlide: (index: number) => void;
  deleteSlide: (index: number) => void;
  moveSlide: (fromIndex: number, toIndex: number) => void;
  updateSlide: (index: number, updates: Partial<Slide>) => void;
  
  addObject: (object: SlideObject) => void;
  updateObject: (objectId: string, updates: Partial<SlideObject>) => void;
  deleteObject: (objectId: string) => void;
  duplicateObject: (objectId: string) => void;
  moveObject: (objectId: string, zIndexDelta: number) => void;
  
  selectObjects: (objectIds: string[]) => void;
  clearSelection: () => void;
  
  copy: () => void;
  paste: () => void;
  cut: () => void;
  
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  setMode: (mode: EditorState['mode']) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleSnap: () => void;
  
  addGuide: (type: 'horizontal' | 'vertical', position: number) => void;
  removeGuide: (index: number) => void;
  
  reset: () => void;
}

export const usePresentationStore = create<PresentationStore>()(
  immer((set, get) => ({
    presentation: createEmptyPresentation(),
    currentSlideIndex: 0,
    selectedObjectIds: [],
    clipboard: [],
    history: [],
    historyIndex: -1,
    mode: 'editor',
    zoom: 1,
    grid: {
      enabled: true,
      size: 20,
      snap: true
    },
    guides: [],

    setPresentation: (presentation) => set({ presentation }),

    setCurrentSlide: (index) => {
      const { presentation } = get();
      if (index >= 0 && index < presentation.slides.length) {
        set({ currentSlideIndex: index, selectedObjectIds: [] });
      }
    },

    addSlide: (index) => set((state) => {
      const newSlide = createEmptySlide();
      const insertIndex = index ?? state.presentation.slides.length;
      state.presentation.slides.splice(insertIndex, 0, newSlide);
      state.currentSlideIndex = insertIndex;
      state.presentation.metadata.updatedAt = new Date().toISOString();
    }),

    duplicateSlide: (index) => set((state) => {
      if (index >= 0 && index < state.presentation.slides.length) {
        const slide = state.presentation.slides[index];
        const newSlide: Slide = {
          ...JSON.parse(JSON.stringify(slide)),
          id: `slide-${Date.now()}`,
          name: `${slide.name} (Copy)`
        };
        state.presentation.slides.splice(index + 1, 0, newSlide);
        state.currentSlideIndex = index + 1;
        state.presentation.metadata.updatedAt = new Date().toISOString();
      }
    }),

    deleteSlide: (index) => set((state) => {
      if (state.presentation.slides.length > 1 && index >= 0 && index < state.presentation.slides.length) {
        state.presentation.slides.splice(index, 1);
        if (state.currentSlideIndex >= state.presentation.slides.length) {
          state.currentSlideIndex = state.presentation.slides.length - 1;
        }
        state.presentation.metadata.updatedAt = new Date().toISOString();
      }
    }),

    moveSlide: (fromIndex, toIndex) => set((state) => {
      if (fromIndex >= 0 && fromIndex < state.presentation.slides.length &&
          toIndex >= 0 && toIndex < state.presentation.slides.length) {
        const [slide] = state.presentation.slides.splice(fromIndex, 1);
        state.presentation.slides.splice(toIndex, 0, slide);
        state.currentSlideIndex = toIndex;
        state.presentation.metadata.updatedAt = new Date().toISOString();
      }
    }),

    updateSlide: (index, updates) => set((state) => {
      if (index >= 0 && index < state.presentation.slides.length) {
        Object.assign(state.presentation.slides[index], updates);
        state.presentation.metadata.updatedAt = new Date().toISOString();
      }
    }),

    addObject: (object) => set((state) => {
      const slide = state.presentation.slides[state.currentSlideIndex];
      if (slide) {
        slide.objects.push(object);
        state.selectedObjectIds = [object.id];
        state.presentation.metadata.updatedAt = new Date().toISOString();
      }
    }),

    updateObject: (objectId, updates) => set((state) => {
      const slide = state.presentation.slides[state.currentSlideIndex];
      if (slide) {
        const object = slide.objects.find(obj => obj.id === objectId);
        if (object) {
          Object.assign(object, updates);
          state.presentation.metadata.updatedAt = new Date().toISOString();
        }
      }
    }),

    deleteObject: (objectId) => set((state) => {
      const slide = state.presentation.slides[state.currentSlideIndex];
      if (slide) {
        slide.objects = slide.objects.filter(obj => obj.id !== objectId);
        state.selectedObjectIds = state.selectedObjectIds.filter(id => id !== objectId);
        state.presentation.metadata.updatedAt = new Date().toISOString();
      }
    }),

    duplicateObject: (objectId) => set((state) => {
      const slide = state.presentation.slides[state.currentSlideIndex];
      if (slide) {
        const object = slide.objects.find(obj => obj.id === objectId);
        if (object) {
          const newObject: SlideObject = {
            ...JSON.parse(JSON.stringify(object)),
            id: `obj-${Date.now()}`,
            transform: {
              ...object.transform,
              x: object.transform.x + 20,
              y: object.transform.y + 20
            }
          };
          slide.objects.push(newObject);
          state.selectedObjectIds = [newObject.id];
          state.presentation.metadata.updatedAt = new Date().toISOString();
        }
      }
    }),

    moveObject: (objectId, zIndexDelta) => set((state) => {
      const slide = state.presentation.slides[state.currentSlideIndex];
      if (slide) {
        const objectIndex = slide.objects.findIndex(obj => obj.id === objectId);
        if (objectIndex !== -1) {
          const newIndex = Math.max(0, Math.min(slide.objects.length - 1, objectIndex + zIndexDelta));
          const [object] = slide.objects.splice(objectIndex, 1);
          slide.objects.splice(newIndex, 0, object);
          slide.objects.forEach((obj, idx) => {
            obj.zIndex = idx;
          });
          state.presentation.metadata.updatedAt = new Date().toISOString();
        }
      }
    }),

    selectObjects: (objectIds) => set({ selectedObjectIds: objectIds }),

    clearSelection: () => set({ selectedObjectIds: [] }),

    copy: () => set((state) => {
      const slide = state.presentation.slides[state.currentSlideIndex];
      if (slide) {
        const selectedObjects = slide.objects.filter(obj => 
          state.selectedObjectIds.includes(obj.id)
        );
        state.clipboard = JSON.parse(JSON.stringify(selectedObjects));
      }
    }),

    paste: () => set((state) => {
      const slide = state.presentation.slides[state.currentSlideIndex];
      if (slide && state.clipboard.length > 0) {
        const newObjects = state.clipboard.map(obj => ({
          ...JSON.parse(JSON.stringify(obj)),
          id: `obj-${Date.now()}-${Math.random()}`,
          transform: {
            ...obj.transform,
            x: obj.transform.x + 20,
            y: obj.transform.y + 20
          }
        }));
        slide.objects.push(...newObjects);
        state.selectedObjectIds = newObjects.map(obj => obj.id);
        state.presentation.metadata.updatedAt = new Date().toISOString();
      }
    }),

    cut: () => set((state) => {
      const slide = state.presentation.slides[state.currentSlideIndex];
      if (slide) {
        const selectedObjects = slide.objects.filter(obj => 
          state.selectedObjectIds.includes(obj.id)
        );
        state.clipboard = JSON.parse(JSON.stringify(selectedObjects));
        slide.objects = slide.objects.filter(obj => 
          !state.selectedObjectIds.includes(obj.id)
        );
        state.selectedObjectIds = [];
        state.presentation.metadata.updatedAt = new Date().toISOString();
      }
    }),

    undo: () => set((state) => {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1;
        state.presentation = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    }),

    redo: () => set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1;
        state.presentation = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    }),

    saveToHistory: () => set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(state.presentation)));
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        state.historyIndex += 1;
      }
      state.history = newHistory;
    }),

    setMode: (mode) => set({ mode }),

    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

    toggleGrid: () => set((state) => {
      state.grid.enabled = !state.grid.enabled;
    }),

    setGridSize: (size) => set((state) => {
      state.grid.size = Math.max(5, Math.min(100, size));
    }),

    toggleSnap: () => set((state) => {
      state.grid.snap = !state.grid.snap;
    }),

    addGuide: (type, position) => set((state) => {
      state.guides.push({ type, position });
    }),

    removeGuide: (index) => set((state) => {
      state.guides.splice(index, 1);
    }),

    reset: () => set({
      presentation: createEmptyPresentation(),
      currentSlideIndex: 0,
      selectedObjectIds: [],
      clipboard: [],
      history: [],
      historyIndex: -1,
      mode: 'editor',
      zoom: 1,
      grid: {
        enabled: true,
        size: 20,
        snap: true
      },
      guides: []
    })
  }))
);
