import type { ActionVariant, Size, Tone } from '@xihan-ui/core'
import type { BackTopApi, BackTopBehavior, BackTopSchema, BackTopTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideBackTop, useBackTopContext } from './context'
import { useBackTop } from './use-back-top'

type BackTopProps = BackTopSchema['props']

/** 默认插槽的载荷：按钮此刻露不露面。 */
export type BackTopRootSlotProps = Pick<BackTopApi, 'visible'>

/** 根节点是定位壳：把按钮钉在视口一角，收起时整块让位。 */
export const XhBackTopRoot = defineComponent({
  name: 'XhBackTopRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    visibilityHeight: { type: Number },
    behavior: { type: String as PropType<BackTopBehavior> },
    translations: { type: Object as PropType<Partial<BackTopTranslations>> },
    variant: { type: String as PropType<ActionVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    /** 滚动容器，缺省即整页滚动；经 refs 交给观察器。 */
    target: { type: Object as PropType<HTMLElement | null> },
  },
  emits: {
    'visibility-change': (_details: PayloadOf<BackTopProps, 'onVisibilityChange'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: BackTopRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notify: BackTopProps['onVisibilityChange'] = details => emit('visibility-change', details)
    // 传响应式 props 对象本身而非快照，供机器每次读时重新展开
    const ctx = useBackTop(withXhConfig('back-top', props) as BackTopProps, notify, () => props.target ?? null)
    provideBackTop(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      visible: ctx.api.value.visible,
    }))
  },
})

/** 原生 button：Enter / Space 的激活与 Tab 停靠都由平台提供。 */
export const XhBackTopTrigger = defineComponent({
  name: 'XhBackTopTrigger',
  setup(_, { slots }) {
    const ctx = useBackTopContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
