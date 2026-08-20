import type { ComponentMeta } from '../spec/types'

// root 缺省则单选组语义与键盘收口都无处安放；一段都没有的分段控件无从操作。
// item-text / indicator / hidden-input 都可以不渲染：文字能直接落在段里，指示器是装饰，
// 隐藏输入只在参与表单提交时才需要。
export const segmentedMeta: ComponentMeta = {
  component: 'segmented',
  requiredParts: ['root', 'item'],
}
