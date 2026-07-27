import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ToastApi, ToastSchema, ToastStatus } from './toast.types'
import { dataAttr } from '@xihan-ui/core'
import { toastAnatomy } from './toast.anatomy'
import { resolveToastId } from './toast.machine'

const parts = toastAnatomy.build()

/** 内部子态收敛成对外的三段式：running / paused 都是"还在台上"。 */
function toStatus(state: ToastSchema['state']): ToastStatus {
  if (state === 'dismissing' || state === 'unmounted')
    return state
  return 'visible'
}

export function connectToast<T extends PropTypes>(
  service: Service<ToastSchema>,
  normalize: NormalizeProps<T>,
): ToastApi<T> {
  const { state, prop, send, context, scope } = service
  const ids = scope.ids('toast', 'title', 'description')

  const status = toStatus(state.get())
  const paused = state.matches('visible.paused')
  const type = prop('type') ?? 'info'
  const closable = prop('closable') ?? true
  const id = resolveToastId(prop('id'), scope)
  const unmounted = status === 'unmounted'

  return {
    id,
    status,
    type,
    title: prop('title'),
    description: prop('description'),
    paused,
    closable,
    remaining: context.get('remaining'),
    dismiss: () => send({ type: 'TOAST.DISMISS' }),
    pause: () => send({ type: 'TOAST.PAUSE', src: 'api' }),
    resume: () => send({ type: 'TOAST.RESUME', src: 'api' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 出错要打断当前朗读（alert + assertive），其余排队等空隙（status + polite）。
      // 两者都显式写：role 隐含的 live 值各家读屏并不一致，写死才有确定行为。
      'role': type === 'error' ? 'alert' : 'status',
      'aria-live': type === 'error' ? 'assertive' : 'polite',
      // 整条一起念：只念变化的那一小块，用户会听到半截话
      'aria-atomic': 'true',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-type': type,
      'data-state': status,
      'data-paused': dataAttr(paused),
      // 退场窗口走完只收起、不卸载：作者写在里面的内容归作者，
      // 什么时候把这条从队列里删掉是宿主的决定
      'hidden': unmounted || undefined,
      // 指针停在通知上就把计时按住：用户正在读的东西不该从眼皮底下溜走。
      // pointerenter / pointerleave 不冒泡，正好只认本条通知这一块区域。
      'onPointerEnter': () => send({ type: 'TOAST.PAUSE', src: 'pointer' }),
      'onPointerLeave': () => send({ type: 'TOAST.RESUME', src: 'pointer' }),
      'onFocusIn': () => send({ type: 'TOAST.PAUSE', src: 'focus' }),
      'onFocusOut': (event: FocusEvent) => {
        // 焦点在本条内部换节点（从操作按钮 Tab 到关闭按钮）也会派 focusout，
        // 判据取"焦点是不是真的离开了本条"，否则中间会漏出一拍没人按着计时
        const next = event.relatedTarget as Node | null
        const root = event.currentTarget as Element | null
        if (next && root?.contains(next))
          return
        send({ type: 'TOAST.RESUME', src: 'focus' })
      },
    }),

    getTitleProps: () => normalize.element({
      ...parts.title.attrs,
      id: ids.title,
    }),

    getDescriptionProps: () => normalize.element({
      ...parts.description.attrs,
      id: ids.description,
    }),

    // 进入退场后机器不再接这两个事件，按钮点了也不会有第二次退场
    getActionTriggerProps: () => normalize.button({
      ...parts['action-trigger'].attrs,
      type: 'button',
      onClick: () => send({ type: 'TOAST.ACTION' }),
    }),

    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      // 单体控件用原生 disabled：不可聚焦、也不占 Tab 位
      'disabled': !closable || undefined,
      'data-disabled': dataAttr(!closable),
      // 不可关闭时连按钮一起收起：留一个按不动的叉，比压根没有叉更让人困惑
      'hidden': !closable || undefined,
      'onClick': () => {
        // 作者把这份 props 摊到非按钮节点上时原生 disabled 不生效，守卫得自己带
        if (!closable)
          return
        send({ type: 'TOAST.DISMISS' })
      },
    }),
  }
}
