import type { ComponentMeta } from '../spec/types'

// 两个都必备：缺 root 就没有量判定线的参照，也没人撑住脱流后空出来的位置；缺 content 则无处可钉。
export const affixMeta: ComponentMeta = {
  component: 'affix',
  requiredParts: ['root', 'content'],
}
