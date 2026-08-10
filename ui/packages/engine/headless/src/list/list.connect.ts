import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { ListApi, ListProps } from './list.types'
import { dataAttr } from '@xihan-ui/kernel'
import { listAnatomy } from './list.anatomy'

const parts = listAnatomy.build()

// List 无状态机：列表不持有交互状态，属性全部由 props 算出。
// 根与条目都不写 role：这份内容是不是列表、这一条算不算列表项，由作者选 ul/ol/li 还是 div 表达。
export function connectList<T extends PropTypes>(
  props: ListProps,
  normalize: NormalizeProps<T>,
): ListApi<T> {
  // 一个轴与三个开关只落在根上，条目各段从这里继承私有槽，子部件不重复标注
  const rootAttrs = {
    ...parts.root.attrs,
    'data-size': props.size,
    'data-bordered': dataAttr(props.bordered),
    'data-hoverable': dataAttr(props.hoverable),
    'data-split': dataAttr(props.split),
  }

  return {
    getRootProps: () => normalize.element(rootAttrs),
    getItemProps: () => normalize.element(parts.item.attrs),
    // 媒体位只圈出图像/头像/图标那一格，画什么、要不要可及名字归作者
    getItemMediaProps: () => normalize.element(parts['item-media'].attrs),
    getItemContentProps: () => normalize.element(parts['item-content'].attrs),
    // 标题不占标题层级：列表嵌在页面哪一层由使用者决定，组件自己插一级标题会污染文档大纲
    getItemTitleProps: () => normalize.element(parts['item-title'].attrs),
    getItemDescriptionProps: () => normalize.element(parts['item-description'].attrs),
    // 操作位只圈出按钮区，按钮本身的语义归作者
    getItemActionProps: () => normalize.element(parts['item-action'].attrs),
  }
}
