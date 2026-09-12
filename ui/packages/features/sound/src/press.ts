import type { Cleanup } from '@xihan-ui/core'
import type { SoundPlayer } from './types'

/** 任意框架的按压音效声明。 */
export interface SoundPressOptions {
  sound?: string
  volume?: number
  player?: SoundPlayer
}

export type SoundPressValue = string | SoundPressOptions | undefined
export type ResolvedSoundPressOptions = SoundPressOptions & { sound: string }

/** 字符串简写与对象声明共用的默认语义归一。 */
export function resolveSoundPressOptions(value: SoundPressValue): ResolvedSoundPressOptions {
  if (typeof value === 'string')
    return { sound: value }
  return { sound: 'click', ...value }
}

/** 检查原生和 XiHan 状态标记；适配器不再各自复制禁用判据。 */
export function isSoundTargetDisabled(target: Pick<Element, 'getAttribute' | 'hasAttribute'>): boolean {
  return target.hasAttribute('disabled')
    || target.getAttribute('aria-disabled') === 'true'
    || target.hasAttribute('data-disabled')
}

/**
 * 首个指针或键盘手势解锁音频上下文；SSR 下退化为空清理函数。
 * target 可注入，测试、iframe 与非全局 Document 宿主不必依赖全局对象。
 */
export function attachDocumentSoundUnlock(
  unlock: () => void,
  target: Pick<Document, 'addEventListener' | 'removeEventListener'> | null = typeof document === 'undefined' ? null : document,
): Cleanup {
  if (!target)
    return () => undefined
  const listener = (): void => {
    unlock()
    target.removeEventListener('pointerdown', listener)
    target.removeEventListener('keydown', listener)
  }
  target.addEventListener('pointerdown', listener)
  target.addEventListener('keydown', listener)
  return () => {
    target.removeEventListener('pointerdown', listener)
    target.removeEventListener('keydown', listener)
  }
}
