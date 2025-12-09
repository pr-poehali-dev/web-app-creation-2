import { useState, useEffect, useCallback } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings, UserProfile, defaultSettings, defaultProfile } from '@/types/settings';
import NovelReader from '@/components/NovelReader';
import AdminPanel from '@/components/AdminPanel';
import EpisodeMenu from '@/components/EpisodeMenu';
import UserProfilePanel from '@/components/UserProfilePanel';
import SettingsPanel from '@/components/SettingsPanel';
import HomePage from '@/components/HomePage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const initialNovel: Novel = {
  id: '1',
  title: 'Тайна старого особняка',
  description: 'Интерактивная визуальная новелла',
  currentEpisodeId: 'ep1',
  currentParagraphIndex: 0,
  episodes: [
    {
      id: 'ep1',
      title: 'Начало',
      position: { x: 100, y: 100 },
      paragraphs: [
        {
          id: 'p1',
          type: 'text',
          content: 'Дождливым вечером ты подъезжаешь к старому особняку. Массивные железные ворота скрипят, открываясь перед тобой.'
        },
        {
          id: 'p2',
          type: 'dialogue',
          characterName: 'Смотритель',
          characterImage: '🧙‍♂️',
          text: 'Добро пожаловать. Я ждал тебя. Особняк полон тайн, но будь осторожен...'
        },
        {
          id: 'p3',
          type: 'text',
          content: 'Ты входишь внутрь. Массивная дубовая дверь закрывается за тобой с глухим звуком.'
        },
        {
          id: 'p4',
          type: 'choice',
          question: 'Куда ты направишься?',
          options: [
            { id: 'c1', text: 'Подняться по лестнице', nextEpisodeId: 'ep2' },
            { id: 'c2', text: 'Исследовать первый этаж', nextEpisodeId: 'ep3' }
          ]
        }
      ]
    },
    {
      id: 'ep2',
      title: 'Второй этаж',
      position: { x: 300, y: 50 },
      paragraphs: [
        {
          id: 'p5',
          type: 'text',
          content: 'Поднимаясь по скрипучей лестнице, ты слышишь странные звуки из дальней комнаты.'
        },
        {
          id: 'p6',
          type: 'dialogue',
          characterName: 'Призрак',
          characterImage: '👻',
          text: 'Наконец-то... Кто-то пришёл... Помоги мне найти потерянный медальон...'
        },
        {
          id: 'p7',
          type: 'item',
          name: 'Старинный ключ',
          description: 'Ты нашёл ржавый ключ под половицей. Интересно, что он открывает?',
          imageUrl: '🗝️'
        }
      ]
    },
    {
      id: 'ep3',
      title: 'Библиотека',
      position: { x: 300, y: 150 },
      paragraphs: [
        {
          id: 'p8',
          type: 'text',
          content: 'Библиотека завалена пыльными книгами. Один из томов светится странным светом.'
        },
        {
          id: 'p9',
          type: 'dialogue',
          characterName: 'Книга',
          characterImage: '📖',
          text: 'Я - Книга Знаний. Задай мне вопрос, и я отвечу... но за цену.'
        }
      ]
    }
  ],
  library: {
    items: [],
    characters: [],
    choices: []
  },
  homePage: {
    greeting: 'Добро пожаловать в интерактивную визуальную новеллу',
    news: [
      {
        id: 'news1',
        title: 'Добро пожаловать!',
        content: 'Это ваша первая визуальная новелла. Исследуйте старый особняк, встречайте персонажей и принимайте решения, которые повлияют на историю.',
        date: new Date().toISOString()
      }
    ]
  },
  fileStorage: {
    images: [],
    audio: []
  }
};

type View = 'home' | 'reader' | 'admin' | 'episodes' | 'profile' | 'settings';

function Index() {
  const [novel, setNovel] = useState<Novel>(initialNovel);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [activeView, setActiveView] = useState<View>('home');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);
  const [showParagraphsDialog, setShowParagraphsDialog] = useState(false);
  const [selectedEpisodeForParagraphs, setSelectedEpisodeForParagraphs] = useState<string | null>(null);

  useEffect(() => {
    const savedNovel = localStorage.getItem('visualNovel');
    const savedSettings = localStorage.getItem('userSettings');
    const savedProfile = localStorage.getItem('userProfile');
    
    if (savedNovel) {
      try {
        setNovel(JSON.parse(savedNovel));
      } catch (e) {
        console.error('Failed to load novel', e);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('visualNovel', JSON.stringify(novel));
  }, [novel]);

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  const handleNovelUpdate = useCallback((updatedNovel: Novel) => {
    setNovel(updatedNovel);
  }, []);

  const handleSettingsUpdate = useCallback((updatedSettings: UserSettings) => {
    setSettings(updatedSettings);
  }, []);

  const handleProfileUpdate = useCallback((updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  }, []);

  const handleAdminLogin = useCallback(() => {
    if (adminPassword === '7859624') {
      setActiveView('admin');
      setShowAdminButton(false);
      setAdminPassword('');
    } else {
      alert('Неверный пароль');
    }
  }, [adminPassword]);

  const handleEpisodeSelect = useCallback((episodeId: string, paragraphIndex?: number) => {
    setNovel({
      ...novel,
      currentEpisodeId: episodeId,
      currentParagraphIndex: paragraphIndex !== undefined ? paragraphIndex : 0
    });
    setActiveView('reader');
  }, [novel]);

  const handleNavigateToBookmark = useCallback((episodeId: string, paragraphIndex: number) => {
    setNovel({
      ...novel,
      currentEpisodeId: episodeId,
      currentParagraphIndex: paragraphIndex
    });
    setActiveView('reader');
  }, [novel]);

  if (activeView === 'admin') {
    return (
      <AdminPanel 
        novel={novel} 
        onUpdate={handleNovelUpdate}
        onLogout={() => setActiveView('reader')}
      />
    );
  }

  if (activeView === 'episodes') {
    return (
      <EpisodeMenu
        novel={novel}
        profile={profile}
        onEpisodeSelect={handleEpisodeSelect}
        onBack={() => setActiveView('reader')}
      />
    );
  }

  if (activeView === 'profile') {
    return (
      <UserProfilePanel
        profile={profile}
        novel={novel}
        onUpdate={handleProfileUpdate}
        onBack={() => setActiveView('reader')}
        onNavigateTo={handleNavigateToBookmark}
      />
    );
  }

  if (activeView === 'settings') {
    return (
      <SettingsPanel
        settings={settings}
        onUpdate={handleSettingsUpdate}
        onBack={() => setActiveView('reader')}
      />
    );
  }

  if (activeView === 'home') {
    return (
      <div className="relative min-h-screen dark">
        <HomePage 
          homePage={novel.homePage || { greeting: 'Добро пожаловать', news: [] }}
          onStart={() => setActiveView('reader')}
        />
        
        <div className="fixed top-4 right-4 flex gap-2 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="bg-card/50 backdrop-blur-sm hover:bg-card/80"
            onClick={() => setActiveView('settings')}
          >
            <Icon name="Settings" size={20} />
          </Button>
          
          {!showAdminButton ? (
            <Button
              variant="ghost"
              size="icon"
              className="bg-card/50 backdrop-blur-sm hover:bg-card/80 opacity-30 hover:opacity-100 transition-opacity"
              onClick={() => setShowAdminButton(true)}
            >
              <Icon name="Lock" size={20} />
            </Button>
          ) : (
            <div className="flex gap-2 bg-card/90 backdrop-blur-sm rounded-lg p-2">
              <Input
                type="password"
                placeholder="Пароль"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdminLogin();
                }}
                className="w-32 text-foreground"
              />
              <Button size="sm" onClick={handleAdminLogin}>
                <Icon name="LogIn" size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setShowAdminButton(false);
                  setAdminPassword('');
                }}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen dark flex">
      {/* Список эпизодов слева */}
      <div className="w-80 bg-background border-r border-border overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Эпизоды</h2>
          <div className="space-y-2">
            {novel.episodes.map((episode, index) => {
              const isCurrent = novel.currentEpisodeId === episode.id;
              const isExpanded = expandedEpisode === episode.id;
              
              return (
                <div key={episode.id} className="space-y-1">
                  <button
                    onClick={() => {
                      if (isCurrent) {
                        setExpandedEpisode(isExpanded ? null : episode.id);
                      } else {
                        handleEpisodeSelect(episode.id);
                        setExpandedEpisode(null);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isCurrent 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'bg-card hover:bg-card/80 text-foreground hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-bold text-sm">{index + 1}.</span>
                        <span className="text-sm font-medium">{episode.title}</span>
                      </div>
                      {isCurrent && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEpisodeForParagraphs(episode.id);
                            setShowParagraphsDialog(true);
                          }}
                        >
                          <Icon name="List" size={14} />
                        </Button>
                      )}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {episode.paragraphs.length} параграфов
                    </div>
                  </button>
                  

                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Читалка справа */}
      <div className="flex-1 relative">
        <NovelReader 
          novel={novel} 
          settings={settings}
          profile={profile}
          onUpdate={handleNovelUpdate}
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
      
      {/* Меню справа */}
      <div className="fixed top-4 right-4 flex gap-2 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80"
          onClick={() => setActiveView('home')}
        >
          <Icon name="Home" size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80"
          onClick={() => setActiveView('profile')}
        >
          <Icon name="User" size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80"
          onClick={() => setActiveView('settings')}
        >
          <Icon name="Settings" size={20} />
        </Button>
        
        {!showAdminButton ? (
          <Button
            variant="ghost"
            size="icon"
            className="bg-card/50 backdrop-blur-sm hover:bg-card/80 opacity-30 hover:opacity-100 transition-opacity"
            onClick={() => setShowAdminButton(true)}
          >
            <Icon name="Lock" size={20} />
          </Button>
        ) : (
          <div className="flex gap-2 bg-card/90 backdrop-blur-sm rounded-lg p-2">
            <Input
              type="password"
              placeholder="Пароль"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdminLogin();
              }}
              className="w-32 text-foreground"
              autoFocus
            />
            <Button size="sm" onClick={handleAdminLogin}>
              <Icon name="LogIn" size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => {
                setShowAdminButton(false);
                setAdminPassword('');
              }}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Диалог выбора параграфов */}
      <Dialog open={showParagraphsDialog} onOpenChange={setShowParagraphsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Параграфы: {novel.episodes.find(ep => ep.id === selectedEpisodeForParagraphs)?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] space-y-2 pr-2">
            {selectedEpisodeForParagraphs && novel.episodes.find(ep => ep.id === selectedEpisodeForParagraphs)?.paragraphs.map((para, pIndex) => {
              const isCurrentPara = novel.currentEpisodeId === selectedEpisodeForParagraphs && novel.currentParagraphIndex === pIndex;
              const isVisited = novel.currentEpisodeId === selectedEpisodeForParagraphs && pIndex <= novel.currentParagraphIndex;
              const isLocked = !isVisited;
              
              return (
                <button
                  key={para.id}
                  onClick={() => {
                    if (!isLocked) {
                      handleEpisodeSelect(selectedEpisodeForParagraphs, pIndex);
                      setShowParagraphsDialog(false);
                    }
                  }}
                  disabled={isLocked}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isCurrentPara
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                      : isLocked
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50'
                      : 'bg-card hover:bg-card/80 text-foreground hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold">#{pIndex + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="uppercase text-xs font-bold opacity-70">{para.type}</span>
                        {isLocked && <Icon name="Lock" size={12} />}
                      </div>
                      {para.type === 'text' && para.content && (
                        <p className="text-sm opacity-80 line-clamp-2">{para.content}</p>
                      )}
                      {para.type === 'dialogue' && para.characterName && (
                        <p className="text-sm opacity-80">{para.characterName}: {para.text?.slice(0, 50)}...</p>
                      )}
                      {para.type === 'item' && para.name && (
                        <p className="text-sm opacity-80">{para.name}</p>
                      )}
                      {para.type === 'choice' && para.question && (
                        <p className="text-sm opacity-80">{para.question}</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Index;