/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 log 相关实现。

import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { LogApi, LogLineProps, LogProps, LogSchema } from './log.types'
import { dataAttr } from '@xihan-ui/core'
import { pressHandlers } from '../shared/press'
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
  const showScrollToEndTrigger = !atBottom
  // 键盘 / 触屏按住期间的按压面；指针按住由 :active 表出，家族配方两者同一档
  const press = pressHandlers(service)

  return {
    rows,
    loading,
    atBottom,
    sticking,
    showScrollToEndTrigger,
    scrollToBottom: () => send({ type: 'SCROLL_TO_BOTTOM' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-size': props.size,
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

    // 行拿身份、等宽排版与级别；文本、时间戳、标注全由作者写
    getLineProps: (line?: LogLineProps) => normalize.element({
      ...parts.line.attrs,
      'data-level': line?.level,
    }),

    // 收起时置 hidden，不卸载节点
    // 回底钮是浮在内容之上的单图标动作：接 Action Control 的 floating 档（circle 正方盒），ghost 形态、
    // 固定 xs（--xh-control-box-sm 32px，与此前 --xh-control-h-sm 同尺寸），材质由皮肤按角落浮钮族给 frosted
    getScrollToEndTriggerProps: () => normalize.button({
      ...parts['scroll-to-end-trigger'].attrs,
      'type': 'button',
      'data-xh-action-control': '',
      'data-xh-action-profile': 'floating',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'xs',
      'aria-label': label.scrollToBottom,
      'data-state': showScrollToEndTrigger ? 'visible' : 'hidden',
      'hidden': !showScrollToEndTrigger || undefined,
      // Space / Enter 与触屏按住投影 data-pressed，家族的按下面同时认它与指针 :active；在底收起时不进
      'data-pressed': dataAttr(context.get('pressed')),
      'onClick': () => send({ type: 'SCROLL_TO_BOTTOM' }),
      'onKeyDown': press.onKeyDown,
      'onKeyUp': press.onKeyUp,
      'onBlur': press.onBlur,
      'onPointerDown': press.onPointerDown,
      'onPointerUp': press.onPointerUp,
      'onPointerCancel': press.onPointerCancel,
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
