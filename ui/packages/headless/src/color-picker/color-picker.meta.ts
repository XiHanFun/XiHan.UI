import type { ComponentMeta } from '../spec/types'

// content 缺一即违约：浮层的身份（role=dialog、aria-controls 的目标）全在它身上。
// area 与 area-thumb 是取色器之所以是取色器的那一部分，缺了就只剩一个色块。
// trigger 是浮层的定位锚点，没有它浮层落不了位。
// 两条通道滑杆、数值框、屏幕取色按钮、预设色板都可缺省——
// 只给色相不给透明度、不给数值框都是正常的用法组合。
export const colorPickerMeta: ComponentMeta = {
  component: 'color-picker',
  requiredParts: ['trigger', 'content', 'area', 'area-thumb'],
}
