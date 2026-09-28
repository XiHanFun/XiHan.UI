/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timestamp 相关实现。

import type { TimestampTranslations, TimestampType, TimestampValue } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectTimestamp, timestampMachine } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { slotPaints } from '../../runtime/slot-content'
import { useMachine } from '../../runtime/use-machine'

export interface XhTimestampProps extends ComponentPropsWithRef<'time'> {
  /** 要显示的时刻。只写年月日的串按零点解读；不带偏移量的串按 timeZone 的墙钟解读，没给时区时按本地。 */
  value?: TimestampValue
  /** 呈现方式：date 只到日、datetime 到秒、relative 表述为几分钟前 / 几分钟后等相对说法，默认 datetime。 */
  type?: TimestampType
  /** 自定义格式串，记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s。 */
  format?: string
  /** BCP 47 语言标记，决定相对说法的用词与缺省的日期写法（由 Intl 给出）。它只更换供人阅读的文本，datetime 与语言无关。 */
  locale?: string
  /** IANA 时区名。给了就按这个时区的墙钟显示，datetime 带上偏移量；认不出的时区落 invalid。 */
  timeZone?: string
  /** 计算相对说法时的参照时刻，默认取当前时刻并自动刷新；提供后不再刷新。 */
  now?: TimestampValue
  /** 相对型的刷新间隔（毫秒）。缺省按距今远近自适应，给 0 不刷新。 */
  refreshInterval?: number
  translations?: Partial<TimestampTranslations>
}

/**
 * 渲染为 `<time datetime>`：文本供人阅读，datetime 供机器读取，两者取自同一个墙钟。
 *
 * children 中写了内容时使用作者的文本，datetime 仍由组件计算：这正是用它包裹一段
 * 自行排版的时间表述的用法。children 为空时铺设组件格式化后的文本。
 * 相对型在没给 now 时按距今远近自动刷新，刷新节奏由状态机掌握。
 */
export function XhTimestamp({ value, type, format, locale, timeZone, now, refreshInterval, translations, children, ...rest }: XhTimestampProps): ReactNode {
  const props = withXhConfig('timestamp', { value, type, format, locale, timeZone, now, refreshInterval, translations })
  const service = useMachine(timestampMachine, () => props, { scope: useReactScope() })
  const api = connectTimestamp(service, reactNormalize)
  return (
    <time {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {/* children 里只剩空白时不算写过东西，那种情况仍铺组件的文本 */}
      {slotPaints(children) ? children : api.text}
    </time>
  )
}
