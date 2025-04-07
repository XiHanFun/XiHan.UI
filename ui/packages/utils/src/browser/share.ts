/**
 * Web Share API 封装工具
 * 提供网页内容分享功能的简便调用方式
 */

/**
 * 分享数据接口
 */
export interface ShareData {
  /**
   * 分享标题
   */
  title?: string;

  /**
   * 分享文本内容
   */
  text?: string;

  /**
   * 分享URL
   */
  url?: string;

  /**
   * 分享文件列表
   */
  files?: File[];
}

/**
 * 检查浏览器是否支持Web Share API
 * @returns 是否支持基本分享功能
 */
export const isShareSupported = (): boolean => {
  return typeof navigator !== "undefined" && !!navigator.share;
};

/**
 * 检查浏览器是否支持文件分享功能
 * @returns 是否支持文件分享
 */
export const isFileShareSupported = (): boolean => {
  return typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare;
};

/**
 * 检查指定的数据是否可以分享
 * @param data 要检查的分享数据
 * @returns 是否可以分享
 */
export const canShare = (data: ShareData): boolean => {
  if (!isShareSupported()) {
    return false;
  }

  // 如果包含文件，检查是否支持文件分享
  if (data.files && data.files.length > 0) {
    if (!isFileShareSupported() || !navigator.canShare) {
      return false;
    }
    return navigator.canShare({ files: data.files });
  }

  // 基本数据分享检查
  return true;
};

/**
 * 分享内容
 * @param data 分享数据
 * @returns 分享操作的Promise
 */
export const share = async (data: ShareData): Promise<void> => {
  if (!isShareSupported()) {
    throw new Error("您的浏览器不支持Web Share API");
  }

  // 检查是否可以分享
  if (data.files && data.files.length > 0 && !canShare(data)) {
    throw new Error("无法分享指定的文件");
  }

  try {
    await navigator.share(data as ShareData & { files?: File[] });
  } catch (error) {
    // ShareError不是标准错误类型，需要处理可能的不同错误
    if ((error as Error).name === "AbortError") {
      // 用户取消分享
      return;
    }

    throw error;
  }
};

/**
 * 分享文本内容
 * @param text 要分享的文本
 * @param title 可选的标题
 * @returns 分享操作的Promise
 */
export const shareText = (text: string, title?: string): Promise<void> => {
  return share({ text, title });
};

/**
 * 分享URL链接
 * @param url 要分享的URL
 * @param title 可选的标题
 * @param text 可选的描述文本
 * @returns 分享操作的Promise
 */
export const shareUrl = (url: string, title?: string, text?: string): Promise<void> => {
  return share({ url, title, text });
};

/**
 * 分享当前页面
 * @param customTitle 自定义标题，默认使用document.title
 * @param customText 自定义描述文本
 * @returns 分享操作的Promise
 */
export const shareCurrentPage = (customTitle?: string, customText?: string): Promise<void> => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("当前环境不支持分享功能");
  }

  const title = customTitle || document.title;
  const url = window.location.href;

  return share({ title, url, text: customText });
};

/**
 * 分享图片文件
 * @param imageFile 图片文件
 * @param title 可选的标题
 * @param text 可选的描述文本
 * @returns 分享操作的Promise
 */
export const shareImage = (imageFile: File, title?: string, text?: string): Promise<void> => {
  if (!isFileShareSupported()) {
    throw new Error("您的浏览器不支持文件分享功能");
  }

  if (!imageFile.type.startsWith("image/")) {
    throw new Error("提供的文件不是图片类型");
  }

  return share({ title, text, files: [imageFile] });
};

/**
 * 分享多个文件
 * @param files 文件列表
 * @param title 可选的标题
 * @returns 分享操作的Promise
 */
export const shareFiles = (files: File[], title?: string): Promise<void> => {
  if (!isFileShareSupported()) {
    throw new Error("您的浏览器不支持文件分享功能");
  }

  return share({ title, files });
};

/**
 * 分享Canvas内容
 * @param canvas Canvas元素
 * @param filename 保存的文件名
 * @param type 图片类型，默认为'image/png'
 * @param quality 图片质量 (0-1)，默认为0.8
 * @param title 可选的标题
 * @returns 分享操作的Promise
 */
export const shareCanvas = (
  canvas: HTMLCanvasElement,
  filename: string = "canvas.png",
  type: string = "image/png",
  quality: number = 0.8,
  title?: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isFileShareSupported()) {
      reject(new Error("您的浏览器不支持文件分享功能"));
      return;
    }

    try {
      canvas.toBlob(
        async blob => {
          if (!blob) {
            reject(new Error("无法从Canvas创建图片"));
            return;
          }

          const file = new File([blob], filename, { type });
          try {
            await shareImage(file, title);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        type,
        quality,
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 提供后备分享方式（当Web Share API不可用时）
 * @param data 分享数据
 * @returns 是否成功提供了后备方式
 */
export const shareFallback = (data: ShareData): boolean => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  if (data.url) {
    // 创建一个临时的a元素
    const a = document.createElement("a");
    a.href = data.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
    return true;
  } else if (data.text) {
    // 尝试复制到剪贴板
    try {
      const textarea = document.createElement("textarea");
      textarea.value = data.text;
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) {
        alert("文本已复制到剪贴板");
        return true;
      }
    } catch (err) {
      console.error("复制到剪贴板失败", err);
    }
  }

  // 无法提供后备方式
  return false;
};

/**
 * 通用分享函数（自动使用后备方式）
 * @param data 分享数据
 * @returns 分享操作的Promise
 */
export const smartShare = async (data: ShareData): Promise<boolean> => {
  // 检查是否支持原生分享
  if (canShare(data)) {
    try {
      await share(data);
      return true;
    } catch (err) {
      console.warn("原生分享失败，尝试后备方式", err);
      // 如果原生分享失败，尝试后备方式
    }
  }

  // 使用后备方式
  return shareFallback(data);
};

// 同时提供命名空间对象
export const shareUtils = {
  isShareSupported,
  isFileShareSupported,
  canShare,
  share,
  shareText,
  shareUrl,
  shareCurrentPage,
  shareImage,
  shareFiles,
  shareCanvas,
  shareFallback,
  smartShare,
};

// 默认导出命名空间对象
export default shareUtils;
