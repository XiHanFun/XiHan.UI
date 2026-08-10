import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { VirtualizerApi, VirtualizerCore, VirtualizerSchema } from './virtualizer.types'
import { dataAttr } from '@xihan-ui/kernel'
import { virtualizerAnatomy } from './virtualizer.anatomy'
import { resolveVirtualizerLanes } from './virtualizer.geometry'
import {
  findVirtualizerItem,
  virtualizerContentStyle,
  virtualizerItemStyle,
} from './virtualizer.sizing'

const parts = virtualizerAnatomy.build()

export function connectVirtualizer<T extends PropTypes>(
  service: Service<VirtualizerSchema>,
  normalize: NormalizeProps<T>,
): VirtualizerApi<T> {
  const { state, prop, context, refs, send } = service

  const snapshot = context.get('snapshot')
  const horizontal = prop('horizontal') ?? false
  const lanes = resolveVirtualizerLanes(prop('lanes'))
  const scrolling = state.get() === 'scrolling'
  const orientation = horizontal ? 'horizontal' : 'vertical'

  /**
   * 计算内核现取，渲染期一次都不问它：connect 在 Vue 的 render 期求值，此刻内核还没建起来。
   * 下面三个命令式方法都是用户动作发生的那一刻才调，那时内核一定在。
   */
  const kernel = (): VirtualizerCore | null => refs.get('getVirtualizer')()

  return {
    virtualItems: snapshot.items,
    totalSize: snapshot.totalSize,
    startIndex: snapshot.startIndex,
    endIndex: snapshot.endIndex,
    horizontal,
    lanes,
    scrolling,

    scrollToIndex: (index, options) => {
      kernel()?.scrollToIndex(index, options?.align ?? 'start')
    },

    /**
     * 节点没了就什么都不做：条目被卸载时适配器会拿 null 回调一次。
     * 收起来的条目一律不量：带 hidden 的节点量出来恒是 0，喂回内核会把那一条压成 0。
     * 判据取节点自报的 data-index，与内核反查下标用的是同一个属性。
     */
    measureElement: (element) => {
      if (!element)
        return
      const index = Number(element.getAttribute('data-index'))
      if (!findVirtualizerItem(snapshot.items, index))
        return
      kernel()?.measureElement(element)
    },

    // 量视口那件事落在机器里，这里只递一个意图。
    // 先确认内核在：它由效应在挂载后填入，同时是机器已经跑起来了吗的判据，挂载前送事件会抛
    measure: () => {
      if (kernel())
        send({ type: 'MEASURE' })
    },

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      'data-scrolling': dataAttr(scrolling),
    }),

    // 滚动一概不接管：这层是原生的 overflow 容器，滚轮与各滚动键全部走浏览器原生通路。
    // tabindex=0 让长列表在没有可聚焦元素时也能被键盘落入
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'tabindex': 0,
      'data-orientation': orientation,
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'data-orientation': orientation,
      'style': virtualizerContentStyle(snapshot.totalSize, horizontal),
    }),

    /**
     * 条目只是定位外壳，不带任何角色语义：role 与 aria-setsize / aria-posinset 归住在里面的那个组件。
     * 虚拟滚动下 DOM 里只剩窗口里那几条，作者给条目内容配集合角色时务必自己补
     * aria-setsize 与 aria-posinset，这两个数取 api 上的 count 与 index。
     */
    getItemProps: (props) => {
      const item = findVirtualizerItem(snapshot.items, props.index)
      return normalize.element({
        ...parts.item.attrs,
        // 内核按这个属性反查节点是第几条，measureElement 的回喂路径靠它
        'data-index': props.index,
        'data-orientation': orientation,
        'data-lane': item ? item.lane : undefined,
        // 不在窗口里就只收起来，不卸载作者节点
        'hidden': item ? undefined : true,
        'style': virtualizerItemStyle(item, { horizontal, lanes }),
      })
    },
  }
}
