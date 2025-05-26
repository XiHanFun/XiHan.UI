/**
 * 缓动函数模块
 * 提供各种常用的缓动函数，用于创建自然流畅的动画效果
 */

/**
 * 缓动函数类型
 * @param t 当前时间点 (0-1 之间的值)
 * @returns 对应的缓动值 (通常也在 0-1 之间，但某些函数可能会超出该范围)
 */
export type EasingFunction = (t: number) => number;

/**
 * 缓动函数库
 */
export const Easing = {
  /**
   * 线性缓动
   * 匀速运动，无缓动效果
   */
  linear: (t: number): number => t,

  /**
   * 二次方缓入 (t²)
   * 动画开始时速度较慢，然后加速
   */
  easeInQuad: (t: number): number => t * t,

  /**
   * 二次方缓出 (1-(1-t)²)
   * 动画开始时速度较快，然后减速
   */
  easeOutQuad: (t: number): number => t * (2 - t),

  /**
   * 二次方缓入缓出
   * 动画开始和结束时速度较慢，中间较快
   */
  easeInOutQuad: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },

  /**
   * 三次方缓入 (t³)
   * 比二次方缓入更强的缓入效果
   */
  easeInCubic: (t: number): number => t * t * t,

  /**
   * 三次方缓出 (1-(1-t)³)
   * 比二次方缓出更强的缓出效果
   */
  easeOutCubic: (t: number): number => --t * t * t + 1,

  /**
   * 三次方缓入缓出
   * 比二次方缓入缓出更强的效果
   */
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },

  /**
   * 四次方缓入 (t⁴)
   */
  easeInQuart: (t: number): number => t * t * t * t,

  /**
   * 四次方缓出 (1-(1-t)⁴)
   */
  easeOutQuart: (t: number): number => 1 - --t * t * t * t,

  /**
   * 四次方缓入缓出
   */
  easeInOutQuart: (t: number): number => {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  },

  /**
   * 五次方缓入 (t⁵)
   */
  easeInQuint: (t: number): number => t * t * t * t * t,

  /**
   * 五次方缓出 (1-(1-t)⁵)
   */
  easeOutQuint: (t: number): number => 1 + --t * t * t * t * t,

  /**
   * 五次方缓入缓出
   */
  easeInOutQuint: (t: number): number => {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  },

  /**
   * 正弦缓入
   */
  easeInSine: (t: number): number => -Math.cos((t * Math.PI) / 2) + 1,

  /**
   * 正弦缓出
   */
  easeOutSine: (t: number): number => Math.sin((t * Math.PI) / 2),

  /**
   * 正弦缓入缓出
   */
  easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,

  /**
   * 指数缓入
   */
  easeInExpo: (t: number): number => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),

  /**
   * 指数缓出
   */
  easeOutExpo: (t: number): number => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),

  /**
   * 指数缓入缓出
   */
  easeInOutExpo: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 10 * (2 * t - 1)) / 2;
    return (2 - Math.pow(2, -10 * (2 * t - 1))) / 2;
  },

  /**
   * 圆形缓入
   */
  easeInCirc: (t: number): number => 1 - Math.sqrt(1 - t * t),

  /**
   * 圆形缓出
   */
  easeOutCirc: (t: number): number => Math.sqrt(1 - --t * t),

  /**
   * 圆形缓入缓出
   */
  easeInOutCirc: (t: number): number => {
    return t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
  },

  /**
   * 弹性缓入
   */
  easeInElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },

  /**
   * 弹性缓出
   */
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  /**
   * 弹性缓入缓出
   */
  easeInOutElastic: (t: number): number => {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },

  /**
   * 反弹缓入
   */
  easeInBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },

  /**
   * 反弹缓出
   */
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  /**
   * 反弹缓入缓出
   */
  easeInOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  /**
   * 弹跳缓入
   */
  easeInBounce: (t: number): number => 1 - Easing.easeOutBounce(1 - t),

  /**
   * 弹跳缓出
   */
  easeOutBounce: (t: number): number => {
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

  /**
   * 弹跳缓入缓出
   */
  easeInOutBounce: (t: number): number => {
    return t < 0.5 ? (1 - Easing.easeOutBounce(1 - 2 * t)) / 2 : (1 + Easing.easeOutBounce(2 * t - 1)) / 2;
  },

  /**
   * 步进函数 - 将动画分为指定数量的步进
   * @param steps 步进数量
   * @param stepFunction 步进位置函数 (start 在步进开始时变化，end 在步进结束时变化)
   */
  steps: (steps: number, stepFunction: "start" | "end" = "end"): EasingFunction => {
    return (t: number) => {
      const nextStep = Math.floor(steps * t);
      if (stepFunction === "start") {
        return nextStep / steps;
      } else {
        // 'end'
        return t === 1 ? 1 : nextStep / steps;
      }
    };
  },

  /**
   * 自定义贝塞尔曲线
   * @param x1 第一个控制点 X 坐标
   * @param y1 第一个控制点 Y 坐标
   * @param x2 第二个控制点 X 坐标
   * @param y2 第二个控制点 Y 坐标
   */
  cubicBezier: (x1: number, y1: number, x2: number, y2: number): EasingFunction => {
    return (t: number) => {
      // 常见的预定义贝塞尔曲线
      if (x1 === 0.25 && y1 === 0.1 && x2 === 0.25 && y2 === 1) {
        return Easing.easeInOutQuad(t); // ease-in-out
      }
      if (x1 === 0.42 && y1 === 0 && x2 === 1 && y2 === 1) {
        return Easing.easeInQuad(t); // ease-in
      }
      if (x1 === 0 && y1 === 0 && x2 === 0.58 && y2 === 1) {
        return Easing.easeOutQuad(t); // ease-out
      }

      // 自定义贝塞尔曲线的计算 (使用逼近算法)
      // 注意：这是一个简化实现，实际应用中可能需要更精确的算法
      return bezierApprox(t, x1, y1, x2, y2);
    };
  },
};

/**
 * 预定义的常用贝塞尔曲线
 */
export const BezierPresets = {
  ease: Easing.cubicBezier(0.25, 0.1, 0.25, 1),
  easeIn: Easing.cubicBezier(0.42, 0, 1, 1),
  easeOut: Easing.cubicBezier(0, 0, 0.58, 1),
  easeInOut: Easing.cubicBezier(0.42, 0, 0.58, 1),
  linear: Easing.cubicBezier(0, 0, 1, 1),
  // Material Design 风格的曲线
  standard: Easing.cubicBezier(0.4, 0, 0.2, 1),
  decelerated: Easing.cubicBezier(0, 0, 0.2, 1),
  accelerated: Easing.cubicBezier(0.4, 0, 1, 1),
};

/**
 * 贝塞尔曲线近似计算
 * 使用牛顿迭代法解决贝塞尔曲线的 t 值问题
 */
function bezierApprox(t: number, x1: number, y1: number, x2: number, y2: number): number {
  // 最大迭代次数
  const MAX_ITERATIONS = 10;
  // 收敛阈值
  const EPSILON = 1e-6;

  // 初始猜测
  let tCurrent = t;

  // 三次贝塞尔曲线 x 坐标计算函数
  function bezierX(t: number): number {
    return 3 * t * (1 - t) * (1 - t) * x1 + 3 * t * t * (1 - t) * x2 + t * t * t;
  }

  // 三次贝塞尔曲线 x 坐标的导数
  function bezierXDerivative(t: number): number {
    return 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2);
  }

  // 牛顿迭代法
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const xCurrent = bezierX(tCurrent) - t;

    if (Math.abs(xCurrent) < EPSILON) {
      break;
    }

    const xDerivative = bezierXDerivative(tCurrent);

    if (Math.abs(xDerivative) < EPSILON) {
      break;
    }

    tCurrent -= xCurrent / xDerivative;
  }

  // 计算对应的 y 值
  return (
    3 * tCurrent * (1 - tCurrent) * (1 - tCurrent) * y1 +
    3 * tCurrent * tCurrent * (1 - tCurrent) * y2 +
    tCurrent * tCurrent * tCurrent
  );
}

/**
 * 缓动函数组合
 * 将多个缓动函数按比例组合使用
 * @param easings 缓动函数数组，每个元素为 [缓动函数, 权重]
 * @returns 组合后的缓动函数
 */
export function composeEasing(easings: Array<[EasingFunction, number]>): EasingFunction {
  // 计算总权重
  const totalWeight = easings.reduce((sum, [_, weight]) => sum + weight, 0);

  return (t: number) => {
    let result = 0;
    for (const [easing, weight] of easings) {
      result += easing(t) * (weight / totalWeight);
    }
    return result;
  };
}

/**
 * 缓动函数序列
 * 按照时间段依次使用不同的缓动函数
 * @param sequence 缓动函数序列，每个元素为 [缓动函数, 时间段结束点]，结束点范围在 0-1 之间
 * @returns 序列化的缓动函数
 */
export function sequenceEasing(sequence: Array<[EasingFunction, number]>): EasingFunction {
  // 按结束点排序
  const sortedSeq = [...sequence].sort((a, b) => a[1] - b[1]);

  return (t: number) => {
    // 确保 t 在 0-1 范围内
    t = Math.max(0, Math.min(1, t));

    let prevEndPoint = 0;

    for (const [easing, endPoint] of sortedSeq) {
      if (t <= endPoint) {
        // 归一化当前段内的 t 值
        const segmentT = (t - prevEndPoint) / (endPoint - prevEndPoint);
        return easing(segmentT);
      }
      prevEndPoint = endPoint;
    }

    // 如果 t 超过最后一个点，使用最后一个缓动函数
    const lastEasing = sortedSeq[sortedSeq.length - 1][0];
    return lastEasing(1);
  };
}

/**
 * 缓动函数镜像
 * 创建一个镜像效果的缓动函数
 * @param easing 原始缓动函数
 * @param mode 镜像模式: 'in-out' 前半段正向后半段反向, 'out-in' 前半段反向后半段正向
 * @returns 镜像缓动函数
 */
export function mirrorEasing(easing: EasingFunction, mode: "in-out" | "out-in" = "in-out"): EasingFunction {
  return (t: number) => {
    if (mode === "in-out") {
      return t < 0.5 ? easing(t * 2) / 2 : 1 - easing((1 - t) * 2) / 2;
    } else {
      // 'out-in'
      return t < 0.5 ? (1 - easing(1 - t * 2)) / 2 : 0.5 + easing((t - 0.5) * 2) / 2;
    }
  };
}
