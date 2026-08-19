import type { Direction } from '@xihan-ui/kernel'

/**
 * 元素此刻的书写方向，从计算样式现读。
 *
 * 横向导航的左右键语义得跟着视觉顺序走，而视觉顺序由祖先链上任意一处的 dir 属性
 * （或 CSS 的 direction）决定：分段控件把年月日、时分秒、验证码格子按 inline 流排开，
 * 整页切成 rtl 时它们的视觉次序就整体翻转，此时 ArrowRight 该走向序号更小的那一段。
 *
 * 不改成让组件收一个 dir prop：那要求作者把已经写在祖先上的方向再声明一遍，
 * 两处一旦不一致，键盘与视觉就会各说各话。键盘处理发生在事件时刻，那时 DOM 一定在场。
 */
export function readDirection(el: Element | null | undefined): Direction {
  const win = el?.ownerDocument?.defaultView
  if (!win)
    return 'ltr'
  // 计算样式是首选：dir 属性与 CSS 的 direction 都算进它，继承也已经解出来
  const computed = win.getComputedStyle(el as Element).direction
  if (computed === 'rtl' || computed === 'ltr')
    return computed
  // 拿不到值就退回最近一处显式声明：有的宿主（jsdom）不为 direction 做继承计算，
  // 那时整条链上只有写了 dir 的那个祖先说得出方向
  return (el as Element).closest('[dir]')?.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr'
}
