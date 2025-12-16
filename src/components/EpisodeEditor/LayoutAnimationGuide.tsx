import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

export default function LayoutAnimationGuide() {
  const [open, setOpen] = useState(false);

  const layouts = [
    { 
      id: 'simple', 
      name: 'Простые', 
      items: [
        { name: 'Один фрейм', emoji: '▫️', grid: 'grid-cols-1', cells: [1] },
        { name: '2 в ряд', emoji: '▪️▪️', grid: 'grid-cols-2', cells: [1, 1] },
        { name: '3 в ряд', emoji: '▪️▪️▪️', grid: 'grid-cols-3', cells: [1, 1, 1] },
        { name: '4 в ряд', emoji: '▪️▪️▪️▪️', grid: 'grid-cols-4', cells: [1, 1, 1, 1] },
        { name: '2 в столбец', emoji: '⬛⬛', grid: 'grid-cols-1 grid-rows-2', cells: [1, 1] },
        { name: '3 в столбец', emoji: '⬛⬛⬛', grid: 'grid-cols-1 grid-rows-3', cells: [1, 1, 1] },
        { name: '4 в столбец', emoji: '⬛⬛⬛⬛', grid: 'grid-cols-1 grid-rows-4', cells: [1, 1, 1, 1] },
      ]
    },
    {
      id: 'grid',
      name: 'Сетки',
      items: [
        { name: 'Сетка 2×2', emoji: '▦', grid: 'grid-cols-2 grid-rows-2', cells: [1, 1, 1, 1] },
        { name: 'Сетка 3×3', emoji: '▦', grid: 'grid-cols-3 grid-rows-3', cells: [1, 1, 1, 1, 1, 1, 1, 1, 1] },
        { name: 'Сетка 2×3', emoji: '▦', grid: 'grid-cols-2 grid-rows-3', cells: [1, 1, 1, 1, 1, 1] },
      ]
    },
    {
      id: 'combo',
      name: 'Комбинации',
      items: [
        { name: '2+1', emoji: '▪️▪️▫️', grid: 'grid-cols-3', cells: [2, 2, 1], spans: ['col-span-1', 'col-span-1', 'col-span-1'] },
        { name: '1+2', emoji: '▫️▪️▪️', grid: 'grid-cols-3', cells: [1, 2, 2], spans: ['col-span-1', 'col-span-1', 'col-span-1'] },
        { name: 'Мозаика ←', emoji: '⬛▫️▫️', grid: 'grid-cols-2 grid-rows-2', cells: [2, 1, 1], spans: ['row-span-2', '', ''] },
        { name: 'Мозаика →', emoji: '▫️▫️⬛', grid: 'grid-cols-2 grid-rows-2', cells: [1, 2, 1], spans: ['', 'row-span-2', ''] },
      ]
    },
    {
      id: 'creative',
      name: 'Креативные',
      items: [
        { name: 'Центр', emoji: '▫️⬛▫️', grid: 'grid-cols-3 grid-rows-3', cells: [1, 1, 1, 1, 2, 1, 1, 1, 1], spans: ['', '', '', '', 'col-span-1 row-span-1', '', '', '', ''] },
        { name: 'Пирамида', emoji: '🔺', grid: 'grid-cols-2 grid-rows-2', cells: [2, 1, 1], spans: ['col-span-2', '', ''] },
        { name: 'Обр. пирамида', emoji: '🔻', grid: 'grid-cols-2 grid-rows-2', cells: [1, 1, 2], spans: ['', '', 'col-span-2'] },
        { name: 'L-форма', emoji: '↪️', grid: 'grid-cols-3 grid-rows-3', cells: [2, 1, 1, 1, 1, 1], spans: ['col-span-2 row-span-2', 'col-start-3', 'col-start-3', '', '', ''] },
        { name: 'Прожектор', emoji: '▫️⬛▫️', grid: 'grid-cols-3 grid-rows-3', cells: [1, 1, 1, 1, 2, 1, 1, 1, 1] },
      ]
    }
  ];

  const animations = [
    {
      id: 'smooth',
      name: 'Плавные',
      items: [
        { name: 'Плавное', emoji: '✨', desc: 'Мягкое появление' },
        { name: 'Размытие', emoji: '🌫️', desc: 'Из размытия в четкость' },
      ]
    },
    {
      id: 'move',
      name: 'Движение',
      items: [
        { name: 'Снизу вверх', emoji: '⬆️', desc: 'Выезд снизу' },
        { name: 'Сверху вниз', emoji: '⬇️', desc: 'Выезд сверху' },
        { name: 'Справа налево', emoji: '⬅️', desc: 'Выезд справа' },
        { name: 'Слева направо', emoji: '➡️', desc: 'Выезд слева' },
      ]
    },
    {
      id: 'scale',
      name: 'Масштаб',
      items: [
        { name: 'Увеличение', emoji: '🔍', desc: 'От малого к нормальному' },
        { name: 'Уменьшение', emoji: '🔎', desc: 'От большого к нормальному' },
      ]
    },
    {
      id: 'rotate',
      name: 'Вращение',
      items: [
        { name: 'Переворот', emoji: '🔄', desc: 'Переворот по Y' },
        { name: 'Переворот X', emoji: '↕️', desc: 'Переворот по X' },
        { name: 'Вращение', emoji: '🌀', desc: 'Вращение с появлением' },
      ]
    },
    {
      id: 'dynamic',
      name: 'Динамичные',
      items: [
        { name: 'Прыжок', emoji: '🏀', desc: 'Эффект отскока' },
        { name: 'Тряска', emoji: '⚡', desc: 'Быстрая тряска' },
        { name: 'Волна', emoji: '🌊', desc: 'Волнообразное движение' },
      ]
    },
    {
      id: 'effects',
      name: 'Эффекты',
      items: [
        { name: 'Разделение ↕️', emoji: '⬍⬌', desc: 'Вертикальное раскрытие' },
        { name: 'Разделение ↔️', emoji: '⬍⬌', desc: 'Горизонтальное раскрытие' },
        { name: 'Глитч', emoji: '📺', desc: 'Эффект глюка' },
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          <Icon name="HelpCircle" size={14} className="mr-1" />
          Подсказка
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Макеты и анимации комикс-фреймов</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="layouts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="layouts">Макеты</TabsTrigger>
            <TabsTrigger value="animations">Анимации</TabsTrigger>
          </TabsList>
          
          <TabsContent value="layouts" className="space-y-6 mt-4">
            {layouts.map(category => (
              <div key={category.id} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {category.items.map((layout, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-3 space-y-2 hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{layout.name}</span>
                        <span className="text-lg">{layout.emoji}</span>
                      </div>
                      <div className={`grid ${layout.grid} gap-1 h-20`}>
                        {layout.cells.map((cell, cellIdx) => (
                          <div 
                            key={cellIdx} 
                            className={`bg-primary/20 rounded ${layout.spans?.[cellIdx] || ''} flex items-center justify-center`}
                            style={{ gridColumn: cell > 1 ? `span ${cell}` : undefined }}
                          >
                            <span className="text-xs text-muted-foreground">{cellIdx + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="animations" className="space-y-6 mt-4">
            {animations.map(category => (
              <div key={category.id} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.items.map((anim, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors">
                      <span className="text-2xl">{anim.emoji}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{anim.name}</div>
                        <div className="text-xs text-muted-foreground">{anim.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-primary mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Анимация по умолчанию</strong> применяется ко всем фреймам параграфа</p>
                  <p><strong>Своя анимация</strong> для фрейма переопределяет анимацию по умолчанию</p>
                  <p><strong>Задержка между фреймами:</strong> 0.2 секунды (автоматически)</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
