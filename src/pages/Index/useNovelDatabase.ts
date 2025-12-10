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
          await fetch(`${API_URL}?admin=true`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novelForSaving)
          });
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