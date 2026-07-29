import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ThreadApi, ThreadSchema, ThreadStatus } from './thread.types'
import { threadAnatomy } from './thread.anatomy'

const parts = threadAnatomy.build()

export function connectThread<T extends PropTypes>(
  service: Service<ThreadSchema>,
  normalize: NormalizeProps<T>,
): ThreadApi<T> {
  const { context, prop, send } = service

  const status: ThreadStatus = prop('status') ?? 'idle'
  const atBottom = context.get('atBottom')
  const sticking = context.get('sticking')
  // 判据只看几何、不看粘附意图：粘着但内容还没追上时按钮不该冒出来
  const showScrollButton = !atBottom

  const translations = prop('translations')
  const label = {
    scrollToBottom: translations?.scrollToBottom ?? 'Scroll to bottom',
    log: translations?.log ?? 'Conversation',
  }

  return {
    status,
    atBottom,
    sticking,
    showScrollButton,
    scrollToBottom: () => send({ type: 'SCROLL_TO_BOTTOM' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-status': status,
    }),

    /**
     * role=log 让读屏知道这是一块"新内容追加在末尾"的区域，但它隐含 aria-live=polite——
     * 逐 token 追加时读屏会把每一小段都念一遍，整段话被念成碎片。所以显式关掉，
     * 播报改由 live-region 在流结束时一次性完成。
     *
     * tabindex=0 是必需的：消息区里常常一个可聚焦元素都没有，键盘用户落不进来就
     * 按不动方向键/PageUp/PageDown，整块内容对他们等于不可滚。滚动本身不接管。
     */
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'role': 'log',
      'aria-live': 'off',
      'aria-label': label.log,
      'tabindex': 0,
      'data-status': status,
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
    }),

    // 收起时只隐藏、不卸载：作者可能在按钮里放了自己的图标与过渡
    getScrollButtonProps: () => normalize.button({
      ...parts['scroll-button'].attrs,
      'type': 'button',
      'aria-label': label.scrollToBottom,
      'data-state': showScrollButton ? 'visible' : 'hidden',
      'hidden': !showScrollButton || undefined,
      'onClick': () => send({ type: 'SCROLL_TO_BOTTOM' }),
    }),

    /**
     * 播报区。宿主只在一轮流结束时把整段最终文本写进来，中途一个字都不写：
     * aria-atomic=true 意味着每次变动都重念整块，中途写就等于把同一段话越念越长。
     */
    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'role': 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    }),
  }
}
