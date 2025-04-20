/**
 * 文件处理工具函数
 */

/**
 * 获取文件扩展名
 * @param filename 文件名，包含扩展名
 * @returns 文件的扩展名部分，不包含点号，如果无扩展名则返回空字符串
 */
export function getFileExt(filename: string): string {
  const ext = filename.substring(filename.lastIndexOf(".") + 1);
  return ext === filename ? "" : ext;
}

/**
 * 下载文件
 * @param url 文件的下载链接
 * @param filename 可选参数，指定下载后保存的文件名。如果不提供，则使用URL的最后一部分作为文件名
 * @throws 当URL无效时抛出错误
 */
export function downloadFile(url: string, filename?: string): void {
  if (!url) throw new Error("下载链接不能为空");

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || url.substring(url.lastIndexOf("/") + 1);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 文件读取器配置
 */
interface FileReaderConfig {
  onProgress?: (event: ProgressEvent<FileReader>) => void;
  timeout?: number;
}

/**
 * 创建文件读取器
 * @param config 配置选项
 * @returns 配置好的FileReader实例
 */
function createFileReader(config: FileReaderConfig = {}): FileReader {
  const reader = new FileReader();

  if (config.onProgress) {
    reader.onprogress = config.onProgress;
  }

  if (config.timeout) {
    setTimeout(() => {
      if (reader.readyState !== FileReader.DONE) {
        reader.abort();
      }
    }, config.timeout);
  }

  return reader;
}

/**
 * 读取本地文件内容为文本
 * @param file 需要读取的文件对象
 * @param config 文件读取器配置
 * @returns 返回一个Promise，解析为文件内容的字符串
 * @throws 当文件读取失败时抛出错误
 */
export function readLocalFile(file: File, config?: FileReaderConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = createFileReader(config);

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("文件内容不是文本格式"));
      }
    };

    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file);
  });
}

/**
 * 读取本地文件内容为二进制数据
 * @param file 需要读取的文件对象
 * @param config 文件读取器配置
 * @returns 返回一个Promise，解析为文件内容的二进制数据
 * @throws 当文件读取失败时抛出错误
 */
export function readLocalFileAsArrayBuffer(file: File, config?: FileReaderConfig): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = createFileReader(config);

    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("文件内容不是二进制格式"));
      }
    };

    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 读取本地文件内容为Blob
 * @param file 需要读取的文件对象
 * @returns 返回一个Promise，解析为文件内容的Blob对象
 */
export function readLocalFileAsBlob(file: File): Promise<Blob> {
  return Promise.resolve(file);
}

/**
 * 读取本地文件内容为DataURL
 * @param file 需要读取的文件对象
 * @param config 文件读取器配置
 * @returns 返回一个Promise，解析为文件内容的DataURL字符串
 * @throws 当文件读取失败时抛出错误
 */
export function readLocalFileAsDataURL(file: File, config?: FileReaderConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = createFileReader(config);

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("文件内容不是DataURL格式"));
      }
    };

    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}
