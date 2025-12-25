import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AdminPanelHeaderProps {
  novelTitle: string;
  onLogout: () => void;
}

function AdminPanelHeader({ novelTitle, onLogout }: AdminPanelHeaderProps) {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
          <p className="text-sm text-muted-foreground">{novelTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}

export default AdminPanelHeader;