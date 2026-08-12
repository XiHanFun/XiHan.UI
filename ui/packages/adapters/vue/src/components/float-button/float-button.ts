import type {
  FloatButtonExpandTrigger,
  FloatButtonNotifiers,
  FloatButtonPlacement,
  FloatButtonProps,
  FloatButtonShape,
  FloatButtonTranslations,
} from '@xihan-ui/headless'
import type { PropType } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideFloatButton, useFloatButtonContext } from './context'
import { useFloatButton } from './use-float-button'

/** 根节点是定位壳：把整组钉在视口一角，悬停展开时进出它才算数。 */
export const XhFloatButtonRoot = defineComponent({
  name: 'XhFloatButtonRoot',
  // 缺省值由机器与 connect 决定，这里一律 default: undefined
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
    placement: { type: String as PropType<FloatButtonPlacement>, default: undefined },
    offset: { type: Number, default: undefined },
    shape: { type: String as PropType<FloatButtonShape>, default: undefined },
    expandTrigger: { type: String as PropType<FloatButtonExpandTrigger>, default: undefined },
    translations: { type: Object as PropType<Partial<FloatButtonTranslations>>, default: undefined },
  },
  // open-change 携带 { open }，update:open 携带裸布尔
  emits: {
    'open-change': (_details: PayloadOf<FloatButtonProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<FloatButtonProps, 'onOpenChange'>['open']) => true,
  },
  setup(props, { slots, emit }) {
    const notify: FloatButtonNotifiers = {
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
    }
    const ctx = useFloatButton(withXhConfig('float-button', props) as FloatButtonProps, notify)
    provideFloatButton(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      setOpen: ctx.api.value.setOpen,
    }))
  },
})

/** 原生 button：Enter / Space 的激活与 Tab 停靠都由平台提供。 */
export const XhFloatButtonTrigger = defineComponent({
  name: 'XhFloatButtonTrigger',
  setup(_, { slots }) {
    const ctx = useFloatButtonContext()
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 展开的那一组动作；收起时带 hidden，里面的按钮一并退出 Tab 序列。 */
export const XhFloatButtonList = defineComponent({
  name: 'XhFloatButtonList',
  setup(_, { slots }) {
    const ctx = useFloatButtonContext()
    return () => h('div', ctx.api.value.getListProps() as Record<string, unknown>, slots.default?.())
  },
})
