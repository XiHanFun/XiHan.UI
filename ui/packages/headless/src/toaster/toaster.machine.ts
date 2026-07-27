import type { ToasterSchema, ToastPlacement, ToastRecord } from './toaster.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<ToasterSchema>()

/** 没指定位置时落哪儿。 */
export const TOASTER_PLACEMENT: ToastPlacement = 'bottom-end'
/** 同一摞内的默认间距（px）。 */
export const TOASTER_GAP = 16

/** 九个位的固定顺序：placements 与分组遍历都按它走，界面顺序才不会随插入次序漂。 */
export const TOAST_PLACEMENTS: readonly ToastPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'middle-start',
  'middle',
  'middle-end',
  'bottom-start',
  'bottom',
  'bottom-end',
]

/** 单条落位：自己写了就听自己的，否则用 toaster 的默认。 */
export function toastPlacementOf(toast: ToastRecord, fallback: ToastPlacement): ToastPlacement {
  return toast.placement ?? fallback
}

/**
 * 按 max 挤掉每个位置上最旧的条目，保持原有先后次序。
 *
 * 两处都用它，各有各的理由：
 * - create 之后落一次，队列才不会无界地长下去（超窗的条目再也不会被渲染，
 *   也就永远等不到它自己的计时器把它带走）；
 * - connect 读的时候再落一次，宿主整份塞进来的受控队列同样只显示窗口内的。
 * 同一个纯函数、同一套规则，两个边界不会各说各话。
 */
export function visibleToasts(
  list: readonly ToastRecord[],
  max: number | undefined,
  fallback: ToastPlacement,
): ToastRecord[] {
  // 不给 max 就是不限；<=0 与非有限数一并按不限处理（0 条可见没有任何用处）
  if (max == null || !Number.isFinite(max) || max <= 0)
    return [...list]

  const overflow = new Set<ToastRecord>()
  for (const placement of TOAST_PLACEMENTS) {
    const group = list.filter(toast => toastPlacementOf(toast, fallback) === placement)
    for (const toast of group.slice(0, Math.max(0, group.length - max)))
      overflow.add(toast)
  }
  return list.filter(toast => !overflow.has(toast))
}

export const toasterMachine = createMachine({
  name: 'toaster',
  context: ({ prop, cell }) => ({
    // 队列是数组，走 cell 原生受控（toasts / defaultToasts / onToastsChange）：
    // 数组不像布尔那样表达不了 undefined，不需要影子事件那一套
    toasts: cell<ToastRecord[]>(() => ({
      value: prop('toasts'),
      defaultValue: prop('defaultToasts') ?? [],
      onChange: toasts => prop('onToastsChange')?.({ toasts }),
    })),
    seq: cell<number>(() => ({ defaultValue: 0 })),
  }),
  initialState: () => 'idle',
  // 四个入口从哪个状态发出都一样（本来也只有一个状态），因此挂根级
  on: {
    'TOASTS.CREATE': { actions: ['createToast'] },
    'TOASTS.UPDATE': { actions: ['updateToast'] },
    'TOASTS.DISMISS': { actions: ['dismissToast'] },
    'TOASTS.DISMISS_ALL': { actions: ['dismissAllToasts'] },
  },
  states: { idle: {} },
  implementations: {
    actions: {
      createToast: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'TOASTS.CREATE')
          return
        // 号照走，即便这次是作者自带的 id：跳号不影响唯一性，
        // 而分支里漏掉自增会让下一条自动 id 撞上刚才那条
        context.set('seq', context.get('seq') + 1)

        const list = context.get('toasts')
        const at = list.findIndex(toast => toast.id === e.toast.id)
        if (at >= 0) {
          // 同 id 就地改写，位置保持不动：loading 转 success 时那条通知若跑到队尾，
          // 看上去就是"原地消失又从别处冒出来"
          const next = [...list]
          next[at] = { ...list[at]!, ...e.toast }
          context.set('toasts', next)
          return
        }
        const fallback = prop('placement') ?? TOASTER_PLACEMENT
        context.set('toasts', visibleToasts([...list, e.toast], prop('max'), fallback))
      },
      updateToast: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TOASTS.UPDATE')
          return
        const list = context.get('toasts')
        const at = list.findIndex(toast => toast.id === e.id)
        // 改一条已经走掉的通知是空操作，不要把它重新变出来
        if (at < 0)
          return
        const next = [...list]
        next[at] = { ...list[at]!, ...e.patch, id: e.id }
        context.set('toasts', next)
      },
      dismissToast: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'TOASTS.DISMISS')
          return
        const list = context.get('toasts')
        const next = list.filter(toast => toast.id !== e.id)
        // 没命中就不写：写一份内容相同的新数组会白白惊动一次 onToastsChange
        if (next.length !== list.length)
          context.set('toasts', next)
      },
      dismissAllToasts: ({ context }) => {
        if (context.get('toasts').length)
          context.set('toasts', [])
      },
    },
  },
})
