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
        <ShapeTransition type="liquid" />
      </div>

      {/* Правая часть - приветствие и новости */}
      <div className="w-full lg:w-1/2 relative bg-background overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center p-8 md:p-16">
          {/* Приветствие */}
          <div className="max-w-2xl w-full mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              {homePage.greeting}
            </h1>
            <Button 
              size="lg"
              onClick={onStart}
              className="w-full md:w-auto text-lg px-8 py-6"
            >
              Начать чтение
            </Button>
          </div>

          {/* Новости */}
          {homePage.news && homePage.news.length > 0 && (
            <div className="max-w-2xl w-full space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Новости
              </h2>
              {homePage.news.map((newsItem) => (
                <div 
                  key={newsItem.id}
                  className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border"
                >
                  {newsItem.imageUrl && (
                    <img 
                      src={newsItem.imageUrl} 
                      alt={newsItem.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {newsItem.title}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(newsItem.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
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
