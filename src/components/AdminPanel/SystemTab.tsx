import { useState } from 'react';
import { Novel } from '@/types/novel';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { migrateNovelToS3 } from '@/utils/migrateBase64ToS3';

interface SystemTabProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

function SystemTab({ novel, onUpdate }: SystemTabProps) {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState('');

  const handleMigrateToS3 = async () => {
    if (isMigrating) return;
    
    const confirmed = confirm('Мигрировать все base64 изображения в S3 хранилище? Это может занять несколько минут.');
    if (!confirmed) return;
    
    setIsMigrating(true);
    setMigrationProgress('Начинаю миграцию...');
    
    try {
      const migratedNovel = await migrateNovelToS3(novel, (msg) => {
        setMigrationProgress(msg);
      });
      
      onUpdate(migratedNovel);
      setMigrationProgress('✅ Миграция завершена! Обновите страницу.');
      
      setTimeout(() => {
        setIsMigrating(false);
        setMigrationProgress('');
      }, 3000);
    } catch (error) {
      setMigrationProgress(`❌ Ошибка: ${error}`);
      setTimeout(() => {
        setIsMigrating(false);
        setMigrationProgress('');
      }, 5000);
    }
  };

  const handleClearData = () => {
    if (confirm('Удалить все данные? Это действие нельзя отменить!')) {
      localStorage.removeItem('visualNovel');
      localStorage.removeItem('userSettings');
      localStorage.removeItem('userProfile');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Оптимизация хранилища</h3>
        <div className="space-y-4">
          <Button
            variant="default"
            className="w-full justify-start"
            onClick={handleMigrateToS3}
            disabled={isMigrating}
          >
            <Icon name={isMigrating ? "Loader2" : "Database"} size={16} className={`mr-2 ${isMigrating ? 'animate-spin' : ''}`} />
            {isMigrating ? 'Миграция...' : 'Мигрировать base64 → S3'}
          </Button>
          {migrationProgress && (
            <p className="text-sm text-foreground bg-secondary/20 p-3 rounded">
              {migrationProgress}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Переносит все base64-изображения в облачное хранилище S3. Уменьшает размер JSON данных и ускоряет загрузку.
          </p>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">Системные действия</h3>
        <div className="space-y-4">
          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleClearData}
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Очистить все данные приложения
          </Button>
          <p className="text-xs text-muted-foreground">
            Удаляет все данные новеллы, настройки и профиль игрока. Приложение вернется к начальному состоянию.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SystemTab;
