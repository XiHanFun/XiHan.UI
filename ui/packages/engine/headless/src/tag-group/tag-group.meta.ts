import type { ComponentMeta } from '../spec/types'

// list 承载 role=grid、键盘收口与 roving 的兜底停靠点，缺了它这排标签对键盘就是一盘散沙；
// item 是作者侧的写法名（渲出来是 tag 的 root），无条目的组则无从导航；
// cell 是 row 的唯一合法孩子，缺了它整块表格语义就断了。
// root / label 与摘除钮都可缺省。
export const tagGroupMeta: ComponentMeta = {
  component: 'tag-group',
  requiredParts: ['list', 'item', 'cell'],
}
