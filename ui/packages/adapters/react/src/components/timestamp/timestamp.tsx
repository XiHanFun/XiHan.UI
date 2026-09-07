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
  /** 呈现方式：date 只到日、datetime 到秒、relative 说成「几分钟前」，缺省 datetime。 */
  type?: TimestampType
  /** 自定义格式串，记号是 YYYY / YY / MM / M / DD / D / HH / H / mm / m / ss / s。 */
  format?: string
  /** BCP 47 语言标记，决定用词与缺省格式串。它只换给人看的文本，datetime 恒是同一种写法。 */
  locale?: string
  /** 算相对说法时的参照时刻，缺省取当前时刻。 */
  now?: TimestampValue
}

/**
 * 渲染成 `<time datetime>`：文本给人看，datetime 给机器读，两者取自同一个墙钟。
 *
 * children 里写了东西就用作者的文本，datetime 仍由组件算——这正是拿它包一段
 * 自己排版好的时间说法的用法。children 为空时铺组件格式化出来的文本。
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
