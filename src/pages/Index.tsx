import NovelReader from '@/components/NovelReader';
import AdminPanel from '@/components/AdminPanel';
import EpisodeMenu from '@/components/EpisodeMenu';
import UserProfilePanel from '@/components/UserProfilePanel';
import SettingsPanel from '@/components/SettingsPanel';
import HomePage from '@/components/HomePage';
import EpisodesSidebar from '@/components/EpisodesSidebar';
import NavigationMenu from '@/components/NavigationMenu';
import ParagraphsDialog from '@/components/ParagraphsDialog';
import ActivePathsIndicator from '@/components/ActivePathsIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useAppState } from './Index/useAppState';
import { useNovelDatabase } from './Index/useNovelDatabase';
import { useAppHandlers } from './Index/useAppHandlers';

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
    adminPassword,
    setAdminPassword,
    showAdminButton,
    setShowAdminButton,
    showParagraphsDialog,
    setShowParagraphsDialog,
    selectedEpisodeForParagraphs,
    setSelectedEpisodeForParagraphs,
    showSidebar,
    setShowSidebar,
    isAdmin,
    setIsAdmin,
    showGreetingScreen,
    setShowGreetingScreen
  } = useAppState();

  const { isLoading, setNovelForSaving } = useNovelDatabase(setNovel, isAdmin);

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
    adminPassword,
    setProfile,
    setSettings,
    setNovel,
    setNovelForSaving,
    setActiveView,
    setIsAdmin,
    setShowAdminButton,
    setAdminPassword,
    setSelectedEpisodeForParagraphs,
    setShowParagraphsDialog,
    setShowGreetingScreen
  });

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
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed top-4 left-4 z-[60] bg-card/90 backdrop-blur-sm p-2 rounded-lg shadow-lg text-white"
      >
        <Icon name={showSidebar ? 'X' : 'Menu'} size={20} />
      </button>

      {profile.currentEpisodeId && !showGreetingScreen && (
        <div className="hidden md:block fixed top-4 left-[340px] z-50">
          <div className="text-xs text-muted-foreground bg-card/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
            {profile.currentParagraphIndex + 1} / {novel.episodes.find(ep => ep.id === profile.currentEpisodeId)?.paragraphs.length}
          </div>
        </div>
      )}

      {showSidebar && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div className={`fixed md:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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
          showGreetingScreen={showGreetingScreen}
        />
        <ActivePathsIndicator novel={novel} profile={profile} />
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
        onGoToGreeting={() => {
          setShowGreetingScreen(true);
        }}
        showGreeting={showGreetingScreen}
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