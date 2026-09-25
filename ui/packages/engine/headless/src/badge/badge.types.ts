/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 badge 类型契约。

import type { PropTypes, Size, Tone } from '@xihan-ui/core'

/** 角标挂在宿主的哪个角。取值与 badge.css 的选择器一一对应。 */
export type BadgePlacement = 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start'

export interface BadgeProps {
  /**
   * 语气：brand / neutral / success / warning / danger / info，决定使用哪族颜色，默认 neutral。
   * 角标实际使用中主要为 danger（未读红点）与 success / neutral（在线 / 离线点）。
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

export interface BadgeApi<T extends PropTypes = PropTypes> {
  /** 当前是否应渲染：计数为 0 且未开启 showZero 时为假。 */
  visible: boolean
  /** 计算后的显示文本：超过 max 时显示为「99+」；dot 模式与无 count 时为空串。 */
  text: string
  /** 锚点：被标记的对象（按钮、头像、标签页）放置在其中。 */
  getRootProps: () => T['element']
  /** 角标本身，绝对定位在 root 的某个角。 */
  getIndicatorProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface BadgeTranslations {}
