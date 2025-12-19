import NovelReader from '@/components/NovelReader';
import AdminPanel from '@/components/AdminPanel';
import EpisodeMenu from '@/components/EpisodeMenu';
import UserProfilePanel from '@/components/UserProfilePanel';
import SettingsPanel from '@/components/SettingsPanel';
import NavigationMenu from '@/components/NavigationMenu';
import ParagraphsDialog from '@/components/ParagraphsDialog';
import HomePage from '@/components/HomePage';
import AdminLogin from '@/components/AdminLogin';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAppState } from './Index/useAppState';
import { useNovelDatabase } from './Index/useNovelDatabase';
import { useAppHandlers } from './Index/useAppHandlers';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

function Index() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const {
    novel,
    setNovel,
    settings,
    setSettings,
    profile,
    setProfile,
    activeView,
    setActiveView,
    showParagraphsDialog,
    setShowParagraphsDialog,
    selectedEpisodeForParagraphs,
    setSelectedEpisodeForParagraphs,
    isAdmin,
    setIsAdmin,
    isMusicPlaying,
    setIsMusicPlaying,
    isContentHidden,
    setIsContentHidden
  } = useAppState();

  const { isLoading, setNovelForSaving } = useNovelDatabase(setNovel, isAdmin);

  const { authState, handleAuthSuccess, handleLogout } = useAuth(profile, setProfile);

  const {
    handleNovelUpdate,
    handleSettingsUpdate,
    handleProfileUpdate,
    handleEpisodeSelect,
    handleNavigateToBookmark,
    handleShowParagraphs,
    handleAddBookmark,
    handleRemoveBookmark
  } = useAppHandlers({
    novel,
    profile,
    setProfile,
    setSettings,
    setNovel,
    setNovelForSaving,
    setActiveView,
    setIsAdmin,
    setSelectedEpisodeForParagraphs,
    setShowParagraphsDialog
  });

  const handleAdminLogin = () => {
    const isAdminAuth = localStorage.getItem('adminAuth') === 'true';
    if (isAdminAuth) {
      setIsAdmin(true);
      setActiveView('admin');
    } else {
      setShowAdminLogin(true);
    }
  };



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

  if (!novel) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground">Новелла не загружена</p>
        </div>
      </div>
    );
  }

  if (activeView === 'admin') {
    const isAdminAuth = localStorage.getItem('adminAuth') === 'true';
    if (!isAdminAuth && !isAdmin) {
      return (
        <div className="min-h-screen bg-background dark flex items-center justify-center">
          <div className="text-center">
            <p className="text-foreground text-xl mb-4">Нет доступа к админ-панели</p>
            <Button onClick={() => setActiveView('reader')}>
              Вернуться
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <AdminPanel 
        novel={novel} 
        onUpdate={handleNovelUpdate}
        onLogout={() => {
          setActiveView('reader');
          setIsAdmin(false);
          localStorage.removeItem('adminAuth');
        }}
        authState={authState}
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
        isAdmin={authState.isAdmin}
        isGuest={authState.isGuest}
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
        username={authState.username || undefined}
      />
    );
  }

  if (activeView === 'settings') {
    return (
      <SettingsPanel
        settings={settings}
        novel={novel}
        onUpdate={handleSettingsUpdate}
        onBack={() => setActiveView('reader')}
      />
    );
  }

  if (activeView === 'home') {
    return (
      <div className="relative">
        <HomePage 
          homePage={novel.homePage || { greeting: 'Добро пожаловать', news: [] }}
          novel={novel}
          onStart={() => {
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
        
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#151d28] text-white backdrop-blur-md hover:bg-[#1a2430] shadow-lg border border-border/50"
            onClick={() => setActiveView('episodes')}
            title="Список эпизодов"
          >
            <Icon name="List" size={20} />
          </Button>
        </div>
        
        <div className="fixed top-4 right-4 flex gap-2 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#151d28] text-white backdrop-blur-sm hover:bg-[#1a2430]"
            onClick={() => setActiveView('settings')}
          >
            <Icon name="Settings" size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="bg-[#151d28] text-white backdrop-blur-sm hover:bg-[#1a2430]"
            onClick={handleAdminLogin}
            title="Админ-панель"
          >
            <Icon name="Settings2" size={20} />
          </Button>
        </div>
      </div>
    );
  }

  const uiFontStyle = settings.uiFontFamily && settings.uiFontFamily !== 'system' ? {
    fontFamily: settings.uiFontFamily === 'montserrat' ? '"Montserrat", sans-serif' :
               settings.uiFontFamily === 'roboto' ? '"Roboto", sans-serif' :
               settings.uiFontFamily === 'opensans' ? '"Open Sans", sans-serif' :
               settings.uiFontFamily === 'ptsans' ? '"PT Sans", sans-serif' :
               settings.uiFontFamily === 'Inter' ? '"Inter", sans-serif' :
               settings.uiFontFamily === 'playfair' ? '"Playfair Display", serif' :
               settings.uiFontFamily === 'lora' ? '"Lora", serif' :
               'system-ui, sans-serif'
  } : {};

  return (
    <div className="relative min-h-screen dark flex" style={uiFontStyle}>
      <div className="flex-1 relative">
        <NovelReader 
          novel={novel} 
          settings={settings}
          profile={profile}
          onUpdate={handleNovelUpdate}
          onProfileUpdate={handleProfileUpdate}
          currentEpisodeId={profile.currentEpisodeId}
          currentParagraphIndex={profile.currentParagraphIndex}
          isGuest={authState.isGuest}
          isAdmin={authState.isAdmin}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={() => setIsMusicPlaying(!isMusicPlaying)}
          isContentHidden={isContentHidden}
          onToggleContentVisibility={() => setIsContentHidden(!isContentHidden)}
        />
      </div>
      


      <NavigationMenu
        isAdmin={authState.isAdmin}
        onSetActiveView={setActiveView}
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
        onLogout={handleLogout}
        username={authState.username || undefined}
        isGuest={authState.isGuest}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={() => setIsMusicPlaying(!isMusicPlaying)}
        hasMusic={!!novel.episodes.find(ep => ep.id === profile.currentEpisodeId)?.backgroundMusic}
        isContentHidden={isContentHidden}
        onToggleContentVisibility={() => setIsContentHidden(!isContentHidden)}
      />

      <ParagraphsDialog
        open={showParagraphsDialog}
        novel={novel}
        profile={profile}
        selectedEpisodeId={selectedEpisodeForParagraphs}
        onOpenChange={setShowParagraphsDialog}
        onEpisodeSelect={handleEpisodeSelect}
        isAdmin={authState.isAdmin}
        isGuest={authState.isGuest}
      />

      {showAdminLogin && (
        <AdminLogin
          onSuccess={() => {
            setShowAdminLogin(false);
            setIsAdmin(true);
            setActiveView('admin');
          }}
          onCancel={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  );
}

export default Index;