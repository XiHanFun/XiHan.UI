/**
 * 地址栏操作相关工具函数
 */
export const location = {
  // 获取当前URL参数
  getParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },

  // 跳转到指定URL
  goto(url: string) {
    window.location.href = url;
  },

  // 刷新页面
  reload() {
    window.location.reload();
  },
};
