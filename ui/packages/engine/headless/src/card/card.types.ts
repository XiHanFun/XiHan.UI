/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 card 类型契约。

import type { ControlVariant, PropTypes } from '@xihan-ui/core'

export interface CardProps {
  /** 形态：outline 为带影的抬起面，subtle 为淡底，ghost 无底无影。默认 outline。 */
  variant?: ControlVariant
  /**
   * 整卡可交互：标题里的 trigger（链接或按钮）把点击区铺满整张卡片，悬停抬起、按下换面，
   * 焦点环画在卡片外沿。可及名只取 trigger 自己的文字，卡片里的其余内容不进链接名。
   * 默认 false。
   */
  interactive?: boolean
}

export interface CardApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  getTitleProps: () => T['element']
  /** 整卡的触发器：放在 title 里的链接或按钮，interactive 时它的点击区铺满整张卡片。 */
  getTriggerProps: () => T['element']
  getDescriptionProps: () => T['element']
  getContentProps: () => T['element']
  getFooterProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface CardTranslations {}
