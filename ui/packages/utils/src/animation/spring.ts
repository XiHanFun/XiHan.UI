/**
 * 弹簧动画模块
 * 提供基于物理弹簧系统的动画功能
 */

import { createTransition } from "./transition";
import type { TransitionOptions, TransitionController } from "./transition";

/**
 * 弹簧系统配置
 */
export interface SpringConfig {
  /**
   * 弹簧刚度系数
   * 数值越大，弹簧越"硬"
   * 默认值: 170
   */
  stiffness?: number;

  /**
   * 阻尼系数
   * 数值越大，弹簧摆动越快停止
   * 默认值: 26
   */
  damping?: number;

  /**
   * 质量
   * 影响整体动画速度
   * 默认值: 1
   */
  mass?: number;

  /**
   * 初始速度
   * 默认值: 0
   */
  initialVelocity?: number;

  /**
   * 精度阈值
   * 当位置和速度小于此值时认为动画结束
   * 默认值: 0.001
   */
  precision?: number;

  /**
   * 是否启用弹跳
   * 默认值: false
   */
  allowsOverdamping?: boolean;

  /**
   * 重力影响
   * 默认值: 0
   */
  gravity?: number;
}

/**
 * 弹簧状态
 */
export interface SpringState {
  /**
   * 当前位置
   */
  position: number;

  /**
   * 当前速度
   */
  velocity: number;

  /**
   * 是否静止
   */
  atRest: boolean;
}

/**
 * 预定义的弹簧配置
 */
export const SpringPresets = {
  /**
   * 默认弹簧
   * 平衡的阻尼和刚度，适用于大多数一般情况
   */
  default: {
    stiffness: 170,
    damping: 26,
    mass: 1,
  },

  /**
   * 轻柔弹簧
   * 低刚度和适度阻尼，产生轻柔缓慢的动画
   */
  gentle: {
    stiffness: 120,
    damping: 14,
    mass: 1,
  },

  /**
   * 弹性弹跳
   * 高刚度和低阻尼，产生明显的弹跳效果
   */
  bouncy: {
    stiffness: 280,
    damping: 18,
    mass: 1,
  },

  /**
   * 快速弹簧
   * 高刚度和高阻尼，快速到达目标位置
   */
  snappy: {
    stiffness: 280,
    damping: 28,
    mass: 0.8,
  },

  /**
   * 慢速弹簧
   * 低刚度和高阻尼，缓慢且平滑移动
   */
  slow: {
    stiffness: 90,
    damping: 22,
    mass: 2,
  },

  /**
   * 精确弹簧
   * 高阻尼消除弹跳，适合需要精确定位的情况
   */
  precise: {
    stiffness: 210,
    damping: 32,
    mass: 1,
  },

  /**
   * 微弹性
   * 微小的弹跳效果，自然又不过分
   */
  wobbly: {
    stiffness: 180,
    damping: 12,
    mass: 1,
  },
};

/**
 * 创建弹簧动画系统
 * @param config 弹簧配置
 * @returns 弹簧动画系统
 */
export function createSpringSystem(config: SpringConfig = {}) {
  const {
    stiffness = 170,
    damping = 26,
    mass = 1,
    initialVelocity = 0,
    precision = 0.001,
    allowsOverdamping = false,
    gravity = 0,
  } = config;

  // 弹簧状态
  const state: SpringState = {
    position: 0,
    velocity: initialVelocity,
    atRest: false,
  };

  /**
   * 更新弹簧状态，使用 RK4 积分器
   * @param dt 时间步长
   * @param targetPosition 目标位置
   */
  const update = (dt: number, targetPosition: number) => {
    // 简化的 RK4 积分方法
    const acceleration = (x: number, v: number) => {
      // 弹簧力 = -stiffness * (position - target)
      const springForce = -stiffness * (x - targetPosition);

      // 阻尼力 = -damping * velocity
      const dampingForce = -damping * v;

      // 重力力 = mass * gravity
      const gravityForce = mass * gravity;

      // F = ma, a = F/m
      return (springForce + dampingForce + gravityForce) / mass;
    };

    // RK4 积分步骤
    const k1v = acceleration(state.position, state.velocity);
    const k1x = state.velocity;

    const k2v = acceleration(state.position + (k1x * dt) / 2, state.velocity + (k1v * dt) / 2);
    const k2x = state.velocity + (k1v * dt) / 2;

    const k3v = acceleration(state.position + (k2x * dt) / 2, state.velocity + (k2v * dt) / 2);
    const k3x = state.velocity + (k2v * dt) / 2;

    const k4v = acceleration(state.position + k3x * dt, state.velocity + k3v * dt);
    const k4x = state.velocity + k3v * dt;

    // 更新位置和速度
    const newPosition = state.position + ((k1x + 2 * k2x + 2 * k3x + k4x) * dt) / 6;
    const newVelocity = state.velocity + ((k1v + 2 * k2v + 2 * k3v + k4v) * dt) / 6;

    // 更新状态
    state.position = newPosition;
    state.velocity = newVelocity;

    // 检查是否达到静止状态
    state.atRest = Math.abs(state.position - targetPosition) < precision && Math.abs(state.velocity) < precision;

    if (state.atRest) {
      state.position = targetPosition;
      state.velocity = 0;
    }
  };

  /**
   * 重置弹簧状态
   * @param position 初始位置
   * @param velocity 初始速度
   */
  const reset = (position: number = 0, velocity: number = initialVelocity) => {
    state.position = position;
    state.velocity = velocity;
    state.atRest = false;
  };

  return {
    update,
    reset,
    getState: () => ({ ...state }),
  };
}

/**
 * 弹簧动画选项
 */
export interface SpringAnimationOptions extends TransitionOptions {
  /**
   * 弹簧配置
   */
  spring?: SpringConfig;

  /**
   * 起始位置
   * 默认值: 0
   */
  from?: number;

  /**
   * 目标位置
   * 默认值: 1
   */
  to?: number;

  /**
   * 最大动画时长 (毫秒)
   * 即使弹簧仍在运动，也会在此时间后强制结束
   * 默认值: 2000
   */
  maxDuration?: number;
}

/**
 * 创建弹簧动画
 * @param update 更新函数，接收当前位置 (from -> to 的映射值)
 * @param options 弹簧动画选项
 * @returns 动画控制器
 */
export function createSpringAnimation(
  update: (value: number) => void,
  options: SpringAnimationOptions = {},
): TransitionController {
  const { spring = SpringPresets.default, from = 0, to = 1, maxDuration = 2000, ...transitionOptions } = options;

  // 创建弹簧系统
  const springSystem = createSpringSystem(spring);
  springSystem.reset(0); // 从归一化的 0 开始

  // 跟踪系统时间和动画时间
  let elapsed = 0;
  const fps = 60;
  const frameDuration = 1000 / fps;
  const dtSeconds = 1 / fps;

  // 创建动画更新函数
  const springUpdate = (progress: number) => {
    // 使用时间驱动弹簧系统
    elapsed += frameDuration * progress;

    // 更新弹簧状态
    springSystem.update(dtSeconds, 1); // 目标归一化为 1

    // 获取当前弹簧位置
    const { position, atRest } = springSystem.getState();

    // 将弹簧位置映射到 from -> to 范围
    const value = from + position * (to - from);

    // 调用更新函数
    update(value);

    // 检查是否应该结束动画
    return atRest || elapsed >= maxDuration;
  };

  // 使用自定义进度计算的过渡动画
  return createTransition(
    progress => {
      // 在这里 progress 是线性时间的进度，仅用于计时
      // 实际的动画进度由弹簧系统决定
      const shouldEnd = springUpdate(1);

      // 如果弹簧系统表示动画应该结束，强制完成过渡
      if (shouldEnd && progress < 1) {
        // 在下一帧强制完成
        setTimeout(() => {
          transitionOptions.onComplete?.();
        }, 0);
      }
    },
    {
      duration: maxDuration,
      ...transitionOptions,
    },
  );
}

/**
 * 创建元素的弹性过渡
 * @param element 目标 DOM 元素
 * @param property CSS 属性名
 * @param from 起始值
 * @param to 结束值
 * @param options 弹簧动画选项
 * @returns 动画控制器
 */
export function springTransition(
  element: HTMLElement,
  property: string,
  from: number,
  to: number,
  options: SpringAnimationOptions & { unit?: string } = {},
): TransitionController {
  const { unit = "px", ...springOptions } = options;

  return createSpringAnimation(
    value => {
      element.style[property as any] = `${value}${unit}`;
    },
    {
      from,
      to,
      ...springOptions,
    },
  );
}

/**
 * 创建元素的弹性变换
 * @param element 目标 DOM 元素
 * @param transform 变换类型
 * @param from 起始值
 * @param to 结束值
 * @param options 弹簧动画选项
 * @returns 动画控制器
 */
export function springTransform(
  element: HTMLElement,
  transform: "translateX" | "translateY" | "scale" | "rotate",
  from: number,
  to: number,
  options: SpringAnimationOptions & { unit?: string } = {},
): TransitionController {
  const { unit = transform.startsWith("translate") ? "px" : transform === "rotate" ? "deg" : "", ...springOptions } =
    options;

  return createSpringAnimation(
    value => {
      element.style.transform = `${transform}(${value}${unit})`;
    },
    {
      from,
      to,
      ...springOptions,
    },
  );
}

/**
 * 弹性滑入效果
 * @param element 目标 DOM 元素
 * @param direction 滑动方向
 * @param options 弹簧动画选项
 * @returns 动画控制器
 */
export function springIn(
  element: HTMLElement,
  direction: "top" | "bottom" | "left" | "right" = "bottom",
  options: SpringAnimationOptions = {},
): TransitionController {
  // 确保元素可见
  const originalDisplay = element.style.display === "none" ? "" : element.style.display;
  element.style.display = originalDisplay || "";

  // 获取元素尺寸
  const rect = element.getBoundingClientRect();

  // 设置初始状态
  const isVertical = direction === "top" || direction === "bottom";
  const size = isVertical ? rect.height : rect.width;
  const transformProp = isVertical ? "translateY" : "translateX";
  const from = direction === "bottom" || direction === "right" ? size : -size;
  const to = 0;

  return springTransform(element, transformProp as any, from, to, {
    spring: SpringPresets.bouncy,
    ...options,
    onStart: () => {
      if (options.onStart) options.onStart();
    },
    onComplete: () => {
      if (options.onComplete) options.onComplete();
    },
  });
}

/**
 * 弹性滑出效果
 * @param element 目标 DOM 元素
 * @param direction 滑动方向
 * @param options 弹簧动画选项
 * @returns 动画控制器
 */
export function springOut(
  element: HTMLElement,
  direction: "top" | "bottom" | "left" | "right" = "bottom",
  options: SpringAnimationOptions = {},
): TransitionController {
  // 获取元素尺寸
  const rect = element.getBoundingClientRect();

  // 设置初始状态
  const isVertical = direction === "top" || direction === "bottom";
  const size = isVertical ? rect.height : rect.width;
  const transformProp = isVertical ? "translateY" : "translateX";
  const from = 0;
  const to = direction === "bottom" || direction === "right" ? size : -size;

  return springTransform(element, transformProp as any, from, to, {
    spring: SpringPresets.gentle,
    ...options,
    onComplete: () => {
      // 隐藏元素
      element.style.display = "none";
      if (options.onComplete) options.onComplete();
    },
  });
}

/**
 * 根据弹簧参数计算临界阻尼
 * @param stiffness 弹簧刚度
 * @param mass 质量
 * @returns 临界阻尼值
 */
export function calculateCriticalDamping(stiffness: number, mass: number): number {
  return 2 * Math.sqrt(stiffness * mass);
}

/**
 * 判断弹簧系统是否为欠阻尼（会震荡）
 * @param config 弹簧配置
 * @returns 是否为欠阻尼
 */
export function isUnderdamped(config: SpringConfig): boolean {
  const { stiffness = 170, damping = 26, mass = 1 } = config;
  const criticalDamping = calculateCriticalDamping(stiffness, mass);
  return damping < criticalDamping;
}

/**
 * 判断弹簧系统是否为过阻尼（不会震荡）
 * @param config 弹簧配置
 * @returns 是否为过阻尼
 */
export function isOverdamped(config: SpringConfig): boolean {
  const { stiffness = 170, damping = 26, mass = 1 } = config;
  const criticalDamping = calculateCriticalDamping(stiffness, mass);
  return damping > criticalDamping;
}

/**
 * 估计弹簧动画的持续时间
 * @param config 弹簧配置
 * @param threshold 静止阈值
 * @returns 估计的持续时间 (毫秒)
 */
export function estimateSpringDuration(config: SpringConfig, threshold: number = 0.001): number {
  const { stiffness = 170, damping = 26, mass = 1 } = config;

  // 对于欠阻尼系统，使用震荡模型
  if (isUnderdamped(config)) {
    // 欠阻尼弹簧的估计时间计算
    const omega = Math.sqrt(stiffness / mass);
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));

    // 估计时间 (秒)
    const duration = -Math.log(threshold) / (zeta * omega);

    // 返回毫秒
    return duration * 1000;
  }
  // 对于临界阻尼或过阻尼系统，使用指数衰减模型
  else {
    // 过阻尼弹簧的估计时间计算
    const base = Math.E;
    const rate = Math.sqrt(stiffness / mass) / damping;

    // 估计时间 (秒)
    const duration = Math.log(1 / threshold) / rate;

    // 返回毫秒
    return duration * 1000;
  }
}

// 同时提供命名空间对象
export const spring = {
  createSpringSystem,
  createSpringAnimation,
  springTransition,
  springTransform,
  springIn,
  springOut,
  SpringPresets,
  calculateCriticalDamping,
  isUnderdamped,
  isOverdamped,
  estimateSpringDuration,
};

// 默认导出命名空间对象
export default spring;
