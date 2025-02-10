/**
 * 窗口相关工具函数
 */
export const windowUtils = {
  /**
   * 获取窗口宽度
   *
   * @returns 返回窗口宽度
   */
  getWidth(): number {
    return window.innerWidth;
  },

  /**
   * 获取窗口高度
   *
   * @returns 返回窗口高度
   */
  getHeight(): number {
    return window.innerHeight;
  },

  /**
   * 滚动到顶部
   *
   * @returns 返回滚动到顶部的结果
   */
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
};
