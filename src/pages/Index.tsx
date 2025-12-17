import NovelReader from '@/components/NovelReader';
import AdminPanel from '@/components/AdminPanel';
import EpisodeMenu from '@/components/EpisodeMenu';
import UserProfilePanel from '@/components/UserProfilePanel';
import SettingsPanel from '@/components/SettingsPanel';
import EpisodesSidebar from '@/components/EpisodesSidebar';
import NavigationMenu from '@/components/NavigationMenu';
import ParagraphsDialog from '@/components/ParagraphsDialog';
import AuthScreen from '@/components/AuthScreen';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAppState } from './Index/useAppState';
import { useNovelDatabase } from './Index/useNovelDatabase';
import { useAppHandlers } from './Index/useAppHandlers';
import { useAuth } from '@/hooks/useAuth';

function Index() {
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
    showSidebar,
    setShowSidebar,
    isAdmin,
    setIsAdmin,
    showGreetingScreen,
    setShowGreetingScreen,
    showAuthPrompt,
    setShowAuthPrompt,
    authPromptDismissed,
    setAuthPromptDismissed,
    isMusicPlaying,
    setIsMusicPlaying
  } = useAppState();

  const { isLoading, setNovelForSaving } = useNovelDatabase(setNovel, isAdmin);

  const { authState, handleAuthSuccess, handleLogout } = useAuth(profile, setProfile);

  const {
    handleNovelUpdate,
    handleSettingsUpdate,
    handleProfileUpdate,
    handleAdminLogin,
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
    setShowParagraphsDialog,
    setShowGreetingScreen
  });

  // Показываем экран авторизации только если пользователь явно запросил или достиг конца доступного контента
  // И только если он ещё не отказался от входа в этой сессии
  if (showAuthPrompt && !authState.isAuthenticated && !authPromptDismissed) {
    return (
      <div className="relative min-h-screen bg-background dark">
        <AuthScreen 
          onAuthSuccess={handleAuthSuccess} 
          onClose={authState.isGuest ? () => {
            setShowAuthPrompt(false);
            setAuthPromptDismissed(true); // Запоминаем, что пользователь отказался
          } : undefined}
        />
      </div>
    );
  }

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
    if (!authState.isAdmin) {
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
          
          {authState.isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="bg-card/50 backdrop-blur-sm hover:bg-card/80"
              onClick={() => {
                setActiveView('admin');
                setIsAdmin(true);
              }}
            >
              <Icon name="Settings2" size={20} />
            </Button>
          )}
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
      {showSidebar && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            onClick={() => setShowSidebar(false)}
          />
          <div className="fixed inset-y-0 left-0 z-[65] transform transition-transform duration-300 translate-x-0 w-[320px]">
            <EpisodesSidebar
              novel={novel}
              currentEpisodeId={profile.currentEpisodeId}
              profile={profile}
              onEpisodeSelect={(episodeId, paragraphIndex) => {
                handleEpisodeSelect(episodeId, paragraphIndex);
                setShowSidebar(false);
              }}
              onShowParagraphs={(episodeId) => {
                handleShowParagraphs(episodeId);
                setShowSidebar(false);
              }}
              isAdmin={authState.isAdmin}
              isGuest={authState.isGuest}
              onClose={() => setShowSidebar(false)}
            />
          </div>
        </>
      )}

      <div className="flex-1 relative">
        <NovelReader 
          novel={novel} 
          settings={settings}
          profile={profile}
          onUpdate={handleNovelUpdate}
          onProfileUpdate={handleProfileUpdate}
          currentEpisodeId={profile.currentEpisodeId}
          currentParagraphIndex={profile.currentParagraphIndex}
          showGreetingScreen={showGreetingScreen}
          isGuest={authState.isGuest}
          onGuestLimitReached={() => setShowAuthPrompt(true)}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={() => setIsMusicPlaying(!isMusicPlaying)}
        />
      </div>
      
      {/* Кнопка открытия боковой панели */}
      {!showSidebar && !showGreetingScreen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => setShowSidebar(true)}
          title="Открыть список эпизодов"
        >
          <Icon name="PanelLeft" size={20} />
        </Button>
      )}

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
        onGoToGreeting={() => {
          setShowGreetingScreen(true);
        }}
        showGreeting={showGreetingScreen}
        onLogout={handleLogout}
        username={authState.username || undefined}
        isGuest={authState.isGuest}
        onShowAuthPrompt={() => setShowAuthPrompt(true)}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={() => setIsMusicPlaying(!isMusicPlaying)}
        hasMusic={!!novel.episodes.find(ep => ep.id === profile.currentEpisodeId)?.backgroundMusic}
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
    </div>
  );
}

export default Index;