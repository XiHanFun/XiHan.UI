/**
 * 窗口相关工具函数
 */
export const windowUtils = {
  // 获取窗口宽度
  getWidth(): number {
    return window.innerWidth;
  },

  // 获取窗口高度
  getHeight(): number {
    return window.innerHeight;
  },

  // 滚动到顶部
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
};
