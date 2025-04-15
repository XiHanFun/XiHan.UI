/**
 * 生成 CSRF Token
 * @returns 返回 CSRF Token
 */
export function generateCsrf(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * 生成会话 Token
 * @param length 长度
 * @returns 返回会话 Token
 */
export function generateSession(length = 32): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(x => chars.charAt(x % chars.length))
    .join("");
}

/**
 * 验证 Token 格式
 * @param token Token
 * @param pattern 正则表达式
 * @returns 返回是否验证通过
 */
export function validate(token: string, pattern: RegExp = /^[A-Za-z0-9-_]+$/): boolean {
  return pattern.test(token);
}
