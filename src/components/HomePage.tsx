import { HomePage as HomePageData } from '@/types/novel';
import { Button } from './ui/button';
import ShapeTransition from './NovelReader/ShapeTransitions';

interface HomePageProps {
  homePage: HomePageData;
  onStart: () => void;
}

function HomePage({ homePage, onStart }: HomePageProps) {
  return (
    <div className="min-h-screen flex">
      {/* Левая часть - фоновое изображение */}
      <div 
        className="hidden lg:block lg:w-1/2 relative overflow-hidden"
        style={{
          backgroundImage: homePage.greetingImage 
            ? `url(${homePage.greetingImage})` 
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
        <ShapeTransition type="rounded" fillColor="hsl(210, 70%, 15%)" />
      </div>

      {/* Правая часть - приветствие и новости */}
      <div className="w-full lg:w-1/2 relative overflow-y-auto" style={{ background: 'linear-gradient(135deg, hsl(210, 70%, 15%) 0%, hsl(215, 65%, 20%) 100%)' }}>
        {/* Декоративные фигуры */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-32 w-24 h-24 rotate-45" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.3), hsl(var(--accent)/0.2))' }} />
        <div className="absolute bottom-32 left-10 w-40 h-40 bg-accent/10 rounded-full blur-2xl" />
        <svg className="absolute top-10 left-10 w-20 h-20 text-primary/30" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-20 right-20 w-16 h-16 text-accent/20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
        
        <div className="min-h-screen flex flex-col items-center justify-center p-8 md:p-16 relative z-10">
          {/* Приветствие */}
          <div className="max-w-2xl w-full mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              {homePage.greeting}
            </h1>
            <Button 
              size="lg"
              onClick={onStart}
              className="w-full md:w-auto text-lg px-8 py-6 shadow-2xl"
            >
              Начать чтение
            </Button>
          </div>

          {/* Новости */}
          {homePage.news && homePage.news.length > 0 && (
            <div className="max-w-2xl w-full space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Новости
              </h2>
              {homePage.news.map((newsItem) => (
                <div 
                  key={newsItem.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                >
                  {newsItem.imageUrl && (
                    <img 
                      src={newsItem.imageUrl} 
                      alt={newsItem.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {newsItem.title}
                    </h3>
                    <span className="text-sm text-white/60">
                      {new Date(newsItem.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-white/80 leading-relaxed">
                    {newsItem.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Мобильный фон */}
      <div 
        className="lg:hidden absolute inset-0 -z-10"
        style={{
          backgroundImage: homePage.greetingImage 
            ? `url(${homePage.greetingImage})` 
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>
    </div>
  );
}

export default HomePage;