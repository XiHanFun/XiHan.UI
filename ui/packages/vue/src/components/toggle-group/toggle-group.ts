import type { Direction, Orientation } from '@xihan-ui/core'
import type { ToggleGroupSchema, ToggleGroupValue } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideToggleGroup, useToggleGroupContext } from './context'
import { useToggleGroup } from './use-toggle-group'

type ToggleGroupProps = ToggleGroupSchema['props']

export const XhToggleGroupRoot = defineComponent({
  name: 'XhToggleGroupRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在 connect。
  // loop / rovingFocus 尤其要写：裸 Boolean 声明会把缺省压成 false，
  // 回绕与 roving tabindex 就都默默关掉了
  props: {
    value: { type: [String, Array] as PropType<ToggleGroupValue>, default: undefined },
    defaultValue: { type: [String, Array] as PropType<ToggleGroupValue>, default: undefined },
    multiple: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    disallowEmpty: { type: Boolean, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    loop: { type: Boolean, default: undefined },
    rovingFocus: { type: Boolean, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸值，支持 v-model:value。
  // 裸值的形态跟着 multiple 走（单选给字符串，多选给数组），
  // 这样单选的 v-model 绑一个字符串变量，回写后仍是字符串
  emits: ['value-change', 'update:value'],
  setup(props, { slots, emit }) {
    const notify: ToggleGroupProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useToggleGroup(props as ToggleGroupProps, notify)
    provideToggleGroup(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToggleGroupItem = defineComponent({
  name: 'XhToggleGroupItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useToggleGroupContext()
    // 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
    // 容器判自己"焦点在组内"退出 Tab 序列，又没有条目认领得了这个锚点，
    // 整组零个 Tab 停靠点，键盘用户再也进不来。卸载前把焦点离场如实上报，
    // 且只有自己正持有焦点时才报——否则删掉任一无关条目都会把光标一并清掉。
    // v-for 不带 key 时 Vue 会就地复用节点：被删的是最后一个组件实例，
    // 而持有焦点的那个 DOM 节点还在、value 却被改成了别的条目。此时锚点仍指着旧值、
    // 已无人认领，键盘就此失灵。自己正持有焦点且 value 变了，就按新值重报一次。
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => props.value, (next, prev) => {
      if (next === prev)
        return
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.FOCUS', value: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      // 整组一起卸载时根的钩子先跑、机器已停机，此刻既无须也不能再送事件
      if (service.getStatus() !== 'Started')
        return
      // 判据是「本节点当下正持有焦点」，不是「值对得上」：v-for 就地复用时
      // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'GROUP.BLUR' })
    })
    // 原生 <button>：Enter/Space 的激活交给平台，这一路我们不自己实现
    return () => h(
      'button',
      { ...ctx.api.value.getItemProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})
