/**
 * 浏览器环境检测工具
 */
export const browser = {
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

  // 获取浏览器信息
  getInfo() {
    const ua = window.navigator.userAgent;
    const browserRegExp = {
      Chrome: /Chrome/,
      Firefox: /Firefox/,
      Safari: /Safari/,
      Edge: /Edge/,
      IE: /MSIE|Trident/,
      Opera: /Opera|OPR/,
    };

    const browser = Object.entries(browserRegExp).find(([_, regexp]) => regexp.test(ua))?.[0] || "Unknown";
    const version = ua.match(new RegExp(`${browser}\\/(\\d+)`))?.[1] || "Unknown";

    return {
      name: browser,
      version,
      userAgent: ua,
      platform: window.navigator.platform,
      language: window.navigator.language,
      vendor: window.navigator.vendor,
    };
  },

  // 检查浏览器功能支持
  supports: {
    touch: () => "ontouchstart" in window,
    webGL: () => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch {
        return false;
      }
    },
    webP: async () => {
      const webP = new Image();
      webP.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
      return new Promise(resolve => {
        webP.onload = webP.onerror = () => resolve(webP.height === 1);
      });
    },
  },
};
