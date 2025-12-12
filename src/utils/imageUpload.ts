// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Убираем префикс data:image/...;base64,
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Upload image to S3 storage instead of base64
export const uploadImageToS3 = async (file: File): Promise<string | null> => {
  try {
    // Конвертируем файл в base64
    const base64Data = await fileToBase64(file);
    
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