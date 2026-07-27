import type { NormalizeProps, Placement, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { HoverCardApi, HoverCardSchema } from './hover-card.types'
import { contains, dataAttr } from '@xihan-ui/core'
import { hoverCardAnatomy } from './hover-card.anatomy'

const parts = hoverCardAnatomy.build()

/** 定位结果落地前的占位朝向，与定位引擎的默认值一致。 */
const DEFAULT_PLACEMENT: Placement = 'bottom'

export function connectHoverCard<T extends PropTypes>(
  service: Service<HoverCardSchema>,
  normalize: NormalizeProps<T>,
): HoverCardApi<T> {
  const { state, context, prop, send, refs, scope } = service
  // visible 的两个子态下浮层都可见：closing 是收起前的等待期，此刻卡片仍在屏幕上
  const open = state.matches('visible')
  const disabled = !!prop('disabled')
  const ids = scope.ids('hover-card', 'trigger', 'content')
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context；这里只读结果，不量 DOM、不调引擎，保持纯函数
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? DEFAULT_PLACEMENT

  /**
   * 焦点是不是仍落在卡片内（trigger 与 content 是两棵分开的子树，两边都要问）。
   *
   * 元素经 refs 现取——只在事件发生的那一刻调用，渲染期不碰：Vue 侧 connect 在 render 期
   * 求值，那一刻这些节点还不存在。
   */
  const staysInside = (related: EventTarget | null): boolean => {
    const node = related as Node | null
    return contains(refs.get('getAnchorEl')(), node) || contains(refs.get('getContentEl')(), node)
  }

  // 焦点在卡片内部改换落点（trigger → content 里的链接、content 内部互跳）不算离场：
  // 判的是「焦点这一下去了哪儿」，去处仍在卡片内就当无事发生。
  const onFocusLeave = (event: FocusEvent): void => {
    if (staysInside(event.relatedTarget))
      return
    send({ type: 'BLUR' })
  }

  const onEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape')
      send({ type: 'ESCAPE' })
  }

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    setOpen,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 只有作者显式给了才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      // 只标记不输出原生 disabled/aria-disabled：关掉的是卡片，
      // trigger 本身（常常是个链接）仍要能点、能聚焦
      'data-disabled': dataAttr(disabled),
      'onPointerenter': () => send({ type: 'POINTER.ENTER' }),
      'onPointerleave': () => send({ type: 'POINTER.LEAVE' }),
      'onFocus': () => send({ type: 'FOCUS' }),
      'onBlur': onFocusLeave,
      'onKeydown': onEscapeKey,
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      // 落定后的朝向（可能被引擎翻转），供箭头与动画方向使用
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置位，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'absolute',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
      },
    }),

    /**
     * 与 tooltip 相反：卡片内容是可交互的一块面板，既能悬停也能聚焦，
     * 所以给 role=dialog 与 tabindex=-1。但它不是模态——不陷焦点、不锁滚动、
     * 不在展开时把焦点搬进来，只是 Tab 走得进来、Escape 收得掉。
     *
     * 收起时留在 DOM 只隐藏，不卸载作者节点。
     */
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'dialog',
      'tabindex': -1,
      // 省略与显式 false 在读屏那里不是一回事：前者是「没说」，后者是「明确说了不是模态」
      'aria-modal': 'false',
      // 没有独立标题部件，卡片的名字就取自它挂在谁身上
      'aria-labelledby': ids.trigger,
      'data-state': stateAttr,
      'data-placement': placement,
      'hidden': !open || undefined,
      // 指针移入卡片即撤销收起等待：内容可交互，用户是奔着点里面的东西来的
      'onPointerenter': () => send({ type: 'POINTER.ENTER' }),
      'onPointerleave': () => send({ type: 'POINTER.LEAVE' }),
      // 焦点可能落在 content 自身，也可能落在它内部任一可聚焦节点上，
      // 故用会冒泡的 focusin/focusout 而非 focus/blur
      'onFocusIn': () => send({ type: 'FOCUS' }),
      'onFocusOut': onFocusLeave,
      'onKeydown': onEscapeKey,
    }),

    getArrowProps: () => normalize.element({
      ...parts.arrow.attrs,
      'aria-hidden': 'true',
      'data-placement': placement,
    }),
  }
}
