import type { ComponentMeta } from '../spec/types'

// 三个 part 一个都不能少：
// input 是唯一的输入口；submit-trigger 是指针用户唯一的发送与停止入口（键盘用户还有 Enter，
// 指针用户没有替代路径，缺了就再也停不下一次流式回答）；root 承载 data-status，
// 皮肤靠它区分待命与流式。
export const composerMeta: ComponentMeta = {
  component: 'composer',
  requiredParts: ['root', 'input', 'submit-trigger'],
}
