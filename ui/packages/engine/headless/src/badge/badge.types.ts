/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 badge 类型契约。

import type { MachineSchema, PropTypes, Size, Tone } from '@xihan-ui/core'

/** 角标挂在宿主的哪个角。取值与 badge.css 的选择器一一对应。 */
export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'

export interface BadgeProps {
  /**
   * 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色，默认 danger（未读红点）。
   * 在线 / 离线这类状态点显式写 success / neutral。
   */
  tone?: Tone
  /** 尺寸：sm / md / lg。影响圆点直径、两位数时的最小宽度与字号。 */
  size?: Size
  /** 挂在哪个角，默认 top-end（右上角；rtl 下自动落到左上）。 */
  placement?: BadgePlacement
  /**
   * 计数。提供后角标自行显示数字，超过 max 时显示为「max+」。
   * 与 indicator 的默认插槽二选一：插槽有内容时以插槽为准。
   */
  count?: number
  /** 计数上限，默认 99：超过时只显示 99+，避免角标变形。 */
  max?: number
  /** 计数为 0 时是否仍然显示，默认不显示：没有未读时不应出现角标。 */
  showZero?: boolean
  /** 只显示圆点，不显示数字。提供后 count 只用于决定是否显示。 */
  dot?: boolean
  /**
   * 圆点呼吸：表达正在进行、给不出进度的状态（直播、录制、通话中）。只在 dot 模式下生效，
   * 数字角标不呼吸——明暗起伏会压低数字的对比度。减弱动效下停在满不透明度。
   */
  pulse?: boolean
  /**
   * 读屏朗读该角标的方式。
   * 角标挂在按钮、头像上时只朗读数字无法表达含义，需要由宿主提供「3 条未读」这类完整语句。
   */
  label?: string
}

/**
 * 计数里的一位（数字的一位，或超过上限时末尾的「+」）。计数逐位排出，换数时变了的那几位滚过去，
 * 没变的原地不动。
 */
export interface BadgeGlyph {
  /**
   * 节点复用的键：数字按从个位起的位次，「+」是 suffix。这一轮在动的位另带轮次：
   * 下一轮再换数时它换一个节点，滚动从头播
   */
  key: string
  /** 这一位写的字。从有到无的那一位写它原来的字：滚走的同时收起宽度，播完才摘掉。 */
  char: string
  /** 滚走的旧字：前后两版都有这一位、字变了时才有。 */
  from?: string
  /** 这一轮怎么动：enter 从无到有（多出一位、出现「+」）、leave 从有到无、swap 换字；不动的位没有。 */
  change?: 'enter' | 'leave' | 'swap'
}

/** 正在播的那一轮换数。 */
export interface BadgeRoll {
  /** 换数之前写的那一版计数文本。 */
  from: string
  /** 计数变大往上滚（新字从下面上来），变小往下滚。 */
  up: boolean
  /** 第几轮：在动的位按它换节点，接连换数时每一轮都从头播。 */
  serial: number
}

export interface BadgeSchema extends MachineSchema {
  props: BadgeProps
  context: {
    /**
     * 角标是否还留着（没有 hidden）。露面时立即为真；收起后等 indicator 的退场动画播完才为假，
     * 期间 data-state 已经是 hidden。
     */
    rendered: boolean
    /** 上一次同步时是否露面：与 props 算出的显隐对照，判出这一次有没有出现或消失。 */
    shown: boolean
    /** 挂载之后显隐换过没有。没换过时 indicator 投影 data-instant：首帧就在的角标直接呈现，不播进场。 */
    moved: boolean
    /** 最后一次露面时的计数文本：退场那几帧照它写，不随计数清零一起变空。 */
    shownText: string
    /** 最后一次露面时的计数：换数时与新计数比大小，定往哪个方向滚。 */
    shownCount: number | undefined
    /** 露面期间换了数、滚动还没播完的那一轮；播完清空，各位回到不动的写法。 */
    roll: BadgeRoll | null
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    /** indicator 留着与否（退场动画播完才报 false）。 */
    | { type: 'INDICATOR.RENDERED', rendered: boolean }
    /** 第 serial 轮换数的滚动播完了。 */
    | { type: 'ROLL.SETTLED', serial: number }
  tag: never
  guard: never
  action: 'syncShown' | 'setRendered' | 'settleRoll'
  effect: 'trackIndicatorPresence'
}

export interface BadgeApi<T extends PropTypes = PropTypes> {
  /** 当前是否应渲染：计数为 0 且未开启 showZero 时为假。 */
  visible: boolean
  /** 计算后的显示文本：超过 max 时显示为「99+」；dot 模式与无 count 时为空串。 */
  text: string
  /** 计数的数字部分，高位在前逐位排出；dot 模式与无 count 时为空。 */
  glyphs: BadgeGlyph[]
  /** 超过上限时数字后面的「+」；没超过、也没在滚走时为 null。 */
  suffix: BadgeGlyph | null
  /** 锚点：被标记的对象（按钮、头像、标签页）放置在其中。 */
  getRootProps: () => T['element']
  /** 角标本身，绝对定位在 root 的某个角。 */
  getIndicatorProps: () => T['element']
  /** 数字部分：各位排在里面，rtl 下仍从左往右，「+」随行向排在它后面。 */
  getValueProps: () => T['element']
  /** 数字的一位。 */
  getGlyphProps: (glyph: BadgeGlyph) => T['element']
  /** 超过上限时的「+」。 */
  getSuffixProps: (suffix: BadgeGlyph) => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface BadgeTranslations {}
