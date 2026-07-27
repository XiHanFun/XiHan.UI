import type { Direction, Orientation } from '@xihan-ui/core'
import type { ToolbarSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideToolbar, useToolbarContext } from './context'
import { useToolbar } from './use-toolbar'

type ToolbarProps = ToolbarSchema['props']

export const XhToolbarRoot = defineComponent({
  name: 'XhToolbarRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在 connect。
  // loop 尤其要写：裸 Boolean 声明会把缺省压成 false，方向键的回绕就默默关掉了
  props: {
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    loop: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
  },
  // 没有对外事件：工具条不持有任何值，条目的点击与切换归条目自己派发
  setup(props, { slots }) {
    const ctx = useToolbar(props as ToolbarProps)
    provideToolbar(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      focusedValue: ctx.api.value.focusedValue,
      orientation: ctx.api.value.orientation,
      disabled: ctx.api.value.disabled,
    }))
  },
})

export const XhToolbarGroup = defineComponent({
  name: 'XhToolbarGroup',
  setup(_, { slots }) {
    const ctx = useToolbarContext()
    return () => h('div', ctx.api.value.getGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhToolbarSeparator = defineComponent({
  name: 'XhToolbarSeparator',
  setup() {
    const ctx = useToolbarContext()
    // 分隔线没有内容：里头塞东西会被读屏当成 separator 的可及名字念出来
    return () => h('div', ctx.api.value.getSeparatorProps() as Record<string, unknown>)
  },
})

export const XhToolbarItem = defineComponent({
  name: 'XhToolbarItem',
  props: {
    value: { type: String, required: true },
    disabled: Boolean,
    /**
     * 条目落成哪个标签。默认 button——工具条里绝大多数是按钮；
     * 链接式条目写 as="a"，自定义控件写它自己的标签名。
     *
     * 刻意不替作者补 type="button"：条目要干什么归它自己，工具条只发身份标记与 Tab 停靠位。
     * 落在 form 里的按钮记得自己写上 type="button"，否则回车会直接提交表单。
     */
    as: { type: String, default: 'button' },
  },
  setup(props, { slots }) {
    const ctx = useToolbarContext()
    // 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的值上：
    // 容器判自己"焦点在条内"退出 Tab 序列，又没有条目认领得了这个锚点，
    // 整条零个 Tab 停靠点，键盘用户再也进不来。卸载前把焦点离场如实上报，
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
      // 整条一起卸载时根的钩子先跑、机器已停机，此刻既无须也不能再送事件
      if (service.getStatus() !== 'Started')
        return
      // 判据是「本节点当下正持有焦点」，不是「值对得上」：v-for 就地复用时
      // 被卸载的是末位实例、它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'TOOLBAR.BLUR' })
    })
    return () => h(
      props.as,
      { ...ctx.api.value.getItemProps({ value: props.value, disabled: props.disabled }) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})
