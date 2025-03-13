/**
 * 获取 URL 参数对象
 * @param url 可选参数，表示要解析的 URL 字符串。如果未提供，则使用当前窗口的 URL
 * @returns 返回一个包含所有 URL 参数的记录对象
 */
export const getParams = (url?: string): Record<string, string> => {
  const search = url ? new URL(url).search : window.location.search;
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

/**
 * 将对象转换为 URL 参数字符串
 * @param params 需要转换的对象
 * @returns 返回 URL 参数字符串
 */
export const stringifyParams = (params: Record<string, any>): string => {
  return new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();
};

/**
 * 向 URL 添加参数
 * @param url 需要添加参数的 URL 字符串
 * @param params 需要添加的参数对象
 * @returns 返回添加参数后的 URL 字符串
 */
export const addParams = (url: string, params: Record<string, any>): string => {
  const urlObj = new URL(url);
  Object.entries(params).forEach(([key, value]) => {
    urlObj.searchParams.append(key, String(value));
  });
  return urlObj.toString();
};

/**
 * 从 URL 中移除指定参数
 * @param url 需要移除参数的 URL 字符串
 * @param params 需要移除的参数列表
 * @returns 返回移除参数后的 URL 字符串
 */
export const removeParams = (url: string, params: string[]): string => {
  const urlObj = new URL(url);
  params.forEach(param => {
    urlObj.searchParams.delete(param);
  });
  return urlObj.toString();
};

/**
 * 解析 URL 的各个部分
 * @param url 需要解析的 URL 字符串
 * @returns 返回一个包含 URL 各个部分的记录对象
 */
export const parse = (url: string) => {
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
};

/**
 * 判断是否为绝对 URL
 * @param url 需要判断的 URL 字符串
 * @returns 返回是否为绝对 URL
 */
export const isAbsolute = (url: string): boolean => {
  return /^[a-z][a-z0-9+.-]*:/.test(url);
};

/**
 * 拼接 URL 路径
 * @param parts 需要拼接的 URL 路径部分
 * @returns 返回拼接后的 URL 路径
 */
export const join = (...parts: string[]): string => {
  return parts
    .map(part => part.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
};
