/**
 * 滚动动画模块
 * 提供流畅的滚动效果、滚动监听和视差效果
 */

import { createTransition } from "./transition";
import type { TransitionOptions, TransitionController } from "./transition";
import { Easing } from "./easing";

/**
 * 滚动选项
 */
export interface ScrollOptions extends TransitionOptions {
  /**
   * 滚动容器元素
   * 默认为 window
   */
  container?: Window | HTMLElement;

  /**
   * 是否在开始前中断当前正在进行的滚动
   * 默认值：true
   */
  cancelOnStart?: boolean;

  /**
   * 抵消滚动目标位置的偏移量（像素）
   * 可用于考虑固定头部等
   * 默认值：0
   */
  offset?: number;

  /**
   * 水平滚动而非垂直滚动
   * 默认值：false
   */
  horizontal?: boolean;
}

/**
 * 检查元素是否在视图中
 * @param element 目标元素
 * @param options 检查选项
 * @returns 元素是否在视图中
 */
export function isElementInView(
  element: HTMLElement,
  options: {
    root?: HTMLElement | null;
    rootMargin?: string;
    threshold?: number;
    completelyVisible?: boolean;
  } = {},
): boolean {
  const { root = null, rootMargin = "0px", threshold = 0, completelyVisible = false } = options;

  // 获取元素和容器的边界
  const rect = element.getBoundingClientRect();

  // 使用 window 作为容器
  if (!root) {
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    // 检查元素是否在视口内
    if (completelyVisible) {
      return rect.top >= 0 && rect.left >= 0 && rect.bottom <= windowHeight && rect.right <= windowWidth;
    } else {
      return rect.bottom >= 0 && rect.right >= 0 && rect.top <= windowHeight && rect.left <= windowWidth;
    }
  }
  // 使用指定容器
  else {
    const rootRect = root.getBoundingClientRect();

    // 解析 rootMargin 值
    const margins = rootMargin.split(" ").map(margin => parseInt(margin, 10) || 0);
    const topMargin = margins[0];
    const rightMargin = margins.length > 1 ? margins[1] : topMargin;
    const bottomMargin = margins.length > 2 ? margins[2] : topMargin;
    const leftMargin = margins.length > 3 ? margins[3] : rightMargin;

    // 扩展容器边界
    const rootTop = rootRect.top - topMargin;
    const rootLeft = rootRect.left - leftMargin;
    const rootBottom = rootRect.bottom + bottomMargin;
    const rootRight = rootRect.right + rightMargin;

    // 检查元素是否在容器内
    if (completelyVisible) {
      return rect.top >= rootTop && rect.left >= rootLeft && rect.bottom <= rootBottom && rect.right <= rootRight;
    } else {
      return rect.bottom >= rootTop && rect.right >= rootLeft && rect.top <= rootBottom && rect.left <= rootRight;
    }
  }
}

/**
 * 获取当前滚动位置
 * @param container 滚动容器
 * @param horizontal 是否检查水平滚动位置
 * @returns 滚动位置（像素）
 */
export function getScrollPosition(container: Window | HTMLElement = window, horizontal: boolean = false): number {
  if (container === window) {
    return horizontal ? window.scrollX || window.pageXOffset : window.scrollY || window.pageYOffset;
  } else {
    return horizontal ? (container as HTMLElement).scrollLeft : (container as HTMLElement).scrollTop;
  }
}

/**
 * 平滑滚动到指定位置
 * @param target 目标位置（像素）或 DOM 元素
 * @param options 滚动选项
 * @returns 滚动控制器
 */
export function smoothScroll(target: number | HTMLElement, options: ScrollOptions = {}): TransitionController {
  const {
    container = window,
    duration = 500,
    easing = Easing.easeInOutCubic,
    cancelOnStart = true,
    offset = 0,
    horizontal = false,
    ...transitionOptions
  } = options;

  // 计算起始位置
  const startPosition = getScrollPosition(container, horizontal);

  // 计算目标位置
  let targetPosition: number;

  if (typeof target === "number") {
    targetPosition = target;
  } else {
    // 目标是 DOM 元素
    const targetRect = target.getBoundingClientRect();
    const containerRect =
      container === window ? { top: 0, left: 0 } : (container as HTMLElement).getBoundingClientRect();

    // 计算相对位置
    targetPosition = horizontal
      ? targetRect.left - containerRect.left + getScrollPosition(container, horizontal)
      : targetRect.top - containerRect.top + getScrollPosition(container, horizontal);
  }

  // 应用偏移量
  targetPosition += offset;

  // 如果已经在目标位置，无需滚动
  if (Math.abs(targetPosition - startPosition) < 1) {
    return {
      pause: () => {},
      resume: () => {},
      cancel: () => {},
      finish: () => {},
      progress: 1,
      isRunning: false,
      isCompleted: true,
    };
  }

  // 取消现有的滚动动画
  if (cancelOnStart) {
    if ("scrollTo" in container) {
      container.scrollTo({
        [horizontal ? "left" : "top"]: startPosition,
        behavior: "auto",
      });
    }
  }

  // 创建滚动动画
  return createTransition(
    progress => {
      const currentPosition = startPosition + (targetPosition - startPosition) * progress;

      if (container === window) {
        window.scrollTo({
          [horizontal ? "left" : "top"]: currentPosition,
          behavior: "auto", // 使用我们自己的缓动而不是浏览器的
        });
      } else {
        (container as HTMLElement)[horizontal ? "scrollLeft" : "scrollTop"] = currentPosition;
      }
    },
    {
      duration,
      easing,
      ...transitionOptions,
    },
  );
}

/**
 * 滚动到页面顶部
 * @param options 滚动选项
 * @returns 滚动控制器
 */
export function scrollToTop(options: ScrollOptions = {}): TransitionController {
  return smoothScroll(0, options);
}

/**
 * 滚动到页面底部
 * @param options 滚动选项
 * @returns 滚动控制器
 */
export function scrollToBottom(options: ScrollOptions = {}): TransitionController {
  const { container = window, horizontal = false, ...restOptions } = options;

  // 计算文档高度/宽度
  let scrollHeight: number;

  if (container === window) {
    scrollHeight = horizontal
      ? Math.max(
          document.body.scrollWidth,
          document.documentElement.scrollWidth,
          document.body.offsetWidth,
          document.documentElement.offsetWidth,
          document.body.clientWidth,
          document.documentElement.clientWidth,
        )
      : Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight,
          document.body.clientHeight,
          document.documentElement.clientHeight,
        );
  } else {
    scrollHeight = horizontal ? (container as HTMLElement).scrollWidth : (container as HTMLElement).scrollHeight;
  }

  return smoothScroll(scrollHeight, { container, horizontal, ...restOptions });
}

/**
 * 滚动到元素
 * @param element 目标元素
 * @param options 滚动选项
 * @returns 滚动控制器
 */
export function scrollToElement(element: HTMLElement, options: ScrollOptions = {}): TransitionController {
  return smoothScroll(element, options);
}

/**
 * 滚动监听器选项
 */
export interface ScrollListenerOptions {
  /**
   * 滚动容器
   * 默认为 window
   */
  container?: Window | HTMLElement;

  /**
   * 是否使用水平滚动位置
   * 默认为 false
   */
  horizontal?: boolean;

  /**
   * 防抖延迟 (毫秒)
   * 默认为 0 (不防抖)
   */
  debounceDelay?: number;

  /**
   * 节流延迟 (毫秒)
   * 默认为 0 (不节流)
   */
  throttleDelay?: number;

  /**
   * 即使滚动位置不变也触发回调
   * 默认为 false
   */
  alwaysTrigger?: boolean;
}

/**
 * 添加滚动监听
 * @param callback 滚动回调函数
 * @param options 监听选项
 * @returns 清除监听的函数
 */
export function addScrollListener(
  callback: (position: number) => void,
  options: ScrollListenerOptions = {},
): () => void {
  const {
    container = window,
    horizontal = false,
    debounceDelay = 0,
    throttleDelay = 0,
    alwaysTrigger = false,
  } = options;

  let lastPosition = getScrollPosition(container, horizontal);
  let timeoutId: number | null = null;
  let lastCallTime = 0;

  // 创建包装回调
  const wrappedCallback = () => {
    const newPosition = getScrollPosition(container, horizontal);

    // 只在位置变化时触发
    if (alwaysTrigger || newPosition !== lastPosition) {
      callback(newPosition);
      lastPosition = newPosition;
    }
  };

  // 创建节流回调
  const throttledCallback = () => {
    const now = Date.now();

    if (throttleDelay > 0) {
      if (now - lastCallTime >= throttleDelay) {
        wrappedCallback();
        lastCallTime = now;
      } else if (debounceDelay > 0) {
        // 重置防抖计时器
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }

        timeoutId = window.setTimeout(() => {
          wrappedCallback();
          lastCallTime = Date.now();
          timeoutId = null;
        }, debounceDelay);
      }
    } else if (debounceDelay > 0) {
      // 仅防抖
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        wrappedCallback();
        timeoutId = null;
      }, debounceDelay);
    } else {
      // 不防抖也不节流
      wrappedCallback();
    }
  };

  // 添加滚动监听
  container.addEventListener("scroll", throttledCallback, { passive: true });

  // 返回清理函数
  return () => {
    container.removeEventListener("scroll", throttledCallback);

    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  };
}

/**
 * 滚动到元素中心
 * @param element 目标元素
 * @param options 滚动选项
 * @returns 滚动控制器
 */
export function scrollToCenter(element: HTMLElement, options: ScrollOptions = {}): TransitionController {
  const { container = window, horizontal = false, offset = 0, ...restOptions } = options;

  // 获取容器和元素尺寸
  const containerRect =
    container === window
      ? {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        }
      : (container as HTMLElement).getBoundingClientRect();

  const elementRect = element.getBoundingClientRect();

  // 计算滚动偏移以使元素居中
  const containerCenter = horizontal
    ? containerRect.left + containerRect.width / 2
    : containerRect.top + containerRect.height / 2;

  const elementCenter = horizontal
    ? elementRect.left + elementRect.width / 2
    : elementRect.top + elementRect.height / 2;

  const currentScroll = getScrollPosition(container, horizontal);
  const centerOffset = elementCenter - containerCenter;

  // 目标滚动位置
  const targetScroll = currentScroll + centerOffset + offset;

  // 执行滚动
  return smoothScroll(targetScroll, { container, horizontal, ...restOptions });
}

/**
 * 视差滚动效果
 * @param element 应用视差效果的元素
 * @param options 视差选项
 * @returns 清除视差效果的函数
 */
export function parallaxScroll(
  element: HTMLElement,
  options: {
    speed?: number;
    direction?: "vertical" | "horizontal" | "both";
    container?: Window | HTMLElement;
    reverse?: boolean;
    clamp?: boolean;
    property?: "transform" | "translate" | "backgroundPosition";
  } = {},
): () => void {
  const {
    speed = 0.5,
    direction = "vertical",
    container = window,
    reverse = false,
    clamp = true,
    property = "transform",
  } = options;

  // 反转符号
  const multiplier = reverse ? -1 : 1;

  // 初始化元素
  if (property === "backgroundPosition") {
    element.style.backgroundPosition = "50% 50%";
  }

  // 视差更新函数
  const updateParallax = () => {
    // 计算元素相对于视口的位置
    const rect = element.getBoundingClientRect();
    const containerHeight = container === window ? window.innerHeight : (container as HTMLElement).clientHeight;
    const containerWidth = container === window ? window.innerWidth : (container as HTMLElement).clientWidth;

    // 计算元素中心在视口中的位置 (0-1)
    const verticalProgress = (rect.top + rect.height / 2) / containerHeight;
    const horizontalProgress = (rect.left + rect.width / 2) / containerWidth;

    // 计算视差偏移
    let xOffset = 0;
    let yOffset = 0;

    if (direction === "horizontal" || direction === "both") {
      // 水平方向的偏移
      xOffset = (horizontalProgress - 0.5) * speed * 100 * multiplier;

      // 限制范围
      if (clamp) {
        xOffset = Math.max(Math.min(xOffset, 100), -100);
      }
    }

    if (direction === "vertical" || direction === "both") {
      // 垂直方向的偏移
      yOffset = (verticalProgress - 0.5) * speed * 100 * multiplier;

      // 限制范围
      if (clamp) {
        yOffset = Math.max(Math.min(yOffset, 100), -100);
      }
    }

    // 应用视差效果
    if (property === "backgroundPosition") {
      const xPos = 50 + xOffset;
      const yPos = 50 + yOffset;
      element.style.backgroundPosition = `${xPos}% ${yPos}%`;
    } else {
      // 使用变换
      element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    }
  };

  // 添加滚动监听器
  const cleanupListener = addScrollListener(updateParallax, {
    container,
    throttleDelay: 10, // 轻微节流以提高性能
    horizontal: direction === "horizontal",
    alwaysTrigger: true,
  });

  // 立即执行一次
  updateParallax();

  // 窗口大小变化时也需要更新
  const resizeHandler = () => {
    updateParallax();
  };

  window.addEventListener("resize", resizeHandler, { passive: true });

  // 返回清理函数
  return () => {
    cleanupListener();
    window.removeEventListener("resize", resizeHandler);
  };
}

/**
 * 滚动监听器类型
 */
export type ScrollTrigger = {
  /**
   * 清除滚动触发器
   */
  cleanup: () => void;
};

/**
 * 创建元素进入视图触发器
 * @param element 要监听的元素
 * @param callback 进入/离开视图的回调
 * @param options 触发选项
 * @returns 滚动触发器对象
 */
export function createScrollTrigger(
  element: HTMLElement,
  callback: (isInView: boolean, entry?: IntersectionObserverEntry) => void,
  options: {
    root?: HTMLElement | null;
    rootMargin?: string;
    threshold?: number | number[];
    triggerOnce?: boolean;
  } = {},
): ScrollTrigger {
  const { root = null, rootMargin = "0px", threshold = 0, triggerOnce = false } = options;

  let triggered = false;

  // 创建监视器
  const observer = new IntersectionObserver(
    entries => {
      const entry = entries[0];
      const isInView = entry.isIntersecting;

      // 调用回调
      if (!triggerOnce || (triggerOnce && isInView && !triggered)) {
        callback(isInView, entry);

        if (triggerOnce && isInView) {
          triggered = true;
          observer.disconnect();
        }
      }
    },
    { root, rootMargin, threshold },
  );

  // 开始监视
  observer.observe(element);

  // 返回清理函数
  return {
    cleanup: () => {
      observer.disconnect();
    },
  };
}

/**
 * 滚动动画的目标值和回调函数
 */
export interface ScrollAnimationTarget {
  /**
   * 目标元素
   */
  element: HTMLElement;

  /**
   * 动画属性
   */
  properties: Record<
    string,
    {
      /**
       * 起始值
       */
      from: number | string;

      /**
       * 结束值
       */
      to: number | string;

      /**
       * 单位 (如 'px', '%', 'rem')
       */
      unit?: string;
    }
  >;

  /**
   * 动画开始位置
   * 0 表示元素底部到达视图底部
   * 1 表示元素顶部到达视图顶部
   * 默认: 0.8
   */
  start?: number;

  /**
   * 动画结束位置
   * 0 表示元素底部到达视图底部
   * 1 表示元素顶部到达视图顶部
   * 默认: 0.2
   */
  end?: number;

  /**
   * 缓动函数
   */
  easing?: (t: number) => number;
}

/**
 * 创建滚动位置动画
 * @param targets 动画目标配置
 * @param options 选项
 * @returns 清理函数
 */
export function createScrollAnimation(
  targets: ScrollAnimationTarget[],
  options: {
    container?: Window | HTMLElement;
  } = {},
): () => void {
  const { container = window } = options;

  // 解析颜色值
  const parseColor = (color: string): number[] => {
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        return [parseInt(hex[0] + hex[0], 16), parseInt(hex[1] + hex[1], 16), parseInt(hex[2] + hex[2], 16)];
      } else if (hex.length === 6) {
        return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
      }
    } else if (color.startsWith("rgb")) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        return [parseInt(matches[0]), parseInt(matches[1]), parseInt(matches[2])];
      }
    }
    return [0, 0, 0];
  };

  // 格式化颜色
  const formatColor = (rgb: number[]): string => {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  };

  // 更新动画
  const updateAnimation = () => {
    const containerHeight = container === window ? window.innerHeight : (container as HTMLElement).clientHeight;

    for (const target of targets) {
      const { element, properties, start = 0.8, end = 0.2, easing = Easing.linear } = target;

      const rect = element.getBoundingClientRect();

      // 计算元素位置
      // 0 表示元素底部在视口底部，1 表示元素顶部在视口顶部
      const elementPosition = 1 - rect.top / containerHeight;

      // 计算进度
      let progress = (elementPosition - start) / (end - start);
      progress = Math.max(0, Math.min(1, progress));

      // 应用缓动函数
      progress = easing(progress);

      // 更新每个属性
      for (const [property, { from, to, unit = "" }] of Object.entries(properties)) {
        // 处理颜色值
        if (
          typeof from === "string" &&
          typeof to === "string" &&
          (from.startsWith("#") || from.startsWith("rgb")) &&
          (to.startsWith("#") || to.startsWith("rgb"))
        ) {
          const fromColor = parseColor(from);
          const toColor = parseColor(to);

          const r = Math.round(fromColor[0] + (toColor[0] - fromColor[0]) * progress);
          const g = Math.round(fromColor[1] + (toColor[1] - fromColor[1]) * progress);
          const b = Math.round(fromColor[2] + (toColor[2] - fromColor[2]) * progress);

          element.style[property as any] = formatColor([r, g, b]);
        }
        // 处理数值
        else if (typeof from === "number" && typeof to === "number") {
          const value = from + (to - from) * progress;
          element.style[property as any] = `${value}${unit}`;
        }
        // 处理可以解析为数字的字符串
        else if (typeof from === "string" && typeof to === "string") {
          const fromNumber = parseFloat(from);
          const toNumber = parseFloat(to);

          if (!isNaN(fromNumber) && !isNaN(toNumber)) {
            const value = fromNumber + (toNumber - fromNumber) * progress;
            element.style[property as any] = `${value}${unit}`;
          }
        }
      }
    }
  };

  // 添加滚动监听
  const cleanupListener = addScrollListener(updateAnimation, {
    container,
    throttleDelay: 10,
    alwaysTrigger: true,
  });

  // 初始更新
  updateAnimation();

  // 窗口大小变化时也更新
  const resizeHandler = () => {
    updateAnimation();
  };

  window.addEventListener("resize", resizeHandler, { passive: true });

  // 返回清理函数
  return () => {
    cleanupListener();
    window.removeEventListener("resize", resizeHandler);
  };
}

// 同时提供命名空间对象
export const scroll = {
  smoothScroll,
  scrollToTop,
  scrollToBottom,
  scrollToElement,
  scrollToCenter,
  parallaxScroll,
  createScrollTrigger,
  createScrollAnimation,
  addScrollListener,
};

// 默认导出命名空间对象
export default scroll;
