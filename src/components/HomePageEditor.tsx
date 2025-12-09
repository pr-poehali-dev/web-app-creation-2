import { useState } from 'react';
import { HomePage, NewsItem } from '@/types/novel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface HomePageEditorProps {
  homePage: HomePage;
  onUpdate: (homePage: HomePage) => void;
}

function HomePageEditor({ homePage, onUpdate }: HomePageEditorProps) {
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const handleAddNews = () => {
    const newNews: NewsItem = {
      id: `news${Date.now()}`,
      title: 'Новая новость',
      content: 'Содержание новости',
      date: new Date().toISOString()
    };

    onUpdate({
      ...homePage,
      news: [...(homePage.news || []), newNews]
    });
    setEditingNewsId(newNews.id);
  };

  const handleUpdateNews = (newsId: string, updates: Partial<NewsItem>) => {
    onUpdate({
      ...homePage,
      news: homePage.news.map(n => n.id === newsId ? { ...n, ...updates } : n)
    });
  };

  const handleDeleteNews = (newsId: string) => {
    onUpdate({
      ...homePage,
      news: homePage.news.filter(n => n.id !== newsId)
    });
    setEditingNewsId(null);
  };

  const handleMoveNews = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= homePage.news.length) return;

    const newNews = [...homePage.news];
    [newNews[index], newNews[newIndex]] = [newNews[newIndex], newNews[index]];
    onUpdate({ ...homePage, news: newNews });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Приветствие</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Изображение (URL)</Label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={homePage.greetingImage || ''}
              onChange={(e) => onUpdate({ ...homePage, greetingImage: e.target.value })}
              className="text-foreground mt-1"
            />
          </div>
          {homePage.greetingImage && (
            <img src={homePage.greetingImage} alt="Greeting" className="w-full max-w-md rounded-lg" />
          )}
          <div>
            <Label>Текст приветствия</Label>
            <Textarea
              value={homePage.greeting || ''}
              onChange={(e) => onUpdate({ ...homePage, greeting: e.target.value })}
              placeholder="Добро пожаловать"
              rows={3}
              className="text-foreground text-lg mt-1"
            />
            <p className="text-xs text-muted-foreground mt-2">Можно использовать несколько строк</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">Новости</h3>
          <Button onClick={handleAddNews}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить новость
          </Button>
        </div>

        {homePage.news && homePage.news.length > 0 ? (
          <div className="space-y-4">
            {homePage.news.map((news, index) => (
              <Card key={news.id} className={editingNewsId === news.id ? 'border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveNews(index, 'up')}
                        disabled={index === 0}
                      >
                        <Icon name="ChevronUp" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMoveNews(index, 'down')}
                        disabled={index === homePage.news.length - 1}
                      >
                        <Icon name="ChevronDown" size={16} />
                      </Button>
                    </div>

                    <div className="flex-1 space-y-3">
                      {editingNewsId === news.id ? (
                        <>
                          <div className="space-y-2">
                            <Label>Заголовок</Label>
                            <Input
                              value={news.title}
                              onChange={(e) => handleUpdateNews(news.id, { title: e.target.value })}
                              className="text-foreground"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Изображение (URL)</Label>
                            <Input
                              placeholder="https://example.com/news-image.jpg"
                              value={news.imageUrl || ''}
                              onChange={(e) => handleUpdateNews(news.id, { imageUrl: e.target.value })}
                              className="text-foreground"
                            />
                          </div>
                          {news.imageUrl && (
                            <img src={news.imageUrl} alt={news.title} className="w-full rounded-lg" />
                          )}
                          <div className="space-y-2">
                            <Label>Содержание</Label>
                            <Textarea
                              value={news.content}
                              onChange={(e) => handleUpdateNews(news.id, { content: e.target.value })}
                              rows={4}
                              className="text-foreground"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Дата</Label>
                            <Input
                              type="date"
                              value={news.date ? new Date(news.date).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleUpdateNews(news.id, { date: new Date(e.target.value).toISOString() })}
                              className="text-foreground"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-foreground">{news.title}</h4>
                            <span className="text-sm text-muted-foreground">
                              {new Date(news.date).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          {news.imageUrl && (
                            <img src={news.imageUrl} alt={news.title} className="w-full rounded-lg mt-2" />
                          )}
                          <p className="text-foreground whitespace-pre-wrap">{news.content}</p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingNewsId(editingNewsId === news.id ? null : news.id)}
                      >
                        <Icon name={editingNewsId === news.id ? "Check" : "Edit"} size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteNews(news.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Нет новостей. Добавьте первую новость.
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePageEditor;