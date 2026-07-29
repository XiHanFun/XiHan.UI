import type { ComponentMeta } from '../spec/types'

// 只有 root 缺不得：它就是那个 `<form>`，提交事件与整表状态都长在它身上。
// 其余部件可缺省：值全靠 api.setFieldValue 写的表单不需要字段容器；
// 错误只挂在各字段 error-text 上的表单不需要错误摘要；
// 靠回车隐式提交或从页面别处调 api.submit 的表单不写那两颗按钮。
export const formMeta: ComponentMeta = {
  component: 'form',
  requiredParts: ['root'],
}
