import type { ComponentMeta } from '../spec/types'

// content 缺一即违约（role=listbox、可及名字与键盘入口全在它身上）；
// 没有 item 的 listbox 不成其为列表。root/label 与分组三件套可缺省——
// 无标题的列表由 aria-label 一类的作者属性顶上，分组本就是可选结构。
export const listboxMeta: ComponentMeta = {
  component: 'listbox',
  requiredParts: ['content', 'item'],
}
