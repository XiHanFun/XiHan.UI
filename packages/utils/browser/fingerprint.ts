/**
 * 设备和浏览器指纹识别工具
 */
export const fingerprintUtils = {
  /**
   * 获取基础设备信息
   */
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timeZoneOffset: new Date().getTimezoneOffset(),
    };
  },

  /**
   * 获取浏览器功能支持信息
   */
  getBrowserFeatures() {
    return {
      cookieEnabled: navigator.cookieEnabled,
      localStorageEnabled: !!window.localStorage,
      sessionStorageEnabled: !!window.sessionStorage,
      webGLEnabled: !!window.WebGLRenderingContext,
      webWorkersEnabled: !!window.Worker,
      serviceWorkersEnabled: !!navigator.serviceWorker,
      indexedDBEnabled: !!window.indexedDB,
      addBehaviorEnabled: !!(document.body && "addBehavior" in document.body),
      webSocketEnabled: !!window.WebSocket,
      webRTCEnabled: !!window.RTCPeerConnection,
    };
  },

  /**
   * 获取已安装的字体列表（通过 canvas 检测）
   */
  async getInstalledFonts(): Promise<string> {
    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testString = "mmmmmmmmmmlli";
    const testSize = "72px";
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) return "";

    const getTextWidth = (font: string): number => {
      context.font = `${testSize} ${font}, ${baseFonts[0]}`;
      return context.measureText(testString).width;
    };

    const fontList = [
      "Arial",
      "Arial Black",
      "Arial Narrow",
      "Calibri",
      "Cambria",
      "Cambria Math",
      "Comic Sans MS",
      "Courier",
      "Courier New",
      "Georgia",
      "Helvetica",
      "Impact",
      "Times",
      "Times New Roman",
      "Trebuchet MS",
      "Verdana",
    ];

    const baseWidth = getTextWidth(baseFonts[0]);
    const installedFonts = fontList.filter(font => getTextWidth(font) !== baseWidth);

    return installedFonts.join(",");
  },

  /**
   * 获取 Canvas 指纹
   */
  getCanvasFingerprint(): string {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return "";

    // 绘制一些图形和文字
    canvas.width = 200;
    canvas.height = 50;
    context.textBaseline = "top";
    context.font = "14px Arial";
    context.fillStyle = "#f60";
    context.fillRect(125, 1, 62, 20);
    context.fillStyle = "#069";
    context.fillText("fingerprint", 2, 15);
    context.fillStyle = "rgba(102, 204, 0, 0.7)";
    context.fillText("canvas", 4, 17);

    return canvas.toDataURL();
  },

  /**
   * 获取音频指纹
   */
  async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

      gainNode.gain.value = 0; // 静音
      oscillator.type = "triangle"; // 使用三角波
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(0);

      return new Promise(resolve => {
        scriptProcessor.onaudioprocess = e => {
          const inputData = e.inputBuffer.getChannelData(0);
          const sum = inputData.reduce((acc, val) => acc + Math.abs(val), 0);
          resolve(sum.toString());
          oscillator.stop();
          audioContext.close();
        };
      });
    } catch {
      return "";
    }
  },

  /**
   * 生成设备指纹
   */
  async generateFingerprint(): Promise<string> {
    const components = [
      JSON.stringify(this.getDeviceInfo()),
      JSON.stringify(this.getBrowserFeatures()),
      this.getCanvasFingerprint(),
      await this.getAudioFingerprint(),
      await this.getInstalledFonts(),
    ];

    // 使用 SHA-256 生成最终指纹
    const fingerprintString = components.join("|");
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  },
};
