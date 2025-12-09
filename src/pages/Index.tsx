import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Novel {
  id: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
  description: string;
  chapters: Chapter[];
  progress: number;
  lastReadChapter: number;
}

interface Chapter {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
}

const mockNovels: Novel[] = [
  {
    id: '1',
    title: 'Тени прошлого',
    author: 'Анна Светлова',
    genre: 'Фэнтези',
    cover: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Захватывающая история о магии, тайнах и древних пророчествах.',
    progress: 45,
    lastReadChapter: 2,
    chapters: [
      { id: 1, title: 'Пробуждение', content: 'Утро началось необычно. Солнце едва пробивалось сквозь плотные облака, когда Элиза проснулась от странного шума за окном.\n\nОна подошла к окну и застыла. Во дворе стоял человек в длинном плаще, его фигура казалась нереальной в утреннем тумане.\n\n"Кто это?" - прошептала девушка, прижимаясь к холодному стеклу.\n\nНезнакомец медленно повернулся, и их взгляды встретились. В этот момент Элиза поняла - её жизнь изменится навсегда.', isRead: true },
      { id: 2, title: 'Первые шаги', content: 'Дни летели быстро. Элиза училась контролировать свои новые способности под руководством загадочного наставника.\n\n"Магия - это не просто сила, - говорил он. - Это ответственность, которую ты должна нести с достоинством."\n\nКаждое утро начиналось с тренировок. Элиза чувствовала, как внутри неё просыпается что-то древнее и могущественное.\n\nНо с каждым днём росла и опасность. Тёмные силы чувствовали пробуждение новой магии.', isRead: true },
      { id: 3, title: 'Тайна раскрыта', content: 'Правда оказалась страшнее, чем Элиза могла представить. Её семья хранила секрет на протяжении веков.\n\n"Ты последняя из рода Хранителей," - сказал наставник, открывая древнюю книгу.\n\nСтраницы светились магическим светом, рассказывая историю её предков. Они защищали мир от древнего зла.\n\nТеперь эта миссия легла на плечи Элизы. Она была готова принять свою судьбу.', isRead: true },
      { id: 4, title: 'Битва начинается', content: 'Тёмные маги не заставили себя долго ждать. Первая атака произошла на закате, когда небо окрасилось кровавым цветом.\n\nЭлиза стояла у ворот академии, чувствуя приближение опасности. Воздух наполнился электричеством.\n\n"Они здесь," - прошептала она, сжимая посох.\n\nИз теней появились фигуры в чёрных одеждах. Началась битва, которая определит судьбу мира.', isRead: false },
      { id: 5, title: 'Союзники', content: 'Но Элиза была не одна. К ней присоединились другие маги, готовые сражаться за свободу.\n\nВместе они были сильнее. Каждый обладал уникальными способностями, дополняющими друг друга.\n\n"Мы команда," - сказал один из новых друзей.\n\nИ Элиза впервые за долгое время почувствовала надежду. Вместе они могли победить.', isRead: false }
    ]
  },
  {
    id: '2',
    title: 'Город грёз',
    author: 'Марк Волков',
    genre: 'Романтика',
    cover: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: 'Современная история любви в большом городе.',
    progress: 100,
    lastReadChapter: 1,
    chapters: [
      { id: 1, title: 'Случайная встреча', content: 'Дождливый вечер. Кафе на углу улицы. Софья забежала укрыться от ливня.\n\nВнутри было тепло и уютно. Аромат свежего кофе смешивался с запахом дождя.\n\n"Свободно?" - услышала она мужской голос.\n\nОна подняла глаза и увидела его - высокого незнакомца с добрыми глазами. "Да, садитесь."', isRead: true },
      { id: 2, title: 'Второй шанс', content: 'Они встретились снова через неделю. В том же кафе, в то же время.\n\n"Вы тоже любите дождь?" - спросил он, улыбаясь.\n\nСофья кивнула. С этого дня их встречи стали регулярными.', isRead: true }
    ]
  },
  {
    id: '3',
    title: 'Киберпанк 2077',
    author: 'Дмитрий Новиков',
    genre: 'Научная фантастика',
    cover: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: 'Будущее, где технологии управляют жизнью людей.',
    progress: 23,
    lastReadChapter: 0,
    chapters: [
      { id: 1, title: 'Неоновые улицы', content: 'Город никогда не спит. Неоновые огни отражаются в лужах на мокром асфальте.\n\nМакс шёл по переулку, стараясь не привлекать внимания. В этом районе каждый второй - киборг или хакер.\n\nЕго имплант пищал, предупреждая об опасности. Кто-то следил за ним.', isRead: true },
      { id: 2, title: 'Взлом системы', content: 'Задание было простым - проникнуть в корпоративную сеть и украсть данные.\n\nНо Макс не учёл, что система окажется защищённой ИИ последнего поколения.\n\nНачалась игра в кошки-мышки в цифровом мире.', isRead: false },
      { id: 3, title: 'Погоня', content: 'Охрана корпорации была на хвосте. Макс бежал по крышам небоскрёбов.\n\nВетер свистел в ушах, город внизу сверкал миллионами огней.\n\n"Так просто меня не возьмёте," - прошептал он, активируя усилители.', isRead: false }
    ]
  }
];

function Index() {
  const [activeView, setActiveView] = useState<'library' | 'reader' | 'profile'>('library');
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [novels, setNovels] = useState<Novel[]>(mockNovels);

  useEffect(() => {
    const saved = localStorage.getItem('novelsData');
    if (saved) {
      setNovels(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('novelsData', JSON.stringify(novels));
  }, [novels]);

  const openReader = (novel: Novel) => {
    setSelectedNovel(novel);
    setCurrentChapter(novel.lastReadChapter || 0);
    setActiveView('reader');
  };

  const closeReader = () => {
    if (selectedNovel) {
      const updatedNovels = novels.map(n => {
        if (n.id === selectedNovel.id) {
          const chapters = [...n.chapters];
          chapters[currentChapter] = { ...chapters[currentChapter], isRead: true };
          const readCount = chapters.filter(c => c.isRead).length;
          return {
            ...n,
            chapters,
            lastReadChapter: currentChapter,
            progress: Math.round((readCount / chapters.length) * 100)
          };
        }
        return n;
      });
      setNovels(updatedNovels);
    }
    setActiveView('library');
    setSelectedNovel(null);
  };

  const nextChapter = () => {
    if (selectedNovel && currentChapter < selectedNovel.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const prevChapter = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const totalRead = novels.reduce((acc, n) => acc + n.chapters.filter(c => c.isRead).length, 0);
  const totalChapters = novels.reduce((acc, n) => acc + n.chapters.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 dark">
      {activeView === 'library' && (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
          <header className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  Библиотека Новелл
                </h1>
                <p className="text-muted-foreground">Ваши истории ждут продолжения</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => setActiveView('profile')}>
                <Icon name="User" size={20} />
              </Button>
            </div>
          </header>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="reading">Читаю</TabsTrigger>
              <TabsTrigger value="completed">Прочитано</TabsTrigger>
              <TabsTrigger value="bookmarks">
                <Icon name="Bookmark" size={16} />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {novels.map((novel, idx) => (
                  <Card 
                    key={novel.id} 
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group animate-scale-in"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    onClick={() => openReader(novel)}
                  >
                    <div 
                      className="h-48 relative"
                      style={{ background: novel.cover }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <Badge variant="secondary" className="text-xs">
                          {novel.genre}
                        </Badge>
                      </div>
                      {novel.progress > 0 && (
                        <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm shadow-lg">
                          {novel.progress}%
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {novel.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {novel.author}
                      </p>
                      <p className="text-sm text-muted-foreground/80 mb-4 line-clamp-2">
                        {novel.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{novel.chapters.filter(c => c.isRead).length} / {novel.chapters.length} глав</span>
                          <span>{novel.progress}%</span>
                        </div>
                        <Progress value={novel.progress} className="h-2" />
                      </div>
                      {novel.progress > 0 && novel.progress < 100 && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                          <Icon name="BookOpen" size={14} />
                          <span>Глава {novel.lastReadChapter + 1}: {novel.chapters[novel.lastReadChapter]?.title}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reading">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {novels.filter(n => n.progress > 0 && n.progress < 100).map((novel) => (
                  <Card 
                    key={novel.id} 
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => openReader(novel)}
                  >
                    <div 
                      className="h-48 relative"
                      style={{ background: novel.cover }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <Badge variant="secondary">{novel.genre}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{novel.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{novel.author}</p>
                      <Progress value={novel.progress} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {novels.filter(n => n.progress === 100).map((novel) => (
                  <Card key={novel.id} className="overflow-hidden cursor-pointer" onClick={() => openReader(novel)}>
                    <div 
                      className="h-48 relative"
                      style={{ background: novel.cover }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <Badge variant="secondary">{novel.genre}</Badge>
                      </div>
                      <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center">
                        <Icon name="Check" size={24} />
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2">{novel.title}</h3>
                      <p className="text-sm text-muted-foreground">{novel.author}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bookmarks">
              <div className="text-center py-16 text-muted-foreground">
                <Icon name="Bookmark" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Закладки появятся здесь</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {activeView === 'reader' && selectedNovel && (
        <div className="fixed inset-0 bg-background z-50 animate-fade-in">
          <div className="h-full flex flex-col">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={closeReader}>
                  <Icon name="ArrowLeft" size={20} />
                </Button>
                <div className="flex-1 text-center">
                  <h2 className="font-bold">{selectedNovel.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    Глава {currentChapter + 1} из {selectedNovel.chapters.length}
                  </p>
                </div>
                <Button variant="ghost" size="icon">
                  <Icon name="Settings" size={20} />
                </Button>
              </div>
              <Progress value={((currentChapter + 1) / selectedNovel.chapters.length) * 100} className="h-1" />
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className="container mx-auto max-w-3xl px-6 py-12">
                <h1 className="text-3xl font-bold mb-8 text-center">
                  {selectedNovel.chapters[currentChapter]?.title}
                </h1>
                <div className="novel-text text-lg leading-relaxed space-y-6">
                  {selectedNovel.chapters[currentChapter]?.content.split('\n\n').map((para, idx) => (
                    <p key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={prevChapter}
                  disabled={currentChapter === 0}
                >
                  <Icon name="ChevronLeft" size={16} className="mr-2" />
                  Назад
                </Button>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {currentChapter + 1} / {selectedNovel.chapters.length}
                  </Badge>
                </div>
                <Button 
                  onClick={nextChapter}
                  disabled={currentChapter === selectedNovel.chapters.length - 1}
                >
                  Далее
                  <Icon name="ChevronRight" size={16} className="ml-2" />
                </Button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {activeView === 'profile' && (
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => setActiveView('library')} className="mb-6">
            <Icon name="ArrowLeft" size={20} />
          </Button>

          <div className="text-center mb-12">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                ЧН
              </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold mb-2">Читатель Новелл</h1>
            <p className="text-muted-foreground">Любитель хороших историй</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon name="BookOpen" size={24} className="text-primary" />
                </div>
                <div className="text-3xl font-bold mb-1">{totalRead}</div>
                <div className="text-sm text-muted-foreground">Прочитано глав</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon name="Library" size={24} className="text-secondary" />
                </div>
                <div className="text-3xl font-bold mb-1">{novels.length}</div>
                <div className="text-sm text-muted-foreground">Новелл в библиотеке</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
                  <Icon name="Percent" size={24} className="text-accent-foreground" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  {Math.round((totalRead / totalChapters) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Общий прогресс</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon name="TrendingUp" size={20} />
                Активность чтения
              </h2>
              <div className="space-y-4">
                {novels.map((novel) => (
                  <div key={novel.id} className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded flex-shrink-0"
                      style={{ background: novel.cover }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{novel.title}</span>
                        <span className="text-sm text-muted-foreground ml-2">{novel.progress}%</span>
                      </div>
                      <Progress value={novel.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Index;
