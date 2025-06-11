/**
 * 动画序列系统
 * 统一的动画序列管理
 */

import type { AnimationController, TransitionConfig } from "../foundation/types";
import { createTransition, fadeIn, fadeOut, slideIn, slideOut, scale } from "./transition";

// =============================================
// 动画序列类
// =============================================

export class AnimationSequence {
  private element: HTMLElement;
  private queue: Array<() => Promise<void>> = [];

  constructor(element: HTMLElement) {
    this.element = element;
  }

  /**
   * 添加自定义动画函数
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
  fadeIn(options: Partial<TransitionConfig> = {}): this {
    this.queue.push(() => this.runAnimation(() => fadeIn(this.element, options)));
    return this;
  }

  /**
   * 添加淡出动画
   */
  fadeOut(options: Partial<TransitionConfig> = {}): this {
    this.queue.push(() => this.runAnimation(() => fadeOut(this.element, options)));
    return this;
  }

  /**
   * 添加滑入动画
   */
  slideIn(direction: "up" | "down" | "left" | "right" = "up", options: Partial<TransitionConfig> = {}): this {
    this.queue.push(() => this.runAnimation(() => slideIn(this.element, direction, options)));
    return this;
  }

  /**
   * 添加滑出动画
   */
  slideOut(direction: "up" | "down" | "left" | "right" = "down", options: Partial<TransitionConfig> = {}): this {
    this.queue.push(() => this.runAnimation(() => slideOut(this.element, direction, options)));
    return this;
  }

  /**
   * 添加缩放动画
   */
  scale(from: number = 0, to: number = 1, options: Partial<TransitionConfig> = {}): this {
    this.queue.push(() => this.runAnimation(() => scale(this.element, from, to, options)));
    return this;
  }

  /**
   * 添加自定义 CSS 过渡
   */
  transition(
    properties: Record<string, { from: string | number; to: string | number; unit?: string }>,
    options: Partial<TransitionConfig> = {},
  ): this {
    this.queue.push(() => {
      return new Promise(resolve => {
        const controller = createTransition(progress => {
          Object.entries(properties).forEach(([prop, { from, to, unit = "" }]) => {
            const fromNum = typeof from === "number" ? from : parseFloat(from.toString());
            const toNum = typeof to === "number" ? to : parseFloat(to.toString());
            const current = fromNum + (toNum - fromNum) * progress;
            this.element.style.setProperty(prop, `${current}${unit}`);
          });
        }, options);

        controller.onComplete = () => resolve();
      });
    });
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
   * 清空动画队列
   */
  clear(): this {
    this.queue = [];
    return this;
  }

  /**
   * 获取队列长度
   */
  get length(): number {
    return this.queue.length;
  }

  /**
   * 运行动画控制器并返回 Promise
   */
  private runAnimation(createController: () => AnimationController): Promise<void> {
    return new Promise(resolve => {
      const controller = createController();
      controller.onComplete = () => resolve();
    });
  }
}

// =============================================
// 动画组合器
// =============================================

export class AnimationComposer {
  private animations: Array<{
    controller: AnimationController;
    delay: number;
    weight: number;
  }> = [];

  /**
   * 添加动画
   */
  add(controller: AnimationController, delay: number = 0, weight: number = 1): this {
    this.animations.push({ controller, delay, weight });
    return this;
  }

  /**
   * 并行播放所有动画
   */
  playParallel(): AnimationController {
    let isRunning = false;
    let isCompleted = false;
    const controllers: AnimationController[] = [];
    const self = this;

    const checkCompletion = () => {
      if (controllers.every(c => c.isCompleted)) {
        isRunning = false;
        isCompleted = true;
        composedController.onComplete?.();
      }
    };

    const composedController: AnimationController = {
      play() {
        if (isRunning) return;
        isRunning = true;
        isCompleted = false;

        self.animations.forEach(({ controller, delay }) => {
          controllers.push(controller);

          if (delay > 0) {
            setTimeout(() => {
              controller.play();
              controller.onComplete = checkCompletion;
            }, delay);
          } else {
            controller.play();
            controller.onComplete = checkCompletion;
          }
        });
      },

      pause() {
        isRunning = false;
        controllers.forEach(c => c.pause());
      },

      stop() {
        isRunning = false;
        isCompleted = false;
        controllers.forEach(c => c.stop());
        controllers.length = 0;
      },

      finish() {
        controllers.forEach(c => c.finish());
        isRunning = false;
        isCompleted = true;
        composedController.onComplete?.();
      },

      reverse() {
        controllers.forEach(c => c.reverse());
      },

      get progress() {
        if (controllers.length === 0) return 0;
        const totalProgress = controllers.reduce((sum, c, index) => {
          const weight = self.animations[index]?.weight || 1;
          return sum + c.progress * weight;
        }, 0);
        const totalWeight = self.animations.reduce((sum, { weight }) => sum + weight, 0);
        return totalWeight > 0 ? totalProgress / totalWeight : 0;
      },

      get isRunning() {
        return isRunning;
      },

      get isCompleted() {
        return isCompleted;
      },

      onComplete: undefined,
    };

    return composedController;
  }

  /**
   * 顺序播放所有动画
   */
  playSequence(): AnimationController {
    let currentIndex = 0;
    let currentController: AnimationController | null = null;
    let isRunning = false;
    let isCompleted = false;
    const self = this;

    const startNext = () => {
      if (currentIndex >= this.animations.length) {
        isRunning = false;
        isCompleted = true;
        composedController.onComplete?.();
        return;
      }

      const { controller, delay } = this.animations[currentIndex];
      currentIndex++;

      setTimeout(() => {
        if (!isRunning) return;

        currentController = controller;
        controller.onComplete = startNext;
        controller.play();
      }, delay);
    };

    const composedController: AnimationController = {
      play() {
        if (isRunning) return;
        isRunning = true;
        isCompleted = false;
        currentIndex = 0;
        startNext();
      },

      pause() {
        isRunning = false;
        currentController?.pause();
      },

      stop() {
        isRunning = false;
        isCompleted = false;
        currentIndex = 0;
        currentController?.stop();
        currentController = null;
      },

      finish() {
        this.stop();
        isCompleted = true;
        composedController.onComplete?.();
      },

      reverse() {
        currentController?.reverse();
      },

      get progress() {
        if (!currentController) return 0;
        const segmentProgress = currentController.progress;
        const totalSegments = self.animations.length;
        const completedSegments = currentIndex - 1;
        return (completedSegments + segmentProgress) / totalSegments;
      },

      get isRunning() {
        return isRunning;
      },

      get isCompleted() {
        return isCompleted;
      },

      onComplete: undefined,
    };

    return composedController;
  }

  /**
   * 清空动画列表
   */
  clear(): this {
    this.animations = [];
    return this;
  }
}

// =============================================
// 便捷函数
// =============================================

/**
 * 创建动画序列
 */
export function createAnimationSequence(element: HTMLElement): AnimationSequence {
  return new AnimationSequence(element);
}

/**
 * 创建动画组合器
 */
export function createAnimationComposer(): AnimationComposer {
  return new AnimationComposer();
}

/**
 * 批量动画工具
 */
export const batchAnimations = {
  /**
   * 批量淡入
   */
  fadeInAll(
    elements: HTMLElement[],
    options: Partial<TransitionConfig> = {},
    stagger: number = 100,
  ): AnimationController {
    const composer = new AnimationComposer();

    elements.forEach((element, index) => {
      const controller = fadeIn(element, options);
      composer.add(controller, index * stagger);
    });

    return composer.playParallel();
  },

  /**
   * 批量滑入
   */
  slideInAll(
    elements: HTMLElement[],
    direction: "up" | "down" | "left" | "right" = "up",
    options: Partial<TransitionConfig> = {},
    stagger: number = 100,
  ): AnimationController {
    const composer = new AnimationComposer();

    elements.forEach((element, index) => {
      const controller = slideIn(element, direction, options);
      composer.add(controller, index * stagger);
    });

    return composer.playParallel();
  },

  /**
   * 波浪式动画
   */
  wave(
    elements: HTMLElement[],
    animationFn: (element: HTMLElement) => AnimationController,
    stagger: number = 100,
  ): AnimationController {
    const composer = new AnimationComposer();

    elements.forEach((element, index) => {
      const controller = animationFn(element);
      composer.add(controller, index * stagger);
    });

    return composer.playParallel();
  },
};

// =============================================
// 预设动画序列
// =============================================

export const presetSequences = {
  /**
   * 入场动画序列
   */
  entrance(element: HTMLElement): AnimationSequence {
    return createAnimationSequence(element).scale(0, 1, { duration: 300 }).fadeIn({ duration: 200 });
  },

  /**
   * 退场动画序列
   */
  exit(element: HTMLElement): AnimationSequence {
    return createAnimationSequence(element).fadeOut({ duration: 200 }).scale(1, 0, { duration: 300 });
  },

  /**
   * 弹跳入场
   */
  bounceIn(element: HTMLElement): AnimationSequence {
    return createAnimationSequence(element)
      .scale(0, 1.2, { duration: 200 })
      .scale(1.2, 0.9, { duration: 100 })
      .scale(0.9, 1, { duration: 100 });
  },

  /**
   * 摇摆动画
   */
  shake(element: HTMLElement): AnimationSequence {
    return createAnimationSequence(element)
      .transition({ transform: { from: "translateX(0)", to: "translateX(-10px)" } }, { duration: 100 })
      .transition({ transform: { from: "translateX(-10px)", to: "translateX(10px)" } }, { duration: 100 })
      .transition({ transform: { from: "translateX(10px)", to: "translateX(-10px)" } }, { duration: 100 })
      .transition({ transform: { from: "translateX(-10px)", to: "translateX(0)" } }, { duration: 100 });
  },

  /**
   * 脉冲动画
   */
  pulse(element: HTMLElement): AnimationSequence {
    return createAnimationSequence(element).scale(1, 1.1, { duration: 300 }).scale(1.1, 1, { duration: 300 });
  },
};
