import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SceneProject } from '@/types/scene';
import SceneEditor from '@/components/SceneEditor/SceneEditor';
import Icon from '@/components/ui/icon';

const SCENE_PROJECTS_API = 'https://functions.poehali.dev/1ab21497-62f0-4aef-b4b2-35e70322b3ca';

export default function SceneEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<SceneProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    if (!id) {
      setError('ID проекта не указан');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${SCENE_PROJECTS_API}?id=${id}`);
      
      if (!response.ok) {
        throw new Error('Проект не найден');
      }

      const data = await response.json();
      setProject(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки проекта');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async (updatedProject: SceneProject) => {
    if (!id) return;

    try {
      await fetch(`${SCENE_PROJECTS_API}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedProject.name,
          data: updatedProject
        })
      });
      setProject(updatedProject);
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  };

  const handleClose = () => {
    navigate('/scene-projects');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground">Загрузка проекта...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-xl mb-4">{error || 'Проект не найден'}</p>
          <button
            onClick={handleClose}
            className="text-primary hover:underline"
          >
            Вернуться к списку проектов
          </button>
        </div>
      </div>
    );
  }

  return (
    <SceneEditor
      project={project}
      onSave={saveProject}
      onClose={handleClose}
    />
  );
}
