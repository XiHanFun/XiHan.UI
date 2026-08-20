import type { ComponentMeta } from '../spec/types'

export const spaceMeta: ComponentMeta = {
  component: 'space',
  // 只锁 root：没有它就没有排布容器。
  // split 按缝铺开，不写分隔符或只有一个子项时它是零个，进这份清单会让这两种正常用法报缺件。
  requiredParts: ['root'],
}
