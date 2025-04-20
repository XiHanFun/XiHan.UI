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

  /**
   * 是否包含文件夹条目
   * @default false
   */
  includeFolders?: boolean;
}

/**
 * ZIP文件头信息
 */
interface ZipHeader {
  signature: number;
  version: number;
  flags: number;
  compression: number;
  lastModified: Date;
  crc32: number;
  compressedSize: number;
  uncompressedSize: number;
  filenameLength: number;
  extraLength: number;
  filename: string;
  extra: Uint8Array;
}

/**
 * 检查是否支持ZIP操作
 * 主要检查Blob，File，FileReader，ArrayBuffer等API是否可用
 */
export function isZipSupported(): boolean {
  return (
    typeof Blob !== "undefined" &&
    typeof File !== "undefined" &&
    typeof FileReader !== "undefined" &&
    typeof ArrayBuffer !== "undefined" &&
    typeof TextDecoder !== "undefined"
  );
}

/**
 * 解析ZIP文件头
 */
function parseZipHeader(view: DataView, offset: number): ZipHeader {
  const signature = view.getUint32(offset, true);
  const version = view.getUint16(offset + 4, true);
  const flags = view.getUint16(offset + 6, true);
  const compression = view.getUint16(offset + 8, true);
  const lastModified = new Date(view.getUint16(offset + 10, true) * 1000 + view.getUint16(offset + 12, true));
  const crc32 = view.getUint32(offset + 14, true);
  const compressedSize = view.getUint32(offset + 18, true);
  const uncompressedSize = view.getUint32(offset + 22, true);
  const filenameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const filename = new TextDecoder().decode(new Uint8Array(view.buffer, offset + 30, filenameLength));
  const extra = new Uint8Array(view.buffer, offset + 30 + filenameLength, extraLength);

  return {
    signature,
    version,
    flags,
    compression,
    lastModified,
    crc32,
    compressedSize,
    uncompressedSize,
    filenameLength,
    extraLength,
    filename,
    extra,
  };
}

/**
 * 创建ZIP文件
 * @param entries 文件条目列表
 * @param options ZIP操作选项
 * @returns 包含ZIP数据的Blob对象
 */
export async function createZip(entries: ZipEntry[], options: ZipOptions = {}): Promise<Blob> {
  // 检查浏览器支持
  if (!isZipSupported()) {
    throw new Error("您的浏览器不支持ZIP操作");
  }

  const { onComplete, onError } = options;

  try {
    const zip = new Map<string, Blob>();

    // 添加文件
    for (const entry of entries) {
      try {
        const { filename, data } = entry;

        // 转换为Blob
        const blob = data instanceof Blob ? data : new Blob([data]);
        zip.set(filename, blob);
      } catch (err) {
        if (onError) {
          onError(err as Error, entry.filename);
        }
      }
    }

    // 生成ZIP文件
    const zipBlob = new Blob([...zip.values()], { type: "application/zip" });

    if (onComplete) {
      onComplete();
    }

    return zipBlob;
  } catch (err) {
    if (onError) {
      onError(err as Error);
    }
    throw err;
  }
}

/**
 * 解压ZIP文件
 * @param zipFile ZIP文件对象
 * @param options 解压选项
 * @returns 文件映射对象，键为文件名，值为文件数据
 */
export async function unzip(
  zipFile: File | Blob | ArrayBuffer,
  options: UnzipOptions = {},
): Promise<Map<string, Blob>> {
  // 检查浏览器支持
  if (!isZipSupported()) {
    throw new Error("您的浏览器不支持ZIP操作");
  }

  const { files, filter, includeFolders = false, onComplete, onError } = options;

  try {
    const result = new Map<string, Blob>();
    const zipBlob = zipFile instanceof Blob ? zipFile : new Blob([zipFile]);
    const reader = new FileReader();

    // 读取ZIP文件
    const zipData = await new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(zipBlob);
    });

    // 解析ZIP文件
    const view = new DataView(zipData);
    let offset = 0;

    while (offset < zipData.byteLength) {
      const header = parseZipHeader(view, offset);

      if (header.signature === 0x504b0304) {
        // PK\3\4
        if (
          (!includeFolders && header.filename.endsWith("/")) ||
          (files && !files.includes(header.filename)) ||
          (filter && !filter(header.filename))
        ) {
          offset += 30 + header.filenameLength + header.extraLength + header.compressedSize;
          continue;
        }

        const fileData = new Uint8Array(
          zipData,
          offset + 30 + header.filenameLength + header.extraLength,
          header.compressedSize,
        );
        result.set(header.filename, new Blob([fileData]));

        offset += 30 + header.filenameLength + header.extraLength + header.compressedSize;
      } else {
        offset++;
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
}

/**
 * 从ZIP文件中提取单个文件
 * @param zipFile ZIP文件对象
 * @param filename 要提取的文件名
 * @param options 解压选项
 * @returns 提取的文件内容
 */
export async function extractFile(
  zipFile: File | Blob | ArrayBuffer,
  filename: string,
  options: UnzipOptions = {},
): Promise<Blob | null> {
  const result = await unzip(zipFile, {
    ...options,
    files: [filename],
  });

  return result.get(filename) || null;
}

/**
 * 列出ZIP文件内容
 * @param zipFile ZIP文件对象
 * @returns 文件列表信息
 */
export async function listZipContents(
  zipFile: File | Blob | ArrayBuffer,
): Promise<{ name: string; size: number; compressed: number; dir: boolean; date: Date }[]> {
  // 检查浏览器支持
  if (!isZipSupported()) {
    throw new Error("您的浏览器不支持ZIP操作");
  }

  const zipBlob = zipFile instanceof Blob ? zipFile : new Blob([zipFile]);
  const reader = new FileReader();
  const contents: { name: string; size: number; compressed: number; dir: boolean; date: Date }[] = [];

  // 读取ZIP文件
  const zipData = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(zipBlob);
  });

  // 解析ZIP文件
  const view = new DataView(zipData);
  let offset = 0;

  while (offset < zipData.byteLength) {
    const header = parseZipHeader(view, offset);

    if (header.signature === 0x504b0304) {
      // PK\3\4
      contents.push({
        name: header.filename,
        size: header.uncompressedSize,
        compressed: header.compressedSize,
        dir: header.filename.endsWith("/"),
        date: header.lastModified,
      });

      offset += 30 + header.filenameLength + header.extraLength + header.compressedSize;
    } else {
      offset++;
    }
  }

  return contents;
}

/**
 * 将ZIP文件保存到本地
 * @param zipData ZIP文件数据
 * @param filename 保存的文件名
 */
export function saveZipFile(zipData: Blob, filename: string = "archive.zip"): void {
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
}

/**
 * 添加文件夹到ZIP
 * @param folderName 文件夹名称
 * @param files 文件映射对象，键为相对路径，值为文件数据
 * @param options ZIP操作选项
 * @returns ZIP文件数据
 */
export async function addFolderToZip(
  folderName: string,
  files: Map<string, Blob | File | ArrayBuffer | Uint8Array>,
  options: ZipOptions = {},
): Promise<Blob> {
  const entries: ZipEntry[] = [];

  // 确保文件夹名称以/结尾
  const normalizedFolderName = folderName.endsWith("/") ? folderName : `${folderName}/`;

  // 添加文件夹条目
  entries.push({
    filename: normalizedFolderName,
    data: new Blob([]),
    compressionLevel: 0,
  });

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
}

/**
 * 合并多个ZIP文件
 * @param zipFiles 多个ZIP文件
 * @param options ZIP操作选项
 * @returns 合并后的ZIP文件
 */
export async function mergeZips(zipFiles: (File | Blob | ArrayBuffer)[], options: ZipOptions = {}): Promise<Blob> {
  // 检查浏览器支持
  if (!isZipSupported()) {
    throw new Error("您的浏览器不支持ZIP操作");
  }

  const entries: ZipEntry[] = [];

  // 解压每个ZIP并合并内容
  for (let i = 0; i < zipFiles.length; i++) {
    const zipFile = zipFiles[i];
    const files = await unzip(zipFile, { includeFolders: true });

    // 添加文件到条目列表
    for (const [filename, data] of files.entries()) {
      entries.push({
        filename,
        data,
      });
    }
  }

  // 创建合并后的ZIP
  const blob = await createZip(entries, options);

  if (options.onComplete) {
    options.onComplete();
  }

  return blob;
}
