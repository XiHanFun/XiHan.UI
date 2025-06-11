/**
 * SVG 动画系统
 * SVG 路径动画、形状变换、描边动画
 */

import type { AnimationController, TransitionConfig } from "../foundation/types";
import { createTransition } from "./transition";

// =============================================
// SVG 路径动画
// =============================================

/**
 * 获取 SVG 路径长度
 */
export function getPathLength(path: SVGPathElement | string): number {
  if (typeof path === "string") {
    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("d", path);
    return tempPath.getTotalLength();
  }
  return path.getTotalLength();
}

/**
 * 获取路径上的点
 */
export function getPointAtLength(path: SVGPathElement | string, length: number): DOMPoint {
  if (typeof path === "string") {
    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("d", path);
    return tempPath.getPointAtLength(length);
  }
  return path.getPointAtLength(length);
}

/**
 * 绘制 SVG 路径动画
 */
export function drawPath(
  pathElement: SVGPathElement,
  options: Partial<TransitionConfig> & {
    direction?: "forward" | "reverse";
    delay?: number;
  } = {},
): AnimationController {
  const { direction = "forward", ...transitionOptions } = options;

  const pathLength = pathElement.getTotalLength();

  // 设置初始状态
  pathElement.style.strokeDasharray = `${pathLength}`;
  pathElement.style.strokeDashoffset = direction === "forward" ? `${pathLength}` : "0";

  const updateFn = (progress: number) => {
    const offset = direction === "forward" ? pathLength * (1 - progress) : pathLength * progress;
    pathElement.style.strokeDashoffset = `${offset}`;
  };

  return createTransition(updateFn, transitionOptions);
}

/**
 * 路径变形动画
 */
export function morphPath(
  pathElement: SVGPathElement,
  fromPath: string,
  toPath: string,
  options: Partial<TransitionConfig> = {},
): AnimationController {
  // 简化的路径插值（实际应用中可能需要更复杂的算法）
  const updateFn = (progress: number) => {
    if (progress === 0) {
      pathElement.setAttribute("d", fromPath);
    } else if (progress === 1) {
      pathElement.setAttribute("d", toPath);
    } else {
      // 这里应该实现路径插值算法
      // 为简化，直接在中点切换
      pathElement.setAttribute("d", progress < 0.5 ? fromPath : toPath);
    }
  };

  return createTransition(updateFn, options);
}

// =============================================
// SVG 元素动画
// =============================================

/**
 * SVG 元素变换动画
 */
export function animateSVGTransform(
  element: SVGElement,
  transform: {
    translate?: { from: [number, number]; to: [number, number] };
    scale?: { from: [number, number]; to: [number, number] };
    rotate?: { from: number; to: number; center?: [number, number] };
  },
  options: Partial<TransitionConfig> = {},
): AnimationController {
  const updateFn = (progress: number) => {
    const transforms: string[] = [];

    if (transform.translate) {
      const { from, to } = transform.translate;
      const x = from[0] + (to[0] - from[0]) * progress;
      const y = from[1] + (to[1] - from[1]) * progress;
      transforms.push(`translate(${x}, ${y})`);
    }

    if (transform.scale) {
      const { from, to } = transform.scale;
      const sx = from[0] + (to[0] - from[0]) * progress;
      const sy = from[1] + (to[1] - from[1]) * progress;
      transforms.push(`scale(${sx}, ${sy})`);
    }

    if (transform.rotate) {
      const { from, to, center = [0, 0] } = transform.rotate;
      const angle = from + (to - from) * progress;
      transforms.push(`rotate(${angle}, ${center[0]}, ${center[1]})`);
    }

    element.setAttribute("transform", transforms.join(" "));
  };

  return createTransition(updateFn, options);
}

/**
 * SVG 属性动画
 */
export function animateSVGAttribute(
  element: SVGElement,
  attribute: string,
  from: number | string,
  to: number | string,
  options: Partial<TransitionConfig> = {},
): AnimationController {
  const fromNum = typeof from === "number" ? from : parseFloat(from.toString());
  const toNum = typeof to === "number" ? to : parseFloat(to.toString());

  const updateFn = (progress: number) => {
    if (typeof from === "string" && typeof to === "string") {
      // 字符串插值（简化版）
      element.setAttribute(attribute, progress < 0.5 ? from : to);
    } else {
      // 数值插值
      const current = fromNum + (toNum - fromNum) * progress;
      element.setAttribute(attribute, current.toString());
    }
  };

  return createTransition(updateFn, options);
}

// =============================================
// SVG 颜色动画
// =============================================

/**
 * SVG 颜色动画
 */
export function animateSVGColor(
  element: SVGElement,
  attribute: "fill" | "stroke",
  fromColor: string,
  toColor: string,
  options: Partial<TransitionConfig> = {},
): AnimationController {
  const fromRgb = parseColor(fromColor);
  const toRgb = parseColor(toColor);

  if (!fromRgb || !toRgb) {
    throw new Error("Invalid color format");
  }

  const updateFn = (progress: number) => {
    const r = Math.round(fromRgb[0] + (toRgb[0] - fromRgb[0]) * progress);
    const g = Math.round(fromRgb[1] + (toRgb[1] - fromRgb[1]) * progress);
    const b = Math.round(fromRgb[2] + (toRgb[2] - fromRgb[2]) * progress);
    element.setAttribute(attribute, `rgb(${r}, ${g}, ${b})`);
  };

  return createTransition(updateFn, options);
}

// =============================================
// 路径跟随动画
// =============================================

/**
 * 元素沿路径移动动画
 */
export function moveAlongPath(
  element: HTMLElement | SVGElement,
  path: SVGPathElement | string,
  options: Partial<TransitionConfig> & {
    rotate?: boolean;
    offset?: { x: number; y: number };
  } = {},
): AnimationController {
  const { rotate = false, offset = { x: 0, y: 0 }, ...transitionOptions } = options;

  const pathLength = getPathLength(path);

  const updateFn = (progress: number) => {
    const distance = pathLength * progress;
    const point = getPointAtLength(path, distance);

    let transform = `translate(${point.x + offset.x}px, ${point.y + offset.y}px)`;

    if (rotate) {
      // 计算切线角度
      const nextDistance = Math.min(distance + 1, pathLength);
      const nextPoint = getPointAtLength(path, nextDistance);
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
      transform += ` rotate(${angle}deg)`;
    }

    if (element instanceof HTMLElement) {
      element.style.transform = transform;
    } else {
      element.setAttribute("transform", transform);
    }
  };

  return createTransition(updateFn, transitionOptions);
}

// =============================================
// 复杂 SVG 动画
// =============================================

/**
 * 创建 SVG 动画序列
 */
export function createSVGAnimationSequence(
  animations: Array<{
    element: SVGElement;
    type: "attribute" | "transform" | "color" | "path";
    config: any;
    options?: Partial<TransitionConfig>;
    delay?: number;
  }>,
): AnimationController {
  let currentIndex = 0;
  let currentController: AnimationController | null = null;
  let isRunning = false;

  const startNext = () => {
    if (currentIndex >= animations.length) {
      isRunning = false;
      controller.onComplete?.();
      return;
    }

    const animation = animations[currentIndex];
    currentIndex++;

    setTimeout(() => {
      if (!isRunning) return;

      switch (animation.type) {
        case "attribute":
          currentController = animateSVGAttribute(
            animation.element,
            animation.config.attribute,
            animation.config.from,
            animation.config.to,
            animation.options,
          );
          break;
        case "transform":
          currentController = animateSVGTransform(animation.element, animation.config, animation.options);
          break;
        case "color":
          currentController = animateSVGColor(
            animation.element,
            animation.config.attribute,
            animation.config.from,
            animation.config.to,
            animation.options,
          );
          break;
        case "path":
          if (animation.element instanceof SVGPathElement) {
            currentController = drawPath(animation.element, animation.options);
          }
          break;
      }

      if (currentController) {
        currentController.onComplete = startNext;
      }
    }, animation.delay || 0);
  };

  const controller: AnimationController = {
    play() {
      if (isRunning) return;
      isRunning = true;
      currentIndex = 0;
      startNext();
    },

    pause() {
      isRunning = false;
      currentController?.pause();
    },

    stop() {
      isRunning = false;
      currentIndex = 0;
      currentController?.stop();
      currentController = null;
    },

    finish() {
      this.stop();
      controller.onComplete?.();
    },

    reverse() {
      currentController?.reverse();
    },

    get progress() {
      if (!currentController) return 0;
      const segmentProgress = currentController.progress;
      const totalSegments = animations.length;
      const completedSegments = currentIndex - 1;
      return (completedSegments + segmentProgress) / totalSegments;
    },

    get isRunning() {
      return isRunning;
    },

    get isCompleted() {
      return !isRunning && currentIndex >= animations.length;
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
 * 创建 SVG 元素
 */
export function createSVGElement<K extends keyof SVGElementTagNameMap>(
  tagName: K,
  attributes: Record<string, string | number> = {},
): SVGElementTagNameMap[K] {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value.toString());
  });

  return element;
}

/**
 * 获取 SVG 元素边界框
 */
export function getSVGBBox(element: SVGGraphicsElement): DOMRect {
  return element.getBBox();
}
