import { useState } from 'react';
import ShapeTransition from './NovelReader/ShapeTransitions';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

const shapeTypes = [
  { type: 'wave' as const, name: 'Волна', description: 'Плавные волны' },
  { type: 'diagonal' as const, name: 'Диагональ', description: 'Угловой срез' },
  { type: 'organic' as const, name: 'Органика', description: 'Природные формы' },
  { type: 'curved' as const, name: 'Изгибы', description: 'Плавные кривые' },
  { type: 'liquid' as const, name: 'Жидкость', description: 'Текучие формы' }
];

function ShapeTransitionDemo() {
  const [selectedType, setSelectedType] = useState<'wave' | 'diagonal' | 'organic' | 'curved' | 'liquid'>('organic');

  return (
    <div className="min-h-screen bg-background p-8 dark">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">Фигурные переходы</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {shapeTypes.map((shape) => (
            <Card 
              key={shape.type}
              className={`cursor-pointer transition-all ${
                selectedType === shape.type 
                  ? 'border-primary border-2 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedType(shape.type)}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-full w-12">
                      <svg 
                        viewBox="0 0 100 1000" 
                        preserveAspectRatio="none" 
                        className="absolute top-0 right-0 h-full w-full"
                      >
                        <path 
                          d={
                            shape.type === 'wave' 
                              ? "M 0 0 Q 50 50, 0 100 T 0 200 T 0 300 T 0 400 T 0 500 T 0 600 T 0 700 T 0 800 T 0 900 T 0 1000 L 100 1000 L 100 0 Z"
                              : shape.type === 'diagonal'
                              ? "M 0 0 L 100 200 L 100 1000 L 100 1000 L 100 0 Z"
                              : shape.type === 'organic'
                              ? "M 0 0 Q 80 100, 20 200 Q -20 300, 40 400 Q 90 500, 10 600 Q -10 700, 50 800 Q 100 900, 0 1000 L 100 1000 L 100 0 Z"
                              : shape.type === 'curved'
                              ? "M 0 0 C 60 50, 80 150, 0 200 S -20 300, 0 400 S 80 500, 0 600 S -20 700, 0 800 S 60 900, 0 1000 L 100 1000 L 100 0 Z"
                              : "M 0 0 Q 70 80, 30 160 Q -10 240, 50 320 Q 100 400, 20 480 Q -20 560, 60 640 Q 110 720, 10 800 Q -30 880, 40 960 Q 90 1020, 0 1000 L 100 1000 L 100 0 Z"
                          }
                          fill="hsl(var(--background))"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{shape.name}</h3>
                    <p className="text-muted-foreground text-sm">{shape.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Предпросмотр: {shapeTypes.find(s => s.type === selectedType)?.name}</h2>
          <div className="flex h-96 rounded-xl overflow-hidden">
            <div className="w-1/2 bg-gradient-to-br from-blue-500 to-purple-500 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-2xl font-bold">Изображение</p>
              </div>
              <ShapeTransition type={selectedType} />
            </div>
            <div className="w-1/2 bg-background flex items-center justify-center">
              <p className="text-foreground text-2xl font-bold">Текст</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ShapeTransitionDemo;
