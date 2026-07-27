import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { BreadcrumbApi, BreadcrumbProps } from './breadcrumb.types'
import { dataAttr } from '@xihan-ui/core'
import { breadcrumbAnatomy } from './breadcrumb.anatomy'

const parts = breadcrumbAnatomy.build()

// Breadcrumb 无状态机：一条路径没有"阶段"可分，属性全部来自 props 与部件自报的声明。
// 结构语义靠标签自己给（root 是 nav、list 是 ol、item/separator/ellipsis 是 li），
// 这里只补标签给不了的那部分：地标名字、当前页标记、装饰节点的隐藏。
export function connectBreadcrumb<T extends PropTypes>(
  props: BreadcrumbProps,
  normalize: NormalizeProps<T>,
): BreadcrumbApi<T> {
  const label = props.translations?.root ?? 'Breadcrumb'

  return {
    // 根节点须是 nav 地标：面包屑是"回到上层"的导航，读屏用户靠地标列表直接跳进来。
    // 地标语义由标签给，这里只往上打名字。
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label,
      // 只有作者显式给了才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': props.dir,
    }),

    // list 须是 ol：面包屑是有序的层级路径，读屏会念"列表，共 n 项，第 k 项"，
    // 换成 div 这层结构就没了。有序性由标签给，这里不再补 role。
    getListProps: () => normalize.element({
      ...parts.list.attrs,
    }),

    getItemProps: () => normalize.element({
      ...parts.item.attrs,
    }),

    getLinkProps: (link) => {
      const current = !!link.current
      return normalize.element({
        ...parts.link.attrs,
        // aria-current 不是布尔属性（取值是 page/step/date… 这类词），规范里它的默认值就是
        // "false"，省略即"不是当前项"，语义没有歧义。给每一条都写一遍 false 只是噪音。
        'aria-current': current ? 'page' : undefined,
        // 这个是布尔 aria，显式写 true/false：省略是"没说"，显式 false 是"明确说了不是"，
        // 读屏对这两者的处理并不一样。
        'aria-disabled': current ? 'true' : 'false',
        // 当前页那条退出 Tab 序列：它指向的就是用户此刻所在的页面，
        // 留一个停靠点只会让每次 Tab 都多按一下，按了还什么都不会发生。
        // 非当前页不写 tabindex——作者写的 <a href> 本来就在 Tab 序列里，
        // 补一个 0 反而会把它从"链接"的原生行为里挪出来（顺序照旧，语义无谓地多一层）。
        'tabindex': current ? -1 : undefined,
        'data-current': dataAttr(current),
        // "点不动"得真的点不动：aria-disabled 只是说给读屏听的，
        // 作者写在当前页那条上的 href 照样会跳转（跳到自己身上，页面白闪一次、滚动位置全丢）。
        // 拦在这里而不是让作者别写 href：作者常常是 v-for 出来的一整排，
        // 哪一条是当前页由数据决定，模板里没有"这一条不要 href"的写法。
        'onClick': (event: MouseEvent) => {
          if (current)
            event.preventDefault()
        },
      })
    },

    // 分隔符是纯视觉的：读屏念 "/" 只会念出一串标点噪音，
    // 而"第 2 项，共 4 项"这层关系 ol/li 已经说清楚了
    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'aria-hidden': 'true',
    }),

    // 折叠掉的中间层级同样只是视觉占位：省略号本身不携带信息，
    // 要让被折叠的层级可达，作者该在这儿放一个菜单，那是另一个组件的事
    getEllipsisProps: () => normalize.element({
      ...parts.ellipsis.attrs,
      'aria-hidden': 'true',
    }),
  }
}
