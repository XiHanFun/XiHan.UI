/**
 * 文件压缩工具
 * 提供文件压缩和解压缩功能
 */

/**
 * 文件压缩选项
 */
export interface CompressionOptions {
  /**
   * 压缩质量 (0-1)，仅适用于图片压缩
   * @default 0.8
   */
  quality?: number;

  /**
   * 压缩级别 (1-9)，仅适用于通用数据压缩
   * @default 6
   */
  level?: number;

  /**
   * 是否保留元数据
   * @default false
   */
  keepMetadata?: boolean;

  /**
   * 最大宽度（像素），仅适用于图片
   */
  maxWidth?: number;

  /**
   * 最大高度（像素），仅适用于图片
   */
  maxHeight?: number;

  /**
   * 目标文件类型，仅适用于图片
   * @default 'image/jpeg'
   */
  mimeType?: string;

  /**
   * 进度回调函数
   */
  onProgress?: (progress: number) => void;
}

/**
 * 压缩图片文件
 * @param file 需要压缩的图片文件
 * @param options 压缩选项
 * @returns 压缩后的文件对象
 */
export const compressImage = async (file: File, options: CompressionOptions = {}): Promise<File> => {
  // 验证输入是否为图片文件
  if (!file.type.startsWith("image/")) {
    throw new Error("仅支持压缩图片文件");
  }

  const { quality = 0.8, maxWidth, maxHeight, mimeType = file.type, onProgress } = options;

  return new Promise((resolve, reject) => {
    // 创建图片元素和Canvas
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("无法创建Canvas上下文"));
      return;
    }

    // 图片加载完成后处理
    img.onload = () => {
      try {
        // 计算新的尺寸（如果需要调整大小）
        let width = img.width;
        let height = img.height;

        if (maxWidth && width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        if (maxHeight && height > maxHeight) {
          const ratio = maxHeight / height;
          height = maxHeight;
          width = width * ratio;
        }

        // 设置canvas尺寸并绘制图像
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // 如果是进度回调，模拟一个压缩过程
        if (onProgress) {
          onProgress(0.5);
        }

        // 将Canvas转换为Blob
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error("压缩失败"));
              return;
            }

            if (onProgress) {
              onProgress(1.0);
            }

            // 创建新的File对象
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: file.lastModified,
            });

            resolve(compressedFile);
          },
          mimeType,
          quality,
        );
      } catch (err) {
        reject(err);
      }
    };

    // 图片加载失败处理
    img.onerror = () => {
      reject(new Error("图片加载失败"));
    };

    // 从文件加载图片
    const url = URL.createObjectURL(file);
    img.src = url;

    // 加载开始时的进度回调
    if (onProgress) {
      onProgress(0.1);
    }
  });
};

/**
 * 压缩文本数据
 * @param text 需要压缩的文本
 * @returns 压缩后的 Uint8Array
 */
export const compressText = async (text: string): Promise<Uint8Array> => {
  if (!("CompressionStream" in window)) {
    throw new Error("您的浏览器不支持压缩流API");
  }

  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(text);

  // 使用GZIP压缩
  return await compressData(uint8Array);
};

/**
 * 解压缩文本数据
 * @param compressedData 压缩后的数据
 * @returns 解压后的文本
 */
export const decompressText = async (compressedData: Uint8Array): Promise<string> => {
  if (!("DecompressionStream" in window)) {
    throw new Error("您的浏览器不支持解压缩流API");
  }

  const decompressedData = await decompressData(compressedData);
  const decoder = new TextDecoder();
  return decoder.decode(decompressedData);
};

/**
 * 压缩二进制数据
 * @param data 需要压缩的数据
 * @param format 压缩格式，默认为'gzip'
 * @returns 压缩后的 Uint8Array
 */
export const compressData = async (data: Uint8Array, format: "gzip" | "deflate" = "gzip"): Promise<Uint8Array> => {
  if (!("CompressionStream" in window)) {
    throw new Error("您的浏览器不支持压缩流API");
  }

  // 创建压缩流
  const cs = new CompressionStream(format);
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();

  // 读取压缩后的数据
  const arrayBuffer = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

/**
 * 解压缩二进制数据
 * @param compressedData 压缩后的数据
 * @param format 解压格式，默认为'gzip'
 * @returns 解压后的 Uint8Array
 */
export const decompressData = async (
  compressedData: Uint8Array,
  format: "gzip" | "deflate" = "gzip",
): Promise<Uint8Array> => {
  if (!("DecompressionStream" in window)) {
    throw new Error("您的浏览器不支持解压缩流API");
  }

  // 创建解压缩流
  const ds = new DecompressionStream(format);
  const writer = ds.writable.getWriter();
  writer.write(compressedData);
  writer.close();

  // 读取解压后的数据
  const arrayBuffer = await new Response(ds.readable).arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

/**
 * 对文件对象进行压缩
 * @param file 要压缩的文件
 * @param options 压缩选项
 * @returns 压缩后的文件对象
 */
export const compressFile = async (file: File, options: CompressionOptions = {}): Promise<File> => {
  // 根据文件类型选择适当的压缩方法
  if (file.type.startsWith("image/")) {
    return compressImage(file, options);
  }

  // 对于文本类型的文件，使用文本压缩
  if (file.type.includes("text") || file.type === "application/json") {
    const text = await file.text();
    const compressedData = await compressText(text);

    return new File([compressedData], `${file.name}.gz`, {
      type: "application/gzip",
      lastModified: file.lastModified,
    });
  }

  // 对于其他类型的文件，使用通用的二进制压缩
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const compressedData = await compressData(uint8Array);

  return new File([compressedData], `${file.name}.gz`, {
    type: "application/gzip",
    lastModified: file.lastModified,
  });
};

/**
 * 批量压缩文件
 * @param files 文件列表
 * @param options 压缩选项
 * @returns 压缩后的文件列表
 */
export const compressBatch = async (files: File[], options: CompressionOptions = {}): Promise<File[]> => {
  const compressedFiles: File[] = [];
  let processedCount = 0;

  for (const file of files) {
    const compressedFile = await compressFile(file, {
      ...options,
      onProgress: options.onProgress
        ? progress => {
            const overallProgress = (processedCount + progress) / files.length;
            options.onProgress!(overallProgress);
          }
        : undefined,
    });

    compressedFiles.push(compressedFile);
    processedCount++;

    if (options.onProgress) {
      options.onProgress(processedCount / files.length);
    }
  }

  return compressedFiles;
};

// 同时提供命名空间对象
export const compressionUtils = {
  compressImage,
  compressText,
  decompressText,
  compressData,
  decompressData,
  compressFile,
  compressBatch,
};

// 默认导出命名空间对象
export default compressionUtils;
