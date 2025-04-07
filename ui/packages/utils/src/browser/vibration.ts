/**
 * 设备振动 API 封装
 * 提供Web Vibration API的简化操作
 */

/**
 * 振动模式类型
 */
export type VibrationPattern = number | number[];

/**
 * 预定义振动模式
 */
export const VibrationPatterns = {
  /**
   * 短振动 (100ms)
   */
  SHORT: 100,

  /**
   * 中等振动 (300ms)
   */
  MEDIUM: 300,

  /**
   * 长振动 (500ms)
   */
  LONG: 500,

  /**
   * 双振动 (两次短振动)
   */
  DOUBLE: [100, 100, 100],

  /**
   * 三振动 (三次短振动)
   */
  TRIPLE: [100, 100, 100, 100, 100],

  /**
   * 成功振动模式
   */
  SUCCESS: [100, 50, 100],

  /**
   * 错误振动模式
   */
  ERROR: [100, 50, 100, 50, 100],

  /**
   * 警告振动模式
   */
  WARNING: [300, 100, 100],

  /**
   * SOS振动模式 (短-短-短-长-长-长-短-短-短)
   */
  SOS: [100, 100, 100, 100, 100, 100, 300, 100, 300, 100, 300, 100, 100, 100, 100, 100, 100],

  /**
   * 心跳振动模式
   */
  HEARTBEAT: [100, 100, 100, 400],
};

/**
 * 检查设备是否支持振动
 */
export function isVibrationSupported(): boolean {
  return "vibrate" in navigator || "mozVibrate" in navigator || "webkitVibrate" in navigator;
}

/**
 * 获取振动API
 */
function getVibrationAPI(): (pattern: VibrationPattern) => boolean {
  if ("vibrate" in navigator) {
    return pattern => {
      try {
        return navigator.vibrate(pattern);
      } catch (error) {
        console.error("振动API调用失败:", error);
        return false;
      }
    };
  }

  if ("mozVibrate" in navigator) {
    return pattern => {
      try {
        return (navigator as any).mozVibrate(pattern);
      } catch (error) {
        console.error("振动API调用失败:", error);
        return false;
      }
    };
  }

  if ("webkitVibrate" in navigator) {
    return pattern => {
      try {
        return (navigator as any).webkitVibrate(pattern);
      } catch (error) {
        console.error("振动API调用失败:", error);
        return false;
      }
    };
  }

  return () => false;
}

/**
 * 振动API实例
 */
const vibrationAPI = getVibrationAPI();

/**
 * 执行振动
 * @param pattern 振动模式, 单个数字表示振动时长(ms), 数组表示振动/暂停交替时长
 */
export function vibrate(pattern: VibrationPattern): boolean {
  if (!isVibrationSupported()) {
    console.warn("当前设备不支持振动API");
    return false;
  }

  return vibrationAPI(pattern);
}

/**
 * 停止振动
 */
export function stopVibration(): boolean {
  if (!isVibrationSupported()) {
    return false;
  }

  return vibrationAPI(0);
}

/**
 * 创建自定义振动模式
 * @param durations 振动持续时间数组
 * @param intervals 间隔时间数组
 */
export function createPattern(durations: number[], intervals: number[] = []): number[] {
  if (durations.length === 0) {
    return [];
  }

  const pattern: number[] = [];
  const maxIter = Math.max(durations.length, intervals.length + 1);

  for (let i = 0; i < maxIter; i++) {
    // 添加振动时长
    if (i < durations.length) {
      pattern.push(durations[i]);
    }

    // 添加间隔时长
    if (i < intervals.length) {
      pattern.push(intervals[i]);
    }
  }

  return pattern;
}

/**
 * 按照节奏振动
 * @param pattern 振动模式
 * @param repeat 重复次数
 */
export function vibrateWithRhythm(pattern: VibrationPattern, repeat: number = 1): boolean {
  if (repeat <= 0) {
    return stopVibration();
  }

  // 单个振动模式
  if (typeof pattern === "number") {
    if (repeat === 1) {
      return vibrate(pattern);
    }

    // 创建重复模式
    const repeatedPattern: number[] = [];
    for (let i = 0; i < repeat; i++) {
      repeatedPattern.push(pattern);
      if (i < repeat - 1) {
        repeatedPattern.push(100); // 100ms间隔
      }
    }

    return vibrate(repeatedPattern);
  }

  // 数组振动模式
  if (repeat === 1) {
    return vibrate(pattern);
  }

  // 创建重复模式
  const repeatedPattern: number[] = [];
  for (let i = 0; i < repeat; i++) {
    repeatedPattern.push(...pattern);
    if (i < repeat - 1) {
      repeatedPattern.push(200); // 200ms的模式间隔
    }
  }

  return vibrate(repeatedPattern);
}

/**
 * 振动管理器类
 */
export class VibrationManager {
  /**
   * 是否启用振动
   */
  private enabled: boolean = true;

  /**
   * 强度系数 (0-1)
   */
  private intensity: number = 1;

  /**
   * 自定义模式映射
   */
  private patterns: Map<string, VibrationPattern> = new Map();

  /**
   * 当前振动定时器
   */
  private currentTimeout: number | null = null;

  /**
   * 创建振动管理器
   * @param initialPatterns 初始模式映射
   * @param enabled 是否默认启用
   * @param intensity 默认强度
   */
  constructor(initialPatterns: Record<string, VibrationPattern> = {}, enabled: boolean = true, intensity: number = 1) {
    this.enabled = enabled;
    this.setIntensity(intensity);

    // 添加预定义模式
    this.addPatterns(VibrationPatterns);

    // 添加自定义模式
    if (initialPatterns) {
      this.addPatterns(initialPatterns);
    }
  }

  /**
   * 添加振动模式
   * @param name 模式名称
   * @param pattern 振动模式
   */
  addPattern(name: string, pattern: VibrationPattern): this {
    this.patterns.set(name, pattern);
    return this;
  }

  /**
   * 批量添加振动模式
   * @param patterns 模式映射
   */
  addPatterns(patterns: Record<string, VibrationPattern>): this {
    Object.entries(patterns).forEach(([name, pattern]) => {
      this.addPattern(name, pattern);
    });
    return this;
  }

  /**
   * 获取振动模式
   * @param name 模式名称
   */
  getPattern(name: string): VibrationPattern | undefined {
    return this.patterns.get(name);
  }

  /**
   * 设置振动强度
   * @param value 强度值 (0-1)
   */
  setIntensity(value: number): this {
    this.intensity = Math.max(0, Math.min(1, value));
    return this;
  }

  /**
   * 获取振动强度
   */
  getIntensity(): number {
    return this.intensity;
  }

  /**
   * 启用振动
   */
  enable(): this {
    this.enabled = true;
    return this;
  }

  /**
   * 禁用振动
   */
  disable(): this {
    this.enabled = false;
    this.stop();
    return this;
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.enabled && isVibrationSupported();
  }

  /**
   * 根据强度调整振动模式
   * @param pattern 原始振动模式
   */
  private adjustPatternIntensity(pattern: VibrationPattern): VibrationPattern {
    if (this.intensity === 1) {
      return pattern;
    }

    if (typeof pattern === "number") {
      return Math.round(pattern * this.intensity);
    }

    return pattern.map((value, index) => {
      // 只调整振动时长，不调整间隔时长
      if (index % 2 === 0) {
        return Math.round(value * this.intensity);
      }
      return value;
    });
  }

  /**
   * 执行振动
   * @param pattern 振动模式或模式名称
   * @param delay 延迟执行时间 (ms)
   */
  vibrate(pattern: VibrationPattern | string, delay: number = 0): boolean {
    if (!this.isEnabled()) {
      return false;
    }

    // 解析模式
    const resolvedPattern = typeof pattern === "string" ? this.getPattern(pattern) : pattern;

    if (!resolvedPattern) {
      console.warn(`未找到振动模式: ${pattern}`);
      return false;
    }

    // 应用强度
    const adjustedPattern = this.adjustPatternIntensity(resolvedPattern);

    // 清除当前定时器
    this.clearCurrentTimeout();

    // 立即执行或延迟执行
    if (delay <= 0) {
      return vibrationAPI(adjustedPattern);
    } else {
      this.currentTimeout = window.setTimeout(() => {
        vibrationAPI(adjustedPattern);
        this.currentTimeout = null;
      }, delay);

      return true;
    }
  }

  /**
   * 停止振动
   */
  stop(): boolean {
    this.clearCurrentTimeout();
    return stopVibration();
  }

  /**
   * 清除当前定时器
   */
  private clearCurrentTimeout(): void {
    if (this.currentTimeout !== null) {
      window.clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }

  /**
   * 按顺序执行多个振动模式
   * @param patterns 振动模式或名称数组
   * @param interval 模式间隔 (ms)
   */
  vibrateSequence(patterns: Array<VibrationPattern | string>, interval: number = 300): boolean {
    if (!this.isEnabled() || patterns.length === 0) {
      return false;
    }

    this.clearCurrentTimeout();

    // 创建振动序列定时器
    let index = 0;
    const executeNext = () => {
      if (index >= patterns.length) {
        return;
      }

      const pattern = patterns[index];
      index++;

      // 执行当前模式
      this.vibrate(pattern);

      // 安排下一个模式
      if (index < patterns.length) {
        this.currentTimeout = window.setTimeout(executeNext, interval);
      }
    };

    // 开始执行序列
    executeNext();
    return true;
  }
}

/**
 * 创建振动管理器
 * @param initialPatterns 初始模式
 * @param enabled 是否启用
 * @param intensity 强度
 */
export function createVibrationManager(
  initialPatterns: Record<string, VibrationPattern> = {},
  enabled: boolean = true,
  intensity: number = 1,
): VibrationManager {
  return new VibrationManager(initialPatterns, enabled, intensity);
}

/**
 * 默认振动管理器实例
 */
export const defaultVibrationManager = createVibrationManager();

// 同时提供命名空间对象
export const vibrationUtils = {
  isVibrationSupported,
  vibrate,
  stopVibration,
  createPattern,
  vibrateWithRhythm,
  VibrationPatterns,
  createVibrationManager,
  defaultVibrationManager,
};

// 默认导出命名空间对象
export default vibrationUtils;
