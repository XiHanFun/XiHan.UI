import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { PageHeaderApi, PageHeaderProps } from './page-header.types'
import { dataAttr } from '@xihan-ui/kernel'
import { pageHeaderAnatomy } from './page-header.anatomy'

const parts = pageHeaderAnatomy.build()

// PageHeader 无状态机：页头不持有任何交互状态，属性全部由 props 算出。
// 根上不写 role：这一块算不算 banner 地标取决于它摆在页面的哪一层，由作者自己声明。
export function connectPageHeader<T extends PropTypes>(
  props: PageHeaderProps,
  normalize: NormalizeProps<T>,
): PageHeaderApi<T> {
  return {
    // 尺寸与分隔线只落在根上，各段从这里继承私有槽，子部件不重复标注
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-size': props.size,
      'data-bordered': dataAttr(props.bordered),
    }),

    // 返回位只给身份与位置：标签、type、可及名字、点了往哪走，全归作者自己的按钮
    getBackTriggerProps: () => normalize.element({ ...parts['back-trigger'].attrs }),

    // 标题不占标题层级：页头嵌在页面哪一层由使用者决定，组件自己插一级标题会污染文档大纲
    getTitleProps: () => normalize.element({ ...parts.title.attrs }),

    getDescriptionProps: () => normalize.element({ ...parts.description.attrs }),

    // 操作槽只圈出按钮区，按钮本身的语义归作者（或 Button 组件）
    getExtraProps: () => normalize.element({ ...parts.extra.attrs }),

    // 页脚整行另起，装描述、标签页或一组摘要
    getFooterProps: () => normalize.element({ ...parts.footer.attrs }),
  }
}
