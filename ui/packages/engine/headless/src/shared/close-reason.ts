import type { OverlayCloseReason } from '@xihan-ui/kernel'

/** 关闭事件的最小形状：类型加一个可选的来源标记。 */
export interface CloseEventLike {
  type: string
  src?: string
}

/** 事件的 src 直接就是对外原因的那几个取值。 */
const PASS_THROUGH = new Set<string>(['esc', 'close-trigger', 'interact-outside', 'tab', 'hover', 'selection'])

/** 选中即收起的那些出口，事件名各组件略有差异。 */
const SELECTION_EVENTS = new Set<string>(['ITEM.SELECT', 'ITEM.CLICK', 'VALUE.SET', 'SELECT', 'NODE.SELECT'])

/**
 * 把关闭事件翻成交给使用者的原因。
 *
 * 原因在机器里早就算出来了——消解层回报 escape-key 还是 interact-outside、
 * 关闭按钮与 Tab 各自带 src——此前只用来决定要不要归还焦点。拿它可以区分
 * 「用户主动取消」与「选完自动收起」，前者常常要回滚草稿。
 *
 * 各组件的专有出口（选完就收、引导走完、悬停移开）由调用方在 extra 里补，
 * 认不出来的一律算 programmatic：那是代码调的，不是用户操作。
 */
export function closeReasonOf(
  event: CloseEventLike,
  extra?: (event: CloseEventLike) => OverlayCloseReason | undefined,
): OverlayCloseReason {
  const fromExtra = extra?.(event)
  if (fromExtra)
    return fromExtra

  // 独立的 ESCAPE 事件与带 src='esc' 的 CLOSE 是同一件事的两种发法
  if (event.type === 'ESCAPE')
    return 'esc'

  const src = event.src
  if (src && PASS_THROUGH.has(src))
    return src as OverlayCloseReason

  // 点触发器收起、选中后自动收起，都是用户操作，不能算成代码调用
  if (event.type === 'TOGGLE')
    return 'close-trigger'
  if (SELECTION_EVENTS.has(event.type))
    return 'selection'

  return 'programmatic'
}
