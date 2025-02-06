/**
 * 字符串格式化工具
 */
export const stringUtils = {
  /**
   * 首字母大写
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * 驼峰转连字符
   */
  kebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  },

  /**
   * 连字符转驼峰
   */
  camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  },

  /**
   * 截断字符串
   */
  truncate(str: string, length: number, suffix = "..."): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + suffix;
  },

  /**
   * 格式化模板字符串
   */
  template(str: string, data: Record<string, any>): string {
    return str.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? ""));
  },

  /**
   * 转义HTML特殊字符
   */
  escapeHtml(str: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return str.replace(/[&<>"']/g, m => map[m]);
  },
};
