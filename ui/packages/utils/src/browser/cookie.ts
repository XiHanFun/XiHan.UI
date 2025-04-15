/**
 * Cookie处理工具函数
 */

/**
 * Cookie选项接口
 */
export interface CookieOptions {
  /**
   * 过期时间（天）
   */
  expires?: number;
  /**
   * 路径
   */
  path?: string;
  /**
   * 域名
   */
  domain?: string;
  /**
   * 是否仅通过HTTPS传输
   */
  secure?: boolean;
  /**
   * 是否禁止JavaScript访问
   */
  httpOnly?: boolean;
  /**
   * 同站策略
   */
  sameSite?: "Strict" | "Lax" | "None";
}

/**
 * 默认Cookie选项
 */
const DEFAULT_OPTIONS: CookieOptions = {
  path: "/",
  secure: true,
  sameSite: "Lax",
};

/**
 * 序列化Cookie选项
 */
const serializeOptions = (options: CookieOptions): string => {
  const parts: string[] = [];

  if (options.expires) {
    const date = new Date();
    date.setTime(date.getTime() + options.expires * 86400000);
    parts.push(`expires=${date.toUTCString()}`);
  }

  if (options.path) parts.push(`path=${options.path}`);
  if (options.domain) parts.push(`domain=${options.domain}`);
  if (options.secure) parts.push("secure");
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);

  return parts.join("; ");
};

/**
 * 获取Cookie
 * @param name 需要获取的Cookie名称
 * @returns 获取到的Cookie值，如果未找到则返回null
 */
export function get(name: string): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
    return match ? decodeURIComponent(match[3]) : null;
  } catch (error) {
    console.error("Failed to get cookie:", error);
    return null;
  }
}

/**
 * 设置Cookie
 * @param name 需要设置的Cookie名称
 * @param value 需要设置的Cookie值
 * @param options Cookie选项
 */
export function set(name: string, value: string, options: CookieOptions = {}): void {
  try {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const cookieValue = encodeURIComponent(value);
    const cookieOptions = serializeOptions(mergedOptions);

    document.cookie = `${encodeURIComponent(name)}=${cookieValue}; ${cookieOptions}`;
  } catch (error) {
    console.error("Failed to set cookie:", error);
  }
}

/**
 * 删除Cookie
 * @param name 需要删除的Cookie名称
 * @param options 额外的Cookie选项
 */
export function remove(name: string, options: CookieOptions = {}): void {
  set(name, "", { ...options, expires: -1 });
}

/**
 * 检查Cookie是否存在
 * @param name Cookie名称
 * @returns 是否存在
 */
export function has(name: string): boolean {
  return get(name) !== null;
}

/**
 * 获取所有Cookie
 * @returns 所有Cookie的键值对对象
 */
export function getAll(): Record<string, string> {
  try {
    return document.cookie.split(";").reduce(
      (cookies, cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name && value) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
        return cookies;
      },
      {} as Record<string, string>,
    );
  } catch (error) {
    console.error("Failed to get all cookies:", error);
    return {};
  }
}

/**
 * 清空所有Cookie
 * @param options 额外的Cookie选项
 */
export function clear(options: CookieOptions = {}): void {
  const cookies = getAll();
  Object.keys(cookies).forEach(name => remove(name, options));
}
