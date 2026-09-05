import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { InfiniteScrollApi, InfiniteScrollSchema } from './infinite-scroll.types'
import { dataAttr } from '@xihan-ui/core'
import { infiniteScrollAnatomy } from './infinite-scroll.anatomy'

const parts = infiniteScrollAnatomy.build()

export function connectInfiniteScroll<T extends PropTypes>(
  service: Service<InfiniteScrollSchema>,
  normalize: NormalizeProps<T>,
): InfiniteScrollApi<T> {
  const { send, state } = service

  const phase = state.get()
  const loading = phase === 'loading'
  const disabled = phase === 'paused'

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
    // 文案由作者写在按钮里：写死一句英文会与可见文字对不上，读屏念的与眼睛看的就分了家
    getLoadMoreTriggerProps: () => normalize.button({
      ...parts['load-more-trigger'].attrs,
      'type': 'button',
      'disabled': loading || disabled || undefined,
      'data-loading': dataAttr(loading),
      'data-disabled': dataAttr(disabled),
      'onClick': () => send({ type: 'LOAD' }),
    }),
  }
}
