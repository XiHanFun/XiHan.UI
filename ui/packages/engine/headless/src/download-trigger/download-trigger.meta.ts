import type { ComponentMeta } from '../spec/types'

// 只有一个 part，缺了它就没有可点的东西，下载无从发起。
export const downloadTriggerMeta: ComponentMeta = {
  component: 'download-trigger',
  requiredParts: ['root'],
}
