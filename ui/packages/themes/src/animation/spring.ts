/**
 * 弹簧动画系统
 * 基于物理的弹簧动画实现
 */

import type { EasingFunction, AnimationController } from "../foundation/types";
import { createTransition } from "./transition";

// =============================================
// 弹簧配置接口
// =============================================

export interface SpringConfig {
  /** 弹簧刚度系数 */
  stiffness: number;
  /** 阻尼系数 */
  damping: number;
  /** 质量 */
  mass: number;
  /** 初始速度 */
  initialVelocity: number;
  /** 精度阈值 */
  precision: number;
}

export interface SpringState {
  position: number;
  velocity: number;
  atRest: boolean;
}

// =============================================
// 弹簧系统实现
// =============================================

export class SpringSystem {
  private state: SpringState;
  private config: Required<SpringConfig>;

  constructor(config: Partial<SpringConfig> = {}) {
    this.config = {
      stiffness: 170,
      damping: 26,
      mass: 1,
      initialVelocity: 0,
      precision: 0.001,
      ...config,
    };

    this.state = {
      position: 0,
      velocity: this.config.initialVelocity,
      atRest: false,
    };
  }

  /**
   * 更新弹簧状态
   */
  update(deltaTime: number, targetPosition: number): SpringState {
    if (this.state.atRest) {
      return this.state;
    }

    const { stiffness, damping, mass, precision } = this.config;
    const dt = deltaTime / 1000; // 转换为秒

    // 计算弹簧力
    const springForce = -stiffness * (this.state.position - targetPosition);
    // 计算阻尼力
    const dampingForce = -damping * this.state.velocity;
    // 计算加速度
    const acceleration = (springForce + dampingForce) / mass;

    // 更新速度和位置
    this.state.velocity += acceleration * dt;
    this.state.position += this.state.velocity * dt;

    // 检查是否静止
    const isAtRest =
      Math.abs(this.state.velocity) < precision && Math.abs(this.state.position - targetPosition) < precision;

    if (isAtRest) {
      this.state.position = targetPosition;
      this.state.velocity = 0;
      this.state.atRest = true;
    }

    return { ...this.state };
  }

  /**
   * 重置弹簧状态
   */
  reset(position: number = 0, velocity: number = this.config.initialVelocity): void {
    this.state = {
      position,
      velocity,
      atRest: false,
    };
  }

  /**
   * 获取当前状态
   */
  getState(): SpringState {
    return { ...this.state };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SpringConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// =============================================
// 弹簧缓动函数
// =============================================

/**
 * 创建弹簧缓动函数
 */
export function createSpringEasing(config: Partial<SpringConfig> = {}): EasingFunction {
  const springConfig: Required<SpringConfig> = {
    stiffness: 170,
    damping: 26,
    mass: 1,
    initialVelocity: 0,
    precision: 0.001,
    ...config,
  };

  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    const spring = new SpringSystem(springConfig);
    const duration = estimateSpringDuration(springConfig);
    const currentTime = t * duration;
    const deltaTime = 16; // 假设 60fps

    let time = 0;
    while (time < currentTime && !spring.getState().atRest) {
      spring.update(deltaTime, 1);
      time += deltaTime;
    }

    return spring.getState().position;
  };
}

/**
 * 估算弹簧动画持续时间
 */
export function estimateSpringDuration(config: SpringConfig): number {
  const { stiffness, damping, mass } = config;
  const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));

  if (dampingRatio < 1) {
    // 欠阻尼
    const naturalFreq = Math.sqrt(stiffness / mass);
    const dampedFreq = naturalFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
    return (4 / (dampingRatio * naturalFreq)) * 1000; // 转换为毫秒
  } else {
    // 过阻尼或临界阻尼
    return (4 / Math.sqrt(stiffness / mass)) * 1000;
  }
}

// =============================================
// 弹簧动画创建函数
// =============================================

/**
 * 创建弹簧动画
 */
export function createSpringAnimation(
  updateFn: (value: number) => void,
  from: number = 0,
  to: number = 1,
  config: Partial<SpringConfig> = {},
): AnimationController {
  const spring = new SpringSystem(config);
  spring.reset(from);

  const duration = estimateSpringDuration({ ...spring["config"], ...config });
  let startTime = 0;
  let isRunning = false;

  const tick = (timestamp: number) => {
    if (!isRunning) return;

    if (startTime === 0) {
      startTime = timestamp;
    }

    const elapsed = timestamp - startTime;
    const state = spring.update(16, to); // 假设 60fps

    updateFn(state.position);

    if (!state.atRest && elapsed < duration * 2) {
      // 添加最大持续时间保护
      requestAnimationFrame(tick);
    } else {
      isRunning = false;
      updateFn(to); // 确保最终值正确
      controller.onComplete?.();
    }
  };

  const controller: AnimationController = {
    play() {
      if (isRunning) return;
      isRunning = true;
      startTime = 0;
      requestAnimationFrame(tick);
    },

    pause() {
      isRunning = false;
    },

    stop() {
      isRunning = false;
      startTime = 0;
      spring.reset(from);
    },

    finish() {
      isRunning = false;
      updateFn(to);
      controller.onComplete?.();
    },

    reverse() {
      // 交换起始和结束值
      const currentState = spring.getState();
      spring.reset(to, -currentState.velocity);
      [from, to] = [to, from];
    },

    get progress() {
      const currentPos = spring.getState().position;
      return Math.abs(to - from) > 0 ? (currentPos - from) / (to - from) : 1;
    },

    get isRunning() {
      return isRunning;
    },

    get isCompleted() {
      return !isRunning && spring.getState().atRest;
    },

    onComplete: undefined,
  };

  return controller;
}

/**
 * 弹簧元素动画
 */
export function springElement(
  element: HTMLElement,
  property: string,
  from: number,
  to: number,
  config: Partial<SpringConfig> = {},
  unit: string = "",
): AnimationController {
  const updateFn = (value: number) => {
    element.style.setProperty(property, `${value}${unit}`);
  };

  return createSpringAnimation(updateFn, from, to, config);
}

/**
 * 弹簧变换动画
 */
export function springTransform(
  element: HTMLElement,
  transform: "translateX" | "translateY" | "scale" | "rotate",
  from: number,
  to: number,
  config: Partial<SpringConfig> = {},
): AnimationController {
  const units = {
    translateX: "px",
    translateY: "px",
    scale: "",
    rotate: "deg",
  };

  const updateFn = (value: number) => {
    const unit = units[transform];
    element.style.transform = `${transform}(${value}${unit})`;
  };

  return createSpringAnimation(updateFn, from, to, config);
}

// =============================================
// 预设弹簧配置
// =============================================

export const springPresets = {
  /** 温和弹簧 */
  gentle: {
    stiffness: 120,
    damping: 14,
    mass: 1,
    initialVelocity: 0,
    precision: 0.001,
  },

  /** 活泼弹簧 */
  wobbly: {
    stiffness: 180,
    damping: 12,
    mass: 1,
    initialVelocity: 0,
    precision: 0.001,
  },

  /** 僵硬弹簧 */
  stiff: {
    stiffness: 400,
    damping: 30,
    mass: 1,
    initialVelocity: 0,
    precision: 0.001,
  },

  /** 慢速弹簧 */
  slow: {
    stiffness: 280,
    damping: 60,
    mass: 1,
    initialVelocity: 0,
    precision: 0.001,
  },

  /** 快速弹簧 */
  fast: {
    stiffness: 400,
    damping: 40,
    mass: 1,
    initialVelocity: 0,
    precision: 0.001,
  },
};

// =============================================
// 工具函数
// =============================================

/**
 * 计算临界阻尼
 */
export function calculateCriticalDamping(stiffness: number, mass: number): number {
  return 2 * Math.sqrt(stiffness * mass);
}

/**
 * 检查是否为欠阻尼
 */
export function isUnderdamped(config: SpringConfig): boolean {
  const { stiffness, damping, mass } = config;
  const criticalDamping = calculateCriticalDamping(stiffness, mass);
  return damping < criticalDamping;
}

/**
 * 检查是否为过阻尼
 */
export function isOverdamped(config: SpringConfig): boolean {
  const { stiffness, damping, mass } = config;
  const criticalDamping = calculateCriticalDamping(stiffness, mass);
  return damping > criticalDamping;
}

/**
 * 获取预设配置
 */
export function getSpringPreset(name: keyof typeof springPresets): SpringConfig {
  return { ...springPresets[name] };
}
