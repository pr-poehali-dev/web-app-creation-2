import { useState } from 'react';
import { Novel } from '@/types/novel';
import { VisualStory } from '@/types/visual-slide';
import TextEditor from '@/components/TextEditor/TextEditor';
import VisualEditor from '@/components/VisualEditor/VisualEditor';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const createDemoNovel = (): Novel => {
  return {
    title: 'Демо новелла',
    description: 'Тестовая новелла для редактора слайдов',
    episodes: [
      {
        id: 'ep1',
        title: 'Пролог',
        position: { x: 0, y: 0 },
        paragraphs: [
          {
            id: 'p2',
            type: 'text',
            content: 'Добро пожаловать в редактор слайдов! Здесь вы можете создавать визуальные истории с текстом, диалогами и выборами.'
          },
          {
            id: 'p3',
            type: 'dialogue',
            characterName: 'Проводник',
            text: 'Я помогу вам разобраться с функционалом редактора. Каждый параграф — это отдельный элемент истории.',
            characterImage: 'https://i.pravatar.cc/150?img=1'
          },
          {
            id: 'p4',
            type: 'choice',
            question: 'Что вы хотите узнать?',
            options: [
              {
                id: 'c1',
                text: 'Как создать текст?',
                nextParagraphIndex: 3
              },
              {
                id: 'c2',
                text: 'Как создать диалог?',
                nextParagraphIndex: 4
              },
              {
                id: 'c3',
                text: 'Как добавить предметы?',
                nextParagraphIndex: 5
              }
            ]
          },
          {
            id: 'p5',
            type: 'item',
            name: 'Демо предмет',
            description: 'Тестовый предмет для демонстрации',
            itemType: 'collectible',
            action: 'gain'
          }
        ]
      }
    ],
    library: {
      items: [
        {
          id: 'demo-item',
          name: 'Демо предмет',
          description: 'Тестовый предмет для демонстрации',
          itemType: 'collectible'
        }
      ],
      characters: [
        {
          id: 'guide',
          name: 'Проводник',
          defaultImage: 'https://i.pravatar.cc/150?img=1',
          images: [
            {
              id: 'img1',
              url: 'https://i.pravatar.cc/150?img=1',
              name: 'default'
            }
          ]
        }
      ],
      choices: []
    }
  };
};

export default function SlideEditorDemo() {
  const [novel, setNovel] = useState<Novel>(createDemoNovel());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'text' | 'visual'>('text');

  if (isEditorOpen) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-card border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditorOpen(false)}
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <div className="flex gap-2">
              <Button
                variant={editorMode === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditorMode('text')}
              >
                <Icon name="Type" size={16} className="mr-2" />
                Текстовый редактор
              </Button>
              <Button
                variant={editorMode === 'visual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditorMode('visual')}
              >
                <Icon name="Presentation" size={16} className="mr-2" />
                Визуальный редактор
              </Button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {editorMode === 'text' ? (
            <TextEditor
              novel={novel}
              onUpdate={setNovel}
              onClose={() => setIsEditorOpen(false)}
              onOpenVisualEditor={() => setEditorMode('visual')}
            />
          ) : (
            <VisualEditor
              novel={novel}
              visualStory={null}
              onUpdate={(story) => console.log('Visual story updated:', story)}
              onClose={() => setIsEditorOpen(false)}
              onBackToText={() => setEditorMode('text')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Icon name="Presentation" size={48} className="text-primary" />
            <h1 className="text-5xl font-bold">Редактор слайдов</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Визуальный редактор для создания интерактивных историй
          </p>
        </div>

        <div className="bg-card rounded-lg p-8 shadow-lg space-y-6">
          <h2 className="text-2xl font-semibold">Возможности</h2>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Icon name="Type" size={20} />
                Текст и диалоги
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Текстовые параграфы</li>
                <li>• Диалоги с персонажами</li>
                <li>• Форматирование</li>
                <li>• Выборы и ветвления</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Icon name="Image" size={20} />
                Визуальный контент
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Фоновые изображения</li>
                <li>• Комикс-фреймы</li>
                <li>• Настройка позиционирования</li>
                <li>• Множественные слои</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Icon name="Sparkles" size={20} />
                Анимации
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Плавное появление (fade)</li>
                <li>• Скольжение (slide)</li>
                <li>• Масштабирование (zoom)</li>
                <li>• Эффекты (glitch, shake)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Icon name="Layout" size={20} />
                Интерфейс
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Список слайдов с превью</li>
                <li>• Панель свойств</li>
                <li>• WYSIWYG канвас</li>
                <li>• Масштабирование</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-8 shadow-lg space-y-4">
          <h2 className="text-2xl font-semibold">Как использовать</h2>
          <ol className="text-left text-muted-foreground space-y-3">
            <li className="flex gap-3">
              <span className="font-semibold text-primary">1.</span>
              <span>
                Откройте <strong>Админ-панель</strong> и нажмите кнопку{' '}
                <strong>"Редактор слайдов"</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary">2.</span>
              <span>
                Выберите эпизод из выпадающего списка
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary">3.</span>
              <span>
                Добавляйте слайды через кнопки на панели инструментов (текст,
                диалог, фон, изображение)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary">4.</span>
              <span>
                Редактируйте контент через панель свойств справа
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary">5.</span>
              <span>
                Добавляйте фреймы и настраивайте анимации для каждого слайда
              </span>
            </li>
          </ol>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            onClick={() => setIsEditorOpen(true)}
            className="text-lg px-8 py-6"
          >
            <Icon name="Play" size={20} className="mr-2" />
            Открыть демо редактор
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            Редактор интегрирован с читалкой — все изменения сразу отображаются
            при чтении новеллы
          </p>
        </div>
      </div>
    </div>
  );
}