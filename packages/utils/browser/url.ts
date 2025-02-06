/**
 * URL 相关工具函数
 */

// URL 参数操作
export const urlUtils = {
  /**
   * 获取 URL 参数对象
   */
  getParams(url?: string): Record<string, string> {
    const search = url ? new URL(url).search : window.location.search;
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },

  /**
   * 将对象转换为 URL 参数字符串
   */
  stringifyParams(params: Record<string, any>): string {
    return new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)
    ).toString();
  },

  /**
   * 向 URL 添加参数
   */
  addParams(url: string, params: Record<string, any>): string {
    const urlObj = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      urlObj.searchParams.append(key, String(value));
    });
    return urlObj.toString();
  },

  /**
   * 从 URL 中移除指定参数
   */
  removeParams(url: string, params: string[]): string {
    const urlObj = new URL(url);
    params.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString();
  },

  /**
   * 解析 URL 的各个部分
   */
  parse(url: string) {
    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol,
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      origin: urlObj.origin,
    };
  },

  /**
   * 判断是否为绝对 URL
   */
  isAbsolute(url: string): boolean {
    return /^[a-z][a-z0-9+.-]*:/.test(url);
  },

  /**
   * 拼接 URL 路径
   */
  join(...parts: string[]): string {
    return parts
      .map(part => part.replace(/^\/+|\/+$/g, ""))
      .filter(Boolean)
      .join("/");
  },
};
