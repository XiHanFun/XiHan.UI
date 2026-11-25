/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 spinner 类型契约。

import type { MachineSchema, Orientation, PropTypes, Size, Tone } from '@xihan-ui/core'

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
   * 转圈与配文的排布：horizontal 并排、适合随文与行内；vertical 转圈在上、配文在下居中，适合整块区域的等待。
   * 缺省单独使用时是 horizontal，遮罩形态下是 vertical。
   */
  orientation?: Orientation
  /**
   * 遮罩形态：包住一块内容，等待时在内容上盖一层遮罩、转圈居中，内容报忙且不可交互。
   * 结构是 container 包住 content 与 mask，root 放在 mask 里。不写时是单独一枚转圈。
   */
  overlay?: boolean
  /**
   * 挂载后等多少毫秒才露面，默认 0 即刻露面。等待期间 root 投影 data-state="hidden"，
   * 皮肤按它把整块藏起、仍占着位置，读屏也读不到；加载在这之前结束、转圈被卸掉时它从头到尾不出现。
   * 露面之后不再回到等待。
   */
  delay?: number
  /**
   * 是否在等待，默认 true。单独使用时 false 把转圈藏起、位置照留；遮罩形态下 false 撤掉遮罩，
   * 被包住的内容恢复可交互。由 false 变回 true 时重新计 delay。
   */
  loading?: boolean
  /** 遮罩形态下盖住整个视口，而不只是 container 里的内容。 */
  fullscreen?: boolean
  translations?: Partial<SpinnerTranslations>
}

/** 转圈的三态：没在等（loading 为 false）、等 delay 过去与露面。 */
export type SpinnerState = 'idle' | 'waiting' | 'visible'

export interface SpinnerSchema extends MachineSchema {
  props: SpinnerProps
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: SpinnerState
  event: { type: 'REVEAL' } | { type: 'START' } | { type: 'STOP' }
  tag: never
  guard: 'hasDelay'
  action: 'revealWhenUndelayed' | 'syncLoading'
  effect: 'trackDelay'
}

export interface SpinnerApi<T extends PropTypes = PropTypes> {
  /** 解析后的文案：label → translations.label → en-US 语言包。 */
  label: string
  /** 是否在等待：loading 不为 false。 */
  loading: boolean
  /** 已经露面；等待 delay 期间与 loading 为 false 时为 false。 */
  visible: boolean
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
  /** 遮罩形态的外框：包住内容与遮罩，作为遮罩的定位参照。 */
  getContainerProps: () => T['element']
  /** 被包住的内容：等待期间报 aria-busy，遮罩露面后不可交互。 */
  getContentProps: () => T['element']
  /** 盖在内容上的遮罩，转圈放在它里面居中。 */
  getMaskProps: () => T['element']
}
