import { useState, useEffect, useCallback } from 'react';
import { Novel } from '@/types/novel';
import { UserSettings, UserProfile, defaultSettings, defaultProfile } from '@/types/settings';
import NovelReader from '@/components/NovelReader';
import AdminPanel from '@/components/AdminPanel';
import EpisodeMenu from '@/components/EpisodeMenu';
import UserProfilePanel from '@/components/UserProfilePanel';
import SettingsPanel from '@/components/SettingsPanel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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
  }
};

type View = 'reader' | 'admin' | 'episodes' | 'profile' | 'settings';

function Index() {
  const [novel, setNovel] = useState<Novel>(initialNovel);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [activeView, setActiveView] = useState<View>('reader');
  const [showAdminButton, setShowAdminButton] = useState(false);

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

  const handleAdminLogin = useCallback((password: string) => {
    if (password === '7859624') {
      setActiveView('admin');
      setShowAdminButton(false);
    }
  }, []);

  const handleEpisodeSelect = useCallback((episodeId: string) => {
    setNovel({
      ...novel,
      currentEpisodeId: episodeId,
      currentParagraphIndex: 0
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

  return (
    <div className="relative min-h-screen dark">
      <NovelReader 
        novel={novel} 
        settings={settings}
        profile={profile}
        onUpdate={handleNovelUpdate}
        onProfileUpdate={handleProfileUpdate}
      />
      
      <div className="fixed top-4 left-4 flex gap-2 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80"
          onClick={() => setActiveView('episodes')}
        >
          <Icon name="List" size={20} />
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
        
        {!showAdminButton && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-card/50 backdrop-blur-sm hover:bg-card/80 opacity-30 hover:opacity-100 transition-opacity"
            onClick={() => setShowAdminButton(true)}
          >
            <Icon name="Lock" size={20} />
          </Button>
        )}
      </div>

      {showAdminButton && (
        <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg animate-scale-in z-50">
          <input
            type="password"
            placeholder="Пароль администратора"
            className="bg-background text-foreground border border-border rounded px-3 py-2 mb-2 w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAdminLogin(e.currentTarget.value);
              }
            }}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                const input = document.querySelector('input[type="password"]') as HTMLInputElement;
                if (input) handleAdminLogin(input.value);
              }}
            >
              Войти
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAdminButton(false)}
            >
              Отмена
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;