import type { Direction, Orientation } from '@xihan-ui/kernel'

// 集合导航的纯计算：把按键翻译成意图，把意图翻译成下标；不碰 DOM。

/** 导航轴。'both' 表示四个方向键都参与导航，与 Orientation 分开取值。 */
export type NavAxis = Orientation | 'both'

export type NavIntent = 'next' | 'prev' | 'first' | 'last'

export interface NavKeyOptions {
  /** 默认 'both'：不限制轴。 */
  axis?: NavAxis
  /** 文字方向，只影响水平轴上的 ArrowLeft/ArrowRight 语义。 */
  dir?: Direction
  /** 是否接受 Home/End，默认 true。 */
  home?: boolean
}

/** 修饰键读取所需的最小事件形状，可直接传 KeyboardEvent。 */
export interface NavKeyEventLike {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}

/**
 * 按键 → 导航意图。返回 null 表示该键不归导航管，调用方不得 preventDefault。
 * 传入事件对象时，带 Ctrl/Meta/Alt/Shift 的组合一律返回 null。
 */
export function navIntentFromKey(key: string | NavKeyEventLike, options: NavKeyOptions = {}): NavIntent | null {
  if (typeof key !== 'string') {
    if (key.ctrlKey || key.metaKey || key.altKey || key.shiftKey)
      return null
    return navIntentFromKey(key.key, options)
  }
  const { axis = 'both', dir = 'ltr', home = true } = options
  const horizontal = axis === 'horizontal' || axis === 'both'
  const vertical = axis === 'vertical' || axis === 'both'
  const rtl = dir === 'rtl'

  if (horizontal && key === 'ArrowRight')
    return rtl ? 'prev' : 'next'
  if (horizontal && key === 'ArrowLeft')
    return rtl ? 'next' : 'prev'
  if (vertical && key === 'ArrowDown')
    return 'next'
  if (vertical && key === 'ArrowUp')
    return 'prev'
  if (home && key === 'Home')
    return 'first'
  if (home && key === 'End')
    return 'last'
  return null
}

export interface StepOptions {
  /** 走到尽头是否回绕，默认 true。 */
  loop?: boolean
  /** 返回 true 表示该下标不可停留（禁用项）。 */
  skip?: (index: number) => boolean
}

/**
 * 在 [0, count) 内按意图走一步，跳过 skip 命中的下标。
 * 返回 -1 表示无处可去（空集合，或所有条目都被跳过）。
 * from 传 -1（无当前项）时，next/prev 都从边界开始找第一个可停留项。
 */
export function stepIndex(count: number, from: number, intent: NavIntent, options: StepOptions = {}): number {
  if (count <= 0)
    return -1
  const { loop = true, skip } = options
  const blocked = (i: number): boolean => skip?.(i) ?? false

  // 从某个起点朝一个方向找第一个可停留项；不回绕时撞到边界即止。
  const seek = (start: number, delta: number): number => {
    let i = start
    for (let taken = 0; taken < count; taken++) {
      if (i < 0 || i >= count) {
        if (!loop)
          return -1
        i = i < 0 ? count - 1 : 0
      }
      if (!blocked(i))
        return i
      i += delta
    }
    return -1
  }

  if (intent === 'first')
    return seek(0, 1)
  if (intent === 'last')
    return seek(count - 1, -1)
  if (from < 0)
    return intent === 'next' ? seek(0, 1) : seek(count - 1, -1)
  return intent === 'next' ? seek(from + 1, 1) : seek(from - 1, -1)
}
