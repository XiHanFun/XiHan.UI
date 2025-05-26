/**
 * 过渡动画辅助模块
 * 提供用于创建和管理元素过渡效果的工具函数
 */

import { Easing } from "./easing";
import type { EasingFunction } from "./easing";

/**
 * 过渡选项
 */
export interface TransitionOptions {
  /**
   * 持续时间 (毫秒)
   */
  duration?: number;

  /**
   * 延迟时间 (毫秒)
   */
  delay?: number;

  /**
   * 缓动函数
   */
  easing?: EasingFunction;

  /**
   * 开始回调
   */
  onStart?: () => void;

  /**
   * 更新回调
   * @param progress 当前进度 (0-1)
   */
  onUpdate?: (progress: number) => void;

  /**
   * 完成回调
   */
  onComplete?: () => void;

  /**
   * 取消回调
   */
  onCancel?: () => void;
}

/**
 * 过渡控制器
 */
export interface TransitionController {
  /**
   * 暂停过渡
   */
  pause: () => void;

  /**
   * 恢复过渡
   */
  resume: () => void;

  /**
   * 取消过渡
   */
  cancel: () => void;

  /**
   * 立即结束过渡
   */
  finish: () => void;

  /**
   * 当前进度 (0-1)
   */
  progress: number;

  /**
   * 过渡是否处于运行状态
   */
  isRunning: boolean;

  /**
   * 过渡是否已经完成
   */
  isCompleted: boolean;

  /**
   * 完成回调函数
   */
  onComplete?: () => void;
}

/**
 * 创建一个简单的过渡动画
 * @param update 更新函数，接收当前进度 (0-1)
 * @param options 过渡选项
 * @returns 过渡控制器
 */
export function createTransition(
  update: (progress: number) => void,
  options: TransitionOptions = {},
): TransitionController {
  const { duration = 300, delay = 0, easing = Easing.linear, onStart, onUpdate, onComplete, onCancel } = options;

  let startTime: number | null = null;
  let pauseTime: number | null = null;
  let pausedDuration = 0;
  let rafId: number | null = null;
  let progress = 0;
  let isRunning = false;
  let isCompleted = false;

  // 动画帧函数
  const tick = (timestamp: number) => {
    // 首次执行，记录开始时间
    if (startTime === null) {
      startTime = timestamp;
      if (onStart) onStart();
    }

    // 计算经过的时间
    const elapsed = timestamp - startTime - pausedDuration;

    // 如果还在延迟中，继续等待
    if (elapsed < delay) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    // 计算动画进度 (0-1 范围)
    progress = Math.min(1, (elapsed - delay) / duration);

    // 应用缓动函数
    const easedProgress = easing(progress);

    // 调用更新函数
    update(easedProgress);
    if (onUpdate) onUpdate(easedProgress);

    // 检查是否完成
    if (progress >= 1) {
      isRunning = false;
      isCompleted = true;
      if (onComplete) onComplete();
    } else {
      // 继续下一帧
      rafId = requestAnimationFrame(tick);
    }
  };

  // 开始过渡动画
  isRunning = true;
  rafId = requestAnimationFrame(tick);

  // 返回控制器
  return {
    pause: () => {
      if (!isRunning || isCompleted) return;

      isRunning = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      pauseTime = performance.now();
    },

    resume: () => {
      if (isRunning || isCompleted || pauseTime === null) return;

      // 计算暂停持续时间
      pausedDuration += performance.now() - pauseTime;
      pauseTime = null;
      isRunning = true;
      rafId = requestAnimationFrame(tick);
    },

    cancel: () => {
      if (isCompleted) return;

      isRunning = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      if (onCancel) onCancel();
    },

    finish: () => {
      if (isCompleted) return;

      isRunning = false;
      isCompleted = true;

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      progress = 1;
      update(1);
      if (onComplete) onComplete();
    },

    get progress() {
      return progress;
    },

    get isRunning() {
      return isRunning;
    },

    get isCompleted() {
      return isCompleted;
    },
  };
}

/**
 * CSS 过渡属性
 */
export interface CSSTransitionProperty {
  /**
   * 属性名
   */
  property: string;

  /**
   * 起始值
   */
  from: string | number;

  /**
   * 结束值
   */
  to: string | number;

  /**
   * 单位 (可选)
   */
  unit?: string;
}

/**
 * 创建 DOM 元素的 CSS 过渡
 * @param element 目标 DOM 元素
 * @param properties 要过渡的 CSS 属性
 * @param options 过渡选项
 * @returns 过渡控制器
 */
export function createCSSTransition(
  element: HTMLElement,
  properties: CSSTransitionProperty[],
  options: TransitionOptions = {},
): TransitionController {
  // 提取初始值和目标值
  const initialValues: Record<string, number> = {};
  const targetValues: Record<string, number> = {};
  const units: Record<string, string> = {};

  // 处理每个属性
  properties.forEach(prop => {
    const { property, from, to, unit = "" } = prop;

    // 将值转换为数字
    initialValues[property] = typeof from === "string" ? parseFloat(from) : from;
    targetValues[property] = typeof to === "string" ? parseFloat(to) : to;
    units[property] = unit || (typeof from === "string" ? extractUnit(from) : "");
  });

  // 创建更新函数
  const update = (progress: number) => {
    for (const property of Object.keys(initialValues)) {
      const from = initialValues[property];
      const to = targetValues[property];
      const unit = units[property];

      // 计算当前值
      const value = from + (to - from) * progress;

      // 更新 CSS 属性
      element.style[property as any] = `${value}${unit}`;
    }
  };

  // 创建并返回过渡控制器
  return createTransition(update, options);
}

/**
 * 从值字符串中提取单位
 * @param value 值字符串，如 "100px"
 * @returns 单位字符串，如 "px"
 */
function extractUnit(value: string): string {
  return value.replace(/^-?\d*\.?\d+/, "");
}

/**
 * 创建 DOM 元素透明度过渡
 * @param element 目标 DOM 元素
 * @param from 起始透明度 (0-1)
 * @param to 结束透明度 (0-1)
 * @param options 过渡选项
 * @returns 过渡控制器
 */
export function fadeElement(
  element: HTMLElement,
  from: number,
  to: number,
  options: TransitionOptions = {},
): TransitionController {
  return createCSSTransition(element, [{ property: "opacity", from, to }], options);
}

/**
 * 淡入元素
 * @param element 目标 DOM 元素
 * @param options 过渡选项
 * @returns 过渡控制器
 */
export function fadeIn(element: HTMLElement, options: TransitionOptions = {}): TransitionController {
  // 确保元素可见
  element.style.display = "";

  // 创建从 0 到 1 的透明度过渡
  return fadeElement(element, 0, 1, {
    easing: Easing.easeOutQuad,
    ...options,
    onStart: () => {
      // 如果元素当前隐藏，则显示它
      if (getComputedStyle(element).display === "none") {
        element.style.display = "";
      }
      if (options.onStart) options.onStart();
    },
  });
}

/**
 * 淡出元素
 * @param element 目标 DOM 元素
 * @param options 过渡选项
 * @returns 过渡控制器
 */
export function fadeOut(element: HTMLElement, options: TransitionOptions = {}): TransitionController {
  // 创建从 1 到 0 的透明度过渡
  return fadeElement(element, 1, 0, {
    easing: Easing.easeInQuad,
    ...options,
    onComplete: () => {
      // 过渡完成后隐藏元素
      element.style.display = "none";
      if (options.onComplete) options.onComplete();
    },
  });
}

/**
 * 滑动方向
 */
export type SlideDirection = "up" | "down" | "left" | "right";

/**
 * 创建 DOM 元素滑动过渡
 * @param element 目标 DOM 元素
 * @param direction 滑动方向
 * @param distance 滑动距离 (像素)，若为 null 则使用元素自身尺寸
 * @param options 过渡选项
 * @returns 过渡控制器
 */
export function slideElement(
  element: HTMLElement,
  direction: SlideDirection,
  distance: number | null = null,
  options: TransitionOptions = {},
): TransitionController {
  // 获取元素当前位置
  const rect = element.getBoundingClientRect();

  // 根据方向确定移动属性和距离
  let property: "transform";
  let transformFrom: string;
  let transformTo: string;

  // 计算滑动距离
  const slideDistance =
    distance !== null ? distance : direction === "up" || direction === "down" ? rect.height : rect.width;

  // 设置初始和目标位置
  switch (direction) {
    case "up":
      transformFrom = `translateY(${slideDistance}px)`;
      transformTo = "translateY(0)";
      break;
    case "down":
      transformFrom = "translateY(0)";
      transformTo = `translateY(${slideDistance}px)`;
      break;
    case "left":
      transformFrom = `translateX(${slideDistance}px)`;
      transformTo = "translateX(0)";
      break;
    case "right":
      transformFrom = "translateX(0)";
      transformTo = `translateX(${slideDistance}px)`;
      break;
  }

  // 创建过渡
  const update = (progress: number) => {
    if (direction === "up" || direction === "left") {
      const currentDistance = slideDistance * (1 - progress);
      const transform = direction === "up" ? `translateY(${currentDistance}px)` : `translateX(${currentDistance}px)`;

      element.style.transform = transform;
    } else {
      const currentDistance = slideDistance * progress;
      const transform = direction === "down" ? `translateY(${currentDistance}px)` : `translateX(${currentDistance}px)`;

      element.style.transform = transform;
    }
  };

  return createTransition(update, {
    easing: Easing.easeInOutQuad,
    ...options,
  });
}

/**
 * 滑入元素
 * @param element 目标 DOM 元素
 * @param direction 滑动方向
 * @param options 过渡选项
 * @returns 过渡控制器
 */
export function slideIn(
  element: HTMLElement,
  direction: SlideDirection = "up",
  options: TransitionOptions = {},
): TransitionController {
  // 确保元素可见
  const originalDisplay = element.style.display;
  element.style.display = "";

  // 获取元素尺寸
  const rect = element.getBoundingClientRect();
  const distance = direction === "up" || direction === "down" ? rect.height : rect.width;

  // 设置初始状态
  element.style.overflow = "hidden";
  if (direction === "up") {
    element.style.transform = `translateY(${distance}px)`;
  } else if (direction === "down") {
    element.style.transform = `translateY(-${distance}px)`;
  } else if (direction === "left") {
    element.style.transform = `translateX(${distance}px)`;
  } else {
    element.style.transform = `translateX(-${distance}px)`;
  }

  // 创建过渡
  const update = (progress: number) => {
    let transformValue = "";
    if (direction === "up") {
      transformValue = `translateY(${distance * (1 - progress)}px)`;
    } else if (direction === "down") {
      transformValue = `translateY(-${distance * (1 - progress)}px)`;
    } else if (direction === "left") {
      transformValue = `translateX(${distance * (1 - progress)}px)`;
    } else {
      transformValue = `translateX(-${distance * (1 - progress)}px)`;
    }
    element.style.transform = transformValue;
  };

  return createTransition(update, {
    easing: Easing.easeOutQuad,
    ...options,
    onStart: () => {
      // 如果元素当前隐藏，则显示它
      if (originalDisplay === "none") {
        element.style.display = "";
      }
      if (options.onStart) options.onStart();
    },
    onComplete: () => {
      // 恢复默认样式
      element.style.overflow = "";
      if (options.onComplete) options.onComplete();
    },
  });
}

/**
 * 滑出元素
 * @param element 目标 DOM 元素
 * @param direction 滑动方向
 * @param options 过渡选项
 * @returns 过渡控制器
 */
export function slideOut(
  element: HTMLElement,
  direction: SlideDirection = "down",
  options: TransitionOptions = {},
): TransitionController {
  // 获取元素尺寸
  const rect = element.getBoundingClientRect();
  const distance = direction === "up" || direction === "down" ? rect.height : rect.width;

  // 设置初始状态
  element.style.overflow = "hidden";
  element.style.transform = "translate(0, 0)";

  // 创建过渡
  const update = (progress: number) => {
    let transformValue = "";
    if (direction === "up") {
      transformValue = `translateY(-${distance * progress}px)`;
    } else if (direction === "down") {
      transformValue = `translateY(${distance * progress}px)`;
    } else if (direction === "left") {
      transformValue = `translateX(-${distance * progress}px)`;
    } else {
      transformValue = `translateX(${distance * progress}px)`;
    }
    element.style.transform = transformValue;
  };

  return createTransition(update, {
    easing: Easing.easeInQuad,
    ...options,
    onComplete: () => {
      // 过渡完成后隐藏元素
      element.style.display = "none";
      element.style.transform = "";
      element.style.overflow = "";
      if (options.onComplete) options.onComplete();
    },
  });
}

/**
 * 创建元素缩放过渡
 * @param element 目标 DOM 元素
 * @param fromScale 起始缩放值
 * @param toScale 结束缩放值
 * @param options 过渡选项
 * @returns 过渡控制器
 */
export function scaleElement(
  element: HTMLElement,
  fromScale: number,
  toScale: number,
  options: TransitionOptions = {},
): TransitionController {
  // 创建过渡
  const update = (progress: number) => {
    const currentScale = fromScale + (toScale - fromScale) * progress;
    element.style.transform = `scale(${currentScale})`;
  };

  return createTransition(update, {
    easing: Easing.easeInOutQuad,
    ...options,
  });
}

/**
 * 创建元素颜色过渡
 * @param element 目标 DOM 元素
 * @param property CSS 颜色属性名
 * @param fromColor 起始颜色 (CSS 颜色格式)
 * @param toColor 结束颜色 (CSS 颜色格式)
 * @param options 过渡选项
 * @returns 过渡控制器
 */
export function colorTransition(
  element: HTMLElement,
  property: string,
  fromColor: string,
  toColor: string,
  options: TransitionOptions = {},
): TransitionController {
  // 解析颜色为 RGB 分量
  const fromRGB = parseColor(fromColor);
  const toRGB = parseColor(toColor);

  if (!fromRGB || !toRGB) {
    throw new Error("Invalid color format");
  }

  // 创建过渡
  const update = (progress: number) => {
    const r = Math.round(fromRGB.r + (toRGB.r - fromRGB.r) * progress);
    const g = Math.round(fromRGB.g + (toRGB.g - fromRGB.g) * progress);
    const b = Math.round(fromRGB.b + (toRGB.b - fromRGB.b) * progress);
    const a = fromRGB.a + (toRGB.a - fromRGB.a) * progress;

    if (a < 1) {
      element.style[property as any] = `rgba(${r}, ${g}, ${b}, ${a})`;
    } else {
      element.style[property as any] = `rgb(${r}, ${g}, ${b})`;
    }
  };

  return createTransition(update, options);
}

/**
 * 解析 CSS 颜色字符串为 RGB 分量
 * @param color CSS 颜色字符串
 * @returns RGB 对象 或 null (如果解析失败)
 */
function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
  // 创建临时元素用于颜色解析
  const tempEl = document.createElement("div");
  tempEl.style.color = color;
  document.body.appendChild(tempEl);

  // 获取计算后的颜色
  const computedColor = getComputedStyle(tempEl).color;
  document.body.removeChild(tempEl);

  // 提取 RGB 分量
  const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);

  if (!match) return null;

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: match[4] ? parseFloat(match[4]) : 1,
  };
}

/**
 * 创建一个序列过渡
 * @param transitions 要依次执行的过渡和延迟
 * @returns 过渡控制器
 */
export function sequenceTransitions(
  transitions: Array<{
    transition: () => TransitionController;
    delay?: number;
  }>,
): TransitionController {
  let currentIndex = 0;
  let currentTransition: TransitionController | null = null;
  let currentTimeout: number | null = null;
  let isCancelled = false;
  let isCompleted = false;

  // 开始序列中的下一个过渡
  const startNext = () => {
    // 序列已完成或已取消
    if (isCompleted || isCancelled) return;

    // 已执行完所有过渡
    if (currentIndex >= transitions.length) {
      isCompleted = true;
      return;
    }

    const { transition, delay = 0 } = transitions[currentIndex];

    // 如果有延迟，等待后再开始过渡
    if (delay > 0) {
      currentTimeout = window.setTimeout(() => {
        currentTimeout = null;
        currentTransition = transition();

        // 当前过渡完成后开始下一个
        currentTransition.finish = () => {
          currentTransition!.cancel();
          currentIndex++;
          startNext();
        };

        // 监听完成事件
        const originalComplete = transitions[currentIndex].transition;
        currentTransition.onComplete = () => {
          currentIndex++;
          startNext();
        };
      }, delay);
    } else {
      // 直接开始过渡
      currentTransition = transition();

      // 替换 finish 方法
      const originalFinish = currentTransition.finish;
      currentTransition.finish = () => {
        originalFinish();
        currentIndex++;
        startNext();
      };

      // 当前过渡完成后开始下一个
      const originalOnComplete = currentTransition.onComplete;
      currentTransition.onComplete = () => {
        if (originalOnComplete) originalOnComplete();
        currentIndex++;
        startNext();
      };
    }

    currentIndex++;
  };

  // 开始第一个过渡
  startNext();

  // 返回控制器
  return {
    pause: () => {
      if (currentTransition && currentTransition.isRunning) {
        currentTransition.pause();
      }
    },

    resume: () => {
      if (currentTransition && !currentTransition.isRunning && !currentTransition.isCompleted) {
        currentTransition.resume();
      }
    },

    cancel: () => {
      isCancelled = true;

      if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }

      if (currentTransition) {
        currentTransition.cancel();
      }
    },

    finish: () => {
      // 立即取消当前延迟
      if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
      }

      // 立即结束当前过渡
      if (currentTransition) {
        currentTransition.finish();
      }

      // 立即执行所有后续过渡
      while (currentIndex < transitions.length) {
        const { transition } = transitions[currentIndex];
        const trans = transition();
        trans.finish();
        currentIndex++;
      }

      isCompleted = true;
    },

    get progress() {
      if (isCompleted) return 1;
      if (isCancelled) return 0;
      if (!currentTransition) return 0;

      // 计算总体进度
      const segmentSize = 1 / transitions.length;
      return (currentIndex - 1) * segmentSize + currentTransition.progress * segmentSize;
    },

    get isRunning() {
      return (
        !isCompleted && !isCancelled && ((currentTransition && currentTransition.isRunning) || currentTimeout !== null)
      );
    },

    get isCompleted() {
      return isCompleted;
    },
  };
}
