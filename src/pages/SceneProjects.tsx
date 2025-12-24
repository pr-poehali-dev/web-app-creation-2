import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { SceneProject } from '@/types/scene';

const SCENE_PROJECTS_API = 'https://functions.poehali.dev/1ab21497-62f0-4aef-b4b2-35e70322b3ca';

interface ProjectListItem {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function SceneProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(SCENE_PROJECTS_API);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    const defaultProject: SceneProject = {
      id: `project-${Date.now()}`,
      name: newProjectName,
      scenes: [{
        id: `scene-${Date.now()}`,
        name: 'Сцена 1',
        duration: 10,
        layers: [],
        animations: [],
        audioTracks: [],
        choices: [],
        variables: {}
      }],
      globalVariables: {},
      currentSceneId: `scene-${Date.now()}`,
      settings: {
        width: 1000,
        height: 600,
        backgroundColor: '#1a1a2e',
        defaultFontFamily: 'Inter',
        accessibility: {
          enableKeyboardNav: true,
          enableAriaLabels: true
        }
      }
    };

    try {
      const response = await fetch(SCENE_PROJECTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          data: defaultProject
        })
      });

      if (response.ok) {
        setShowNewDialog(false);
        setNewProjectName('');
        loadProjects();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const deleteProject = async (id: number) => {
    if (!confirm('Удалить проект? Это действие необратимо.')) return;

    try {
      const response = await fetch(`${SCENE_PROJECTS_API}?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadProjects();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const openProject = (id: number) => {
    navigate(`/scene-editor/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Scene Editor</h1>
              <p className="text-muted-foreground">Проекты визуальных новелл</p>
            </div>
          </div>

          <Button onClick={() => setShowNewDialog(true)}>
            <Icon name="Plus" size={20} className="mr-2" />
            Новый проект
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="FolderOpen" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Нет проектов</h3>
            <p className="text-muted-foreground mb-6">
              Создайте первый проект для начала работы с Scene Editor
            </p>
            <Button onClick={() => setShowNewDialog(true)}>
              <Icon name="Plus" size={20} className="mr-2" />
              Создать проект
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => openProject(project.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name="Film" size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(project.updated_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                  >
                    <Icon name="Trash2" size={16} className="text-destructive" />
                  </Button>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Открыть редактор</span>
                  <Icon name="ChevronRight" size={16} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый проект</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              placeholder="Название проекта"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Отмена
            </Button>
            <Button onClick={createProject} disabled={!newProjectName.trim()}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
