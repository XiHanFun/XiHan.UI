import type { ComponentMeta } from '../spec/types'

// 两侧面板与两侧的 list 缺一即违约：role=listbox、可及名字与键盘入口全在 list 上，
// 而面板是"哪一侧"这个身份的唯一载体（条目归属靠它判）。
// to-target-trigger 也是必备——没有它就没有任何搬运入口，控件不成其为穿梭框；
// to-source-trigger 反过来可缺省（oneWay 本就不需要它）。
// item 不列为必备：一侧可以是空的，那是正常态。
// panel-header/panel-title/panel-count/search/select-all-trigger 都是可选装点。
export const transferMeta: ComponentMeta = {
  component: 'transfer',
  requiredParts: ['source-panel', 'target-panel', 'list', 'to-target-trigger'],
}
