import { useState, useEffect } from 'react';
import { Novel } from '@/types/novel';

const API_URL = 'https://functions.poehali.dev/a5862c6f-ca89-4789-b680-9ca4719c90a1';

const initialNovel: Novel = {
  title: 'Тайна старого особняка',
  paths: [],
  episodes: [
    {
      id: 'ep1',
      title: 'Начало',
      position: { x: 100, y: 100 },
      paragraphs: [
        {
          id: 'p1',
          type: 'text',
          content: 'Дождливым вечером ты подъезжаешь к старому особняку. Массивные железные ворота скрипят, открываясь перед тобой.'
        },
        {
          id: 'p2',
          type: 'dialogue',
          characterName: 'Смотритель',
          characterImage: '🧙‍♂️',
          text: 'Добро пожаловать. Я ждал тебя. Особняк полон тайн, но будь осторожен...'
        },
        {
          id: 'p3',
          type: 'text',
          content: 'Ты входишь внутрь. Массивная дубовая дверь закрывается за тобой с глухим звуком.'
        },
        {
          id: 'p4',
          type: 'choice',
          question: 'Куда ты направишься?',
          options: [
            { id: 'c1', text: 'Подняться по лестнице', nextEpisodeId: 'ep2' },
            { id: 'c2', text: 'Исследовать первый этаж', nextEpisodeId: 'ep3' }
          ]
        }
      ]
    },
    {
      id: 'ep2',
      title: 'Второй этаж',
      position: { x: 300, y: 50 },
      paragraphs: [
        {
          id: 'p5',
          type: 'text',
          content: 'Поднимаясь по скрипучей лестнице, ты слышишь странные звуки из дальней комнаты.'
        },
        {
          id: 'p6',
          type: 'dialogue',
          characterName: 'Призрак',
          characterImage: '👻',
          text: 'Наконец-то... Кто-то пришёл... Помоги мне найти потерянный медальон...'
        },
        {
          id: 'p7',
          type: 'item',
          name: 'Старинный ключ',
          description: 'Ты нашёл ржавый ключ под половицей. Интересно, что он открывает?',
          imageUrl: '🗝️'
        }
      ]
    },
    {
      id: 'ep3',
      title: 'Библиотека',
      position: { x: 300, y: 150 },
      paragraphs: [
        {
          id: 'p8',
          type: 'text',
          content: 'Библиотека завалена пыльными книгами. Один из томов светится странным светом.'
        },
        {
          id: 'p9',
          type: 'dialogue',
          characterName: 'Книга',
          characterImage: '📖',
          text: 'Я - Книга Знаний. Задай мне вопрос, и я отвечу... но за цену.'
        }
      ]
    }
  ],
  library: {
    items: [],
    characters: [],
    choices: []
  }
};

export function useNovelDatabase(
  setNovel: (novel: Novel) => void,
  isAdmin: boolean
) {
  const [isLoading, setIsLoading] = useState(true);
  const [novelForSaving, setNovelForSaving] = useState<Novel | null>(null);

  useEffect(() => {
    const loadNovel = async () => {
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const novelData = await response.json();
          
          // Ensure library structure exists with all required fields
          if (!novelData.library) {
            novelData.library = { items: [], characters: [], choices: [] };
          } else {
            if (!novelData.library.items) novelData.library.items = [];
            if (!novelData.library.characters) novelData.library.characters = [];
            if (!novelData.library.choices) novelData.library.choices = [];
          }
          
          // Migration: Replace old placeholder URLs with new SVG data URLs
          novelData.episodes.forEach((episode: any) => {
            episode.paragraphs.forEach((para: any) => {
              if ((para.type === 'image' || para.type === 'background') && para.url) {
                if (para.url.includes('via.placeholder.com/800x600')) {
                  para.url = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23ddd" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E800×600%3C/text%3E%3C/svg%3E';
                } else if (para.url.includes('via.placeholder.com/1920x1080')) {
                  para.url = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"%3E%3Crect fill="%23333" width="1920" height="1080"/%3E%3Ctext fill="%23666" font-family="sans-serif" font-size="48" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E1920×1080%3C/text%3E%3C/svg%3E';
                } else if (para.url.includes('via.placeholder.com')) {
                  // Fallback for any other placeholder
                  para.url = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23ddd" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E800×600%3C/text%3E%3C/svg%3E';
                }
              }
              // Migration: Add default character image if missing
              if (para.type === 'dialogue' && !para.characterImage) {
                para.characterImage = '👤';
              }
            });
          });
          
          setNovel(novelData);
          setNovelForSaving(novelData);
        } else {
          console.error('Failed to load novel from database');
          setNovel(initialNovel);
          setNovelForSaving(initialNovel);
        }
      } catch (error) {
        console.error('Error loading novel:', error);
        setNovel(initialNovel);
        setNovelForSaving(initialNovel);
      } finally {
        setIsLoading(false);
      }
    };

    loadNovel();
  }, [setNovel]);

  useEffect(() => {
    if (!isLoading && isAdmin && novelForSaving) {
      const saveNovel = async () => {
        try {
          const response = await fetch(`${API_URL}?admin=true`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novelForSaving)
          });
          
          if (!response.ok) {
            if (response.status === 413) {
              console.error('Error saving novel: Data too large (HTTP 413). Consider reducing image sizes or removing unused data.');
              alert('⚠️ Данные не сохранились: слишком большой размер проекта.\n\nРекомендации:\n- Используйте сжатие изображений\n- Удалите неиспользуемые данные из библиотеки\n- Уменьшите размер изображений');
            } else {
              console.error(`Error saving novel: HTTP ${response.status}`);
            }
          }
        } catch (error) {
          console.error('Error saving novel:', error);
        }
      };

      const timeoutId = setTimeout(saveNovel, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [novelForSaving, isAdmin, isLoading]);

  return {
    isLoading,
    setNovelForSaving
  };
}