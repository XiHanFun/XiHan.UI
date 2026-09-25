/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 从元素读取语义动效令牌的实际取值。
//
// 计算样式里已经算进了作者对组件槽的覆盖、容器上的 data-motion 与系统的减弱动效偏好，
// JS 动画从这里取时长与曲线，就与同一元素上的 CSS 过渡同步。
// 读不到时（服务端、未加载样式的测试环境）取与令牌同值的常量，减弱动效按元素判断。

import type { EasingFunction } from './easing'
import type { MotionDurationName, MotionEaseName } from './semantic'
import { resolveEasing } from './easing'
import { resolveMotionPreference } from './reduced-motion'
import { motionDurations, motionEasings, reducedMotionDurations } from './semantic'

/** 一次读取的结果：按语义名取时长与曲线。 */
export interface MotionReading {
  /** 语义时长（毫秒）。 */
  duration: (name: MotionDurationName) => number
  /** 语义缓动的采样函数。 */
  easing: (name: MotionEaseName) => EasingFunction
}

/** 解析 `200ms` / `0.2s` 形式的时长；空串与其它写法返回 null。 */
function parseDuration(raw: string | undefined): number | null {
  const match = raw?.trim().match(/^(\d+(?:\.\d+)?|\.\d+)(ms|s)$/)
  if (!match)
    return null
  const value = Number(match[1]) * (match[2] === 's' ? 1000 : 1)
  return Number.isFinite(value) ? value : null
}

/**
 * 读取元素上的语义动效令牌。
 *
 * 每次调用读一次计算样式，不做缓存：主题、密度与 data-motion 随时可能变化，
 * 动画开始前读一次即可。
 */
export function readMotion(target: Element): MotionReading {
  const view = target.ownerDocument?.defaultView
  const style = typeof view?.getComputedStyle === 'function' ? view.getComputedStyle(target) : null
  let reduced: boolean | undefined
  const isReduced = (): boolean => (reduced ??= resolveMotionPreference(target) === 'reduce')

  return {
    duration(name) {
      const parsed = parseDuration(style?.getPropertyValue(`--xh-motion-duration-${name}`))
      if (parsed !== null)
        return parsed
      return (isReduced() ? reducedMotionDurations : motionDurations)[name]
    },
    easing(name) {
      const raw = style?.getPropertyValue(`--xh-motion-ease-${name}`).trim()
      return resolveEasing(raw || motionEasings[name])
    },
  }
}
