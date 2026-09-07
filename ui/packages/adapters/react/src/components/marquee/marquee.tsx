import type { MarqueeDirection, MarqueeProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectMarquee } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { MarqueeProvider, useMarqueeContext } from './context'

export interface XhMarqueeRootProps extends ComponentPropsWithRef<'div'> {
  /** 滚动方向，缺省 left；轴由方向推出，另落成 data-orientation。 */
  direction?: MarqueeDirection
  /** 名义上的每秒像素数，落成根上的内联变量；只收有限正数。 */
  speed?: number
  /** 指针停在窗口上时暂停。 */
  pauseOnHover?: boolean
  /** 受控暂停，比 pauseOnHover 优先。 */
  paused?: boolean
  /** 内容不足时重复铺满：轨道里铺两份内容。 */
  autoFill?: boolean
}

/** 跑马灯的窗口：内容在这一层里被裁掉，怎么滚归皮肤。 */
export function XhMarqueeRoot({
  direction,
  speed,
  pauseOnHover,
  paused,
  autoFill,
  children,
  ...rest
}: XhMarqueeRootProps): ReactNode {
  const api = connectMarquee(
    { direction, speed, pauseOnHover, paused, autoFill } satisfies MarqueeProps,
    reactNormalize,
  )
  return (
    <MarqueeProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </MarqueeProvider>
  )
}

export interface XhMarqueeContentProps extends ComponentPropsWithRef<'div'> {}

/**
 * 轨道：走的是这一层。children 按 api.copies 铺若干份，每份包一层壳。
 *
 * 包壳是为了让每份等长：接缝对不对得上，看的是「走完的距离恰好等于一份的长度」这一条。
 * 第一份之后的都是副本，同时标 aria-hidden 与 inert：读屏不念第二遍，Tab 也不会停在副本上——
 * 只标 aria-hidden 而留着可聚焦的副本，焦点会落进一个读屏看不见的地方。
 * children 里只剩空白时一份都不铺——白铺一份只会让轨道多出一段空白在那儿转。
 */
export function XhMarqueeContent({ children, ...rest }: XhMarqueeContentProps): ReactNode {
  const ctx = useMarqueeContext()
  const copies: ReactNode[] = []
  if (slotPaints(children)) {
    for (let i = 0; i < ctx.api.copies; i++) {
      const copy = i > 0
      copies.push(
        <div
          key={i}
          data-xh-copy={String(i)}
          aria-hidden={copy ? 'true' : undefined}
          inert={copy ? true : undefined}
        >
          {children}
        </div>,
      )
    }
  }
  return (
    <div {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {copies}
    </div>
  )
}
