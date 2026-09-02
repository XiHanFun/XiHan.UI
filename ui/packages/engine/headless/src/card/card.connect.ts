import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { CardApi, CardProps } from './card.types'
import { dataAttr } from '@xihan-ui/kernel'
import { cardAnatomy } from './card.anatomy'

const parts = cardAnatomy.build()

// Card 无状态机：卡片不持有任何交互状态，属性全部由 props 算出。
// 根上不写 role：卡片是不是地标、要不要可及名字，由里面放了什么内容决定，作者自己声明。
export function connectCard<T extends PropTypes>(
  props: CardProps,
  normalize: NormalizeProps<T>,
): CardApi<T> {
  // 三个视觉轴与两个开关只落在根上，各段从这里继承私有槽，子部件不重复标注
  const rootAttrs = {
    ...parts.root.attrs,
    'data-variant': props.variant,
    'data-size': props.size,
    'data-hoverable': dataAttr(props.hoverable),
    'data-split': dataAttr(props.segmented),
  }

  return {
    getRootProps: () => normalize.element(rootAttrs),
    getCoverProps: () => normalize.element(parts.cover.attrs),
    getHeaderProps: () => normalize.element(parts.header.attrs),
    getTitleProps: () => normalize.element(parts.title.attrs),
    getDescriptionProps: () => normalize.element(parts.description.attrs),
    getBodyProps: () => normalize.element(parts.body.attrs),
    getFooterProps: () => normalize.element(parts.footer.attrs),
  }
}
