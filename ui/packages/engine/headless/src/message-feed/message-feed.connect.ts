import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { MessageFeedApi, MessageFeedItemRole, MessageFeedSchema, MessageFeedStatus } from './message-feed.types'
import { focusItem, getTabbables, ITEM_VALUE_ATTR, itemValue, navigateItems, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { messageFeedAnatomy, messageFeedItemQuery } from './message-feed.anatomy'

const parts = messageFeedAnatomy.build()

/** 焦点走出消息流时落到哪一侧。 */
type ExitEdge = 'before' | 'after'

export function connectMessageFeed<T extends PropTypes>(
  service: Service<MessageFeedSchema>,
  normalize: NormalizeProps<T>,
): MessageFeedApi<T> {
  const { context, prop, send, refs, scope } = service
  const atBottom = context.get('atBottom')
  const sticking = context.get('sticking')
  const focusedId = context.get('focusedId')
  const status: MessageFeedStatus = prop('status') ?? 'idle'
  const loop = prop('loop') ?? false
  const count = prop('count')
  const translations = prop('translations')

  const itemLabel = translations?.item
    ?? ((position: number, size: number, role?: MessageFeedItemRole): string => {
      const who = role == null ? '' : `, ${role}`
      // size 为 -1 是 ARIA 的「总数未知」，念出来只会让人以为倒数
      return size > 0 ? `Message ${position} of ${size}${who}` : `Message ${position}${who}`
    })

  /**
   * 条目集合只在事件处理器与命令式方法里查活 DOM，顺序即文档序。
   * 渲染期不得调用：connect 在 Vue 的 render 期求值，此时 DOM 尚不存在。
   */
  const items = (container: HTMLElement | null): HTMLElement[] => queryItems(container, messageFeedItemQuery)

  const itemById = (id: string): HTMLElement | null =>
    items(refs.get('getRootEl')()).find(el => itemValue(el) === id) ?? null

  /**
   * 走一步。
   *
   * PageUp / PageDown 不能经 navIntentFromKey：它只认四个方向键与 Home/End。
   * 这里自己把按键映成意图再交给 navigateItems。
   */
  const navigate = (container: HTMLElement, intent: NavIntent): void => {
    // 落焦即触发条目的 onFocus，锚点由那一处记，这里不重复发
    focusItem(navigateItems(items(container), focusedId, intent, { loop }))
  }

  /**
   * 焦点走出消息流：按文档序挑 root 之后的第一个 / 之前的最后一个可聚焦元素。
   * 会话界面里前者通常就是输入框。
   */
  const exit = (container: HTMLElement, edge: ExitEdge): void => {
    const doc = container.ownerDocument
    const outside = getTabbables(doc.body).filter(el => !container.contains(el))
    const after = edge === 'after'
    let picked: HTMLElement | null = null
    for (const el of outside) {
      const position = container.compareDocumentPosition(el)
      const isAfter = (position & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
      if (after) {
        if (isAfter) {
          picked = el
          break
        }
      }
      else if (!isAfter) {
        picked = el
      }
    }
    if (picked)
      focusItem(picked)
  }

  return {
    status,
    atBottom,
    sticking,
    focusedId,
    // 只看在不在底：粘着但内容还没追上时按钮不该冒出来
    showScrollButton: !atBottom,
    scrollToBottom: () => send({ type: 'SCROLL_TO_BOTTOM' }),
    scrollToItem: (id) => {
      itemById(id)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    },
    focusItem: (id) => {
      const el = itemById(id)
      if (!el)
        return
      focusItem(el)
      send({ type: 'ITEM.FOCUS', id })
    },

    // root 是键盘宿主与唯一的 Tab 停靠点，集合语义落在直接包着条目的 list 上：
    // role=feed 只认 article 子节点，而播报区与回到底部按钮都是 root 的孩子。
    // 不发 aria-busy：它会压住同子树内 live-region 的播报。
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 整份消息列表只占一个 Tab 停靠位。
      // 判据用 focusedId 而非锚点元素：锚点可能指向已被删掉的消息，那时无人认领 tabindex=0
      'tabindex': focusedId == null ? 0 : -1,
      'data-state': status,
      'data-size': prop('size'),
      'onKeyDown': (event: KeyboardEvent) => {
        if (event.altKey || event.shiftKey)
          return
        const container = event.currentTarget as HTMLElement
        const mod = event.ctrlKey || event.metaKey
        if (!mod && event.key === 'PageDown') {
          event.preventDefault()
          navigate(container, 'next')
          return
        }
        if (!mod && event.key === 'PageUp') {
          event.preventDefault()
          navigate(container, 'prev')
          return
        }
        if (mod && event.key === 'End') {
          event.preventDefault()
          exit(container, 'after')
          return
        }
        if (mod && event.key === 'Home') {
          event.preventDefault()
          exit(container, 'before')
        }
      },
      'onFocus': (event: FocusEvent) => {
        const container = event.currentTarget as HTMLElement
        // 只接管从流外进来的焦点：流内 Shift+Tab 往外退时转投会把人困住
        if (contains(container, event.relatedTarget as Node | null))
          return
        const list = items(container)
        // 转投给锚点条目，锚点悬空时退回第一条；落焦之后由条目自己的 onFocus 记锚点，
        // 这里再发一次会让宿主收到两条一模一样的通知
        const target = list.find(el => itemValue(el) === focusedId) ?? navigateItems(list, null, 'first', { loop })
        focusItem(target)
      },
      'onFocusOut': (event: FocusEvent) => {
        const container = event.currentTarget as HTMLElement
        if (contains(container, event.relatedTarget as Node | null))
          return
        send({ type: 'FEED.BLUR' })
      },
    }),

    // 只有几何：不给 role、不给 aria-live、不给 tabindex
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
    }),

    // 内容包裹层。条目必须是它的直接子节点：向上插入历史消息时的滚动补偿只在直接子节点里挑锚
    // role=feed 自带 article 集合语义与 W3C 定义的键盘模式，且不是活区——
    // 播报另设一个原子区，不必像 role=log 那样先把隐含的 polite 关掉
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'role': 'feed',
      'aria-label': translations?.feed ?? 'Conversation',
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      'role': 'article',
      [ITEM_VALUE_ATTR]: item.id,
      'aria-posinset': item.index + 1,
      // -1 是 ARIA 规定的「总数未知」
      'aria-setsize': count ?? -1,
      // 二选一：指向没渲出来的 id 会让读屏读空
      'aria-labelledby': item.labelled === true ? scope.partId('message-feed', `item-label:${item.id}`) : undefined,
      'aria-label': item.labelled === true ? undefined : itemLabel(item.index + 1, count ?? -1, item.role),
      // roving tabindex：整份消息流只有锚点那一条留在 Tab 序列内
      'tabindex': focusedId === item.id ? 0 : -1,
      'data-role': item.role,
      'data-streaming': dataAttr(item.streaming),
      'onFocus': () => send({ type: 'ITEM.FOCUS', id: item.id }),
    }),

    getItemLabelProps: ({ id }) => normalize.element({
      ...parts['item-label'].attrs,
      id: scope.partId('message-feed', `item-label:${id}`),
    }),

    getScrollButtonProps: () => normalize.button({
      ...parts['scroll-button'].attrs,
      'type': 'button',
      'aria-label': translations?.scrollToBottom ?? 'Scroll to bottom',
      'data-state': atBottom ? 'hidden' : 'visible',
      // 收起不卸载：按钮反复建删会让它的进场动画每次从头播
      'hidden': atBottom || undefined,
      'onClick': () => send({ type: 'SCROLL_TO_BOTTOM' }),
    }),

    // 一份会话只该有这一个活区：N 条消息各开一个会互相打断
    // 不写 role=status：它与下面两条 aria-* 等价，而 role=feed 只认 article 子节点，
    // 播报区带着角色待在流里会让集合语义判为不合法
    getLiveRegionProps: () => normalize.element({
      ...parts['live-region'].attrs,
      'aria-live': 'polite',
      'aria-atomic': 'true',
    }),
  }
}
