import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { AnchorApi, AnchorSchema } from './anchor.types'
import { ITEM_VALUE_ATTR } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { anchorAnatomy } from './anchor.anatomy'

const parts = anchorAnatomy.build()

export function connectAnchor<T extends PropTypes>(
  service: Service<AnchorSchema>,
  normalize: NormalizeProps<T>,
): AnchorApi<T> {
  const { context, prop, send } = service
  const value = context.get('value') ?? null
  // 位置由机器在 effect 里量好写进 context；这里只读结果，不碰 DOM，保持纯函数
  const indicator = context.get('indicator')
  const orientation = prop('orientation') ?? 'vertical'
  const label = prop('translations')?.root ?? 'Anchor navigation'
  const smooth = !!prop('smooth')

  const isActive = (target: string): boolean => target === value

  return {
    value,
    isActive,
    setValue: next => send({ type: 'VALUE.SET', value: next }),

    // 根节点须是 nav 地标：页内目录是"跳到本页某一节"的导航，读屏用户靠地标列表直接跳进来。
    // 地标语义由标签给，这里只往上打名字。
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label,
      'data-orientation': orientation,
      // 只有作者显式给了才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
    }),

    // list 须是 ul：目录是一组并列的去处，读屏会念"列表，共 n 项"。
    // 有序性不是重点（不像面包屑那样有层级），所以是 ul 不是 ol。
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'data-orientation': orientation,
    }),

    getItemProps: () => normalize.element({
      ...parts.item.attrs,
    }),

    getLinkProps: (link) => {
      const active = isActive(link.value)
      return normalize.element({
        ...parts.link.attrs,
        // 观察器与指示条量测都以此为条目身份
        [ITEM_VALUE_ATTR]: link.value,
        // href 由目标 id 派生：它就是这个组件的全部意义，没有让作者再写一遍的道理。
        // 也因此 smooth 关掉时整条目录不靠 JS 也能用（原生片段跳转）。
        'href': `#${link.value}`,
        // 页内位置用 location，不是 page：page 说的是"这就是当前页面"，
        // 而目录里每一条指向的都是同一个页面的不同位置。
        // aria-current 不是布尔属性，规范里默认值就是 "false"，省略即"不是当前项"。
        'aria-current': active ? 'location' : undefined,
        'data-active': dataAttr(active),
        'onClick': (event: MouseEvent) => {
          // 别人已经拦下了（作者自己的处理器），就不抢
          if (event.defaultPrevented)
            return
          // 带修饰键或非主键 = 用户要在新标签页/新窗口打开，交回浏览器
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
            return
          // 平滑滚动由机器接管，原生的瞬时跳转得先拦下来；
          // 不平滑时不拦，让浏览器自己跳（还会顺手更新地址栏的片段）
          if (smooth)
            event.preventDefault()
          send({ type: 'LINK.CLICK', value: link.value })
        },
      })
    },

    // 指示条是纯装饰：读屏那边"当前在哪一节"已经由 aria-current 说清楚了，
    // 再念一遍只会是噪音。位置铺成内联样式，样式层负责画它长什么样。
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': 'true',
      'data-orientation': orientation,
      'data-value': value ?? undefined,
      // 没有激活项（还没滚到首节）时整条收起，不留一段悬在原处的残影
      'hidden': indicator == null || undefined,
      // 只写主轴那一条：竖排目录的指示条是贴在起始缘的一道竖杠，横排是压在下面的一道横杠，
      // 交叉轴的粗细与贴边归样式层管。内联样式压得过样式表，两边都写就等于把皮肤焊死了。
      'style': indicator
        ? (orientation === 'horizontal'
            ? { insetInlineStart: `${indicator.inlineStart}px`, inlineSize: `${indicator.inlineSize}px` }
            : { insetBlockStart: `${indicator.blockStart}px`, blockSize: `${indicator.blockSize}px` })
        : undefined,
    }),
  }
}
