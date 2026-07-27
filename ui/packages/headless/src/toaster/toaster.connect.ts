import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ResolvedToast, ToasterApi, ToasterSchema, ToastPlacement, ToastRecord } from './toaster.types'
import { dataAttr } from '@xihan-ui/core'
import { TOAST_DURATION, TOAST_REMOVE_DELAY } from '../toast'
import { toasterAnatomy } from './toaster.anatomy'
import {
  TOAST_PLACEMENTS,
  TOASTER_GAP,
  TOASTER_PLACEMENT,
  toastPlacementOf,
  visibleToasts,
} from './toaster.machine'

const parts = toasterAnatomy.build()

export function connectToaster<T extends PropTypes>(
  service: Service<ToasterSchema>,
  normalize: NormalizeProps<T>,
): ToasterApi<T> {
  const { prop, send, context, scope } = service

  const fallback = prop('placement') ?? TOASTER_PLACEMENT
  const gap = prop('gap') ?? TOASTER_GAP
  const pauseOnPageIdle = prop('pauseOnPageIdle') ?? false

  // 把 toaster 的默认值烘进每一条：适配器直接摊给 toast 部件即可，
  // 两个适配器也就不必各自再兜一遍缺省（那正是两侧行为开始分叉的地方）
  const resolve = (toast: ToastRecord): ResolvedToast => ({
    ...toast,
    placement: toastPlacementOf(toast, fallback),
    type: toast.type ?? 'info',
    // 单条 > toaster > 内置默认，逐级兜底后必定是个具体数值；
    // loading 不自动消失那条规则不在这里，它住在 toast 机器里——
    // 独立使用（不经 toaster）的单条通知同样要守得住
    duration: toast.duration ?? prop('duration') ?? TOAST_DURATION,
    removeDelay: toast.removeDelay ?? prop('removeDelay') ?? TOAST_REMOVE_DELAY,
    closable: toast.closable ?? true,
    pauseOnPageIdle,
  })

  const list = visibleToasts(context.get('toasts'), prop('max'), fallback).map(resolve)
  const byPlacement = (placement: ToastPlacement): ResolvedToast[] =>
    list.filter(toast => toast.placement === placement)

  return {
    visibleToasts: list,
    // 按九宫格固定顺序，不按插入次序：否则同一批通知换个先后就会让整块界面重排
    placements: TOAST_PLACEMENTS.filter(placement => list.some(toast => toast.placement === placement)),
    count: list.length,
    getToastsByPlacement: byPlacement,

    create: (options = {}) => {
      const id = options.id ?? `toast-${scope.id}-${context.get('seq')}`
      send({ type: 'TOASTS.CREATE', toast: { ...options, id } })
      return id
    },
    update: (id, options) => send({ type: 'TOASTS.UPDATE', id, patch: options }),
    dismiss: id => send({ type: 'TOASTS.DISMISS', id }),
    dismissAll: () => send({ type: 'TOASTS.DISMISS_ALL' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 地标而不是 live region：每条通知自己就是 status / alert，
      // 外面再套一层 live region 会让读屏把同一条内容宣读两遍
      'role': 'region',
      'aria-label': prop('translations')?.region ?? 'Notifications',
      'data-count': list.length,
      'data-empty': dataAttr(list.length === 0),
    }),

    getGroupProps: (props = {}) => {
      const placement = props.placement ?? fallback
      const group = byPlacement(placement)
      return normalize.element({
        ...parts.group.attrs,
        'data-placement': placement,
        'data-count': group.length,
        'data-empty': dataAttr(group.length === 0),
        // 只交间距，不做定位：九个位怎么贴边、朝哪一侧堆叠是样式层的事，
        // 这里出的是两个适配器共用的同一份间距
        'style': { gap: `${gap}px` },
      })
    },
  }
}
