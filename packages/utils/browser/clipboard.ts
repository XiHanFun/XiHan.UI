/**
 * 剪贴板操作相关工具函数
 */
export const clipboardUtils = {
  /**
   * 复制文本到剪贴板
   *
   * @param text 要复制的文本
   * @returns Promise<void>
   */
  async copyText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 降级处理
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  },

  /**
   * 从剪贴板读取文本
   *
   * @returns Promise<string>
   */
  async readText(): Promise<string> {
    try {
      return await navigator.clipboard.readText();
    } catch {
      throw new Error("无法访问剪贴板");
    }
  },
};
