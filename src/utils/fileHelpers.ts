export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const selectFile = (accept: string): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      resolve(file || null);
    };
    input.click();
  });
};

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

export const selectAndConvertImage = async (): Promise<string | null> => {
  const file = await selectFile('image/*');
  if (!file) return null;
  
  if (file.size > MAX_FILE_SIZE) {
    alert(`Файл слишком большой (${(file.size / 1024 / 1024).toFixed(2)} МБ). Максимум: 1 МБ`);
    return null;
  }
  
  return fileToBase64(file);
};

export const selectAndConvertAudio = async (): Promise<string | null> => {
  const file = await selectFile('audio/*');
  if (!file) return null;
  
  if (file.size > MAX_FILE_SIZE) {
    alert(`Файл слишком большой (${(file.size / 1024 / 1024).toFixed(2)} МБ). Максимум: 1 МБ`);
    return null;
  }
  
  return fileToBase64(file);
};