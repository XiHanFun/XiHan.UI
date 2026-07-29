import type { ComponentMeta } from '../spec/types'

// root 缺一即违约：语言与闭合标记挂在它身上，皮肤按它取用。
// pre 是撑高与横向滚动的那层，也是唯一的 Tab 停靠点，缺了键盘用户就够不着溢出的代码。
// code 承载代码文本本身，缺了就没有内容可言。
// lang-label 可缺省：它是纯装饰角标，作者不想显示语言时整枚不渲染也仍是个正确的代码块。
export const codeBlockMeta: ComponentMeta = {
  component: 'code-block',
  requiredParts: ['root', 'pre', 'code'],
}
