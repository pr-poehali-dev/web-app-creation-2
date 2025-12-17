// Фигурные переходы между изображением и текстом
// Вдохновлено дизайном из загруженной картинки

interface ShapeTransitionProps {
  type?: 'wave' | 'diagonal' | 'organic' | 'curved' | 'liquid';
  fillColor?: string;
}

function ShapeTransition({ type = 'wave', fillColor = 'hsl(var(--background))' }: ShapeTransitionProps) {
  const shapes = {
    // Плавная волна
    wave: "M 0 0 Q 50 50, 0 100 T 0 200 T 0 300 T 0 400 T 0 500 T 0 600 T 0 700 T 0 800 T 0 900 T 0 1000 L 100 1000 L 100 0 Z",
    
    // Диагональный срез с закруглением (как в первом примере на картинке)
    diagonal: "M 0 0 L 100 200 L 100 1000 L 100 1000 L 100 0 Z",
    
    // Органичная форма (как во втором примере)
    organic: "M 0 0 Q 80 100, 20 200 Q -20 300, 40 400 Q 90 500, 10 600 Q -10 700, 50 800 Q 100 900, 0 1000 L 100 1000 L 100 0 Z",
    
    // Плавные изгибы (третий пример)
    curved: "M 0 0 C 60 50, 80 150, 0 200 S -20 300, 0 400 S 80 500, 0 600 S -20 700, 0 800 S 60 900, 0 1000 L 100 1000 L 100 0 Z",
    
    // Жидкая форма (четвертый пример)
    liquid: "M 0 0 Q 70 80, 30 160 Q -10 240, 50 320 Q 100 400, 20 480 Q -20 560, 60 640 Q 110 720, 10 800 Q -30 880, 40 960 Q 90 1020, 0 1000 L 100 1000 L 100 0 Z"
  };

  return (
    <div className="absolute top-0 right-0 h-full w-32 pointer-events-none">
      <svg 
        viewBox="0 0 100 1000" 
        preserveAspectRatio="none" 
        className="absolute top-0 right-0 h-full w-full"
        style={{ 
          filter: 'drop-shadow(-3px 0 12px rgba(0,0,0,0.15))',
          transform: 'translateX(1px)' // Устраняем зазор
        }}
      >
        <path 
          d={shapes[type]}
          fill={fillColor}
        />
      </svg>
    </div>
  );
}

export default ShapeTransition;
