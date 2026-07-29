import type { ComponentMeta } from '../spec/types'

// 两侧面板与两侧的 list 必需：role=listbox、可及名字与键盘入口全在 list 上，
// 面板是哪一侧这个身份的唯一载体。
// to-target-trigger 是唯一必备的搬运入口；to-source-trigger 可缺省（oneWay 不需要它）。
// item 不列为必备（一侧可以是空的）；panel-header/panel-title/panel-count/search/select-all-trigger 都可选。
export const transferMeta: ComponentMeta = {
  component: 'transfer',
  requiredParts: ['source-panel', 'target-panel', 'list', 'to-target-trigger'],
}
