/**
 * 地址栏操作相关工具函数
 */
export const locationUtils = {
  /**
   * 获取当前URL参数
   *
   * @returns 返回一个包含所有URL参数的记录对象
   */
  getParams: (): Record<string, string> => {
    const params = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },

  /**
   * 跳转到指定URL
   *
   * @param url 要跳转的URL
   */
  goto: (url: string) => {
    window.location.href = url;
  },

  /**
   * 刷新页面
   */
  reload: () => {
    window.location.reload();
  },
};
