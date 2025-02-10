/**
 * 网络状态相关工具函数
 */
export const networkUtils = {
  /**
   * 获取当前网络状态
   */
  getNetworkStatus: () => {
    const connection = (navigator as any).connection;
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType || "unknown",
      type: connection?.type || "unknown",
      saveData: connection?.saveData || false,
    };
  },

  /**
   * 监听网络状态变化
   *
   * @param callback 回调函数
   * @returns 返回取消监听的函数
   */
  onNetworkChange: (callback: (status: { online: boolean }) => void) => {
    const handleOnline = () => callback({ online: true });
    const handleOffline = () => callback({ online: false });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  },

  /**
   * 检测网络速度
   *
   * @param imageUrl 用于测速的图片URL，默认为1x1像素的透明图
   * @returns Promise<number> 返回加载时间(ms)
   */
  checkNetworkSpeed: async (
    imageUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  ): Promise<number> => {
    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(performance.now() - startTime);
      img.onerror = reject;
      img.src = imageUrl;
    });
  },
};
