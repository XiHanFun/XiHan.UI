/**
 * 获取当前URL参数
 * @returns 返回一个包含所有URL参数的记录对象
 */
export function getParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * 获取当前URL指定参数
 * @param key 参数名
 * @returns 返回指定参数的值
 */
export function getParamByName(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

/**
 * 跳转到指定URL
 * @param url 要跳转的URL
 */
export function goto(url: string): void {
  window.location.href = url;
}

/**
 * 刷新页面
 */
export function reload(): void {
  window.location.reload();
}
