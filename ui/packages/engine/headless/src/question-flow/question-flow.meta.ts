import type { ComponentMeta } from '../spec/types'

// track 与 question 缺一，题目栈就无处安放，量测也没有参照系；
// submit-trigger 缺了这份问卷就交不上去。其余按用法取舍：
// viewport 不渲染就退成不裁切的长列表，footer / counter / result 都只是排布与显示。
export const questionFlowMeta: ComponentMeta = {
  component: 'question-flow',
  requiredParts: ['root', 'track', 'question', 'submit-trigger'],
}
