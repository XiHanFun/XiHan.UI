/**
 * 指纹处理工具函数
 */

import { getInfo, isMobile, getHardwareConcurrency } from "./navigator";
import { isAudioSupported, createAudioContext } from "../media/audio";
import { getDeviceType, isTouchDevice, isIOS, isAndroid, getOrientation } from "./device";
import { getStatus } from "./network";

/**
 * 获取基础设备信息
 */
export function getDeviceInfo() {
  const browserInfo = getInfo();
  const deviceInfo = getDeviceType();
  const networkStatus = getStatus();

  return {
    userAgent: browserInfo.userAgent,
    platform: browserInfo.platform,
    language: browserInfo.language,
    languages: Array.from(navigator.languages || []),
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    availableScreenSize: `${window.screen.availWidth}x${window.screen.availHeight}`,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeZoneOffset: new Date().getTimezoneOffset(),
    cpuCores: getHardwareConcurrency(),
    deviceMemory: (navigator as any).deviceMemory || 0,
    connectionType: networkStatus.type,
    connectionEffectiveType: networkStatus.effectiveType,
    connectionDownlink: (navigator as any).connection?.downlink || 0,
    connectionRtt: (navigator as any).connection?.rtt || 0,
    doNotTrack: navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack || "unknown",
  };
}

/**
 * 获取浏览器功能支持信息
 */
export function getBrowserFeatures() {
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
    touchSupport: isTouchDevice(),
    maxTouchPoints: navigator.maxTouchPoints || 0,
    pdfViewerEnabled: navigator.pdfViewerEnabled || false,
    speechSynthesis: "speechSynthesis" in window,
    oscpu: (navigator as any).oscpu || "",
    hardwareConcurrency: getHardwareConcurrency(),
    accelerometerEnabled: "Accelerometer" in window,
    gyroscopeEnabled: "Gyroscope" in window,
    magnetometerEnabled: "Magnetometer" in window,
  };
}

/**
 * 获取已安装的字体列表（通过 canvas 检测）
 */
export async function getInstalledFonts(): Promise<string> {
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
}

/**
 * 获取 Canvas 指纹
 */
export function getCanvasFingerprint(): string {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return "";

  canvas.width = 280;
  canvas.height = 80;

  context.fillStyle = "#f8f8f8";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "rgba(255, 0, 0, 0.5)");
  gradient.addColorStop(0.5, "rgba(0, 255, 0, 0.5)");
  gradient.addColorStop(1, "rgba(0, 0, 255, 0.5)");

  context.beginPath();
  context.arc(40, 40, 30, 0, Math.PI * 2, true);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();

  context.textBaseline = "alphabetic";
  context.fillStyle = "#069";
  context.font = "15px Arial";
  context.fillText("XiHan UI", 10, 25);

  context.font = "bold 18px Times New Roman";
  context.fillStyle = "#c00";
  context.fillText("Fingerprint", 100, 45);

  context.shadowColor = "rgba(0, 0, 0, 0.5)";
  context.shadowBlur = 5;
  context.shadowOffsetX = 3;
  context.shadowOffsetY = 3;

  context.fillStyle = "rgba(102, 204, 0, 0.7)";
  context.fillRect(180, 10, 80, 60);

  context.globalCompositeOperation = "multiply";
  context.fillStyle = "rgba(255, 100, 100, 0.8)";
  context.beginPath();
  context.moveTo(230, 30);
  context.lineTo(250, 70);
  context.lineTo(210, 70);
  context.closePath();
  context.fill();

  return canvas.toDataURL();
}

/**
 * 获取音频指纹
 */
export async function getAudioFingerprint(): Promise<string> {
  if (!isAudioSupported()) return "";

  try {
    const audioContext = createAudioContext();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gainNode = audioContext.createGain();
    const compressor = audioContext.createDynamicsCompressor();

    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.1;
    compressor.release.value = 0.25;

    analyser.fftSize = 4096;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    gainNode.gain.value = 0;
    oscillator.type = "triangle";
    oscillator.frequency.value = 440;

    oscillator.connect(compressor);
    compressor.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(0);

    await new Promise(resolve => setTimeout(resolve, 100));

    analyser.getFloatFrequencyData(dataArray);
    const timeData = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(timeData);

    const frequencySum = dataArray.reduce((acc, val, idx) => acc + Math.abs(val) * (idx + 1), 0);
    const timeSum = timeData.reduce((acc, val, idx) => acc + Math.abs(val) * (idx + 1), 0);

    const sampleRate = audioContext.sampleRate;
    const channelCount = audioContext.destination.channelCount;
    const baseLatency = audioContext.baseLatency || 0;

    oscillator.stop();
    audioContext.close();

    return `${frequencySum.toString()}|${timeSum.toString()}|${sampleRate}|${channelCount}|${baseLatency}`;
  } catch {
    return "";
  }
}

/**
 * 获取网络信息指纹
 */
export async function getNetworkFingerprint(): Promise<string> {
  const networkStatus = getStatus();
  const networkInfo = {
    effectiveType: networkStatus.effectiveType,
    downlink: (navigator as any).connection?.downlink || 0,
    rtt: (navigator as any).connection?.rtt || 0,
    saveData: networkStatus.saveData,
    type: networkStatus.type,
  };

  let ipInfo = "";
  try {
    const pc = new RTCPeerConnection({ iceServers: [] });
    const supported = !!pc.createDataChannel;
    pc.close();
    ipInfo = supported ? "webrtc-supported" : "webrtc-unsupported";
  } catch (e) {
    ipInfo = "webrtc-error";
  }

  return JSON.stringify(networkInfo) + "|" + ipInfo;
}

/**
 * 获取行为指纹
 */
export function getBehavioralFingerprint(): string {
  const automationDetection = {
    webdriver: navigator.webdriver || false,
    plugins: navigator.plugins?.length || 0,
    hasChrome: "chrome" in window,
    hasPhantom: "callPhantom" in window || "_phantom" in window,
    hasSelenium: "selenium" in window || "webdriver" in window || "driver" in window,
    hasEmulatedLanguage: navigator.languages?.length === 0,
    hasNotification: "Notification" in window,
    hasPerformance: "performance" in window,
    hasTouch: isTouchDevice(),
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };

  const privacyProtection = {
    doNotTrack: navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack || "unknown",
    cookiesEnabled: navigator.cookieEnabled,
    privateMode: !window.localStorage || !window.indexedDB,
  };

  return JSON.stringify(automationDetection) + "|" + JSON.stringify(privacyProtection);
}

/**
 * 生成设备指纹
 */
export async function generateFingerprint(): Promise<string> {
  const components = [
    JSON.stringify(getDeviceInfo()),
    JSON.stringify(getBrowserFeatures()),
    getCanvasFingerprint(),
    await getAudioFingerprint(),
    await getInstalledFonts(),
    await getNetworkFingerprint(),
    getBehavioralFingerprint(),
  ];

  const fingerprintString = components.join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 生成稳定设备指纹（减少变化因素）
 */
export async function generateStableFingerprint(): Promise<string> {
  const browserInfo = getInfo();
  const deviceInfo = getDeviceType();
  const orientation = getOrientation();

  const stableComponents = [
    browserInfo.userAgent,
    browserInfo.platform,
    browserInfo.language,
    window.screen.colorDepth,
    `${window.screen.width}x${window.screen.height}`,
    getHardwareConcurrency(),
    (navigator as any).deviceMemory || 0,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    await getInstalledFonts(),
    deviceInfo,
    orientation,
  ];

  const fingerprintString = stableComponents.join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
