/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timestamp 相关实现。

import type { TimestampProps, TimestampType, TimestampValue } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectTimestamp } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'

export interface XhTimestampProps extends ComponentPropsWithRef<'time'> {
  /** 要显示的时刻。只写年月日的串按本地零点解读。 */
  value?: TimestampValue
  /** 呈现方式：date 只到日、datetime 到秒、relative 表述为几分钟前等相对说法，默认 datetime。 */
  type?: TimestampType
  /** 自定义格式串，记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s。 */
  format?: string
  /** BCP 47 语言标记，决定用词与默认格式串。它只更换供人阅读的文本，datetime 恒为同一种写法。 */
  locale?: string
  /** 计算相对表述时的参照时刻，默认取当前时刻。 */
  now?: TimestampValue
}

/**
 * 渲染为 `<time datetime>`：文本供人阅读，datetime 供机器读取，两者取自同一个墙钟。
 *
 * children 中写了内容时使用作者的文本，datetime 仍由组件计算：这正是用它包裹一段
 * 自行排版的时间表述的用法。children 为空时铺设组件格式化后的文本。
 */
export function XhTimestamp({ value, type, format, locale, now, children, ...rest }: XhTimestampProps): ReactNode {
  const api = connectTimestamp(
    withXhConfig('timestamp', { value, type, format, locale, now }) as TimestampProps,
    reactNormalize,
  )
  return (
    <time {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {/* children 里只剩空白时不算写过东西，那种情况仍铺组件的文本 */}
      {slotPaints(children) ? children : api.text}
    </time>
  )
}
