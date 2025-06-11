/**
 * 过渡动画系统
 * 统一的过渡动画实现，支持 CSS 和 JS 动画
 */

import type { EasingFunction, AnimationController, TransitionConfig } from "../foundation/types";
import { linear } from "./easing";
import { debounce } from "../foundation/utils";

// =============================================
// 过渡控制器实现
// =============================================

export class TransitionController implements AnimationController {
  private startTime: number = 0;
  private pausedTime: number = 0;
  private animationId?: number;
  private _isRunning: boolean = false;
  private _progress: number = 0;
  private _isCompleted: boolean = false;

  constructor(
    private updateFn: (progress: number) => void,
    private config: Required<TransitionConfig>,
  ) {}

  play(): void {
    if (this._isRunning) return;

    this._isRunning = true;
    this._isCompleted = false;
    this.startTime = performance.now() - this.pausedTime;
    this.pausedTime = 0;

    this.tick();
  }

  pause(): void {
    if (!this._isRunning) return;

    this._isRunning = false;
    this.pausedTime = performance.now() - this.startTime;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  stop(): void {
    this._isRunning = false;
    this._isCompleted = false;
    this._progress = 0;
    this.pausedTime = 0;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  finish(): void {
    this.stop();
    this._progress = 1;
    this._isCompleted = true;
    this.updateFn(1);
    this.onComplete?.();
  }

  reverse(): void {
    // 实现反向播放逻辑
    const currentProgress = this._progress;
    this.stop();
    this._progress = 1 - currentProgress;
    this.play();
  }

  get progress(): number {
    return this._progress;
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  get isCompleted(): boolean {
    return this._isCompleted;
  }

  onComplete?: () => void;

  private tick = (): void => {
    if (!this._isRunning) return;

    const now = performance.now();
    const elapsed = now - this.startTime;
    const rawProgress = Math.min(elapsed / this.config.duration, 1);

    // 应用缓动函数
    this._progress = this.config.easing(rawProgress);

    // 更新动画
    this.updateFn(this._progress);

    if (rawProgress >= 1) {
      this._isRunning = false;
      this._isCompleted = true;
      this.onComplete?.();
    } else {
      this.animationId = requestAnimationFrame(this.tick);
    }
  };
}

// =============================================
// 过渡创建函数
// =============================================

/**
 * 创建基础过渡动画
 */
export function createTransition(
  updateFn: (progress: number) => void,
  options: Partial<TransitionConfig> = {},
): TransitionController {
  const config: Required<TransitionConfig> = {
    property: "all",
    duration: 300,
    easing: linear,
    delay: 0,
    ...options,
  };

  const controller = new TransitionController(updateFn, config);

  // 处理延迟
  if (config.delay > 0) {
    setTimeout(() => controller.play(), config.delay);
  } else {
    controller.play();
  }

  return controller;
}

/**
 * 创建 CSS 属性过渡
 */
export function createCSSTransition(
  element: HTMLElement,
  properties: Record<string, { from: string | number; to: string | number; unit?: string }>,
  options: Partial<TransitionConfig> = {},
): TransitionController {
  // 设置初始值
  Object.entries(properties).forEach(([prop, { from, unit = "" }]) => {
    element.style.setProperty(prop, `${from}${unit}`);
  });

  const updateFn = (progress: number) => {
    Object.entries(properties).forEach(([prop, { from, to, unit = "" }]) => {
      const fromNum = typeof from === "number" ? from : parseFloat(from.toString());
      const toNum = typeof to === "number" ? to : parseFloat(to.toString());
      const current = fromNum + (toNum - fromNum) * progress;
      element.style.setProperty(prop, `${current}${unit}`);
    });
  };

  return createTransition(updateFn, options);
}

// =============================================
// 常用过渡动画
// =============================================

/**
 * 淡入动画
 */
export function fadeIn(element: HTMLElement, options: Partial<TransitionConfig> = {}): TransitionController {
  return createCSSTransition(
    element,
    {
      opacity: { from: 0, to: 1 },
    },
    options,
  );
}

/**
 * 淡出动画
 */
export function fadeOut(element: HTMLElement, options: Partial<TransitionConfig> = {}): TransitionController {
  return createCSSTransition(
    element,
    {
      opacity: { from: 1, to: 0 },
    },
    options,
  );
}

/**
 * 滑入动画
 */
export function slideIn(
  element: HTMLElement,
  direction: "up" | "down" | "left" | "right" = "up",
  options: Partial<TransitionConfig> = {},
): TransitionController {
  const transforms = {
    up: { from: "translateY(100%)", to: "translateY(0)" },
    down: { from: "translateY(-100%)", to: "translateY(0)" },
    left: { from: "translateX(100%)", to: "translateX(0)" },
    right: { from: "translateX(-100%)", to: "translateX(0)" },
  };

  return createCSSTransition(
    element,
    {
      transform: transforms[direction],
    },
    options,
  );
}

/**
 * 滑出动画
 */
export function slideOut(
  element: HTMLElement,
  direction: "up" | "down" | "left" | "right" = "down",
  options: Partial<TransitionConfig> = {},
): TransitionController {
  const transforms = {
    up: { from: "translateY(0)", to: "translateY(-100%)" },
    down: { from: "translateY(0)", to: "translateY(100%)" },
    left: { from: "translateX(0)", to: "translateX(-100%)" },
    right: { from: "translateX(0)", to: "translateX(100%)" },
  };

  return createCSSTransition(
    element,
    {
      transform: transforms[direction],
    },
    options,
  );
}

/**
 * 缩放动画
 */
export function scale(
  element: HTMLElement,
  from: number = 0,
  to: number = 1,
  options: Partial<TransitionConfig> = {},
): TransitionController {
  return createCSSTransition(
    element,
    {
      transform: { from: `scale(${from})`, to: `scale(${to})` },
    },
    options,
  );
}

/**
 * 旋转动画
 */
export function rotate(
  element: HTMLElement,
  from: number = 0,
  to: number = 360,
  options: Partial<TransitionConfig> = {},
): TransitionController {
  return createCSSTransition(
    element,
    {
      transform: { from: `rotate(${from}deg)`, to: `rotate(${to}deg)` },
    },
    options,
  );
}

/**
 * 颜色过渡
 */
export function colorTransition(
  element: HTMLElement,
  property: string,
  fromColor: string,
  toColor: string,
  options: Partial<TransitionConfig> = {},
): TransitionController {
  const fromRgb = parseColor(fromColor);
  const toRgb = parseColor(toColor);

  if (!fromRgb || !toRgb) {
    throw new Error("Invalid color format");
  }

  const updateFn = (progress: number) => {
    const r = Math.round(fromRgb[0] + (toRgb[0] - fromRgb[0]) * progress);
    const g = Math.round(fromRgb[1] + (toRgb[1] - fromRgb[1]) * progress);
    const b = Math.round(fromRgb[2] + (toRgb[2] - fromRgb[2]) * progress);
    element.style.setProperty(property, `rgb(${r}, ${g}, ${b})`);
  };

  return createTransition(updateFn, options);
}

// =============================================
// 序列动画
// =============================================

/**
 * 序列过渡动画
 */
export function sequenceTransitions(
  transitions: Array<{
    transition: () => TransitionController;
    delay?: number;
  }>,
): AnimationController {
  let currentIndex = 0;
  let currentController: TransitionController | null = null;
  let isRunning = false;
  let isCompleted = false;

  const startNext = () => {
    if (currentIndex >= transitions.length) {
      isRunning = false;
      isCompleted = true;
      controller.onComplete?.();
      return;
    }

    const { transition, delay = 0 } = transitions[currentIndex];
    currentIndex++;

    setTimeout(() => {
      if (!isRunning) return;

      currentController = transition();
      currentController.onComplete = () => {
        startNext();
      };
    }, delay);
  };

  const controller: AnimationController = {
    play() {
      if (isRunning) return;
      isRunning = true;
      isCompleted = false;
      currentIndex = 0;
      startNext();
    },

    pause() {
      isRunning = false;
      currentController?.pause();
    },

    stop() {
      isRunning = false;
      isCompleted = false;
      currentIndex = 0;
      currentController?.stop();
      currentController = null;
    },

    finish() {
      this.stop();
      isCompleted = true;
      controller.onComplete?.();
    },

    reverse() {
      // 实现序列反向播放
      currentController?.reverse();
    },

    get progress() {
      if (!currentController) return 0;
      const segmentProgress = currentController.progress;
      const totalSegments = transitions.length;
      const completedSegments = currentIndex - 1;
      return (completedSegments + segmentProgress) / totalSegments;
    },

    get isRunning() {
      return isRunning;
    },

    get isCompleted() {
      return isCompleted;
    },

    onComplete: undefined,
  };

  return controller;
}

/**
 * 并行过渡动画
 */
export function parallelTransitions(transitions: Array<() => TransitionController>): AnimationController {
  const controllers: TransitionController[] = [];
  let isRunning = false;
  let isCompleted = false;

  const checkCompletion = debounce(() => {
    if (controllers.every(c => c.isCompleted)) {
      isRunning = false;
      isCompleted = true;
      controller.onComplete?.();
    }
  }, 10);

  const controller: AnimationController = {
    play() {
      if (isRunning) return;
      isRunning = true;
      isCompleted = false;

      controllers.length = 0;
      transitions.forEach(createTransition => {
        const ctrl = createTransition();
        ctrl.onComplete = checkCompletion;
        controllers.push(ctrl);
      });
    },

    pause() {
      isRunning = false;
      controllers.forEach(c => c.pause());
    },

    stop() {
      isRunning = false;
      isCompleted = false;
      controllers.forEach(c => c.stop());
      controllers.length = 0;
    },

    finish() {
      controllers.forEach(c => c.finish());
      isRunning = false;
      isCompleted = true;
      controller.onComplete?.();
    },

    reverse() {
      controllers.forEach(c => c.reverse());
    },

    get progress() {
      if (controllers.length === 0) return 0;
      const totalProgress = controllers.reduce((sum, c) => sum + c.progress, 0);
      return totalProgress / controllers.length;
    },

    get isRunning() {
      return isRunning;
    },

    get isCompleted() {
      return isCompleted;
    },

    onComplete: undefined,
  };

  return controller;
}

// =============================================
// 工具函数
// =============================================

/**
 * 解析颜色为 RGB 数组
 */
function parseColor(color: string): [number, number, number] | null {
  // 处理十六进制颜色
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return [parseInt(hex[0] + hex[0], 16), parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16)];
    } else if (hex.length === 6) {
      return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
    }
  }

  // 处理 RGB 颜色
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }

  return null;
}

/**
 * 等待过渡完成
 */
export function waitForTransition(element: HTMLElement): Promise<void> {
  return new Promise(resolve => {
    const handleEnd = () => {
      element.removeEventListener("transitionend", handleEnd);
      resolve();
    };
    element.addEventListener("transitionend", handleEnd);
  });
}

/**
 * 获取元素的过渡持续时间
 */
export function getTransitionDuration(element: HTMLElement): number {
  const style = getComputedStyle(element);
  const duration = style.transitionDuration;
  return parseFloat(duration) * 1000; // 转换为毫秒
}
