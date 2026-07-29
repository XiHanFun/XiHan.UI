import type { ComponentMeta } from '../spec/types'

// 两条通道滑杆、数值框、屏幕取色按钮、预设色板都可缺省。
export const colorPickerMeta: ComponentMeta = {
  component: 'color-picker',
  requiredParts: ['trigger', 'content', 'area', 'area-thumb'],
}
