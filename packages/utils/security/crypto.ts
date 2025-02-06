// 加密解密相关工具

/**
 * 加密工具集
 */
export const cryptoUtils = {
  /**
   * 生成随机密码
   */
  generatePassword(
    length = 12,
    options = {
      uppercase: true,
      numbers: true,
      symbols: true,
    }
  ): string {
    const chars = {
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    };

    let pool = chars.lowercase;
    if (options.uppercase) pool += chars.uppercase;
    if (options.numbers) pool += chars.numbers;
    if (options.symbols) pool += chars.symbols;

    return Array.from({ length }, () => pool.charAt(Math.floor(Math.random() * pool.length))).join("");
  },

  /**
   * Base64 编解码
   */
  base64: {
    encode(str: string): string {
      return btoa(encodeURIComponent(str));
    },
    decode(str: string): string {
      return decodeURIComponent(atob(str));
    },
  },

  /**
   * 哈希函数
   */
  hash: {
    async md5(message: string): Promise<string> {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest("MD5", msgBuffer);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    },

    async sha256(message: string): Promise<string> {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
    },
  },

  /**
   * AES 加解密
   */
  aes: {
    async encrypt(data: string, key: string): Promise<string> {
      const encoder = new TextEncoder();
      const keyBuffer = await crypto.subtle.importKey(
        "raw",
        encoder.encode(key),
        { name: "AES-CBC", length: 256 },
        false,
        ["encrypt"]
      );

      const iv = crypto.getRandomValues(new Uint8Array(16));
      const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, keyBuffer, encoder.encode(data));

      return JSON.stringify({
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted)),
      });
    },

    async decrypt(encryptedData: string, key: string): Promise<string> {
      const { iv, data } = JSON.parse(encryptedData);
      const decoder = new TextDecoder();
      const keyBuffer = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(key),
        { name: "AES-CBC", length: 256 },
        false,
        ["decrypt"]
      );

      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv: new Uint8Array(iv) },
        keyBuffer,
        new Uint8Array(data)
      );

      return decoder.decode(decrypted);
    },
  },
};
