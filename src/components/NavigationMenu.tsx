import { useState } from 'react';
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
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
  hasMusic?: boolean;
  isContentHidden?: boolean;
  onToggleContentVisibility?: () => void;
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
  isMusicPlaying,
  onToggleMusic,
  hasMusic,
  isContentHidden,
  onToggleContentVisibility
}: NavigationMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-50 items-end">
      {/* Кнопка-гамбургер (только на мобильной) */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title="Меню"
      >
        <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
      </Button>

      {/* Первая строка: основные кнопки навигации (скрываются на мобильной) */}
      <div className={`gap-2 ${isMenuOpen ? 'flex' : 'hidden md:flex'}`}>
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => {
            onSetActiveView('episodes');
            setIsMenuOpen(false);
          }}
          title="Список эпизодов"
        >
          <Icon name="List" size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => {
            onSetActiveView('home');
            setIsMenuOpen(false);
          }}
          title="На главную"
        >
          <Icon name="Home" size={20} />
        </Button>
        <Button
          variant="ghost"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => {
            onSetActiveView('profile');
            setIsMenuOpen(false);
          }}
          title="Профиль"
        >
          <Icon name="User" size={20} />
          {username && <span className="ml-2 hidden md:inline">{username}</span>}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => {
            onSetActiveView('settings');
            setIsMenuOpen(false);
          }}
        >
          <Icon name="Settings" size={20} />
        </Button>
        
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
            onClick={() => {
              onAdminLogin();
              setIsMenuOpen(false);
            }}
            title="Админ-панель"
          >
            <Icon name="Settings2" size={20} />
          </Button>
        )}
      </div>

      {/* Вторая строка: закладка и музыка (только десктоп) */}
      <div className="hidden md:flex gap-2">
        {!isGuest && episodeId && paragraphIndex !== undefined && onAddBookmark && onRemoveBookmark && (
          <BookmarkButton
            episodeId={episodeId}
            paragraphIndex={paragraphIndex}
            existingBookmark={existingBookmark}
            onAdd={onAddBookmark}
            onRemove={onRemoveBookmark}
          />
        )}
        
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
      </div>
      
      {/* Мобильная версия: закладка и музыка в гамбургере */}
      <div className={`md:hidden gap-2 ${isMenuOpen ? 'flex' : 'hidden'}`}>
        {!isGuest && episodeId && paragraphIndex !== undefined && onAddBookmark && onRemoveBookmark && (
          <BookmarkButton
            episodeId={episodeId}
            paragraphIndex={paragraphIndex}
            existingBookmark={existingBookmark}
            onAdd={onAddBookmark}
            onRemove={onRemoveBookmark}
          />
        )}
        
        {hasMusic && onToggleMusic && (
          <Button
            variant="ghost"
            size="icon"
            className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMusic();
              setIsMenuOpen(false);
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
      </div>

      {/* Третья строка: кнопка с глазом */}
      {onToggleContentVisibility && (
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex items-center justify-center bg-card/80 backdrop-blur-sm hover:bg-card/90 text-white border border-border/50"
          onClick={(e) => {
            e.stopPropagation();
            onToggleContentVisibility();
          }}
          title={isContentHidden ? 'Показать текст' : 'Скрыть текст'}
        >
          <Icon name={isContentHidden ? 'Eye' : 'EyeOff'} size={20} />
        </Button>
      )}
    </div>
  );
}

export default NavigationMenu;