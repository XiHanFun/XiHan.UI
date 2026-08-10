import type { ComponentMeta } from '../spec/types'

// 没有 control 与 input 就无从输入标签；label / clear-trigger / hidden-input 由作者按需要挂。
// item 那一族是按标签集合渲染出来的，空集合时一个都没有，因此不能算必备。
export const tagsInputMeta: ComponentMeta = {
  component: 'tags-input',
  requiredParts: ['root', 'control', 'input'],
}
