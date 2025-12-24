import { useState } from 'react';
import { SceneProject, Scene, Layer } from '@/types/scene';
import SceneEditor from '@/components/SceneEditor/SceneEditor';
import { Button } from '@/components/ui/button';
import { downloadHTML } from '@/utils/exportToHTML';

const createDemoProject = (): SceneProject => {
  const demoScene: Scene = {
    id: 'scene-1',
    name: 'Демонстрационная сцена',
    duration: 5,
    layers: [
      {
        id: 'bg-1',
        name: 'Фон',
        type: 'background',
        order: 0,
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width: 1280,
        height: 720,
        rotation: 0,
        opacity: 1,
        scale: 1,
        backgroundColor: '#1a1a2e'
      },
      {
        id: 'title-1',
        name: 'Заголовок',
        type: 'text',
        order: 1,
        visible: true,
        locked: false,
        x: 100,
        y: 200,
        width: 1080,
        height: 100,
        rotation: 0,
        opacity: 1,
        scale: 1,
        textContent: 'Добро пожаловать в Scene Editor!',
        fontSize: 48,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center'
      },
      {
        id: 'subtitle-1',
        name: 'Подзаголовок',
        type: 'text',
        order: 2,
        visible: true,
        locked: false,
        x: 200,
        y: 350,
        width: 880,
        height: 60,
        rotation: 0,
        opacity: 0.8,
        scale: 1,
        textContent: 'Создавайте интерактивные истории с анимациями',
        fontSize: 24,
        fontFamily: 'Inter',
        color: '#94a3b8',
        textAlign: 'center'
      },
      {
        id: 'shape-1',
        name: 'Декоративный элемент',
        type: 'shape',
        order: 0.5,
        visible: true,
        locked: false,
        x: 500,
        y: 500,
        width: 280,
        height: 100,
        rotation: 0,
        opacity: 0.3,
        scale: 1,
        backgroundColor: '#3b82f6'
      }
    ],
    animations: [
      {
        id: 'anim-1',
        layerId: 'title-1',
        name: 'Появление заголовка',
        duration: 1,
        keyframes: [
          {
            id: 'kf-1',
            time: 0,
            property: 'opacity',
            value: 0,
            easing: 'ease-in-out'
          },
          {
            id: 'kf-2',
            time: 1,
            property: 'opacity',
            value: 1,
            easing: 'ease-in-out'
          }
        ],
        trigger: 'onLoad'
      },
      {
        id: 'anim-2',
        layerId: 'subtitle-1',
        name: 'Появление подзаголовка',
        duration: 1,
        delay: 0.5,
        keyframes: [
          {
            id: 'kf-3',
            time: 0,
            property: 'y',
            value: 400,
            easing: 'ease-out'
          },
          {
            id: 'kf-4',
            time: 1,
            property: 'y',
            value: 350,
            easing: 'ease-out'
          }
        ],
        trigger: 'onLoad'
      }
    ],
    audioTracks: [],
    choices: [
      {
        id: 'choice-1',
        text: 'Начать редактирование',
        variables: { started: true }
      },
      {
        id: 'choice-2',
        text: 'Экспортировать в HTML',
        variables: { exported: true }
      }
    ],
    variables: {
      started: false,
      exported: false
    }
  };

  return {
    id: 'demo-project',
    name: 'Демо-проект Scene Editor',
    scenes: [demoScene],
    globalVariables: {},
    currentSceneId: 'scene-1',
    settings: {
      width: 1280,
      height: 720,
      backgroundColor: '#0a0f14',
      defaultFontFamily: 'Inter, system-ui, sans-serif',
      accessibility: {
        enableKeyboardNav: true,
        enableAriaLabels: true
      }
    }
  };
};

export default function SceneEditorDemo() {
  const [project, setProject] = useState<SceneProject>(createDemoProject());
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleExport = () => {
    downloadHTML(project);
  };

  if (isEditorOpen) {
    return (
      <SceneEditor
        project={project}
        onSave={setProject}
        onClose={() => setIsEditorOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold">Scene Editor MVP</h1>
          <p className="text-xl text-muted-foreground">
            Веб-редактор интерактивных историй с функционалом PowerPoint
          </p>
        </div>

        <div className="bg-card rounded-lg p-8 shadow-lg space-y-6">
          <h2 className="text-2xl font-semibold">Возможности</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">✨ Редактор</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Слои (фон, текст, изображения, видео, фигуры)</li>
                <li>• Drag & Drop интерфейс</li>
                <li>• Панель свойств с настройками</li>
                <li>• Управление порядком слоёв</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">🎬 Анимации</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ключевые кадры (keyframes)</li>
                <li>• Timeline с визуализацией</li>
                <li>• Easing функции (linear, bounce, elastic)</li>
                <li>• Трансформации (позиция, масштаб, поворот)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">🎯 Ветвления</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Условные переходы между сценами</li>
                <li>• Система переменных</li>
                <li>• Выборы с визуальными кнопками</li>
                <li>• Проверка условий (JavaScript)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">🎵 Аудио</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Howler.js для воспроизведения</li>
                <li>• Таймкоды с синхронизацией</li>
                <li>• Crossfade между треками</li>
                <li>• Действия по таймкодам (highlight, show/hide)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-8 shadow-lg space-y-4">
          <h2 className="text-2xl font-semibold">Экспорт</h2>
          <p className="text-muted-foreground">
            Проект экспортируется в самодостаточный HTML-файл с встроенными:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• GSAP 3.12.5 для анимаций</li>
            <li>• Howler.js 2.2.4 для аудио</li>
            <li>• Навигация клавиатурой (Space, Arrow keys)</li>
            <li>• Адаптивный дизайн для разных экранов</li>
            <li>• Система выборов с условными переходами</li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            onClick={() => setIsEditorOpen(true)}
            className="text-lg px-8 py-6"
          >
            Открыть редактор
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={handleExport}
            className="text-lg px-8 py-6"
          >
            Экспортировать демо в HTML
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2 pt-8">
          <p><strong>Технологии:</strong> React + TypeScript + GSAP + Howler.js + Vite</p>
          <p><strong>Структура:</strong> Scene-based архитектура с слоями, анимациями и ветвлениями</p>
          <p><strong>Совместимость:</strong> IndexedDB для офлайн-работы, ARIA для accessibility</p>
        </div>
      </div>
    </div>
  );
}
