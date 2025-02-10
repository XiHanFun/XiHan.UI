/**
 *  文件处理相关
 */
export const fileUtils = {
  /**
   * 获取文件扩展名
   *
   * @param filename 文件名，包含扩展名
   * @returns 文件的扩展名部分，不包含点号
   */
  getFileExt: (filename: string): string => filename.substring(filename.lastIndexOf(".") + 1),

  /**
   * 格式化文件大小为人类可读的字符串
   *
   * @param bytes 文件大小，以字节为单位
   * @returns 格式化后的文件大小字符串，如 "1.23 KB"
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;

    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  },

  /**
   * 下载文件
   *
   * @param url 文件的下载链接
   * @param filename 可选参数，指定下载后保存的文件名。如果不提供，则使用URL的最后一部分作为文件名
   */
  downloadFile: (url: string, filename?: string): void => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || url.substring(url.lastIndexOf("/") + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * 读取本地文件内容为文本
   *
   * @param file 需要读取的文件对象
   * @returns 返回一个Promise，解析为文件内容的字符串
   */
  readLocalFile: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },
};
