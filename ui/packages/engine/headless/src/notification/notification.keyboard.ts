import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

// 队列容器自己不接键盘：它是地标，不抢焦点、不做方向键导航。
// 通知内部那两个按钮的键盘可达性在 toast 那张表里。
export const notificationKeyboard: KeyboardTable = {
  component: 'notification',
  source: APG,
  rows: [],
}
