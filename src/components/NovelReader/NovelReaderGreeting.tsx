import { Novel } from '@/types/novel';

interface NovelReaderGreetingProps {
  novel: Novel;
}

function NovelReaderGreeting({ novel }: NovelReaderGreetingProps) {
  return (
    <div className="w-full max-w-4xl relative z-10 space-y-6 overflow-y-auto h-screen scrollbar-hide pt-20 pb-8">
      {/* Фоновое изображение */}
      <div 
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'url(https://cdn.poehali.dev/files/4c59d030-8954-4c43-bc6b-b094a4e6ac06_4.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="text-center animate-fade-in relative z-10">
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-border">
          {novel.homePage?.greetingImage && (
            <img 
              src={novel.homePage.greetingImage} 
              alt="Greeting" 
              className="w-full max-w-md mx-auto mb-6 rounded-xl"
            />
          )}
          <h1 className="text-4xl font-bold mb-4 text-foreground">{novel.homePage.greeting}</h1>
          <p className="text-muted-foreground text-sm">Выберите эпизод в боковой панели для начала чтения</p>
        </div>
      </div>

      {novel.homePage?.news && novel.homePage.news.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground text-center">Новости</h2>
          {novel.homePage.news.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl p-6 shadow-xl border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {new Date(item.date).toLocaleDateString('ru-RU')}
                </span>
              </div>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full rounded-lg mb-4" />
              )}
              <p className="text-foreground whitespace-pre-wrap">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NovelReaderGreeting;