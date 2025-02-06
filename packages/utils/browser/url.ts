/**
 * 从给定的URL中提取查询参数并返回一个键值对对象。
 * 如果未提供URL，则从当前页面的URL中提取查询参数。
 *
 * @param url 可选参数。要从中提取参数的URL。如果不提供，则从当前页面的URL中提取参数。
 * @returns 返回一个对象，其中键是参数名称，值是参数值。
 */
export const getUrlParams = (url?: string): Record<string, string> => {
  const search = url ? new URL(url).search : window.location.search;
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};
