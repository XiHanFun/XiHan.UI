import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { ResultApi, ResultProps } from './result.types'
import { resultAnatomy } from './result.anatomy'

const parts = resultAnatomy.build()

// Result 无状态机：结果页不持有交互状态，属性全部由 props 算出。
export function connectResult<T extends PropTypes>(
  props: ResultProps,
  normalize: NormalizeProps<T>,
): ResultApi<T> {
  return {
    // 两个轴只落在根上，各段从根上继承私有槽，子部件不重复标注。
    // 根上不写 role：整页结果随页面一起呈现，没有"更新"可播报；
    // 就地换出来的结果用 empty-state 或 alert 的活区。
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-status': props.status,
      'data-size': props.size,
    }),

    // 图标是纯装饰，对读屏隐藏：它表达的信息标题里已经写了。
    // 画什么由作者塞进这个槽，库不带插画资产，status 只决定这块的语气色。
    getIconProps: () => normalize.element({
      ...parts.icon.attrs,
      'aria-hidden': true,
    }),

    // 标题不占标题层级：结果页嵌在页面哪一层由使用者决定，组件自己插一级标题会污染文档大纲
    getTitleProps: () => normalize.element({ ...parts.title.attrs }),

    getDescriptionProps: () => normalize.element({ ...parts.description.attrs }),

    // 操作槽只圈出按钮区，按钮本身的语义归作者（或 Button 组件）
    getActionProps: () => normalize.element({ ...parts.action.attrs }),
  }
}
