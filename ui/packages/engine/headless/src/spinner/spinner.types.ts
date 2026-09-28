/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 spinner 类型契约。

import type { MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 转圈的形态：整圈轨道加一段起始边、渐隐弧、三点。 */
export type SpinnerVariant = 'ring' | 'arc' | 'dots'

/** 读屏文案，默认英文。 */
export interface SpinnerTranslations {
  /** 转圈的可及名，说明正在等待的内容。 */
  label: string
}

export interface SpinnerProps {
  /**
   * 该处的可及名，写在 root 上。
   * label 部件显示的应当是同一段文案：aria-label 会覆盖节点中的文字，两者不一致时
   * 读屏朗读的与屏幕上看到的不匹配。
   */
  label?: string
  /** 直径档位，默认 md；默认档不输出 data-size。 */
  size?: Size
  /** 形态，默认 arc。 */
  variant?: SpinnerVariant
  /** 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色 */
  tone?: Tone
  /**
   * 挂载后等多少毫秒才露面，默认 0 即刻露面。等待期间 root 投影 data-state="hidden"，
   * 皮肤按它把整块藏起、仍占着位置，读屏也读不到；加载在这之前结束、转圈被卸掉时它从头到尾不出现。
   * 露面之后不再回到等待。
   */
  delay?: number
  translations?: Partial<SpinnerTranslations>
}

/** 转圈的两态：挂载后的等待与露面。 */
export type SpinnerState = 'waiting' | 'visible'

export interface SpinnerSchema extends MachineSchema {
  props: SpinnerProps
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: SpinnerState
  event: { type: 'REVEAL' }
  tag: never
  guard: never
  action: 'revealWhenUndelayed'
  effect: 'trackDelay'
}

export interface SpinnerApi<T extends PropTypes = PropTypes> {
  /** 解析后的文案：label → translations.label → 内置默认值。 */
  label: string
  /** 已经露面；等待 delay 期间为 false。 */
  visible: boolean
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
}
