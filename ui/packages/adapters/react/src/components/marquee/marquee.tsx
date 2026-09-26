/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 marquee 相关实现。

import type { MarqueeDirection, MarqueeSchema, MarqueeTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectMarquee, marqueeMachine } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { slotPaints } from '../../runtime/slot-content'
import { useMachine } from '../../runtime/use-machine'
import { MarqueeProvider, useMarqueeContext } from './context'

type MarqueeProps = MarqueeSchema['props']

export interface XhMarqueeRootProps extends ComponentPropsWithRef<'div'> {
  /** 滚动方向，默认 left；轴由方向推出，另写为 data-orientation。 */
  direction?: MarqueeDirection
  /** 名义上的每秒像素数，写为根上的内联变量；只接受有限正数。 */
  speed?: number
  /** 指针停在窗口上、或键盘焦点落进窗口时暂停，默认开启；写 false 关掉。 */
  pauseOnHover?: boolean
  /** 受控暂停：给了它，暂停开关只报 onPausedChange，由作者写回。 */
  paused?: boolean
  /** 非受控暂停的初值，默认 false。 */
  defaultPaused?: boolean
  /** 内容不足时重复铺满：轨道中铺设两份内容。 */
  autoFill?: boolean
  /** 暂停开关在两种状态下的可及名，默认英文。 */
  translations?: Partial<MarqueeTranslations>
  onPausedChange?: MarqueeProps['onPausedChange']
}

/** 跑马灯的窗口：内容在这一层中被裁剪，如何滚动归皮肤。 */
export function XhMarqueeRoot({
  direction,
  speed,
  pauseOnHover,
  paused,
  defaultPaused,
  autoFill,
  translations,
  onPausedChange,
  children,
  ...rest
}: XhMarqueeRootProps): ReactNode {
  const props = withXhConfig('marquee', {
    direction,
    speed,
    pauseOnHover,
    paused,
    defaultPaused,
    autoFill,
    translations,
    onPausedChange,
  }) as MarqueeProps
  // 暂停开关带 aria-controls 指向轨道的 id：用 useId 派生的 scope，服务端与水合两侧同号
  const service = useMachine(marqueeMachine, () => props, { scope: useReactScope() })
  const api = connectMarquee(service, reactNormalize)
  return (
    <MarqueeProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </MarqueeProvider>
  )
}

XhMarqueeRoot.xhEvents = ['paused-change'] as const

export interface XhMarqueeContentProps extends ComponentPropsWithRef<'div'> {}

/**
 * 轨道：滚动的是这一层。children 按 api.copies 铺设若干份，每份包一层壳。
 *
 * 包壳是为了让每份等长：接缝能否对齐，取决于滚动完成的距离恰好等于一份的长度。
 * 第一份之后的都是副本，同时标 aria-hidden 与 inert：读屏不朗读第二遍，Tab 也不会停在副本上：
 * 只标 aria-hidden 而保留可聚焦的副本，焦点会落进一个读屏看不见的位置。
 * children 中只剩空白时一份都不铺设：铺设只会让轨道多出一段空白滚动。
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

export interface XhMarqueeAutoplayTriggerProps extends ComponentPropsWithRef<'button'> {}

/** 暂停开关：原生 button，Enter / Space 的激活与 Tab 停靠由平台提供；不给内容时皮肤画暂停 / 播放图标。 */
export function XhMarqueeAutoplayTrigger({ children, ...rest }: XhMarqueeAutoplayTriggerProps): ReactNode {
  const ctx = useMarqueeContext()
  return (
    <button {...mergeReactProps(ctx.api.getAutoplayTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}
