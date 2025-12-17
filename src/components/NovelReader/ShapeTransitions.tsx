// Фигурные переходы между изображением и текстом
// Вдохновлено дизайном из загруженной картинки

interface ShapeTransitionProps {
  type?: 'wave' | 'diagonal' | 'organic' | 'curved' | 'liquid' | 'triangle' | 'hexagon' | 'arc' | 'stairs' | 'zigzag' | 'rounded' | 'sharp' | 'double-wave';
  fillColor?: string;
}

function ShapeTransition({ type = 'wave', fillColor = 'hsl(var(--background))' }: ShapeTransitionProps) {
  const shapes = {
    // Плавная волна
    wave: "M 0 0 Q 50 50, 0 100 T 0 200 T 0 300 T 0 400 T 0 500 T 0 600 T 0 700 T 0 800 T 0 900 T 0 1000 L 100 1000 L 100 0 Z",
    
    // Диагональный срез
    diagonal: "M 0 0 L 100 200 L 100 1000 L 100 1000 L 100 0 Z",
    
    // Органичная форма
    organic: "M 0 0 Q 80 100, 20 200 Q -20 300, 40 400 Q 90 500, 10 600 Q -10 700, 50 800 Q 100 900, 0 1000 L 100 1000 L 100 0 Z",
    
    // Плавные изгибы
    curved: "M 0 0 C 60 50, 80 150, 0 200 S -20 300, 0 400 S 80 500, 0 600 S -20 700, 0 800 S 60 900, 0 1000 L 100 1000 L 100 0 Z",
    
    // Жидкая форма
    liquid: "M 0 0 Q 70 80, 30 160 Q -10 240, 50 320 Q 100 400, 20 480 Q -20 560, 60 640 Q 110 720, 10 800 Q -30 880, 40 960 Q 90 1020, 0 1000 L 100 1000 L 100 0 Z",
    
    // Треугольные вырезы (как на картинках с юристами)
    triangle: "M 0 0 L 100 150 L 0 300 L 100 450 L 0 600 L 100 750 L 0 900 L 100 1000 L 100 0 Z",
    
    // Шестиугольники (как на фото-презентациях)
    hexagon: "M 0 0 L 80 100 L 80 200 L 0 300 L 80 400 L 80 500 L 0 600 L 80 700 L 80 800 L 0 900 L 100 1000 L 100 0 Z",
    
    // Большая дуга (как на корпоративных слайдах)
    arc: "M 0 0 Q 120 500, 0 1000 L 100 1000 L 100 0 Z",
    
    // Ступеньки
    stairs: "M 0 0 L 60 0 L 60 200 L 0 200 L 0 400 L 60 400 L 60 600 L 0 600 L 0 800 L 60 800 L 60 1000 L 100 1000 L 100 0 Z",
    
    // Зигзаг
    zigzag: "M 0 0 L 100 100 L 0 200 L 100 300 L 0 400 L 100 500 L 0 600 L 100 700 L 0 800 L 100 900 L 0 1000 L 100 1000 L 100 0 Z",
    
    // Округлая волна (мягкие переходы)
    rounded: "M 0 0 C 50 0, 100 100, 0 200 C 100 200, 50 300, 0 400 C 50 400, 100 500, 0 600 C 100 600, 50 700, 0 800 C 50 800, 100 900, 0 1000 L 100 1000 L 100 0 Z",
    
    // Острые углы
    sharp: "M 0 0 L 50 150 L 0 300 L 70 450 L 0 600 L 50 750 L 0 900 L 100 1000 L 100 0 Z",
    
    // Двойная волна
    'double-wave': "M 0 0 Q 40 50, 0 100 Q 60 150, 0 200 Q 40 250, 0 300 Q 60 350, 0 400 Q 40 450, 0 500 Q 60 550, 0 600 Q 40 650, 0 700 Q 60 750, 0 800 Q 40 850, 0 900 Q 60 950, 0 1000 L 100 1000 L 100 0 Z"
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