import { Novel } from '@/types/novel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import ItemsLibrary from './Library/ItemsLibrary';
import CharactersLibrary from './Library/CharactersLibrary';
import ChoicesLibrary from './Library/ChoicesLibrary';

interface LibraryManagerProps {
  novel: Novel;
  onUpdate: (novel: Novel) => void;
}

function LibraryManager({ novel, onUpdate }: LibraryManagerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Библиотека ресурсов</h2>
        <p className="text-sm text-muted-foreground">
          Создавайте предметы, персонажей и варианты выбора для быстрого использования в эпизодах
        </p>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="items">
            <Icon name="Package" size={16} className="mr-2" />
            Предметы
          </TabsTrigger>
          <TabsTrigger value="characters">
            <Icon name="Users" size={16} className="mr-2" />
            Персонажи
          </TabsTrigger>
          <TabsTrigger value="choices">
            <Icon name="GitBranch" size={16} className="mr-2" />
            Выборы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <ItemsLibrary novel={novel} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="characters">
          <CharactersLibrary novel={novel} onUpdate={onUpdate} />
        </TabsContent>

        <TabsContent value="choices">
          <ChoicesLibrary novel={novel} onUpdate={onUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LibraryManager;
