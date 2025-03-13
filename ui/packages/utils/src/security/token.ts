/**
 * 生成 CSRF Token
 * @returns 返回 CSRF Token
 */
export const generateCsrf = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * 生成会话 Token
 * @param length 长度
 * @returns 返回会话 Token
 */
export const generateSession = (length = 32): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(x => chars.charAt(x % chars.length))
    .join("");
};

/**
 * 验证 Token 格式
 * @param token Token
 * @param pattern 正则表达式
 * @returns 返回是否验证通过
 */
export const validate = (token: string, pattern: RegExp = /^[A-Za-z0-9-_]+$/): boolean => {
  return pattern.test(token);
};

/**
 * Token 存储管理
 */
export const storage = {
  /**
   * 设置 Token
   * @param key 键
   * @param token Token
   * @param options 选项
   */
  set(key: string, token: string, options?: { expires?: number }): void {
    const item = {
      token,
      expires: options?.expires ? Date.now() + options.expires : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  /**
   * 获取 Token
   * @param key 键
   * @returns 返回 Token
   */
  get(key: string): string | null {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { token, expires } = JSON.parse(item);
    if (expires && Date.now() > expires) {
      localStorage.removeItem(key);
      return null;
    }

    return token;
  },

  /**
   * 删除 Token
   * @param key 键
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  },
};

export const tokenUtils = {
  generateCsrf,
  generateSession,
  validate,
  storage,
} as const;

export default tokenUtils;
