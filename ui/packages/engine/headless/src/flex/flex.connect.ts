/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 flex 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { FlexApi, FlexBreakpoint, FlexByBreakpoint, FlexProps, FlexResponsive } from './flex.types'
import { dataAttr } from '@xihan-ui/core'
import { flexAnatomy } from './flex.anatomy'

const parts = flexAnatomy.build()

/** 断点档位，自窄到宽。 */
const BREAKPOINTS: readonly FlexBreakpoint[] = ['sm', 'md', 'lg', 'xl']

/**
 * 一个可逐档写的取值归一成五档：给单值或不给时只有 base 那一格有值；给断点对象时逐档取，没写的档是 undefined。
 * 属性名不由这里拼——它们是公开面，得在调用处按字面写着才盯得住改名。
 */
function tiers<V extends string>(value: FlexResponsive<V> | undefined): Required<Record<'base' | FlexBreakpoint, V | undefined>> {
  const byTier: FlexByBreakpoint<V> = value != null && typeof value === 'object' ? value : { base: value }
  const out = { base: byTier.base } as Required<Record<'base' | FlexBreakpoint, V | undefined>>
  for (const at of BREAKPOINTS)
    out[at] = byTier[at]
  return out
}

// Flex 无状态机：一维排布不持有任何状态，六个排版参数原样落成 data-*，换算成哪条 CSS 规则由皮肤定。
// 方向、对齐、分布与间距可以按断点分档，也只是多落几个 data-<轴>-<档>，
// 哪一档在多宽的视口上接管由皮肤的媒体查询定，这里不量视口。
// 根上不写 role：容器只做排布，里面装的是列表还是一组按钮由作者自己声明。
export function connectFlex<T extends PropTypes>(
  props: FlexProps,
  normalize: NormalizeProps<T>,
): FlexApi<T> {
  const orientation = tiers(props.orientation)
  const align = tiers(props.align)
  const justify = tiers(props.justify)
  const gap = tiers(props.gap)
  return {
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 方向恒有值：缺省 horizontal，读一眼 DOM 就知道这一层往哪排
      'data-orientation': orientation.base ?? 'horizontal',
      'data-orientation-sm': orientation.sm,
      'data-orientation-md': orientation.md,
      'data-orientation-lg': orientation.lg,
      'data-orientation-xl': orientation.xl,
      'data-align': align.base,
      'data-align-sm': align.sm,
      'data-align-md': align.md,
      'data-align-lg': align.lg,
      'data-align-xl': align.xl,
      'data-justify': justify.base,
      'data-justify-sm': justify.sm,
      'data-justify-md': justify.md,
      'data-justify-lg': justify.lg,
      'data-justify-xl': justify.xl,
      'data-gap': gap.base,
      'data-gap-sm': gap.sm,
      'data-gap-md': gap.md,
      'data-gap-lg': gap.lg,
      'data-gap-xl': gap.xl,
      'data-wrap': dataAttr(props.wrap),
      'data-inline': dataAttr(props.inline),
    }),

    // 分隔符两端产出同一份属性：Vue 侧由 split 插槽在每道缝里铺一个，WC 侧由作者逐个写在 root 里。
    // aria-hidden 恒为真：它是装饰，逐条念出来只会打断内容。
    getSplitProps: () => normalize.element({
      ...parts.split.attrs,
      'aria-hidden': true,
    }),
  }
}
