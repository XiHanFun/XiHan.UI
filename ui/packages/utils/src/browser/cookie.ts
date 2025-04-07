/**
 * 获取Cookie
 * @param name 需要获取的Cookie名称
 * @returns 获取到的Cookie值，如果未找到则返回null
 */
export const get = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
};

/**
 * 设置Cookie
 * @param name 需要设置的Cookie名称
 * @param value 需要设置的Cookie值
 * @param options 可选参数，表示Cookie的选项，包括过期时间、路径、域名和安全选项
 */
export const set = (
  name: string,
  value: string,
  options: { expires?: number; path?: string; domain?: string; secure?: boolean } = {},
) => {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    const d = new Date();
    d.setTime(d.getTime() + options.expires * 86400000);
    cookie += `;expires=${d.toUTCString()}`;
  }

  if (options.path) cookie += `;path=${options.path}`;
  if (options.domain) cookie += `;domain=${options.domain}`;
  if (options.secure) cookie += `;secure`;

  document.cookie = cookie;
};

/**
 * 删除Cookie
 * @param name 需要删除的Cookie名称
 */
export const remove = (name: string): void => {
  set(name, "", { expires: -1 });
};

// 同时提供命名空间对象
export const cookieUtils = {
  get,
  set,
  remove,
};

// 默认导出命名空间对象
export default cookieUtils;
