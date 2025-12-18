import { HomePage as HomePageData, Novel } from '@/types/novel';
import { Button } from './ui/button';

interface HomePageProps {
  homePage: HomePageData;
  novel: Novel;
  onStart: () => void;
}

function HomePage({ homePage, novel, onStart }: HomePageProps) {
  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* Левая часть - фоновое изображение */}
      <div 
        className="hidden lg:block lg:w-1/2 h-screen relative overflow-hidden flex-shrink-0"
        style={{
          backgroundImage: homePage.greetingImage 
            ? `url(${homePage.greetingImage})` 
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
        <div className="absolute top-0 right-0 h-full w-64 pointer-events-none z-20">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#151d28]/50 to-[#151d28]" />
        </div>
      </div>

      {/* Правая часть - приветствие и новости */}
      <div className="w-full lg:w-1/2 h-screen relative overflow-y-auto scrollbar-hide" style={{ backgroundColor: '#151d28' }}>
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
        
        <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-32 md:pb-16 p-8 md:p-16 relative z-10">
          {/* Приветствие */}
          <div className="max-w-2xl w-full mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              {homePage.greeting}
            </h1>
            <Button 
              size="lg"
              onClick={onStart}
              className="w-full md:w-auto text-lg px-8 py-6 shadow-2xl bg-[#151d28] text-white hover:bg-[#1a2430]"
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
        className="lg:hidden absolute inset-0 -z-10 flex flex-col"
      >
        <div 
          className="h-1/2 relative"
          style={{
            backgroundImage: homePage.greetingImage 
              ? `url(${homePage.greetingImage})` 
              : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.6) 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent via-[#151d28]/50 to-[#151d28] z-20" />
        </div>
        <div className="h-1/2" style={{ backgroundColor: '#151d28' }} />
      </div>
    </div>
  );
}

export default HomePage;