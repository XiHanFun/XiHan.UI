/**
 * 获取基础设备信息
 */
export const getDeviceInfo = () => {
  // 获取平台信息的函数
  const getPlatform = (): string => {
    // 优先使用现代API
    if ((navigator as any).userAgentData?.platform) {
      return (navigator as any).userAgentData.platform;
    }

    // 从UA字符串中提取操作系统信息作为备选方案
    const ua = navigator.userAgent;
    if (/Windows/.test(ua)) return "Windows";
    if (/Macintosh|Mac OS X/.test(ua)) return "macOS";
    if (/Linux/.test(ua)) return "Linux";
    if (/Android/.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";

    return "unknown";
  };

  return {
    userAgent: navigator.userAgent,
    platform: getPlatform(),
    language: navigator.language,
    languages: Array.from(navigator.languages || []),
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    availableScreenSize: `${window.screen.availWidth}x${window.screen.availHeight}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeZoneOffset: new Date().getTimezoneOffset(),
    cpuCores: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || 0,
    connectionType: (navigator as any).connection?.type || "unknown",
    connectionEffectiveType: (navigator as any).connection?.effectiveType || "unknown",
    connectionDownlink: (navigator as any).connection?.downlink || 0,
    connectionRtt: (navigator as any).connection?.rtt || 0,
    doNotTrack: navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack || "unknown",
  };
};

/**
 * 获取浏览器功能支持信息
 */
export const getBrowserFeatures = () => {
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
    webpSupported: (() => {
      try {
        const canvas = document.createElement("canvas");
        return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
      } catch (e) {
        return false;
      }
    })(),
    bluetooth: "bluetooth" in navigator,
    touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    pdfViewerEnabled: navigator.pdfViewerEnabled || false,
    speechSynthesis: "speechSynthesis" in window,
    // 键盘布局检测
    oscpu: (navigator as any).oscpu || "",
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    // 硬件加速检测
    accelerometerEnabled: "Accelerometer" in window,
    gyroscopeEnabled: "Gyroscope" in window,
    magnetometerEnabled: "Magnetometer" in window,
  };
};

/**
 * 获取已安装的字体列表（通过 canvas 检测）
 */
export const getInstalledFonts = async (): Promise<string> => {
  const baseFonts = ["monospace", "sans-serif", "serif"];
  const testString = "XiHanFun|XiHanUI|XiHan|ZhaiFanhua";
  const testSize = "72px";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return "";

  const getTextWidth = (font: string): number => {
    context.font = `${testSize} ${font}, ${baseFonts[0]}`;
    return context.measureText(testString).width;
  };

  // 扩展更多常见字体
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
    "Segoe UI",
    "Tahoma",
    "Lucida Sans",
    "Lucida Console",
    "Palatino Linotype",
    "Book Antiqua",
    "Garamond",
    "Bookman Old Style",
    "Century Gothic",
    "Consolas",
    "MS Serif",
    "MS Sans Serif",
    "宋体",
    "黑体",
    "微软雅黑",
    "Arial Unicode MS",
    "Hiragino Sans GB",
    "冬青黑体",
    "Apple Color Emoji",
    "Segoe UI Emoji",
    "Segoe UI Symbol",
    "Noto Color Emoji",
  ];

  const baseWidth = getTextWidth(baseFonts[0]);
  const installedFonts = fontList.filter(font => getTextWidth(font) !== baseWidth);

  return installedFonts.join(",");
};

/**
 * 获取 Canvas 指纹
 */
export const getCanvasFingerprint = (): string => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return "";

  // 更复杂的绘制内容，包含更多绘图指令和转换
  canvas.width = 280;
  canvas.height = 80;

  // 填充背景
  context.fillStyle = "#f8f8f8";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制渐变
  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "rgba(255, 0, 0, 0.5)");
  gradient.addColorStop(0.5, "rgba(0, 255, 0, 0.5)");
  gradient.addColorStop(1, "rgba(0, 0, 255, 0.5)");

  // 绘制路径和曲线
  context.beginPath();
  context.arc(40, 40, 30, 0, Math.PI * 2, true);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();

  // 绘制文本，使用不同字体和样式
  context.textBaseline = "alphabetic";
  context.fillStyle = "#069";
  context.font = "15px Arial";
  context.fillText("XiHan UI", 10, 25);

  context.font = "bold 18px Times New Roman";
  context.fillStyle = "#c00";
  context.fillText("Fingerprint", 100, 45);

  // 绘制阴影和复杂图形
  context.shadowColor = "rgba(0, 0, 0, 0.5)";
  context.shadowBlur = 5;
  context.shadowOffsetX = 3;
  context.shadowOffsetY = 3;

  context.fillStyle = "rgba(102, 204, 0, 0.7)";
  context.fillRect(180, 10, 80, 60);

  // 设置混合模式
  context.globalCompositeOperation = "multiply";
  context.fillStyle = "rgba(255, 100, 100, 0.8)";
  context.beginPath();
  context.moveTo(230, 30);
  context.lineTo(250, 70);
  context.lineTo(210, 70);
  context.closePath();
  context.fill();

  return canvas.toDataURL();
};

/**
 * 获取音频指纹
 */
export const getAudioFingerprint = async (): Promise<string> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const compressor = audioContext.createDynamicsCompressor();

    // 增加复杂度：使用多种音频处理节点
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.1;
    compressor.release.value = 0.25;

    analyser.fftSize = 4096;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    gainNode.gain.value = 0; // 静音
    oscillator.type = "triangle"; // 使用三角波
    oscillator.frequency.value = 440; // 设置频率为标准音A

    // 构建更复杂的音频处理图
    oscillator.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(0);

    // 等待一小段时间确保有数据产生
    await new Promise(resolve => setTimeout(resolve, 100));

    // 获取频率数据和时域数据
    analyser.getFloatFrequencyData(dataArray);
    const timeData = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(timeData);

    // 计算更复杂的指纹
    const frequencySum = dataArray.reduce((acc, val, idx) => acc + Math.abs(val) * (idx + 1), 0);
    const timeSum = timeData.reduce((acc, val, idx) => acc + Math.abs(val) * (idx + 1), 0);

    // 获取音频上下文的额外信息
    const sampleRate = audioContext.sampleRate;
    const channelCount = audioContext.destination.channelCount;
    const baseLatency = audioContext.baseLatency || 0;

    oscillator.stop();
    audioContext.close();

    return `${frequencySum.toString()}|${timeSum.toString()}|${sampleRate}|${channelCount}|${baseLatency}`;
  } catch {
    return "";
  }
};

/**
 * 获取网络信息指纹
 */
export const getNetworkFingerprint = async (): Promise<string> => {
  try {
    const connection = (navigator as any).connection;
    const networkInfo = {
      effectiveType: connection?.effectiveType || "unknown",
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
      type: connection?.type || "unknown",
    };

    // 检测IP地址相关信息（不泄露实际IP）
    let ipInfo = "";
    try {
      // 使用WebRTC检测本地IP（仅检测是否支持，不实际获取IP）
      const pc = new RTCPeerConnection({ iceServers: [] });
      const supported = !!pc.createDataChannel;
      pc.close();
      ipInfo = supported ? "webrtc-supported" : "webrtc-unsupported";
    } catch (e) {
      ipInfo = "webrtc-error";
    }

    return JSON.stringify(networkInfo) + "|" + ipInfo;
  } catch {
    return "";
  }
};

/**
 * 获取行为指纹
 */
export const getBehavioralFingerprint = (): string => {
  // 检测自动化工具/机器人特征
  const automationDetection = {
    webdriver: navigator.webdriver || false,
    plugins: navigator.plugins?.length || 0,
    hasChrome: "chrome" in window,
    hasPhantom: "callPhantom" in window || "_phantom" in window,
    hasSelenium: "selenium" in window || "webdriver" in window || "driver" in window,
    hasEmulatedLanguage: navigator.languages?.length === 0,
    hasNotification: "Notification" in window,
    hasPerformance: "performance" in window,
    // 检测触摸事件模拟
    hasTouch: "ontouchstart" in window,
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };

  // 检测隐私保护模式/防追踪
  const privacyProtection = {
    doNotTrack: navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack || "unknown",
    cookiesEnabled: navigator.cookieEnabled,
    privateMode: !window.localStorage || !window.indexedDB,
  };

  return JSON.stringify(automationDetection) + "|" + JSON.stringify(privacyProtection);
};

/**
 * 生成设备指纹
 */
export const generateFingerprint = async (): Promise<string> => {
  const components = [
    JSON.stringify(getDeviceInfo()),
    JSON.stringify(getBrowserFeatures()),
    getCanvasFingerprint(),
    await getAudioFingerprint(),
    await getInstalledFonts(),
    await getNetworkFingerprint(),
    getBehavioralFingerprint(),
  ];

  // 使用 SHA-256 生成最终指纹
  const fingerprintString = components.join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

/**
 * 生成稳定设备指纹（减少变化因素）
 */
export const generateStableFingerprint = async (): Promise<string> => {
  // 平台信息获取函数
  const getPlatform = (): string => {
    if ((navigator as any).userAgentData?.platform) {
      return (navigator as any).userAgentData.platform;
    }

    const ua = navigator.userAgent;
    if (/Windows/.test(ua)) return "Windows";
    if (/Macintosh|Mac OS X/.test(ua)) return "macOS";
    if (/Linux/.test(ua)) return "Linux";
    if (/Android/.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";

    return "unknown";
  };

  // 仅包含较为稳定的特征，减少随时间变化的因素
  const stableComponents = [
    navigator.userAgent,
    getPlatform(),
    navigator.language,
    window.screen.colorDepth,
    `${window.screen.width}x${window.screen.height}`,
    navigator.hardwareConcurrency || 0,
    (navigator as any).deviceMemory || 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    await getInstalledFonts(),
  ];

  // 使用 SHA-256 生成最终指纹
  const fingerprintString = stableComponents.join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};
