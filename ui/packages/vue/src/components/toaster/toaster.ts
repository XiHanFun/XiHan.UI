import type { ToasterSchema, ToasterTranslations, ToastPlacement, ToastRecord } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, Fragment, h } from 'vue'
import { provideToaster, useToasterContext } from './context'
import { useToaster } from './use-toaster'

type ToasterProps = ToasterSchema['props']

export const XhToasterRoot = defineComponent({
  name: 'XhToasterRoot',
  // 一律 default: undefined —— 缺省值的唯一事实源在 connect（placement 与 gap 尤其：
  // 在这里再补一份，两处一旦不同步，同一份标记在 Vue 与 WC 上就会摆到不同的位置）。
  // toasts 落成空数组更糟：那等于宣称"受控且当前为空"，队列从此一条也进不来
  props: {
    toasts: { type: Array as PropType<ToastRecord[]>, default: undefined },
    defaultToasts: { type: Array as PropType<ToastRecord[]>, default: undefined },
    placement: { type: String as PropType<ToastPlacement>, default: undefined },
    max: { type: Number, default: undefined },
    gap: { type: Number, default: undefined },
    duration: { type: Number, default: undefined },
    removeDelay: { type: Number, default: undefined },
    pauseOnPageIdle: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<Partial<ToasterTranslations>>, default: undefined },
  },
  // toasts-change 携带 { toasts }；update:toasts 携带裸队列，支持 v-model:toasts
  emits: ['toasts-change', 'update:toasts'],
  setup(props, { slots, emit }) {
    const notify: ToasterProps['onToastsChange'] = (details) => {
      emit('toasts-change', details)
      emit('update:toasts', details.toasts)
    }
    const ctx = useToaster(props as ToasterProps, notify)
    provideToaster(ctx)
    // 根节点是地标容器，命令一并交到插槽作用域里：把"发一条通知"的按钮写在队列内部
    // 是最常见的用法，这样作者不必再为它单独调一次 useToaster
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      toasts: ctx.api.value.visibleToasts,
      placements: ctx.api.value.placements,
      count: ctx.api.value.count,
      getToastsByPlacement: ctx.api.value.getToastsByPlacement,
      create: ctx.create,
      update: ctx.update,
      dismiss: ctx.dismiss,
      dismissAll: ctx.dismissAll,
    }))
  },
})

export const XhToasterGroup = defineComponent({
  name: 'XhToasterGroup',
  props: {
    // 不写就用 toaster 的 placement；写了就只收这个位置上的条目
    placement: { type: String as PropType<ToastPlacement>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useToasterContext()
    return () => {
      const api = ctx.api.value
      const groupProps = api.getGroupProps({ placement: props.placement }) as Record<string, unknown>
      // 落位从 group 自己的产出里读回来，不在这边再算一遍缺省：
      // 摞里渲染哪几条与 data-placement 报的是哪个位置，必须是同一个答案
      const placement = groupProps['data-placement'] as ToastPlacement
      const list = api.getToastsByPlacement(placement)
      // 每条通知一个 key，取队列身份 id。不给 key 的话 Vue 会就地复用节点：
      // 队首那条走掉后，原本承载焦点的节点会被改写成下一条通知的内容，
      // 焦点还留在这个节点上，而它已经不是用户刚才在看的那条了——
      // 键盘用户的位置就此错位，读屏也会把两条通知的内容念串
      return h(
        'div',
        groupProps,
        slots.default ? list.map(toast => h(Fragment, { key: toast.id }, slots.default!({ toast }))) : undefined,
      )
    }
  },
})
