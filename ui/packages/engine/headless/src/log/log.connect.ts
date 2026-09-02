import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { LogApi, LogProps, LogSchema } from './log.types'
import { dataAttr } from '@xihan-ui/kernel'
import { logAnatomy } from './log.anatomy'

const parts = logAnatomy.build()

/**
 * 行高槽位与它的兜底值，兜底须与皮肤里 --xh-log-line-height 的兜底逐字一致，
 * 否则按行数算出的视口高度对不上行。
 */
const LINE_HEIGHT = 'var(--xh-log-line-height, 1.25rem)'

/**
 * 日志视图的连接层。机器只管粘底与"回到底部"，行数、载入态与文案都是视图属性走第二参。
 * 行的内容由作者渲染，这里只发身份。
 */
export function connectLog<T extends PropTypes>(
  service: Service<LogSchema>,
  props: LogProps,
  normalize: NormalizeProps<T>,
): LogApi<T> {
  const { context, send } = service

  const atBottom = context.get('atBottom')
  const sticking = context.get('sticking')
  const loading = !!props.loading
  // 非正数与小数一律当没给：定高得是整数行
  const rows = props.rows != null && Number.isFinite(props.rows) && props.rows > 0
    ? Math.floor(props.rows)
    : undefined
  const label = {
    log: props.translations?.log ?? 'Log',
    scrollToBottom: props.translations?.scrollToBottom ?? 'Scroll to bottom',
  }
  // 只按 atBottom 判定，不看粘附意图
  const showScrollButton = !atBottom

  return {
    rows,
    loading,
    atBottom,
    sticking,
    showScrollButton,
    scrollToBottom: () => send({ type: 'SCROLL_TO_BOTTOM' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-loading': dataAttr(loading),
      'data-at-bottom': dataAttr(atBottom),
      'data-sticking': dataAttr(sticking),
    }),

    // role=log 标记这是一块会追加的区域，显式关掉它隐含的 aria-live：一行一句地念，
    // 连成串的输出就成了读屏里的噪声。播报走 live-region，由宿主决定念哪一句、什么时候念。
    // 取行期间置 aria-busy；tabindex=0 让键盘用户能聚焦并用原生按键滚动。
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'role': 'log',
      'aria-live': 'off',
      'aria-label': label.log,
      'aria-busy': loading ? 'true' : undefined,
      'tabindex': 0,
      // 按行数定高：行高本身是皮肤的槽位，这里只做乘法；rows 缺席时写空串把高度还给皮肤。
      // 写成 style 而非 CSS 自定义属性，WC 侧的属性铺设写不进 --* 变量
      'style': { blockSize: rows ? `calc(${LINE_HEIGHT} * ${rows})` : '' },
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
    }),

    // 行只拿身份与等宽排版，文本、级别、标注全由作者写
    getLineProps: () => normalize.element({
      ...parts.line.attrs,
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

    /** 播报区，aria-atomic 为 true，宿主往里写整句要念的话，比如一段输出的收尾结论。 */
    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'role': 'status',
      'aria-live': 'polite',
      'aria-atomic': 'true',
    }),
  }
}
