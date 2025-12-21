import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function AdminLogin({ onSuccess, onCancel }: AdminLoginProps) {
  const handleEnter = () => {
    localStorage.setItem('adminAuth', 'true');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 dark">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Вход в админ-панель</h2>
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
            <Icon name="X" size={16} />
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Нажмите кнопку ниже для входа в режим редактирования
          </p>

          <div className="flex gap-2">
            <Button onClick={handleEnter} className="flex-1">
              Войти
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;