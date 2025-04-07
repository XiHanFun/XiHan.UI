/**
 * 生成随机密码
 * @param length 密码长度，默认 12
 * @param options 密码选项，默认包含大小写字母、数字和符号
 * @returns 返回随机密码
 */
export const generatePassword = (
  length = 12,
  options = {
    uppercase: true,
    numbers: true,
    symbols: true,
  },
): string => {
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
};

/**
 * Base64 编解码
 */
export const base64 = {
  /**
   * Base64 编码
   * @param str 要编码的字符串
   * @returns 返回编码后的字符串
   */
  encode: (str: string): string => {
    return btoa(encodeURIComponent(str));
  },

  /**
   * Base64 解码
   * @param str 要解码的字符串
   * @returns 返回解码后的字符串
   */
  decode: (str: string): string => {
    return decodeURIComponent(atob(str));
  },
};

/**
 * 哈希函数
 */
export const hash = {
  /**
   * MD5 哈希
   * @param message 要哈希的字符串
   * @returns 返回 MD5 哈希值
   */
  md5: async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("MD5", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  },

  /**
   * SHA-256 哈希
   * @param message 要哈希的字符串
   * @returns 返回 SHA-256 哈希值
   */
  sha256: async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  },
};

/**
 * AES 加解密
 */
export const aes = {
  /**
   * AES 加密
   * @param data 要加密的数据
   * @param key 加密密钥
   * @returns 返回加密后的数据
   */
  encrypt: async (data: string, key: string): Promise<string> => {
    const encoder = new TextEncoder();
    const keyBuffer = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "AES-CBC", length: 256 },
      false,
      ["encrypt"],
    );

    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, keyBuffer, encoder.encode(data));

    return JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
    });
  },

  /**
   * AES 解密
   * @param encryptedData 要解密的加密数据
   * @param key 解密密钥
   * @returns 返回解密后的数据
   */
  decrypt: async (encryptedData: string, key: string): Promise<string> => {
    const { iv, data } = JSON.parse(encryptedData);
    const decoder = new TextDecoder();
    const keyBuffer = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      { name: "AES-CBC", length: 256 },
      false,
      ["decrypt"],
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: new Uint8Array(iv) },
      keyBuffer,
      new Uint8Array(data),
    );

    return decoder.decode(decrypted);
  },
};

/**
 * RSA 加解密
 */
export const rsa = {
  /**
   * 生成 RSA 密钥对
   * @param modulusLength 密钥长度，默认 2048 位
   * @returns 返回公钥和私钥
   */
  generateKeyPair: async (modulusLength = 2048): Promise<{ publicKey: string; privateKey: string }> => {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    );

    const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    return {
      publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKey))),
      privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKey))),
    };
  },

  /**
   * RSA 加密
   * @param data 要加密的数据
   * @param publicKey 公钥
   * @returns 返回加密后的数据
   */
  encrypt: async (data: string, publicKey: string): Promise<string> => {
    const binaryKey = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0));
    const importedKey = await crypto.subtle.importKey(
      "spki",
      binaryKey,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"],
    );

    const encoded = new TextEncoder().encode(data);
    const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, importedKey, encoded);

    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  },

  /**
   * RSA 解密
   * @param encryptedData 要解密的加密数据
   * @param privateKey 私钥
   * @returns 返回解密后的数据
   */
  decrypt: async (encryptedData: string, privateKey: string): Promise<string> => {
    const binaryKey = Uint8Array.from(atob(privateKey), c => c.charCodeAt(0));
    const importedKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["decrypt"],
    );

    const encrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, importedKey, encrypted);

    return new TextDecoder().decode(decrypted);
  },

  /**
   * RSA 签名
   * @param data 要签名的数据
   * @param privateKey 私钥
   * @returns 返回签名后的数据
   */
  sign: async (data: string, privateKey: string): Promise<string> => {
    const binaryKey = Uint8Array.from(atob(privateKey), c => c.charCodeAt(0));
    const importedKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      false,
      ["sign"],
    );

    const encoded = new TextEncoder().encode(data);
    const signature = await crypto.subtle.sign(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      importedKey,
      encoded,
    );

    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  },

  /**
   * 验证 RSA 签名
   * @param data 原始数据
   * @param signature 签名数据
   * @param publicKey 公钥
   * @returns 返回签名是否有效
   */
  verify: async (data: string, signature: string, publicKey: string): Promise<boolean> => {
    const binaryKey = Uint8Array.from(atob(publicKey), c => c.charCodeAt(0));
    const importedKey = await crypto.subtle.importKey(
      "spki",
      binaryKey,
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      false,
      ["verify"],
    );

    const encoded = new TextEncoder().encode(data);
    const binarySignature = Uint8Array.from(atob(signature), c => c.charCodeAt(0));

    return await crypto.subtle.verify(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      importedKey,
      binarySignature,
      encoded,
    );
  },
};
