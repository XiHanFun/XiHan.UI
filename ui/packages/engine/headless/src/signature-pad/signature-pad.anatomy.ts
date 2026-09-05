import { createAnatomy } from '@xihan-ui/core'

// root 是包住标题、画布、清空按钮与表单影子的外壳；control 是那块接指针的画布；
// path 是承载全部笔迹的那一条路径（每一笔是它的一条子路径），guide 是画布上的基准线；
// status 是把"签没签"念给读屏的活区域。
export const signaturePadAnatomy = createAnatomy('signature-pad', [
  'root',
  'label',
  'control',
  'guide',
  'path',
  'clear-trigger',
  'status',
  'hidden-input',
])
