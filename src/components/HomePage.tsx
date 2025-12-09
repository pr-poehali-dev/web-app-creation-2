import { HomePage as HomePageType } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  homePage: HomePageType;
  onStart: () => void;
}

function HomePage({ homePage, onStart }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 dark flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-6 bg-card/30 backdrop-blur-xl border-2 border-primary/20 rounded-3xl p-12 shadow-2xl">
          {homePage.greetingImage && (
            <img 
              src={homePage.greetingImage} 
              alt="Greeting" 
              className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl animate-fade-in border-4 border-primary/30"
            />
          )}
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-scale-in whitespace-pre-wrap leading-tight">
            {homePage.greeting || 'Добро пожаловать'}
          </h1>
          <Button size="lg" onClick={onStart} className="mt-8 text-lg px-8 py-6 rounded-2xl bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all">
            Начать историю
          </Button>
        </div>

        {homePage.news && homePage.news.length > 0 && (
          <div className="space-y-6 mt-12">
            <h2 className="text-3xl font-bold text-foreground text-center">Новости</h2>
            {homePage.news.map((item) => (
              <Card key={item.id} className="animate-fade-in bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-xl">{item.title}</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {new Date(item.date).toLocaleDateString('ru-RU')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.title} className="w-full rounded-xl shadow-lg border-2 border-primary/20" />
                  )}
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">{item.content}</p>
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