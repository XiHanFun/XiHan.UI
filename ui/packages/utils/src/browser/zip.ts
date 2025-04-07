/**
 * ZIP文件处理工具
 * 提供ZIP格式文件的压缩和解压功能
 */

/**
 * ZIP文件项描述
 */
export interface ZipEntry {
  /**
   * 文件名（包括路径）
   */
  filename: string;

  /**
   * 文件数据
   */
  data: Blob | File | ArrayBuffer | Uint8Array;

  /**
   * 压缩级别 (0-9)，0表示不压缩
   * @default 5
   */
  compressionLevel?: number;

  /**
   * 最后修改时间
   * @default 当前时间
   */
  lastModified?: Date;

  /**
   * 注释
   */
  comment?: string;
}

/**
 * ZIP操作选项
 */
export interface ZipOptions {
  /**
   * 默认压缩级别 (0-9)
   * @default 5
   */
  compressionLevel?: number;

  /**
   * 是否包含文件夹条目
   * @default true
   */
  includeFolders?: boolean;

  /**
   * 进度回调
   */
  onProgress?: (progress: number, currentFile?: string) => void;

  /**
   * 完成回调
   */
  onComplete?: () => void;

  /**
   * 错误回调
   */
  onError?: (error: Error, filename?: string) => void;
}

/**
 * ZIP解压选项
 */
export interface UnzipOptions extends ZipOptions {
  /**
   * 要解压的特定文件，如果未指定则解压所有文件
   */
  files?: string[];

  /**
   * 文件名过滤函数
   */
  filter?: (filename: string) => boolean;
}

/**
 * 检查是否支持ZIP操作
 * 主要检查Blob，File，FileReader，ArrayBuffer等API是否可用
 */
export const isZipSupported = (): boolean => {
  return (
    typeof Blob !== "undefined" &&
    typeof File !== "undefined" &&
    typeof FileReader !== "undefined" &&
    typeof ArrayBuffer !== "undefined"
  );
};

/**
 * 创建ZIP文件
 * @param entries 文件条目列表
 * @param options ZIP操作选项
 * @returns 包含ZIP数据的Blob对象
 */
export const createZip = async (entries: ZipEntry[], options: ZipOptions = {}): Promise<Blob> => {
  // 注意：此函数实现需要依赖如JSZip等第三方库
  // 以下是一个示例实现，实际使用时请引入适当的库

  // 检查浏览器支持
  if (!isZipSupported()) {
    throw new Error("您的浏览器不支持ZIP操作");
  }

  // 引入JSZip库示例
  if (typeof window.JSZip === "undefined") {
    throw new Error("需要JSZip库支持，请先加载JSZip");
  }

  const { compressionLevel = 5, includeFolders = true, onProgress, onComplete, onError } = options;

  try {
    // 创建JSZip实例
    const zip = new window.JSZip();
    const totalEntries = entries.length;
    let processedEntries = 0;

    // 添加文件
    for (const entry of entries) {
      try {
        const {
          filename,
          data,
          compressionLevel: entryCompressionLevel = compressionLevel,
          lastModified = new Date(),
          comment,
        } = entry;

        // 确定压缩方法
        const compression = entryCompressionLevel > 0 ? "DEFLATE" : "STORE";
        const compressionOptions = {
          level: entryCompressionLevel,
          comment,
        };

        // 添加到zip
        zip.file(filename, data, {
          compression,
          compressionOptions,
          date: lastModified,
        });

        // 更新进度
        processedEntries++;
        if (onProgress) {
          onProgress(processedEntries / totalEntries, filename);
        }
      } catch (err) {
        if (onError) {
          onError(err as Error, entry.filename);
        }
      }
    }

    // 生成ZIP文件
    const blob = await zip.generateAsync(
      {
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: compressionLevel,
        },
      },
      (metadata: { percent: number }) => {
        if (onProgress) {
          onProgress(metadata.percent / 100);
        }
      },
    );

    if (onComplete) {
      onComplete();
    }

    return blob;
  } catch (err) {
    if (onError) {
      onError(err as Error);
    }
    throw err;
  }
};

/**
 * 解压ZIP文件
 * @param zipFile ZIP文件对象
 * @param options 解压选项
 * @returns 文件映射对象，键为文件名，值为文件数据
 */
export const unzip = async (
  zipFile: File | Blob | ArrayBuffer,
  options: UnzipOptions = {},
): Promise<Map<string, Blob>> => {
  // 注意：此函数实现需要依赖如JSZip等第三方库
  // 以下是一个示例实现，实际使用时请引入适当的库

  // 检查浏览器支持
  if (!isZipSupported()) {
    throw new Error("您的浏览器不支持ZIP操作");
  }

  // 引入JSZip库示例
  if (typeof window.JSZip === "undefined") {
    throw new Error("需要JSZip库支持，请先加载JSZip");
  }

  const { files, filter, includeFolders = false, onProgress, onComplete, onError } = options;

  try {
    // 加载ZIP文件
    const zip = await window.JSZip.loadAsync(zipFile);
    const result = new Map<string, Blob>();

    // 获取所有文件
    const zipFiles = zip.files;
    const filenames = Object.keys(zipFiles).filter(name => {
      // 过滤文件夹（除非特别指定）
      if (!includeFolders && name.endsWith("/")) {
        return false;
      }

      // 使用指定的文件列表进行过滤
      if (files && files.length > 0) {
        return files.includes(name);
      }

      // 使用自定义过滤函数
      if (filter) {
        return filter(name);
      }

      return true;
    });

    const totalFiles = filenames.length;
    let processedFiles = 0;

    // 逐个解压文件
    for (const filename of filenames) {
      try {
        const fileObj = zipFiles[filename];

        // 跳过目录
        if (fileObj.dir && !includeFolders) {
          continue;
        }

        // 获取文件内容
        const blob = await fileObj.async("blob");
        result.set(filename, blob);

        // 更新进度
        processedFiles++;
        if (onProgress) {
          onProgress(processedFiles / totalFiles, filename);
        }
      } catch (err) {
        if (onError) {
          onError(err as Error, filename);
        }
      }
    }

    if (onComplete) {
      onComplete();
    }

    return result;
  } catch (err) {
    if (onError) {
      onError(err as Error);
    }
    throw err;
  }
};

/**
 * 从ZIP文件中提取单个文件
 * @param zipFile ZIP文件对象
 * @param filename 要提取的文件名
 * @param options 解压选项
 * @returns 提取的文件内容
 */
export const extractFile = async (
  zipFile: File | Blob | ArrayBuffer,
  filename: string,
  options: UnzipOptions = {},
): Promise<Blob | null> => {
  const result = await unzip(zipFile, {
    ...options,
    files: [filename],
  });

  return result.get(filename) || null;
};

/**
 * 列出ZIP文件内容
 * @param zipFile ZIP文件对象
 * @returns 文件列表信息
 */
export const listZipContents = async (
  zipFile: File | Blob | ArrayBuffer,
): Promise<{ name: string; size: number; compressed: number; dir: boolean; date: Date }[]> => {
  // 检查浏览器支持
  if (!isZipSupported()) {
    throw new Error("您的浏览器不支持ZIP操作");
  }

  // 引入JSZip库示例
  if (typeof window.JSZip === "undefined") {
    throw new Error("需要JSZip库支持，请先加载JSZip");
  }

  // 加载ZIP文件
  const zip = await window.JSZip.loadAsync(zipFile);
  const contents: { name: string; size: number; compressed: number; dir: boolean; date: Date }[] = [];

  // 遍历所有文件
  Object.keys(zip.files).forEach(filename => {
    const file = zip.files[filename];
    contents.push({
      name: filename,
      size: file._data ? file._data.uncompressedSize : 0,
      compressed: file._data ? file._data.compressedSize : 0,
      dir: file.dir,
      date: file.date,
    });
  });

  return contents;
};

/**
 * 将ZIP文件保存到本地
 * @param zipData ZIP文件数据
 * @param filename 保存的文件名
 */
export const saveZipFile = (zipData: Blob, filename: string = "archive.zip"): void => {
  const url = URL.createObjectURL(zipData);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);

  a.click();

  // 清理
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * 添加文件夹到ZIP
 * @param folderName 文件夹名称
 * @param files 文件映射对象，键为相对路径，值为文件数据
 * @param options ZIP操作选项
 * @returns ZIP文件数据
 */
export const addFolderToZip = async (
  folderName: string,
  files: Map<string, Blob | File | ArrayBuffer | Uint8Array>,
  options: ZipOptions = {},
): Promise<Blob> => {
  const entries: ZipEntry[] = [];

  // 确保文件夹名称以/结尾
  const normalizedFolderName = folderName.endsWith("/") ? folderName : `${folderName}/`;

  // 添加文件夹条目
  if (options.includeFolders !== false) {
    entries.push({
      filename: normalizedFolderName,
      data: new Blob([]),
      compressionLevel: 0,
    });
  }

  // 添加文件
  for (const [relativePath, data] of files.entries()) {
    const filename = `${normalizedFolderName}${relativePath}`;
    entries.push({
      filename,
      data,
      compressionLevel: options.compressionLevel,
    });
  }

  // 创建ZIP
  return createZip(entries, options);
};

/**
 * 合并多个ZIP文件
 * @param zipFiles 多个ZIP文件
 * @param options ZIP操作选项
 * @returns 合并后的ZIP文件
 */
export const mergeZips = async (zipFiles: (File | Blob | ArrayBuffer)[], options: ZipOptions = {}): Promise<Blob> => {
  // 检查浏览器支持
  if (!isZipSupported()) {
    throw new Error("您的浏览器不支持ZIP操作");
  }

  // 引入JSZip库示例
  if (typeof window.JSZip === "undefined") {
    throw new Error("需要JSZip库支持，请先加载JSZip");
  }

  // 创建新的ZIP
  const mergedZip = new window.JSZip();

  // 解压每个ZIP并合并内容
  for (let i = 0; i < zipFiles.length; i++) {
    const zipFile = zipFiles[i];
    const zip = await window.JSZip.loadAsync(zipFile);

    // 遍历文件并添加到合并ZIP
    for (const [filename, file] of Object.entries(zip.files) as [
      string,
      {
        dir: boolean;
        async: (type: string) => Promise<any>;
        compression: string;
        date: Date;
      },
    ][]) {
      if (!file.dir) {
        const content = await file.async("arraybuffer");
        mergedZip.file(filename, content, {
          compression: file.compression,
          compressionOptions: {
            level: options.compressionLevel || 5,
          },
          date: file.date,
        });
      } else if (options.includeFolders !== false) {
        mergedZip.folder(filename);
      }
    }

    // 更新进度
    if (options.onProgress) {
      options.onProgress((i + 1) / zipFiles.length);
    }
  }

  // 生成最终ZIP
  const blob = await mergedZip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: options.compressionLevel || 5,
    },
  });

  if (options.onComplete) {
    options.onComplete();
  }

  return blob;
};

// 为TypeScript定义JSZip接口
declare global {
  interface Window {
    JSZip: any;
  }
}

// 同时提供命名空间对象
export const zipUtils = {
  isZipSupported,
  createZip,
  unzip,
  extractFile,
  listZipContents,
  saveZipFile,
  addFolderToZip,
  mergeZips,
};

// 默认导出命名空间对象
export default zipUtils;
