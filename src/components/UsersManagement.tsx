import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

const AUTH_API = 'https://functions.poehali.dev/f895202d-2b99-4eae-a334-8b273bf2cbd1';

interface User {
  username: string;
  isAdmin: boolean;
  createdAt: string | null;
}

interface UsersManagementProps {
  adminUsername: string;
}

function UsersManagement({ adminUsername }: UsersManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_all_users',
          admin_username: adminUsername
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка загрузки пользователей');
        return;
      }

      setUsers(data.users);
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [adminUsername]);

  const handleToggleAdmin = async (username: string, makeAdmin: boolean) => {
    try {
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_admin',
          admin_username: adminUsername,
          target_username: username,
          make_admin: makeAdmin
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Ошибка изменения прав');
        return;
      }

      loadUsers();
    } catch (err) {
      alert('Ошибка соединения с сервером');
    }
  };

  const handleSetPassword = async () => {
    if (!editingUser) return;
    
    setPasswordError('');

    if (!newPassword || newPassword.length < 4) {
      setPasswordError('Пароль должен быть минимум 4 символа');
      return;
    }

    try {
      const response = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_set_password',
          admin_username: adminUsername,
          target_username: editingUser,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.error || 'Ошибка изменения пароля');
        return;
      }

      alert(`Пароль для ${editingUser} успешно изменен`);
      setEditingUser(null);
      setNewPassword('');
    } catch (err) {
      setPasswordError('Ошибка соединения с сервером');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Управление пользователями</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Icon name="Loader2" size={32} className="animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Управление пользователями</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button onClick={loadUsers} className="mt-4">
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Управление пользователями
          <Button size="sm" variant="outline" onClick={loadUsers}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Обновить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.username}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">
                    {user.username}
                  </p>
                  {user.username === 'kotatsu' && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                      Супер-админ
                    </span>
                  )}
                  {user.isAdmin && user.username !== 'kotatsu' && (
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                      Админ
                    </span>
                  )}
                </div>
                {user.createdAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Зарегистрирован: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingUser(user.username);
                    setNewPassword('');
                    setPasswordError('');
                  }}
                >
                  <Icon name="Key" size={14} className="mr-1" />
                  Пароль
                </Button>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`admin-${user.username}`} className="text-sm">
                    Админ
                  </Label>
                  <Switch
                    id={`admin-${user.username}`}
                    checked={user.isAdmin}
                    onCheckedChange={(checked) => handleToggleAdmin(user.username, checked)}
                    disabled={user.username === 'kotatsu'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {users.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Пользователи не найдены
          </p>
        )}
      </CardContent>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить пароль: {editingUser}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Минимум 4 символа"
                onKeyDown={(e) => e.key === 'Enter' && handleSetPassword()}
              />
            </div>
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSetPassword} className="flex-1">
                Изменить пароль
              </Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default UsersManagement;