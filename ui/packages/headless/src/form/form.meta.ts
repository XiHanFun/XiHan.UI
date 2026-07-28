import type { ComponentMeta } from '../spec/types'

// 只有 root 是缺不得的：它就是那个 `<form>`，提交事件、preventDefault 与整表状态全长在它身上。
// 其余都可缺省且各有正当缺席的场景——
// 字段容器：值全靠 api.setFieldValue 写的表单一个都不需要；
// 错误摘要：错误只挂在各字段的 error-text 上时不必再汇总一遍；
// 两颗按钮：只靠回车隐式提交、或由页面别处的按钮调 api.submit 的表单都不写。
export const formMeta: ComponentMeta = {
  component: 'form',
  requiredParts: ['root'],
}
