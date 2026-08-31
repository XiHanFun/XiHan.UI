import type { ComponentMeta } from '../spec/types'

// 三件全必需：root 是焦点环与三视觉轴的落点，input 是值，submit-trigger 缺了就没有指针入口。
export const promptInputMeta: ComponentMeta = {
  component: 'prompt-input',
  requiredParts: ['root', 'input', 'submit-trigger'],
}
