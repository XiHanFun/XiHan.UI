/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 infinite scroll 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { InfiniteScrollApi, InfiniteScrollSchema } from './infinite-scroll.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
import { infiniteScrollAnatomy } from './infinite-scroll.anatomy'

const parts = infiniteScrollAnatomy.build()

export function connectInfiniteScroll<T extends PropTypes>(
  service: Service<InfiniteScrollSchema>,
  normalize: NormalizeProps<T>,
): InfiniteScrollApi<T> {
  const { send, state, context } = service

  const phase = state.get()
  const loading = phase === 'loading'
  const disabled = phase === 'paused'
  // 按压通道：真源在机器 context，跟踪器只把 Space / Enter 与触屏按住翻成事件；指针按住由 :active 表出
  const pressed = context.get('pressed')
  const press = pressHandlers(service)

  return {
    phase,
    loading,
    disabled,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-loading': dataAttr(loading),
      'data-disabled': dataAttr(disabled),
      // 取数期间这块内容正在变，读屏据此推迟播报
      'aria-busy': loading ? 'true' : undefined,
    }),

    // 哨兵是纯机制，尺寸由皮肤给成一条细线，不进无障碍树
    getSentinelProps: () => normalize.element({
      ...parts.sentinel.attrs,
      'aria-hidden': true,
    }),

    // 读屏在虚拟光标模式下不产生滚动事件，哨兵那条路够不着；这个按钮是它的键盘等价通路。
    // 文案由作者写在按钮里：写死一句英文会与可见文字对不上，读屏念的与眼睛看的就分了家。
    // 它是铺满一行的独立动作条目（§9.2 load-more trigger）：接 Action Control 的 row 档、outline 形态，
    // 宽度由容器给、高度随内容、按下只换面不缩放；盒几何、悬停 / 按下 / 禁用面与粗指针热区由家族给。
    // 本组件没有 size 轴，档位固定 md
    getLoadMoreTriggerProps: () => normalize.button({
      ...parts['load-more-trigger'].attrs,
      'data-xh-action-control': '',
      'data-xh-action-profile': 'row',
      'data-xh-action-variant': 'outline',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
      'type': 'button',
      'disabled': loading || disabled || undefined,
      'data-loading': dataAttr(loading),
      'data-disabled': dataAttr(disabled),
      // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active（row 档只换面）
      'data-pressed': dataAttr(pressed),
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
      'onClick': () => send({ type: 'LOAD' }),
    }),
  }
}
