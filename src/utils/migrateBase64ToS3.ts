import { Novel } from '@/types/novel';
import { uploadImageToS3 } from './imageUpload';

// Проверяет, является ли строка base64
const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image/') && str.includes('base64,');
};

// Конвертирует base64 в File объект
const base64ToFile = (base64: string, fileName: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
};

// Мигрирует одно base64 изображение в S3
const migrateBase64Image = async (base64: string, name: string): Promise<string | null> => {
  try {
    const file = base64ToFile(base64, `${name}.jpg`);
    const url = await uploadImageToS3(file);
    return url;
  } catch (error) {
    console.error(`Failed to migrate image ${name}:`, error);
    return null;
  }
};

// Главная функция миграции
export const migrateNovelToS3 = async (novel: Novel, onProgress?: (message: string) => void): Promise<Novel> => {
  const updatedNovel = { ...novel };
  let migratedCount = 0;
  let totalBase64Images = 0;

  onProgress?.('🔍 Сканирование base64 изображений...');

  // Считаем сколько всего base64 картинок
  updatedNovel.episodes.forEach(ep => {
    ep.paragraphs.forEach(p => {
      if (p.type === 'dialogue' && p.characterImage && isBase64Image(p.characterImage)) totalBase64Images++;
      if (p.type === 'item' && p.imageUrl && isBase64Image(p.imageUrl)) totalBase64Images++;
      if ((p.type === 'image' || p.type === 'background') && p.url && isBase64Image(p.url)) totalBase64Images++;
      if ((p.type === 'image' || p.type === 'background') && p.mobileUrl && isBase64Image(p.mobileUrl)) totalBase64Images++;
    });
  });

  updatedNovel.library.characters.forEach(char => {
    if (char.defaultImage && isBase64Image(char.defaultImage)) totalBase64Images++;
    char.images?.forEach(img => {
      if (isBase64Image(img.url)) totalBase64Images++;
    });
  });

  updatedNovel.library.items.forEach(item => {
    if (item.imageUrl && isBase64Image(item.imageUrl)) totalBase64Images++;
  });

  if (totalBase64Images === 0) {
    onProgress?.('✅ Base64 изображений не найдено');
    return updatedNovel;
  }

  onProgress?.(`📦 Найдено ${totalBase64Images} base64 изображений. Начинаю миграцию...`);

  // Мигрируем параграфы
  for (let i = 0; i < updatedNovel.episodes.length; i++) {
    const episode = updatedNovel.episodes[i];
    for (let j = 0; j < episode.paragraphs.length; j++) {
      const p = episode.paragraphs[j];
      
      if (p.type === 'dialogue' && p.characterImage && isBase64Image(p.characterImage)) {
        onProgress?.(`⏳ Миграция [${migratedCount + 1}/${totalBase64Images}] dialogue...`);
        const url = await migrateBase64Image(p.characterImage, `char-${p.id}`);
        if (url) {
          p.characterImage = url;
          migratedCount++;
        }
      }
      
      if (p.type === 'item' && p.imageUrl && isBase64Image(p.imageUrl)) {
        onProgress?.(`⏳ Миграция [${migratedCount + 1}/${totalBase64Images}] item...`);
        const url = await migrateBase64Image(p.imageUrl, `item-${p.id}`);
        if (url) {
          p.imageUrl = url;
          migratedCount++;
        }
      }
      
      if ((p.type === 'image' || p.type === 'background') && p.url && isBase64Image(p.url)) {
        onProgress?.(`⏳ Миграция [${migratedCount + 1}/${totalBase64Images}] ${p.type}...`);
        const url = await migrateBase64Image(p.url, `${p.type}-${p.id}`);
        if (url) {
          p.url = url;
          migratedCount++;
        }
      }
      
      if ((p.type === 'image' || p.type === 'background') && p.mobileUrl && isBase64Image(p.mobileUrl)) {
        onProgress?.(`⏳ Миграция [${migratedCount + 1}/${totalBase64Images}] mobile-${p.type}...`);
        const url = await migrateBase64Image(p.mobileUrl, `mobile-${p.type}-${p.id}`);
        if (url) {
          p.mobileUrl = url;
          migratedCount++;
        }
      }
    }
  }

  // Мигрируем библиотеку персонажей
  for (let i = 0; i < updatedNovel.library.characters.length; i++) {
    const char = updatedNovel.library.characters[i];
    
    if (char.defaultImage && isBase64Image(char.defaultImage)) {
      onProgress?.(`⏳ Миграция [${migratedCount + 1}/${totalBase64Images}] character default...`);
      const url = await migrateBase64Image(char.defaultImage, `char-default-${char.id}`);
      if (url) {
        char.defaultImage = url;
        migratedCount++;
      }
    }
    
    if (char.images) {
      for (let j = 0; j < char.images.length; j++) {
        const img = char.images[j];
        if (isBase64Image(img.url)) {
          onProgress?.(`⏳ Миграция [${migratedCount + 1}/${totalBase64Images}] character image...`);
          const url = await migrateBase64Image(img.url, `char-img-${img.id}`);
          if (url) {
            img.url = url;
            migratedCount++;
          }
        }
      }
    }
  }

  // Мигрируем библиотеку предметов
  for (let i = 0; i < updatedNovel.library.items.length; i++) {
    const item = updatedNovel.library.items[i];
    if (item.imageUrl && isBase64Image(item.imageUrl)) {
      onProgress?.(`⏳ Миграция [${migratedCount + 1}/${totalBase64Images}] library item...`);
      const url = await migrateBase64Image(item.imageUrl, `lib-item-${item.id}`);
      if (url) {
        item.imageUrl = url;
        migratedCount++;
      }
    }
  }

  onProgress?.(`✅ Миграция завершена! ${migratedCount} из ${totalBase64Images} изображений перенесены в S3`);
  
  return updatedNovel;
};
