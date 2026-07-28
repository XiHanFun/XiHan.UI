import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { VirtualizerApi, VirtualizerCore, VirtualizerSchema } from './virtualizer.types'
import { dataAttr } from '@xihan-ui/core'
import { virtualizerAnatomy } from './virtualizer.anatomy'
import {
  findVirtualizerItem,
  resolveVirtualizerLanes,
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
   * 计算内核现取。渲染期一次都不问它——Vue 在 render 期求值 connect（此刻内核还没建起来），
   * WC 在 updated 之后求值，两侧看到的会是不同的东西。
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
      kernel()?.scrollToIndex(index, { align: options?.align ?? 'start' })
    },

    /**
     * 节点没了就什么都不做：条目被卸载时适配器会拿 null 回调一次。
     *
     * 收起来的条目一律不量：不在窗口里的节点带着 hidden（display:none），
     * 量出来的尺寸恒是 0，喂回内核会把那一条的高度真的压成 0，整份列表跟着塌一截。
     * 判据取节点自报的 data-index——那也正是内核反查下标用的同一个属性，
     * 规则落在这里而不是各适配器里，两侧才不会一边有一边没有。
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
    // 先确认内核在：它由效应在挂载后填入，因此它同时是"机器已经跑起来了吗"的判据——
    // 挂载前送事件会直接抛（Vue 在 render 期就求值 connect，那时机器还没起）
    measure: () => {
      if (kernel())
        send({ type: 'MEASURE' })
    },

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-orientation': orientation,
      'data-scrolling': dataAttr(scrolling),
    }),

    // 滚动一概不接管：这层是原生的 overflow 容器，滚轮、方向键、PageUp/PageDown、
    // Home/End 全部走浏览器原生通路，组件只是跟着滚动量换一批该渲的下标。
    // tabindex=0 是唯一动过的地方：长列表里若一个可聚焦元素都没有，键盘用户根本落不进来，
    // 上面那些键也就无从按起
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
     * 条目只是定位外壳，一点角色语义都不带：role、aria-setsize / aria-posinset 归住在
     * 里面的那个组件（listbox / tree / grid 各有各的说法），这里替它写只会与它打架。
     *
     * 但虚拟滚动确实会让读屏"数不清一共几条"——DOM 里只剩窗口里那几条。
     * 作者给条目内容配集合角色时务必自己补 aria-setsize（总条数）与 aria-posinset（第几条），
     * 这两个数 api 上的 count 与 index 都现成。
     */
    getItemProps: (props) => {
      const item = findVirtualizerItem(snapshot.items, props.index)
      return normalize.element({
        ...parts.item.attrs,
        // 内核按这个属性反查节点是第几条（measureElement 的回喂路径靠它）
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
