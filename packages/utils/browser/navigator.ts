/**
 * 浏览器导航相关工具函数
 */
export const navigator = {
  // 获取浏览器语言
  getLanguage(): string {
    return window.navigator.language;
  },

  // 检查是否在线
  isOnline(): boolean {
    return window.navigator.onLine;
  },

  // 检查是否为移动设备
  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
  },
};
