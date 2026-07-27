import type { Direction, Orientation } from '@xihan-ui/core'
import type { StepsSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideSteps, provideStepsItem, useStepsContext, useStepsItem } from './context'
import { useSteps } from './use-steps'

type StepsProps = StepsSchema['props']

export const XhStepsRoot = defineComponent({
  name: 'XhStepsRoot',
  // 全部 default: undefined —— 缺省值的唯一事实源在 connect
  props: {
    step: { type: Number, default: undefined },
    defaultStep: { type: Number, default: undefined },
    count: { type: Number, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    linear: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  // step-change 携带 { step }；update:step 携带裸下标，支持 v-model:step
  emits: ['step-change', 'update:step'],
  setup(props, { slots, emit }) {
    const notify: StepsProps['onStepChange'] = (details) => {
      emit('step-change', details)
      emit('update:step', details.step)
    }
    const ctx = useSteps(props as StepsProps, notify)
    provideSteps(ctx)
    // 走一步/退一步的按钮通常长在步骤条外面（"下一步"在表单底部），
    // 经插槽把这几个出口交出去，作者不必再自己接一份状态
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      step: ctx.api.value.step,
      count: ctx.api.value.count,
      complete: ctx.api.value.complete,
      setStep: ctx.api.value.setStep,
      goToNextStep: ctx.api.value.goToNextStep,
      goToPrevStep: ctx.api.value.goToPrevStep,
    }))
  },
})

export const XhStepsList = defineComponent({
  name: 'XhStepsList',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    return () => h('div', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhStepsItem = defineComponent({
  name: 'XhStepsItem',
  props: {
    // 身份声明叫 value 而不是 index：与本仓其余集合类部件同名（tabs/select/pagination），
    // WC 侧也只观察 value 这一个作者属性，改名会让运行期改写下标在 WC 上静默不生效。
    // 收 String 是因为它常常来自模板里的属性字面量（以及 WC 侧的 DOM 属性）
    value: { type: [Number, String] as PropType<number | string>, required: true },
    disabled: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useStepsContext()
    provideStepsItem(() => ({ index: Number(props.value), disabled: props.disabled }))
    return () => h(
      'div',
      ctx.api.value.getItemProps({ index: Number(props.value), disabled: props.disabled }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhStepsTrigger = defineComponent({
  name: 'XhStepsTrigger',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    const item = useStepsItem()
    // 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一个已消失的下标上：
    // 容器判自己"焦点在组内"退出 Tab 序列，又没有条目认领得了这个锚点，
    // 整组零个 Tab 停靠点，键盘用户再也进不来。卸载前把焦点离场如实上报，
    // 且只有自己正持有焦点时才报——否则删掉任一无关条目都会把光标一并清掉。
    // v-for 不带 key 时 Vue 会就地复用节点：被删的是最后一个组件实例，
    // 而持有焦点的那个 DOM 节点还在、下标却被改成了别的条目。此时锚点仍指着旧值、
    // 已无人认领，键盘就此失灵。自己正持有焦点且下标变了，就按新值重报一次。
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => item().index, (next, prev) => {
      if (next === prev)
        return
      const svc = ctx.service
      if (svc.getStatus() !== 'Started')
        return
      if (itemEl.value && svc.scope.getActiveElement() === itemEl.value)
        svc.send({ type: 'TRIGGER.FOCUS', step: next })
    })
    onBeforeUnmount(() => {
      // 整组一起卸载时根的钩子先跑、机器已停机，此刻既无须也不能再送事件
      if (ctx.service.getStatus() !== 'Started')
        return
      // 判据是「本节点当下正持有焦点」，不是「下标对得上」：v-for 就地复用时
      // 被卸载的是末位实例、它的下标可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
      if (itemEl.value && ctx.service.scope.getActiveElement() === itemEl.value)
        ctx.service.send({ type: 'LIST.BLUR' })
    })
    return () => h(
      'button',
      { ...ctx.api.value.getTriggerProps(item()) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhStepsIndicator = defineComponent({
  name: 'XhStepsIndicator',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    const item = useStepsItem()
    return () => h('span', ctx.api.value.getIndicatorProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

export const XhStepsTitle = defineComponent({
  name: 'XhStepsTitle',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    const item = useStepsItem()
    return () => h('span', ctx.api.value.getTitleProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

export const XhStepsDescription = defineComponent({
  name: 'XhStepsDescription',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    const item = useStepsItem()
    return () => h('span', ctx.api.value.getDescriptionProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

// 连接线属于它前面那一步，因此写在 item 之内，身份也从 item 那里取。
export const XhStepsSeparator = defineComponent({
  name: 'XhStepsSeparator',
  setup(_, { slots }) {
    const ctx = useStepsContext()
    const item = useStepsItem()
    return () => h('div', ctx.api.value.getSeparatorProps(item()) as Record<string, unknown>, slots.default?.())
  },
})

/**
 * 面板挂在 list 之外，够不到 item 的身份，因此自带 value 与 trigger 配对（与 Tabs 同一套写法）。
 * 想做完成页就再写一个 value 等于 count 的面板：走到完成位时它自然显出来。
 */
export const XhStepsContent = defineComponent({
  name: 'XhStepsContent',
  props: {
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useStepsContext()
    return () => h(
      'div',
      ctx.api.value.getContentProps({ index: Number(props.value) }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
