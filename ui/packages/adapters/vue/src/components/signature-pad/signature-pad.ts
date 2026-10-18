/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 signature pad 相关实现。

import type { SignaturePadApi, SignaturePadDrawingOptions, SignaturePadSchema, SignaturePadTranslations, SignaturePadValue } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { signaturePadStructure } from '@xihan-ui/headless'
import { defineComponent, h, onUnmounted } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { withHandlers } from '../../runtime/with-handlers'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideSignaturePad, useSignaturePadContext } from './context'
import { useSignaturePad } from './use-signature-pad'

type SignaturePadProps = SignaturePadSchema['props']

/** 默认插槽的载荷：签名数据、笔迹路径与空态、落笔中标记，以及导出、清空、撤销与重做的动作。 */
export type SignaturePadRootSlotProps = Pick<
  SignaturePadApi,
  | 'value'
  | 'paths'
  | 'empty'
  | 'drawing'
  | 'disabled'
  | 'readOnly'
  | 'canUndo'
  | 'canRedo'
  | 'statusText'
  | 'toSvg'
  | 'clear'
  | 'undo'
  | 'redo'
>

export const XhSignaturePadRoot = defineComponent({
  name: 'XhSignaturePadRoot',
  // 缺省值由 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    name: { type: String },
    // 缺席值 undefined 表示非受控
    value: { type: Object as PropType<SignaturePadValue> },
    defaultValue: { type: Object as PropType<SignaturePadValue> },
    drawing: { type: Object as PropType<SignaturePadDrawingOptions> },
    translations: { type: Object as PropType<Partial<SignaturePadTranslations>> },
  },
  // draw / draw-end 是笔迹通知；value-change 携带 { value }，update:value 携带裸值
  emits: {
    'clear': () => true,
    'draw': (_details: PayloadOf<SignaturePadProps, 'onDraw'>) => true,
    'draw-end': (_details: PayloadOf<SignaturePadProps, 'onDrawEnd'>) => true,
    'value-change': (_details: PayloadOf<SignaturePadProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<SignaturePadProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: SignaturePadRootSlotProps) => VNode[]
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onDraw: SignaturePadProps['onDraw'] = details => emit('draw', details)
    const onDrawEnd: SignaturePadProps['onDrawEnd'] = details => emit('draw-end', details)
    const onValueChange: SignaturePadProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const ctx = useSignaturePad(withHandlers(withXhConfig('signature-pad', useFormControlProps(props)), { onClear: () => emit('clear') }) as SignaturePadProps, { onDraw, onDrawEnd, onValueChange })
    provideSignaturePad(ctx)
    return () => {
      const api = ctx.api.value
      return h('div', api.getRootProps() as Record<string, unknown>, slots.default
        ? slots.default({
            value: api.value,
            paths: api.paths,
            empty: api.empty,
            drawing: api.drawing,
            disabled: api.disabled,
            readOnly: api.readOnly,
            canUndo: api.canUndo,
            canRedo: api.canRedo,
            statusText: api.statusText,
            toSvg: api.toSvg,
            clear: api.clear,
            undo: api.undo,
            redo: api.redo,
          })
        : renderDefaultStructure(api, props.label, props.name !== undefined, slots.label))
    }
  },
})

export const XhSignaturePadLabel = defineComponent({
  name: 'XhSignaturePadLabel',
  setup(_, { slots }) {
    const ctx = useSignaturePadContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    // 不用原生 label：画布是 svg、不是可被 label 关联的表单控件，名字经 aria-labelledby 挂过去
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSignaturePadControl = defineComponent({
  name: 'XhSignaturePadControl',
  setup(_, { slots }) {
    // 放进字段时字段的标题并进画布的名字，说明与错误文案进描述链；画布是 role=img，只取组类接线
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    const ctx = useSignaturePadContext()
    // 画布是 svg：笔迹与基准线都是图元。viewBox 由连接层按钉住的尺寸给，
    // 基准线与笔迹都建在这棵 svg 子树里，命名空间由它带下去
    return () => h('svg', {
      ...fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getControlProps() as Record<string, unknown> }),
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

export const XhSignaturePadUndoTrigger = defineComponent({
  name: 'XhSignaturePadUndoTrigger',
  setup(_, { slots }) {
    const ctx = useSignaturePadContext()
    return () => h('button', ctx.api.value.getUndoTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSignaturePadRedoTrigger = defineComponent({
  name: 'XhSignaturePadRedoTrigger',
  setup(_, { slots }) {
    const ctx = useSignaturePadContext()
    return () => h('button', ctx.api.value.getRedoTriggerProps() as Record<string, unknown>, slots.default?.())
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

/** 标准结构里各部件对应的组件。 */
const SIGNATURE_PAD_PARTS = {
  'label': XhSignaturePadLabel,
  'control': XhSignaturePadControl,
  'guide': XhSignaturePadGuide,
  'path': XhSignaturePadPath,
  'clear-trigger': XhSignaturePadClearTrigger,
  'status': XhSignaturePadStatus,
  'hidden-input': XhSignaturePadHiddenInput,
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 signaturePadStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题由 label 插槽接管。
 */
function renderDefaultStructure(api: SignaturePadApi, label: string | undefined, hiddenInput: boolean, labelSlot?: () => VNode[]): VNode[] {
  const nodes = signaturePadStructure(api, { label, hiddenInput, slotted: name => name === 'label' && labelSlot != null })
  return renderStructure(nodes, SIGNATURE_PAD_PARTS, node => (node.slot ? labelSlot?.() : undefined))
}
