/**
 * DOM 动画工具
 */

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number | "infinite";
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  fillMode?: "none" | "forwards" | "backwards" | "both";
}

export interface TransitionOptions {
  property?: string;
  duration?: number;
  easing?: string;
  delay?: number;
}

/**
 * CSS 动画工具
 */
export const animation = {
  /**
   * 播放 CSS 动画
   */
  play(element: HTMLElement, keyframes: string, options: AnimationOptions = {}): Animation {
    const {
      duration = 300,
      easing = "ease",
      delay = 0,
      iterations = 1,
      direction = "normal",
      fillMode = "both",
    } = options;

    const animationName = `animation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 创建样式表
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ${animationName} {
        ${keyframes}
      }
    `;
    document.head.appendChild(style);

    // 应用动画
    element.style.animation = `${animationName} ${duration}ms ${easing} ${delay}ms ${iterations} ${direction} ${fillMode}`;

    // 清理函数
    const cleanup = () => {
      element.style.animation = "";
      document.head.removeChild(style);
    };

    // 监听动画结束
    const promise = new Promise<void>(resolve => {
      const handleEnd = () => {
        cleanup();
        element.removeEventListener("animationend", handleEnd);
        element.removeEventListener("animationcancel", handleEnd);
        resolve();
      };

      element.addEventListener("animationend", handleEnd);
      element.addEventListener("animationcancel", handleEnd);
    });

    // 返回简化的动画控制对象
    return {
      finished: promise,
      cancel: () => {
        cleanup();
        element.getAnimations().forEach(anim => anim.cancel());
      },
      pause: () => {
        element.getAnimations().forEach(anim => anim.pause());
      },
      play: () => {
        element.getAnimations().forEach(anim => anim.play());
      },
    } as any;
  },

  /**
   * 淡入动画
   */
  fadeIn(element: HTMLElement, duration = 300): Promise<void> {
    return new Promise(resolve => {
      element.style.opacity = "0";
      element.style.display = "block";

      const animation = element.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration,
        easing: "ease-out",
        fill: "forwards",
      });

      animation.addEventListener("finish", () => {
        element.style.opacity = "";
        resolve();
      });
    });
  },

  /**
   * 淡出动画
   */
  fadeOut(element: HTMLElement, duration = 300): Promise<void> {
    return new Promise(resolve => {
      const animation = element.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration,
        easing: "ease-out",
        fill: "forwards",
      });

      animation.addEventListener("finish", () => {
        element.style.display = "none";
        element.style.opacity = "";
        resolve();
      });
    });
  },

  /**
   * 滑入动画
   */
  slideDown(element: HTMLElement, duration = 300): Promise<void> {
    return new Promise(resolve => {
      const height = element.scrollHeight;
      element.style.height = "0";
      element.style.overflow = "hidden";
      element.style.display = "block";

      const animation = element.animate([{ height: "0px" }, { height: `${height}px` }], {
        duration,
        easing: "ease-out",
        fill: "forwards",
      });

      animation.addEventListener("finish", () => {
        element.style.height = "";
        element.style.overflow = "";
        resolve();
      });
    });
  },

  /**
   * 滑出动画
   */
  slideUp(element: HTMLElement, duration = 300): Promise<void> {
    return new Promise(resolve => {
      const height = element.scrollHeight;
      element.style.height = `${height}px`;
      element.style.overflow = "hidden";

      const animation = element.animate([{ height: `${height}px` }, { height: "0px" }], {
        duration,
        easing: "ease-out",
        fill: "forwards",
      });

      animation.addEventListener("finish", () => {
        element.style.display = "none";
        element.style.height = "";
        element.style.overflow = "";
        resolve();
      });
    });
  },

  /**
   * 缩放动画
   */
  scale(element: HTMLElement, from = 0, to = 1, duration = 300): Promise<void> {
    return new Promise(resolve => {
      const animation = element.animate(
        [
          { transform: `scale(${from})`, opacity: from === 0 ? 0 : 1 },
          { transform: `scale(${to})`, opacity: to === 0 ? 0 : 1 },
        ],
        { duration, easing: "ease-out", fill: "forwards" },
      );

      animation.addEventListener("finish", () => {
        if (to === 0) {
          element.style.display = "none";
        }
        element.style.transform = "";
        element.style.opacity = "";
        resolve();
      });
    });
  },

  /**
   * 弹跳动画
   */
  bounce(element: HTMLElement, duration = 600): Promise<void> {
    return new Promise(resolve => {
      const animation = element.animate(
        [
          { transform: "translateY(0)" },
          { transform: "translateY(-20px)" },
          { transform: "translateY(0)" },
          { transform: "translateY(-10px)" },
          { transform: "translateY(0)" },
        ],
        { duration, easing: "ease-out" },
      );

      animation.addEventListener("finish", () => {
        resolve();
      });
    });
  },

  /**
   * 摇摆动画
   */
  shake(element: HTMLElement, duration = 600): Promise<void> {
    return new Promise(resolve => {
      const animation = element.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-10px)" },
          { transform: "translateX(10px)" },
          { transform: "translateX(-10px)" },
          { transform: "translateX(10px)" },
          { transform: "translateX(0)" },
        ],
        { duration, easing: "ease-out" },
      );

      animation.addEventListener("finish", () => {
        resolve();
      });
    });
  },

  /**
   * 脉冲动画
   */
  pulse(element: HTMLElement, duration = 1000): Promise<void> {
    return new Promise(resolve => {
      const animation = element.animate(
        [
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(1.05)", opacity: 0.8 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration, easing: "ease-in-out" },
      );

      animation.addEventListener("finish", () => {
        resolve();
      });
    });
  },

  /**
   * 停止所有动画
   */
  stop(element: HTMLElement): void {
    element.getAnimations().forEach(animation => animation.cancel());
    element.style.animation = "";
    element.style.transition = "";
  },

  /**
   * 暂停动画
   */
  pause(element: HTMLElement): void {
    element.getAnimations().forEach(animation => animation.pause());
  },

  /**
   * 恢复动画
   */
  resume(element: HTMLElement): void {
    element.getAnimations().forEach(animation => animation.play());
  },
};

/**
 * CSS 过渡工具
 */
export const transition = {
  /**
   * 设置过渡效果
   */
  set(element: HTMLElement, options: TransitionOptions = {}): void {
    const { property = "all", duration = 300, easing = "ease", delay = 0 } = options;

    element.style.transition = `${property} ${duration}ms ${easing} ${delay}ms`;
  },

  /**
   * 移除过渡效果
   */
  remove(element: HTMLElement): void {
    element.style.transition = "";
  },

  /**
   * 执行过渡动画
   */
  run(element: HTMLElement, styles: Record<string, string | number>, options: TransitionOptions = {}): Promise<void> {
    return new Promise(resolve => {
      // 设置过渡
      this.set(element, options);

      // 监听过渡结束
      const handleEnd = () => {
        element.removeEventListener("transitionend", handleEnd);
        resolve();
      };

      element.addEventListener("transitionend", handleEnd);

      // 应用样式
      Object.entries(styles).forEach(([property, value]) => {
        (element.style as any)[property] = value;
      });
    });
  },

  /**
   * 平滑改变样式
   */
  to(element: HTMLElement, styles: Record<string, string | number>, duration = 300, easing = "ease"): Promise<void> {
    return this.run(element, styles, { duration, easing });
  },
};

/**
 * 动画序列工具
 */
export class AnimationSequence {
  private element: HTMLElement;
  private queue: Array<() => Promise<void>> = [];

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /**
   * 添加动画到序列
   */
  add(animationFn: () => Promise<void>): this {
    this.queue.push(animationFn);
    return this;
  }

  /**
   * 添加延迟
   */
  delay(ms: number): this {
    this.queue.push(() => new Promise(resolve => setTimeout(resolve, ms)));
    return this;
  }

  /**
   * 添加淡入动画
   */
  fadeIn(duration = 300): this {
    this.queue.push(() => animation.fadeIn(this.element, duration));
    return this;
  }

  /**
   * 添加淡出动画
   */
  fadeOut(duration = 300): this {
    this.queue.push(() => animation.fadeOut(this.element, duration));
    return this;
  }

  /**
   * 添加滑入动画
   */
  slideDown(duration = 300): this {
    this.queue.push(() => animation.slideDown(this.element, duration));
    return this;
  }

  /**
   * 添加滑出动画
   */
  slideUp(duration = 300): this {
    this.queue.push(() => animation.slideUp(this.element, duration));
    return this;
  }

  /**
   * 添加缩放动画
   */
  scale(from = 0, to = 1, duration = 300): this {
    this.queue.push(() => animation.scale(this.element, from, to, duration));
    return this;
  }

  /**
   * 添加弹跳动画
   */
  bounce(duration = 600): this {
    this.queue.push(() => animation.bounce(this.element, duration));
    return this;
  }

  /**
   * 添加摇摆动画
   */
  shake(duration = 600): this {
    this.queue.push(() => animation.shake(this.element, duration));
    return this;
  }

  /**
   * 添加脉冲动画
   */
  pulse(duration = 1000): this {
    this.queue.push(() => animation.pulse(this.element, duration));
    return this;
  }

  /**
   * 添加过渡动画
   */
  transition(styles: Record<string, string | number>, options: TransitionOptions = {}): this {
    this.queue.push(() => transition.run(this.element, styles, options));
    return this;
  }

  /**
   * 执行动画序列
   */
  async play(): Promise<void> {
    for (const animationFn of this.queue) {
      await animationFn();
    }
  }

  /**
   * 清空动画序列
   */
  clear(): this {
    this.queue = [];
    return this;
  }
}

/**
 * 创建动画序列
 */
export function createAnimationSequence(element: HTMLElement): AnimationSequence {
  return new AnimationSequence(element);
}

/**
 * 动画工具函数
 */
export const animationUtils = {
  /**
   * 检查是否支持 CSS 动画
   */
  isSupported(): boolean {
    return typeof document !== "undefined" && "animate" in HTMLElement.prototype;
  },

  /**
   * 获取动画持续时间
   */
  getDuration(element: HTMLElement): number {
    const computed = window.getComputedStyle(element);
    const duration = computed.animationDuration || computed.transitionDuration || "0s";
    return parseFloat(duration) * (duration.includes("ms") ? 1 : 1000);
  },

  /**
   * 等待动画结束
   */
  waitForAnimation(element: HTMLElement): Promise<void> {
    return new Promise(resolve => {
      const animations = element.getAnimations();
      if (animations.length === 0) {
        resolve();
        return;
      }

      Promise.all(animations.map(anim => anim.finished)).then(() => resolve());
    });
  },

  /**
   * 等待过渡结束
   */
  waitForTransition(element: HTMLElement): Promise<void> {
    return new Promise(resolve => {
      const handleEnd = () => {
        element.removeEventListener("transitionend", handleEnd);
        resolve();
      };

      element.addEventListener("transitionend", handleEnd);

      // 如果没有过渡，立即解决
      const computed = window.getComputedStyle(element);
      if (computed.transitionDuration === "0s") {
        element.removeEventListener("transitionend", handleEnd);
        resolve();
      }
    });
  },
};
