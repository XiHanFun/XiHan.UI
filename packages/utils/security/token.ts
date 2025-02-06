/**
 * Token 工具集
 */
export const tokenUtils = {
  /**
   * 生成 CSRF Token
   */
  generateCsrf(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  },

  /**
   * 生成会话 Token
   */
  generateSession(length = 32): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map(x => chars.charAt(x % chars.length))
      .join("");
  },

  /**
   * 验证 Token 格式
   */
  validate(token: string, pattern: RegExp = /^[A-Za-z0-9-_]+$/): boolean {
    return pattern.test(token);
  },

  /**
   * Token 存储管理
   */
  storage: {
    set(key: string, token: string, options?: { expires?: number }): void {
      const item = {
        token,
        expires: options?.expires ? Date.now() + options.expires : null,
      };
      localStorage.setItem(key, JSON.stringify(item));
    },

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

    remove(key: string): void {
      localStorage.removeItem(key);
    },
  },
};
