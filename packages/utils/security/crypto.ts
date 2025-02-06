// 加密解密相关工具

/**
 * 生成随机密码
 *
 * @param length 密码长度
 * @param options 配置选项，包括是否包含大写字母、数字和特殊字符
 * @returns 生成的随机密码
 */
export const generatePassword = (
  length = 12,
  options = {
    uppercase: true,
    numbers: true,
    symbols: true,
  }
): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  let chars = lowercase;
  if (options.uppercase) chars += uppercase;
  if (options.numbers) chars += numbers;
  if (options.symbols) chars += symbols;

  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};

/**
 * Base64 编码
 *
 * @param str 需要编码的字符串
 * @returns Base64编码后的字符串
 */
export const encodeBase64 = (str: string): string => {
  return btoa(encodeURIComponent(str));
};

/**
 * Base64 解码
 *
 * @param str Base64编码的字符串
 * @returns 解码后的原始字符串
 */
export const decodeBase64 = (str: string): string => {
  return decodeURIComponent(atob(str));
};

/**
 * MD5加密
 *
 * @param message 需要加密的消息
 * @returns MD5哈希值
 */
export const md5 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

/**
 * SHA-256加密
 *
 * @param message 需要加密的消息
 * @returns SHA-256哈希值
 */
export const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

/**
 * AES加密
 *
 * @param data 需要加密的数据
 * @param key 密钥
 * @returns 加密后的数据
 */
export const aesEncrypt = async (data: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyBuffer = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "AES-CBC", length: 256 }, false, [
    "encrypt",
  ]);

  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, keyBuffer, encoder.encode(data));

  const encryptedArray = Array.from(new Uint8Array(encrypted));
  const ivArray = Array.from(iv);

  return JSON.stringify({
    iv: ivArray,
    data: encryptedArray,
  });
};

/**
 * AES解密
 *
 * @param encryptedData 加密的数据
 * @param key 密钥
 * @returns 解密后的数据
 */
export const aesDecrypt = async (encryptedData: string, key: string): Promise<string> => {
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
};
