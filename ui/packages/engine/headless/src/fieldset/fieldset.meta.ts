import type { ComponentMeta } from '../spec/types'

// root 缺省则没有原生 <fieldset>，禁用连坐与分组语义都无处安放；
// legend 缺省则这一组没有名字，读屏只念得出"分组"两个字。
// 说明与错误文案是可选装饰件，不进这份清单。
export const fieldsetMeta: ComponentMeta = {
  component: 'fieldset',
  requiredParts: ['root', 'legend'],
}
