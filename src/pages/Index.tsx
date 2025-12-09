import { useState, useEffect, useCallback } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings, UserProfile, defaultSettings, defaultProfile } from '@/types/settings';

const API_URL = 'https://functions.poehali.dev/a5862c6f-ca89-4789-b680-9ca4719c90a1';
import NovelReader from '@/components/NovelReader';
import AdminPanel from '@/components/AdminPanel';
import EpisodeMenu from '@/components/EpisodeMenu';
import UserProfilePanel from '@/components/UserProfilePanel';
import SettingsPanel from '@/components/SettingsPanel';
import HomePage from '@/components/HomePage';
import EpisodesSidebar from '@/components/EpisodesSidebar';
import NavigationMenu from '@/components/NavigationMenu';
import ParagraphsDialog from '@/components/ParagraphsDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

const initialNovel: Novel = {
  title: 'Тайна старого особняка',
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
  const [showParagraphsDialog, setShowParagraphsDialog] = useState(false);
  const [selectedEpisodeForParagraphs, setSelectedEpisodeForParagraphs] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка новеллы из БД при старте
  useEffect(() => {
    const loadNovel = async () => {
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const novelData = await response.json();
          setNovel(novelData);
        } else {
          console.error('Failed to load novel from database');
          setNovel(initialNovel);
        }
      } catch (error) {
        console.error('Error loading novel:', error);
        setNovel(initialNovel);
      } finally {
        setIsLoading(false);
      }
    };

    loadNovel();

    // Загружаем настройки и профиль из localStorage (они остаются локальными)
    const savedSettings = localStorage.getItem('userSettings');
    const savedProfile = localStorage.getItem('userProfile');
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    }
  }, []);

  // Автосохранение новеллы в БД только для админа
  useEffect(() => {
    if (!isLoading && isAdmin) {
      const saveNovel = async () => {
        try {
          await fetch(`${API_URL}?admin=true`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novel)
          });
        } catch (error) {
          console.error('Error saving novel:', error);
        }
      };

      const timeoutId = setTimeout(saveNovel, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [novel, isAdmin, isLoading]);

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
      setIsAdmin(true);
      setActiveView('admin');
      setShowAdminButton(false);
      setAdminPassword('');
    } else {
      alert('Неверный пароль');
    }
  }, [adminPassword]);

  const handleEpisodeSelect = useCallback((episodeId: string, paragraphIndex?: number) => {
    setProfile({
      ...profile,
      currentEpisodeId: episodeId,
      currentParagraphIndex: paragraphIndex !== undefined ? paragraphIndex : 0
    });
    setActiveView('reader');
  }, [profile]);

  const handleNavigateToBookmark = useCallback((episodeId: string, paragraphIndex: number) => {
    setProfile({
      ...profile,
      currentEpisodeId: episodeId,
      currentParagraphIndex: paragraphIndex
    });
    setActiveView('reader');
  }, [profile]);

  const handleShowParagraphs = useCallback((episodeId: string) => {
    setSelectedEpisodeForParagraphs(episodeId);
    setShowParagraphsDialog(true);
  }, []);

  const handleAddBookmark = useCallback((comment: string) => {
    const currentEpisode = novel.episodes.find(ep => ep.id === profile.currentEpisodeId);
    if (!currentEpisode) return;

    const existingBookmark = profile.bookmarks.find(
      b => b.episodeId === profile.currentEpisodeId && b.paragraphIndex === profile.currentParagraphIndex
    );

    const newBookmark = {
      id: existingBookmark?.id || `bm${Date.now()}`,
      episodeId: profile.currentEpisodeId,
      paragraphIndex: profile.currentParagraphIndex,
      comment,
      createdAt: existingBookmark?.createdAt || new Date().toISOString()
    };

    const updatedBookmarks = existingBookmark
      ? profile.bookmarks.map(b => b.id === existingBookmark.id ? newBookmark : b)
      : [...profile.bookmarks, newBookmark];

    setProfile({
      ...profile,
      bookmarks: updatedBookmarks
    });
  }, [novel, profile]);

  const handleRemoveBookmark = useCallback(() => {
    const existingBookmark = profile.bookmarks.find(
      b => b.episodeId === profile.currentEpisodeId && b.paragraphIndex === profile.currentParagraphIndex
    );

    if (existingBookmark) {
      setProfile({
        ...profile,
        bookmarks: profile.bookmarks.filter(b => b.id !== existingBookmark.id)
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground">Загрузка новеллы...</p>
        </div>
      </div>
    );
  }

  if (activeView === 'admin') {
    return (
      <AdminPanel 
        novel={novel} 
        onUpdate={handleNovelUpdate}
        onLogout={() => {
          setActiveView('reader');
          setIsAdmin(false);
        }}
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
          onStart={() => {
            // Если нет прогресса или некорректные данные - начинаем с первого эпизода
            const hasValidProgress = profile.currentEpisodeId && 
              novel.episodes.some(ep => ep.id === profile.currentEpisodeId) &&
              profile.currentParagraphIndex !== undefined;
            
            if (!hasValidProgress) {
              const firstEpisode = novel.episodes[0];
              if (firstEpisode) {
                setProfile({
                  ...profile,
                  currentEpisodeId: firstEpisode.id,
                  currentParagraphIndex: 0
                });
              }
            }
            setActiveView('reader');
          }}
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
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed top-4 left-4 z-[60] bg-card/90 backdrop-blur-sm p-2 rounded-lg shadow-lg text-white"
      >
        <Icon name={showSidebar ? 'X' : 'Menu'} size={20} />
      </button>

      {/* Paragraph counter - left top */}
      {profile.currentEpisodeId && (
        <div className="hidden md:block fixed top-4 left-[340px] z-50">
          <div className="text-xs text-muted-foreground bg-card/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
            {profile.currentParagraphIndex + 1} / {novel.episodes.find(ep => ep.id === profile.currentEpisodeId)?.paragraphs.length}
          </div>
        </div>
      )}

      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - hidden on mobile by default */}
      <div className={`fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <EpisodesSidebar
          novel={novel}
          currentEpisodeId={profile.currentEpisodeId}
          onEpisodeSelect={(episodeId, paragraphIndex) => {
            handleEpisodeSelect(episodeId, paragraphIndex);
            setShowSidebar(false);
          }}
          onShowParagraphs={(episodeId) => {
            handleShowParagraphs(episodeId);
            setShowSidebar(false);
          }}
        />
      </div>

      <div className="flex-1 relative">
        <NovelReader 
          novel={novel} 
          settings={settings}
          profile={profile}
          onUpdate={handleNovelUpdate}
          onProfileUpdate={handleProfileUpdate}
          currentEpisodeId={profile.currentEpisodeId}
          currentParagraphIndex={profile.currentParagraphIndex}
        />
      </div>
      
      <NavigationMenu
        showAdminButton={showAdminButton}
        adminPassword={adminPassword}
        onSetActiveView={setActiveView}
        onSetShowAdminButton={setShowAdminButton}
        onSetAdminPassword={setAdminPassword}
        onAdminLogin={handleAdminLogin}
        episodeId={profile.currentEpisodeId}
        paragraphIndex={profile.currentParagraphIndex}
        currentParagraph={profile.currentParagraphIndex + 1}
        totalParagraphs={novel.episodes.find(ep => ep.id === profile.currentEpisodeId)?.paragraphs.length}
        existingBookmark={profile.bookmarks.find(
          b => b.episodeId === profile.currentEpisodeId && b.paragraphIndex === profile.currentParagraphIndex
        )}
        onAddBookmark={handleAddBookmark}
        onRemoveBookmark={handleRemoveBookmark}
      />

      <ParagraphsDialog
        open={showParagraphsDialog}
        novel={novel}
        selectedEpisodeId={selectedEpisodeForParagraphs}
        onOpenChange={setShowParagraphsDialog}
        onEpisodeSelect={handleEpisodeSelect}
      />
    </div>
  );
}

export default Index;