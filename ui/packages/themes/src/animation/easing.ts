/**
 * 缓动函数库
 * 统一的缓动函数实现，支持自定义和预设缓动
 */

import type { EasingFunction } from "../foundation/types";

// =============================================
// 基础缓动函数
// =============================================

/**
 * 线性缓动
 */
export const linear: EasingFunction = (t: number) => t;

/**
 * 二次缓动
 */
export const quad = {
  in: (t: number) => t * t,
  out: (t: number) => t * (2 - t),
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
};

/**
 * 三次缓动
 */
export const cubic = {
  in: (t: number) => t * t * t,
  out: (t: number) => --t * t * t + 1,
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
};

/**
 * 四次缓动
 */
export const quart = {
  in: (t: number) => t * t * t * t,
  out: (t: number) => 1 - --t * t * t * t,
  inOut: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
};

/**
 * 五次缓动
 */
export const quint = {
  in: (t: number) => t * t * t * t * t,
  out: (t: number) => 1 + --t * t * t * t * t,
  inOut: (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t),
};

/**
 * 正弦缓动
 */
export const sine = {
  in: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  out: (t: number) => Math.sin((t * Math.PI) / 2),
  inOut: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};

/**
 * 指数缓动
 */
export const expo = {
  in: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  out: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOut: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
};

/**
 * 圆形缓动
 */
export const circ = {
  in: (t: number) => 1 - Math.sqrt(1 - t * t),
  out: (t: number) => Math.sqrt(1 - --t * t),
  inOut: (t: number) => (t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2),
};

/**
 * 回弹缓动
 */
export const back = {
  in: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  out: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  inOut: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
};

/**
 * 弹性缓动
 */
export const elastic = {
  in: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  out: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  inOut: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
};

/**
 * 弹跳缓动
 */
export const bounce = {
  in: (t: number) => 1 - bounce.out(1 - t),
  out: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  inOut: (t: number) => (t < 0.5 ? (1 - bounce.out(1 - 2 * t)) / 2 : (1 + bounce.out(2 * t - 1)) / 2),
};

// =============================================
// 贝塞尔曲线缓动
// =============================================

/**
 * 创建三次贝塞尔缓动函数
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): EasingFunction {
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    // 使用牛顿-拉夫逊方法求解
    let currentT = t;
    for (let i = 0; i < 8; i++) {
      const currentX = bezierX(currentT, x1, x2);
      const currentSlope = bezierXDerivative(currentT, x1, x2);

      if (Math.abs(currentX - t) < 0.001) {
        break;
      }

      if (Math.abs(currentSlope) < 0.001) {
        break;
      }

      currentT -= (currentX - t) / currentSlope;
    }

    return bezierY(currentT, y1, y2);
  };
}

function bezierX(t: number, x1: number, x2: number): number {
  return 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
}

function bezierY(t: number, y1: number, y2: number): number {
  return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
}

function bezierXDerivative(t: number, x1: number, x2: number): number {
  return 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
}

// =============================================
// 预设缓动
// =============================================

export const presets = {
  // CSS 标准缓动
  ease: cubicBezier(0.25, 0.1, 0.25, 1),
  easeIn: cubicBezier(0.42, 0, 1, 1),
  easeOut: cubicBezier(0, 0, 0.58, 1),
  easeInOut: cubicBezier(0.42, 0, 0.58, 1),

  // 自然缓动
  natural: cubicBezier(0.4, 0, 0.2, 1),
  smooth: cubicBezier(0.4, 0, 0.6, 1),
  sharp: cubicBezier(0.4, 0, 1, 1),

  // 弹性缓动
  spring: cubicBezier(0.175, 0.885, 0.32, 1.275),
  bounce: bounce.out,
  elastic: elastic.out,

  // 快速缓动
  fast: cubicBezier(0.4, 0, 1, 1),
  slow: cubicBezier(0, 0, 0.2, 1),
};

// =============================================
// 高级缓动工具
// =============================================

/**
 * 步进缓动
 */
export function steps(steps: number, stepFunction: "start" | "end" = "end"): EasingFunction {
  return (t: number) => {
    const step = Math.floor(t * steps);
    const progress = stepFunction === "start" ? step / steps : (step + 1) / steps;
    return Math.min(progress, 1);
  };
}

/**
 * 组合缓动函数
 */
export function composeEasing(easings: Array<[EasingFunction, number]>): EasingFunction {
  const totalWeight = easings.reduce((sum, [, weight]) => sum + weight, 0);

  return (t: number) => {
    let result = 0;
    for (const [easing, weight] of easings) {
      result += easing(t) * (weight / totalWeight);
    }
    return result;
  };
}

/**
 * 序列缓动函数
 */
export function sequenceEasing(sequence: Array<[EasingFunction, number]>): EasingFunction {
  const totalDuration = sequence.reduce((sum, [, duration]) => sum + duration, 0);

  return (t: number) => {
    let elapsed = 0;
    for (const [easing, duration] of sequence) {
      const segmentEnd = (elapsed + duration) / totalDuration;
      if (t <= segmentEnd) {
        const segmentStart = elapsed / totalDuration;
        const segmentProgress = (t - segmentStart) / (duration / totalDuration);
        return easing(Math.max(0, Math.min(1, segmentProgress)));
      }
      elapsed += duration;
    }
    return 1;
  };
}

/**
 * 镜像缓动函数
 */
export function mirrorEasing(easing: EasingFunction, mode: "in-out" | "out-in" = "in-out"): EasingFunction {
  return (t: number) => {
    if (mode === "in-out") {
      return t < 0.5 ? easing(t * 2) / 2 : 1 - easing((1 - t) * 2) / 2;
    } else {
      return t < 0.5 ? 1 - easing((0.5 - t) * 2) / 2 : easing((t - 0.5) * 2) / 2 + 0.5;
    }
  };
}

/**
 * 反转缓动函数
 */
export function reverseEasing(easing: EasingFunction): EasingFunction {
  return (t: number) => 1 - easing(1 - t);
}

/**
 * 延迟缓动函数
 */
export function delayEasing(easing: EasingFunction, delay: number): EasingFunction {
  return (t: number) => {
    if (t < delay) return 0;
    return easing((t - delay) / (1 - delay));
  };
}

// =============================================
// 缓动工具函数
// =============================================

/**
 * 获取所有预设缓动名称
 */
export function getPresetNames(): string[] {
  return Object.keys(presets);
}

/**
 * 根据名称获取预设缓动
 */
export function getPreset(name: string): EasingFunction | undefined {
  return presets[name as keyof typeof presets];
}

/**
 * 检查是否为有效的缓动函数
 */
export function isValidEasing(easing: unknown): easing is EasingFunction {
  return typeof easing === "function";
}

/**
 * 创建自定义缓动函数
 */
export function createCustomEasing(config: { type: "bezier" | "spring" | "steps"; params: number[] }): EasingFunction {
  switch (config.type) {
    case "bezier":
      const [x1, y1, x2, y2] = config.params;
      return cubicBezier(x1, y1, x2, y2);
    case "steps":
      const [stepCount, stepType] = config.params;
      return steps(stepCount, stepType === 1 ? "start" : "end");
    default:
      return linear;
  }
}
