import { createAnatomy } from '@xihan-ui/kernel'

// select-all-trigger 是那颗第三态全选格，与 table 的同名部件同物；
// 库里的 trigger 一律指「开合这个组件的那一位」，全选不是开合，故不叫 trigger。
export const checkboxGroupAnatomy = createAnatomy('checkbox-group', [
  'root',
  'label',
  'item',
  'indicator',
  'item-text',
  'hidden-input',
  'select-all-trigger',
])
