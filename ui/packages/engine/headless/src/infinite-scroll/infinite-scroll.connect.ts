import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { InfiniteScrollApi, InfiniteScrollSchema } from './infinite-scroll.types'
import { dataAttr } from '@xihan-ui/kernel'
import { infiniteScrollAnatomy } from './infinite-scroll.anatomy'

const parts = infiniteScrollAnatomy.build()

export function connectInfiniteScroll<T extends PropTypes>(
  service: Service<InfiniteScrollSchema>,
  normalize: NormalizeProps<T>,
): InfiniteScrollApi<T> {
  const { state } = service

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
  }
}
