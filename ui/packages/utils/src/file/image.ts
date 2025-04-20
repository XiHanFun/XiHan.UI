/**
 * 预加载图片
 * @param src 图片地址
 */
export function preload(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 批量预加载图片
 * @param srcs 图片地址数组
 * @returns 加载完成的图片数组
 */
export function preloadAll(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map(src => preload(src)));
}

/**
 * 检查图片是否已加载完成
 * @param img 图片元素
 */
export function isLoaded(img: HTMLImageElement): boolean {
  return img.complete && img.naturalHeight !== 0;
}

/**
 * 获取图片的主要颜色
 * @param img 图片元素
 * @returns RGB颜色值
 */
export const getDominantColor = (img: HTMLImageElement): { r: number; g: number; b: number } => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context not supported");
  }

  const width = 1;
  const height = 1;

  canvas.width = width;
  canvas.height = height;
  context.drawImage(img, 0, 0, width, height);

  const [r, g, b] = context.getImageData(0, 0, width, height).data;
  return { r, g, b };
};

/**
 * 压缩图片
 * @param file 图片文件
 * @param options 压缩选项
 */
export const compress = async (
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): Promise<Blob> => {
  const { maxWidth = 800, maxHeight = 600, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not supported"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          },
          file.type,
          quality,
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
