async function loadFileAsDataURL(file: Blob): Promise<FileReader> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      resolve(reader);
    };
    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

export async function loadImageFile(file: Blob): Promise<HTMLImageElement> {
  const reader = await loadFileAsDataURL(file);

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = async () => {
      resolve(image);
    };
    image.onerror = (error) => {
      reject(error);
    };

    image.src = reader.result as string;
  });
}
