import type { ComponentMeta } from '../spec/types'

export const statisticMeta: ComponentMeta = {
  component: 'statistic',
  // 只有根是必备的：标签、前后缀都可以不给，只摆一个数值也是一块合法的统计
  requiredParts: ['root'],
}
