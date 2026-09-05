import type { SignaturePadApi, SignaturePadDrawingOptions, SignaturePadSchema, SignaturePadTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideSignaturePad, useSignaturePadContext } from './context'
import { useSignaturePad } from './use-signature-pad'

type SignaturePadProps = SignaturePadSchema['props']

/** 默认插槽的载荷：笔迹路径与空态、落笔中标记，以及导出与清空的动作。 */
export type SignaturePadRootSlotProps = Pick<
  SignaturePadApi,
  'paths' | 'empty' | 'drawing' | 'disabled' | 'readOnly' | 'statusText' | 'toSvg' | 'clear'
>

export const XhSignaturePadRoot = defineComponent({
  name: 'XhSignaturePadRoot',
  // 全部 default: undefined，缺省值由 connect 决定
  props: {
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    name: { type: String, default: undefined },
    drawing: { type: Object as PropType<SignaturePadDrawingOptions>, default: undefined },
    translations: { type: Object as PropType<Partial<SignaturePadTranslations>>, default: undefined },
  },
  // 两条都是只读通知，签名写不回来，因此没有 v-model
  emits: {
    'draw': (_details: PayloadOf<SignaturePadProps, 'onDraw'>) => true,
    'draw-end': (_details: PayloadOf<SignaturePadProps, 'onDrawEnd'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: SignaturePadRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onDraw: SignaturePadProps['onDraw'] = details => emit('draw', details)
    const onDrawEnd: SignaturePadProps['onDrawEnd'] = details => emit('draw-end', details)
    const ctx = useSignaturePad(withXhConfig('signature-pad', props) as SignaturePadProps, { onDraw, onDrawEnd })
    provideSignaturePad(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      paths: ctx.api.value.paths,
      empty: ctx.api.value.empty,
      drawing: ctx.api.value.drawing,
      disabled: ctx.api.value.disabled,
      readOnly: ctx.api.value.readOnly,
      statusText: ctx.api.value.statusText,
      toSvg: ctx.api.value.toSvg,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhSignaturePadLabel = defineComponent({
  name: 'XhSignaturePadLabel',
  setup(_, { slots }) {
    const ctx = useSignaturePadContext()
    // 不用原生 label：画布是 svg、不是可被 label 关联的表单控件，名字经 aria-labelledby 挂过去
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSignaturePadControl = defineComponent({
  name: 'XhSignaturePadControl',
  setup(_, { slots }) {
    const ctx = useSignaturePadContext()
    // 画布是 svg：笔迹与基准线都是图元。viewBox 由连接层按钉住的尺寸给，
    // 基准线与笔迹都建在这棵 svg 子树里，命名空间由它带下去
    return () => h('svg', {
      ...ctx.api.value.getControlProps() as Record<string, unknown>,
      ref: ctx.controlRef,
    }, slots.default?.())
  },
})

export const XhSignaturePadGuide = defineComponent({
  name: 'XhSignaturePadGuide',
  setup() {
    const ctx = useSignaturePadContext()
    return () => h('line', ctx.api.value.getGuideProps() as Record<string, unknown>)
  },
})

export const XhSignaturePadPath = defineComponent({
  name: 'XhSignaturePadPath',
  setup() {
    const ctx = useSignaturePadContext()
    // 全部笔迹落在这一条路径上，每一笔是它的一条子路径
    return () => h('path', ctx.api.value.getPathProps() as Record<string, unknown>)
  },
})

export const XhSignaturePadClearTrigger = defineComponent({
  name: 'XhSignaturePadClearTrigger',
  setup(_, { slots }) {
    const ctx = useSignaturePadContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSignaturePadStatus = defineComponent({
  name: 'XhSignaturePadStatus',
  setup(_, { slots }) {
    const ctx = useSignaturePadContext()
    // 作者不写内容就用内建那句话，读屏才有东西可念
    return () => h(
      'span',
      ctx.api.value.getStatusProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.statusText,
    )
  },
})

export const XhSignaturePadHiddenInput = defineComponent({
  name: 'XhSignaturePadHiddenInput',
  setup() {
    const ctx = useSignaturePadContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
