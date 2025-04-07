/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<void>
 */
export const copyText = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // 降级处理
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;opacity:0;";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    // @ts-ignore - document.execCommand 已弃用但用作降级方案
    document.execCommand("copy", false, undefined);
    document.body.removeChild(textarea);
  }
};

/**
 * 复制图片到剪贴板
 * @param image 要复制的图片或图片URL
 * @returns Promise<void>
 */
export const copyImage = async (image: HTMLImageElement | string): Promise<void> => {
  try {
    let imgElement: HTMLImageElement;

    if (typeof image === "string") {
      imgElement = new Image();
      imgElement.src = image;
      await new Promise((resolve, reject) => {
        imgElement.onload = resolve;
        imgElement.onerror = reject;
      });
    } else {
      imgElement = image;
    }

    const canvas = document.createElement("canvas");
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("无法创建 canvas 上下文");

    ctx.drawImage(imgElement, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error("转换为Blob失败"))), "image/png");
    });

    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  } catch (error: unknown) {
    throw new Error(`复制图片失败: ${error instanceof Error ? error.message : "未知错误"}`);
  }
};

/**
 * 从剪贴板读取文本
 * @returns Promise<string>
 */
export const readText = async (): Promise<string> => {
  try {
    return await navigator.clipboard.readText();
  } catch {
    throw new Error("无法访问剪贴板");
  }
};

/**
 * 从剪贴板读取图片
 * @returns Promise<Blob | null>
 */
export const readImage = async (): Promise<Blob | null> => {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const types = item.types;
      const imageType = types.find(type => type.startsWith("image/"));
      if (imageType) {
        return await item.getType(imageType);
      }
    }
    return null;
  } catch {
    throw new Error("无法从剪贴板读取图片");
  }
};

/**
 * 检查剪贴板权限
 * @param type 权限类型
 * @returns Promise<boolean>
 */
export const checkPermission = async (type: "read" | "write" = "read"): Promise<boolean> => {
  try {
    const permission = await navigator.permissions.query({
      name: "clipboard" as PermissionName,
      ...(type === "write" ? { allowWithoutGesture: false } : {}),
    });
    return permission.state === "granted";
  } catch {
    return false;
  }
};

// 同时提供命名空间对象
export const clipboardUtils = {
  copyText,
  copyImage,
  readText,
  readImage,
  checkPermission,
};

// 默认导出命名空间对象
export default clipboardUtils;
