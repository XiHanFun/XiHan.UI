import type { ComponentMeta } from '../spec/types'

// root / viewport / item-group 缺一即违约：region 语义与名字在 root，
// 裁切与活区在 viewport，被位移的那条轨道是 item-group——少任何一个，
// 剩下的部件都无处安放。
// item 不列为必备：条目数是作者声明的（slideCount），一张都没有是正常的空态。
// 两端按钮与指示点都可缺省：只用键盘或只用拖拽的轮播是成立的形态。
export const carouselMeta: ComponentMeta = {
  component: 'carousel',
  requiredParts: ['root', 'viewport', 'item-group'],
}
