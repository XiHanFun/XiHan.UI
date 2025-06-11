/**
 * 滚动动画系统
 * 平滑滚动、视差滚动、滚动触发动画
 */

import type { AnimationController, TransitionConfig } from "../foundation/types";
import { createTransition } from "./transition";
import { debounce, throttle } from "../foundation/utils";

// =============================================
// 滚动配置接口
// =============================================

export interface ScrollOptions extends Partial<TransitionConfig> {
  /** 滚动容器 */
  container?: Window | HTMLElement;
  /** 是否取消当前滚动 */
  cancelOnStart?: boolean;
  /** 偏移量 */
  offset?: number;
  /** 是否水平滚动 */
  horizontal?: boolean;
}

export interface ScrollListenerOptions {
  container?: Window | HTMLElement;
  horizontal?: boolean;
  debounceDelay?: number;
  throttleDelay?: number;
  alwaysTrigger?: boolean;
}

// =============================================
// 滚动工具函数
// =============================================

/**
 * 获取滚动位置
 */
export function getScrollPosition(container: Window | HTMLElement = window, horizontal: boolean = false): number {
  if (container === window) {
    return horizontal ? window.scrollX : window.scrollY;
  } else {
    const element = container as HTMLElement;
    return horizontal ? element.scrollLeft : element.scrollTop;
  }
}

/**
 * 设置滚动位置
 */
export function setScrollPosition(
  container: Window | HTMLElement,
  position: number,
  horizontal: boolean = false,
): void {
  if (container === window) {
    if (horizontal) {
      window.scrollTo(position, window.scrollY);
    } else {
      window.scrollTo(window.scrollX, position);
    }
  } else {
    const element = container as HTMLElement;
    if (horizontal) {
      element.scrollLeft = position;
    } else {
      element.scrollTop = position;
    }
  }
}

/**
 * 获取最大滚动距离
 */
export function getMaxScrollDistance(container: Window | HTMLElement, horizontal: boolean = false): number {
  if (container === window) {
    return horizontal
      ? document.documentElement.scrollWidth - window.innerWidth
      : document.documentElement.scrollHeight - window.innerHeight;
  } else {
    const element = container as HTMLElement;
    return horizontal ? element.scrollWidth - element.clientWidth : element.scrollHeight - element.clientHeight;
  }
}

// =============================================
// 平滑滚动
// =============================================

/**
 * 平滑滚动到指定位置
 */
export function smoothScrollTo(target: number | HTMLElement, options: ScrollOptions = {}): AnimationController {
  const { container = window, horizontal = false, offset = 0, cancelOnStart = true, ...transitionOptions } = options;

  // 计算目标位置
  let targetPosition: number;
  if (typeof target === "number") {
    targetPosition = target;
  } else {
    const rect = target.getBoundingClientRect();
    const currentScroll = getScrollPosition(container, horizontal);
    targetPosition = horizontal ? currentScroll + rect.left : currentScroll + rect.top;
  }

  targetPosition += offset;

  // 限制在有效范围内
  const maxScroll = getMaxScrollDistance(container, horizontal);
  targetPosition = Math.max(0, Math.min(targetPosition, maxScroll));

  const startPosition = getScrollPosition(container, horizontal);

  // 取消当前滚动
  if (cancelOnStart && container === window) {
    window.stop?.();
  }

  const updateFn = (progress: number) => {
    const currentPosition = startPosition + (targetPosition - startPosition) * progress;
    setScrollPosition(container, currentPosition, horizontal);
  };

  return createTransition(updateFn, transitionOptions);
}

/**
 * 滚动到顶部
 */
export function scrollToTop(options: ScrollOptions = {}): AnimationController {
  return smoothScrollTo(0, options);
}

/**
 * 滚动到底部
 */
export function scrollToBottom(options: ScrollOptions = {}): AnimationController {
  const { container = window, horizontal = false } = options;
  const maxScroll = getMaxScrollDistance(container, horizontal);
  return smoothScrollTo(maxScroll, options);
}

/**
 * 滚动到元素
 */
export function scrollToElement(element: HTMLElement, options: ScrollOptions = {}): AnimationController {
  return smoothScrollTo(element, options);
}

/**
 * 滚动到元素中心
 */
export function scrollToCenter(element: HTMLElement, options: ScrollOptions = {}): AnimationController {
  const { container = window, horizontal = false, offset = 0 } = options;

  const rect = element.getBoundingClientRect();
  const containerSize =
    container === window
      ? horizontal
        ? window.innerWidth
        : window.innerHeight
      : horizontal
        ? (container as HTMLElement).clientWidth
        : (container as HTMLElement).clientHeight;

  const elementSize = horizontal ? rect.width : rect.height;
  const centerOffset = (containerSize - elementSize) / 2;

  return smoothScrollTo(element, {
    ...options,
    offset: offset - centerOffset,
  });
}

// =============================================
// 滚动监听
// =============================================

/**
 * 添加滚动监听器
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

  const wrappedCallback = () => {
    const currentPosition = getScrollPosition(container, horizontal);
    if (alwaysTrigger || currentPosition !== lastPosition) {
      callback(currentPosition);
      lastPosition = currentPosition;
    }
  };

  let finalCallback = wrappedCallback;

  // 应用防抖
  if (debounceDelay > 0) {
    finalCallback = debounce(wrappedCallback, debounceDelay);
  }

  // 应用节流
  if (throttleDelay > 0) {
    finalCallback = throttle(finalCallback, throttleDelay);
  }

  container.addEventListener("scroll", finalCallback, { passive: true });

  return () => {
    container.removeEventListener("scroll", finalCallback);
  };
}

// =============================================
// 视差滚动
// =============================================

export interface ParallaxOptions {
  speed?: number;
  direction?: "vertical" | "horizontal" | "both";
  container?: Window | HTMLElement;
  reverse?: boolean;
  clamp?: boolean;
}

/**
 * 创建视差滚动效果
 */
export function createParallaxEffect(element: HTMLElement, options: ParallaxOptions = {}): () => void {
  const { speed = 0.5, direction = "vertical", container = window, reverse = false, clamp = true } = options;

  const updateParallax = throttle(() => {
    const scrollY = getScrollPosition(container, false);
    const scrollX = getScrollPosition(container, true);

    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + scrollY;
    const elementLeft = rect.left + scrollX;

    const containerHeight = container === window ? window.innerHeight : (container as HTMLElement).clientHeight;
    const containerWidth = container === window ? window.innerWidth : (container as HTMLElement).clientWidth;

    // 计算视差偏移
    let offsetY = 0;
    let offsetX = 0;

    if (direction === "vertical" || direction === "both") {
      const progress = (scrollY - elementTop + containerHeight) / (containerHeight + rect.height);
      offsetY = (progress - 0.5) * speed * 100;
      if (reverse) offsetY = -offsetY;
      if (clamp) offsetY = Math.max(-50, Math.min(50, offsetY));
    }

    if (direction === "horizontal" || direction === "both") {
      const progress = (scrollX - elementLeft + containerWidth) / (containerWidth + rect.width);
      offsetX = (progress - 0.5) * speed * 100;
      if (reverse) offsetX = -offsetX;
      if (clamp) offsetX = Math.max(-50, Math.min(50, offsetX));
    }

    element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
  }, 16);

  const cleanup = addScrollListener(updateParallax, { container });

  // 初始更新
  updateParallax();

  return cleanup;
}

// =============================================
// 滚动触发动画
// =============================================

export interface ScrollTriggerOptions {
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  onEnter?: (entry: IntersectionObserverEntry) => void;
  onLeave?: (entry: IntersectionObserverEntry) => void;
}

/**
 * 创建滚动触发器
 */
export function createScrollTrigger(
  element: HTMLElement,
  callback: (isInView: boolean, entry?: IntersectionObserverEntry) => void,
  options: ScrollTriggerOptions = {},
): { cleanup: () => void } {
  const { root = null, rootMargin = "0px", threshold = 0.1, triggerOnce = false, onEnter, onLeave } = options;

  let hasTriggered = false;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const isInView = entry.isIntersecting;

        if (triggerOnce && hasTriggered && !isInView) {
          return;
        }

        callback(isInView, entry);

        if (isInView) {
          onEnter?.(entry);
          if (triggerOnce) {
            hasTriggered = true;
          }
        } else {
          onLeave?.(entry);
        }
      });
    },
    {
      root,
      rootMargin,
      threshold,
    },
  );

  observer.observe(element);

  return {
    cleanup: () => {
      observer.unobserve(element);
      observer.disconnect();
    },
  };
}

// =============================================
// 滚动动画序列
// =============================================

export interface ScrollAnimationTarget {
  element: HTMLElement;
  properties: Record<
    string,
    {
      from: number | string;
      to: number | string;
      unit?: string;
    }
  >;
  start?: number; // 0-1, 动画开始位置
  end?: number; // 0-1, 动画结束位置
  easing?: (t: number) => number;
}

/**
 * 创建基于滚动的动画序列
 */
export function createScrollAnimation(
  targets: ScrollAnimationTarget[],
  options: { container?: Window | HTMLElement } = {},
): () => void {
  const { container = window } = options;

  const updateAnimation = throttle(() => {
    const scrollY = getScrollPosition(container, false);
    const containerHeight = container === window ? window.innerHeight : (container as HTMLElement).clientHeight;

    targets.forEach(target => {
      const { element, properties, start = 0, end = 1, easing = t => t } = target;
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementHeight = rect.height;

      // 计算动画进度
      const startPosition = elementTop - containerHeight * (1 - start);
      const endPosition = elementTop + elementHeight * end;
      const totalDistance = endPosition - startPosition;

      if (totalDistance <= 0) return;

      const progress = Math.max(0, Math.min(1, (scrollY - startPosition) / totalDistance));
      const easedProgress = easing(progress);

      // 应用属性动画
      Object.entries(properties).forEach(([prop, { from, to, unit = "" }]) => {
        const fromNum = typeof from === "number" ? from : parseFloat(from.toString());
        const toNum = typeof to === "number" ? to : parseFloat(to.toString());
        const current = fromNum + (toNum - fromNum) * easedProgress;
        element.style.setProperty(prop, `${current}${unit}`);
      });
    });
  }, 16);

  const cleanup = addScrollListener(updateAnimation, { container });

  // 初始更新
  updateAnimation();

  return cleanup;
}

// =============================================
// 工具函数
// =============================================

/**
 * 检查元素是否在视口中
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

  const rect = element.getBoundingClientRect();
  const rootRect = root
    ? root.getBoundingClientRect()
    : {
        top: 0,
        left: 0,
        bottom: window.innerHeight,
        right: window.innerWidth,
      };

  if (completelyVisible) {
    return (
      rect.top >= rootRect.top &&
      rect.left >= rootRect.left &&
      rect.bottom <= rootRect.bottom &&
      rect.right <= rootRect.right
    );
  } else {
    const intersectionArea =
      Math.max(0, Math.min(rect.bottom, rootRect.bottom) - Math.max(rect.top, rootRect.top)) *
      Math.max(0, Math.min(rect.right, rootRect.right) - Math.max(rect.left, rootRect.left));
    const elementArea = rect.width * rect.height;
    return elementArea > 0 && intersectionArea / elementArea >= threshold;
  }
}

/**
 * 获取滚动进度 (0-1)
 */
export function getScrollProgress(container: Window | HTMLElement = window, horizontal: boolean = false): number {
  const current = getScrollPosition(container, horizontal);
  const max = getMaxScrollDistance(container, horizontal);
  return max > 0 ? current / max : 0;
}
