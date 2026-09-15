/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 gradient text 类型契约。

import type { PropTypes, Tone } from '@xihan-ui/core'

/**
 * 渐变走向档位，逐档对应 CSS 的 `to <边或角>`。
 * 只接受这八个档，不接受任意角度字符串：角度是排版参数不是设计档位，放开后无法在皮肤中换算。
 */
export type GradientTextDirection
  = | 'to-right' | 'to-left' | 'to-bottom' | 'to-top'
    | 'to-bottom-right' | 'to-bottom-left' | 'to-top-right' | 'to-top-left'

export interface GradientTextProps {
  /** 起点颜色，写为 CSS 变量交给皮肤；未提供时使用品牌色族。 */
  from?: string
  /** 终点颜色，写为 CSS 变量交给皮肤；未提供时使用品牌色族。 */
  to?: string
  /** 渐变走向档位，默认 to-right。 */
  direction?: GradientTextDirection
  /** 颜色：brand / neutral / success / warning / danger / info；显式 from / to 优先。 */
  tone?: Tone
}

export interface GradientTextApi<T extends PropTypes = PropTypes> {
  getRootProps: () => T['element']
}

/** 读屏文案。本组件目前没有需要外露的文案，保留该位。 */
export interface GradientTextTranslations {}
