import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import BookmarkButton from './BookmarkButton';
import { Bookmark } from '@/types/settings';

type View = 'home' | 'reader' | 'admin' | 'episodes' | 'profile' | 'settings';

interface NavigationMenuProps {
  isAdmin: boolean;
  onSetActiveView: (view: View) => void;
  onAdminLogin: () => void;
  episodeId?: string;
  paragraphIndex?: number;
  currentParagraph?: number;
  totalParagraphs?: number;
  existingBookmark?: Bookmark;
  onAddBookmark?: (comment: string) => void;
  onRemoveBookmark?: () => void;
  onLogout?: () => void;
  username?: string;
  isGuest?: boolean;
  onShowAuthPrompt?: () => void;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
  hasMusic?: boolean;
}

function NavigationMenu({
  isAdmin,
  onSetActiveView,
  onAdminLogin,
  episodeId,
  paragraphIndex,
  currentParagraph,
  totalParagraphs,
  existingBookmark,
  onAddBookmark,
  onRemoveBookmark,
  onLogout,
  username,
  isGuest = false,
  onShowAuthPrompt,
  isMusicPlaying,
  onToggleMusic,
  hasMusic
}: NavigationMenuProps) {
  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-50 items-end">
      <div className="flex gap-2 flex-wrap justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => onSetActiveView('episodes')}
          title="Список эпизодов"
        >
          <Icon name="List" size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => onSetActiveView('home')}
          title="На главную"
        >
          <Icon name="Home" size={20} />
        </Button>
        {isGuest ? (
          <Button
            variant="default"
            className="bg-primary/90 backdrop-blur-sm hover:bg-primary text-white"
            onClick={onShowAuthPrompt}
            title="Войти или зарегистрироваться"
          >
            <Icon name="LogIn" size={20} />
            <span className="ml-2 hidden md:inline">Войти</span>
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
              onClick={() => onSetActiveView('profile')}
              title="Профиль"
            >
              <Icon name="User" size={20} />
              {username && <span className="ml-2 hidden md:inline">{username}</span>}
            </Button>
            {onLogout && (
              <Button
                variant="ghost"
                size="icon"
                className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
                onClick={onLogout}
                title="Выйти"
              >
                <Icon name="LogOut" size={20} />
              </Button>
            )}
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => onSetActiveView('settings')}
        >
          <Icon name="Settings" size={20} />
        </Button>
        
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
            onClick={onAdminLogin}
            title="Админ-панель"
          >
            <Icon name="Settings2" size={20} />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
          {hasMusic && onToggleMusic && (
            <Button
              variant="ghost"
              size="icon"
              className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMusic();
              }}
              title={isMusicPlaying ? "Выключить музыку" : "Включить музыку"}
            >
              {isMusicPlaying ? (
                <Icon name="Music" size={20} className="animate-pulse" />
              ) : (
                <Icon name="Music" size={20} />
              )}
            </Button>
          )}
          {!isGuest && episodeId && paragraphIndex !== undefined && onAddBookmark && onRemoveBookmark && (
            <BookmarkButton
              episodeId={episodeId}
              paragraphIndex={paragraphIndex}
              existingBookmark={existingBookmark}
              onAdd={onAddBookmark}
              onRemove={onRemoveBookmark}
            />
          )}
      </div>
    </div>
  );
}

export default NavigationMenu;