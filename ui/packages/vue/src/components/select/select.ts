import type { Direction, Placement } from '@xihan-ui/core'
import type { SelectItemProps, SelectSchema } from '@xihan-ui/headless'
import type { PropType, VNode } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideSelect, provideSelectItem, useSelectContext, useSelectItemContext } from './context'
import { useSelect } from './use-select'

type SelectProps = SelectSchema['props']

export const XhSelectRoot = defineComponent({
  name: 'XhSelectRoot',
  // 缺省值的唯一事实源在 connect —— 凡是 connect 有兜底的一律 default: undefined
  // （loop 尤其：裸 Boolean 声明会把缺省压成 false，回绕就默默关掉了）
  props: {
    value: { type: String as PropType<string | null>, default: undefined },
    defaultValue: { type: String as PropType<string | null>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    loop: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  // value-change 携带 { value }、open-change 携带 { open }；
  // update:* 携带裸值，支持 v-model:value 与 v-model:open
  emits: ['value-change', 'open-change', 'update:value', 'update:open'],
  setup(props, { slots, emit }) {
    const notifyValue: SelectProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: SelectProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useSelect(props as SelectProps, notifyValue, notifyOpen)
    provideSelect(ctx)

    // 表单影子由根部件自行装配，作者不必手写。选项只补当前值这一个：
    // 值为空时落在空串选项上，required 才判得出「没选」。
    // 子节点先于 props 挂载，因此 select 的 value 写下去时目标选项已经在了。
    const hiddenSelect = (): VNode => {
      const api = ctx.api.value
      const options = [h('option', { value: '' })]
      if (api.value != null)
        options.push(h('option', { value: api.value }, api.valueText ?? api.value))
      return h('select', api.getHiddenSelectProps() as Record<string, unknown>, options)
    }

    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, [
      hiddenSelect(),
      ...(slots.default?.({
        open: ctx.api.value.open,
        value: ctx.api.value.value,
        displayText: ctx.api.value.displayText,
        setOpen: ctx.api.value.setOpen,
        setValue: ctx.api.value.setValue,
      }) ?? []),
    ])
  },
})

export const XhSelectLabel = defineComponent({
  name: 'XhSelectLabel',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectTrigger = defineComponent({
  name: 'XhSelectTrigger',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhSelectValueText = defineComponent({
  name: 'XhSelectValueText',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    // 作者写了插槽就听作者的，否则显示选中项文本，无选中时显示 placeholder
    return () => h(
      'span',
      ctx.api.value.getValueTextProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.displayText,
    )
  },
})

export const XhSelectIndicator = defineComponent({
  name: 'XhSelectIndicator',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('span', ctx.api.value.getIndicatorProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectPositioner = defineComponent({
  name: 'XhSelectPositioner',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhSelectContent = defineComponent({
  name: 'XhSelectContent',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhSelectItem = defineComponent({
  name: 'XhSelectItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useSelectContext()
    const item = computed<SelectItemProps>(() => ({ value: props.value, disabled: props.disabled }))
    provideSelectItem({ item })
    // 承载焦点的条目被移出 DOM 时浏览器不派 focusout，高亮锚点会停在一个已消失的值上：
    // 没有条目认领 tabindex=0、方向键也失去起点。卸载前如实上报，机器就地重挑锚点。
    // v-for 不带 key 时 Vue 会就地复用节点：被删的是「最后一个组件实例」，
    // 而持有焦点的那个 DOM 节点还在、value 却被改成了别的条目。此时锚点仍指着旧值、
    // 已无人认领，键盘就此失灵。自己正持有焦点且 value 变了，就按新值重报一次。
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const svc = ctx.service
      if (svc.getStatus() !== 'Started')
        return
      if (itemEl.value && svc.scope.getActiveElement() === itemEl.value)
        svc.send({ type: 'ITEM.HIGHLIGHT', value: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      // 整组一起卸载时根先停机，此刻无焦点可言（送事件还会在 dev 下抛）
      if (service.getStatus() !== 'Started')
        return
      // 判据是「本节点当下正持有焦点」，不是「值对得上」：v-for 就地复用时
      // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.LOST' })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhSelectItemText = defineComponent({
  name: 'XhSelectItemText',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    const { item } = useSelectItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSelectItemIndicator = defineComponent({
  name: 'XhSelectItemIndicator',
  setup(_, { slots }) {
    const ctx = useSelectContext()
    const { item } = useSelectItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})
