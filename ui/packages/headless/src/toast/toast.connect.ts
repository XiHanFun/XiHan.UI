import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ToastApi, ToastSchema, ToastStatus, ToastType } from './toast.types'
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

/**
 * 类型到语气轴的映射。type 管行为（实时区级别、图标、是否自动消失），配色则统一交给
 * 全库共用的语气层，所以这里派生一份 data-tone 而不是让皮肤按 type 各写一套颜色。
 * error 在词汇表里叫 danger；loading 说的是"事情还没完"，不是好消息也不是坏消息，走中性。
 */
function toneOf(type: ToastType): string {
  if (type === 'error')
    return 'danger'
  if (type === 'loading')
    return 'neutral'
  return type
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
      // 两者都显式写：role 隐含的 live 值各家读屏并不一致。
      'role': type === 'error' ? 'alert' : 'status',
      'aria-live': type === 'error' ? 'assertive' : 'polite',
      // 整条一起念，否则用户会听到半截话
      'aria-atomic': 'true',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-type': type,
      // 语气轴只挂在 root 上，子部件靠继承拿到语气槽
      'data-tone': toneOf(type),
      'data-state': status,
      'data-paused': dataAttr(paused),
      // 退场窗口走完只收起、不卸载，何时把这条从队列里删掉是宿主的决定
      'hidden': unmounted || undefined,
      // 指针停在通知上就把计时按住；pointerenter / pointerleave 不冒泡，只认本条通知这块区域。
      'onPointerEnter': () => send({ type: 'TOAST.PAUSE', src: 'pointer' }),
      'onPointerLeave': () => send({ type: 'TOAST.RESUME', src: 'pointer' }),
      'onFocusIn': () => send({ type: 'TOAST.PAUSE', src: 'focus' }),
      'onFocusOut': (event: FocusEvent) => {
        // 焦点在本条内部换节点也会派 focusout，判据取焦点是不是真的离开了本条
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
      // 不可关闭时连按钮一起收起，不留一个按不动的叉
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
