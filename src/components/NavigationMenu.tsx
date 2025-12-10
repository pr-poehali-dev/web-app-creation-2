import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import BookmarkButton from './BookmarkButton';
import { Bookmark } from '@/types/settings';

type View = 'home' | 'reader' | 'admin' | 'episodes' | 'profile' | 'settings';

interface NavigationMenuProps {
  showAdminButton: boolean;
  adminPassword: string;
  onSetActiveView: (view: View) => void;
  onSetShowAdminButton: (show: boolean) => void;
  onSetAdminPassword: (password: string) => void;
  onAdminLogin: () => void;
  episodeId?: string;
  paragraphIndex?: number;
  currentParagraph?: number;
  totalParagraphs?: number;
  existingBookmark?: Bookmark;
  onAddBookmark?: (comment: string) => void;
  onRemoveBookmark?: () => void;
}

function NavigationMenu({
  showAdminButton,
  adminPassword,
  onSetActiveView,
  onSetShowAdminButton,
  onSetAdminPassword,
  onAdminLogin,
  episodeId,
  paragraphIndex,
  currentParagraph,
  totalParagraphs,
  existingBookmark,
  onAddBookmark,
  onRemoveBookmark
}: NavigationMenuProps) {
  return (
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-50 items-end">
      <div className="flex gap-2 flex-wrap justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => onSetActiveView('home')}
        >
          <Icon name="Home" size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => onSetActiveView('profile')}
        >
          <Icon name="User" size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-sm hover:bg-card/80 text-white"
          onClick={() => onSetActiveView('settings')}
        >
          <Icon name="Settings" size={20} />
        </Button>
        
        {!showAdminButton ? (
          <Button
            variant="ghost"
            size="icon"
            className="bg-card/50 backdrop-blur-sm hover:bg-card/80 opacity-30 hover:opacity-100 transition-opacity text-white"
            onClick={() => onSetShowAdminButton(true)}
          >
            <Icon name="Lock" size={20} />
          </Button>
        ) : (
          <div className="flex gap-2 bg-card/90 backdrop-blur-sm rounded-lg p-2">
            <Input
              type="password"
              placeholder="Пароль"
              value={adminPassword}
              onChange={(e) => onSetAdminPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAdminLogin();
              }}
              className="w-32 text-foreground"
              autoFocus
            />
            <Button size="sm" onClick={onAdminLogin}>
              <Icon name="LogIn" size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => {
                onSetShowAdminButton(false);
                onSetAdminPassword('');
              }}
            >
              <Icon name="X" size={16} />
            </Button>
          </div>
        )}
      </div>

      {episodeId && paragraphIndex !== undefined && onAddBookmark && onRemoveBookmark && (
        <BookmarkButton
          episodeId={episodeId}
          paragraphIndex={paragraphIndex}
          existingBookmark={existingBookmark}
          onAdd={onAddBookmark}
          onRemove={onRemoveBookmark}
        />
      )}
    </div>
  );
}

export default NavigationMenu;