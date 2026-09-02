import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
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
  // 只按 atBottom 判定，不看粘附意图
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
      'data-state': status,
    }),

    // role=log 标记追加型区域，显式关掉其隐含的 aria-live，播报交给 live-region；
    // tabindex=0 让键盘用户能聚焦并用原生按键滚动。
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'role': 'log',
      'aria-live': 'off',
      'aria-label': label.log,
      'tabindex': 0,
      'data-state': status,
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
    }),

    // 收起时置 hidden，不卸载节点
    getScrollButtonProps: () => normalize.button({
      ...parts['scroll-button'].attrs,
      'type': 'button',
      'aria-label': label.scrollToBottom,
      'data-state': showScrollButton ? 'visible' : 'hidden',
      'hidden': !showScrollButton || undefined,
      'onClick': () => send({ type: 'SCROLL_TO_BOTTOM' }),
    }),

    /** 播报区，aria-atomic 为 true，宿主在一轮流结束时写入整段最终文本。 */
    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'role': 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    }),
  }
}
