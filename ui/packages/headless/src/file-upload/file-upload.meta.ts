import type { ComponentMeta } from '../spec/types'

// hidden-input 必须在场：打开系统文件选择框只有 input.click() 一条路，缺了它所有入口都是空操作。
// 其余部件可缺省（dropzone 与 trigger 互为备选，列表部件在没选文件时不渲染）。
export const fileUploadMeta: ComponentMeta = {
  component: 'file-upload',
  requiredParts: ['hidden-input'],
}
