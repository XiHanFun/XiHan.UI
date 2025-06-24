/**
 * 波纹动画系统
 * 统一的波纹效果实现
 */

import type { AnimationController } from "../foundation/types";
import { createTransition } from "./transition";

// =============================================
// 波纹配置接口
// =============================================

export interface RippleOptions {
  /** 波纹颜色 */
  color?: string;
  /** 波纹持续时间(ms) */
  duration?: number;
  /** 波纹大小 */
  size?: number;
  /** 波纹透明度 */
  opacity?: number;
  /** 波纹缩放比例 */
  scale?: number;
}

// =============================================
// 波纹效果实现
// =============================================

/**
 * 创建波纹效果
 */
export function createRippleEffect(
  element: HTMLElement,
  event: MouseEvent,
  options: RippleOptions = {},
): AnimationController {
  const { color = "currentColor", duration = 600, size = 100, opacity = 0.3, scale = 2 } = options;

  // 获取点击位置
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // 创建波纹元素
  const ripple = document.createElement("div");
  ripple.className = "xh-ripple";
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background-color: ${color};
    width: ${size}px;
    height: ${size}px;
    left: ${x - size / 2}px;
    top: ${y - size / 2}px;
    opacity: ${opacity};
    transform: scale(0);
    pointer-events: none;
  `;

  // 添加到容器
  element.appendChild(ripple);

  // 创建动画
  const controller = createTransition(
    progress => {
      ripple.style.transform = `scale(${progress * scale})`;
      ripple.style.opacity = `${opacity * (1 - progress)}`;
    },
    {
      duration,
      easing: t => t * (2 - t), // ease-out
    },
  );

  // 动画结束后移除波纹元素
  controller.onComplete = () => {
    ripple.remove();
  };

  return controller;
}

/**
 * 创建波纹容器
 */
export function createRippleContainer(element: HTMLElement): void {
  element.style.position = "relative";
  element.style.overflow = "hidden";
}

/**
 * 添加波纹事件监听
 */
export function addRippleListener(element: HTMLElement, options: RippleOptions = {}): () => void {
  createRippleContainer(element);

  const handleClick = (event: MouseEvent) => {
    createRippleEffect(element, event, options);
  };

  element.addEventListener("click", handleClick);

  return () => {
    element.removeEventListener("click", handleClick);
  };
}

// =============================================
// 预设波纹效果
// =============================================

export const ripplePresets = {
  /** 默认波纹 */
  default: {
    color: "currentColor",
    duration: 600,
    size: 100,
    opacity: 0.3,
    scale: 2,
  },

  /** 强调波纹 */
  emphasis: {
    color: "currentColor",
    duration: 800,
    size: 120,
    opacity: 0.4,
    scale: 2.5,
  },

  /** 柔和波纹 */
  soft: {
    color: "currentColor",
    duration: 500,
    size: 80,
    opacity: 0.2,
    scale: 1.8,
  },
};
