import { HomePage as HomePageType } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  homePage: HomePageType;
  onStart: () => void;
}

function HomePage({ homePage, onStart }: HomePageProps) {
  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground animate-scale-in">
            {homePage.greeting || 'Добро пожаловать'}
          </h1>
          <Button size="lg" onClick={onStart} className="mt-8">
            Начать историю
          </Button>
        </div>

        {homePage.news && homePage.news.length > 0 && (
          <div className="space-y-4 mt-12">
            <h2 className="text-2xl font-bold text-foreground text-center">Новости</h2>
            {homePage.news.map((item) => (
              <Card key={item.id} className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{item.title}</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {new Date(item.date).toLocaleDateString('ru-RU')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
