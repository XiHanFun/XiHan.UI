import type { ComponentMeta } from '../spec/types'

// hidden-input 缺一即违约：打开系统文件选择框只有 input.click() 一条路，
// 它不在场时点投放区、点按钮、按 Enter 全都是空操作，控件根本收不到文件。
// dropzone 与 trigger 互为备选（只放一个按钮的上传控件很常见），
// 列表三件套（item-group/item/…）在没选文件时本就不该渲染，因此都可缺省。
export const fileUploadMeta: ComponentMeta = {
  component: 'file-upload',
  requiredParts: ['hidden-input'],
}
