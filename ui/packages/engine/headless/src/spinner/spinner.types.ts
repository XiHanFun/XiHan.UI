/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 spinner 类型契约。

import type { PropTypes, Size, Tone } from '@xihan-ui/core'

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
  translations?: Partial<SpinnerTranslations>
}

export interface SpinnerApi<T extends PropTypes = PropTypes> {
  /** 解析后的文案：label → translations.label → 内置默认值。 */
  label: string
  getRootProps: () => T['element']
  getLabelProps: () => T['element']
}
