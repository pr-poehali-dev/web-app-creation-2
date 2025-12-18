// Compress and convert image to base64
const compressImage = (file: File, maxSizeMB: number = 5): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Рассчитываем размер для уменьшения
        const maxDimension = 2048; // максимальная сторона
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Пробуем разное качество, пока не получим нужный размер
        let quality = 0.9;
        let base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1];
        
        // Если файл все еще слишком большой, уменьшаем качество
        while (base64.length > maxSizeMB * 1024 * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.1;
          base64 = canvas.toDataURL('image/jpeg', quality).split(',')[1];
        }
        
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Upload image to S3 storage instead of base64
export const uploadImageToS3 = async (file: File): Promise<string | null> => {
  try {
    // Сжимаем и конвертируем файл в base64
    const base64Data = await compressImage(file, 4); // Максимум 4 МБ для безопасности
    
    // Отправляем в backend функцию для загрузки в S3
    const response = await fetch('https://functions.poehali.dev/a0c6a23f-1d31-4d44-9ca4-fd04d7e97063', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileData: base64Data,
        fileName: file.name,
        contentType: file.type
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Upload failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.url; // CDN URL из S3
  } catch (error) {
    console.error('Failed to upload image to S3:', error);
    return null;
  }
};

export const selectAndUploadImage = async (): Promise<string | null> => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  return new Promise((resolve) => {
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        alert(`Файл слишком большой (${(file.size / 1024 / 1024).toFixed(2)} МБ). Максимум: 10 МБ`);
        resolve(null);
        return;
      }
      
      // Показываем индикатор загрузки
      const loadingIndicator = document.createElement('div');
      loadingIndicator.textContent = '⏳ Загрузка изображения...';
      loadingIndicator.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 12px 20px; background: #000; color: #fff; border-radius: 8px; z-index: 9999;';
      document.body.appendChild(loadingIndicator);
      
      const url = await uploadImageToS3(file);
      
      document.body.removeChild(loadingIndicator);
      
      if (url) {
        resolve(url);
      } else {
        alert('❌ Ошибка загрузки изображения. Попробуйте еще раз.');
        resolve(null);
      }
    };
    
    input.click();
  });
};