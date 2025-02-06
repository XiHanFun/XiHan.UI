/**
 * 屏幕相关工具函数
 */
export const screen = {
  // 获取屏幕宽度
  getWidth(): number {
    return window.screen.width;
  },

  // 获取屏幕高度
  getHeight(): number {
    return window.screen.height;
  },

  // 获取设备像素比
  getPixelRatio(): number {
    return window.devicePixelRatio;
  },
};
