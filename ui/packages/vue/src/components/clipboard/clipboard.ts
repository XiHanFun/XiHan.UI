import type { ClipboardSchema } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { provideClipboard, useClipboardContext } from './context'
import { useClipboard } from './use-clipboard'

type ClipboardProps = ClipboardSchema['props']

export const XhClipboardRoot = defineComponent({
  name: 'XhClipboardRoot',
  props: {
    // 属性缺席 = 没给要复制的文本，落回空串；不给 default: '' 免得与"显式给了空串"混为一谈
    value: { type: String, default: undefined },
    timeout: { type: Number, default: undefined },
  },
  // status-change 携带 { status }；copy-error 携带 { error, value }
  emits: ['status-change', 'copy-error'],
  setup(props, { slots, emit }) {
    const ctx = useClipboard(props as ClipboardProps, {
      onStatusChange: details => emit('status-change', details),
      onCopyError: details => emit('copy-error', details),
    })
    provideClipboard(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      status: ctx.api.value.status,
      copied: ctx.api.value.copied,
      value: ctx.api.value.value,
      copy: ctx.api.value.copy,
    }))
  },
})

export const XhClipboardLabel = defineComponent({
  name: 'XhClipboardLabel',
  setup(_, { slots }) {
    const ctx = useClipboardContext()
    // 必须是原生 <label>：connect 把 for 写向 input，换成别的标签这条关联当场作废
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhClipboardControl = defineComponent({
  name: 'XhClipboardControl',
  setup(_, { slots }) {
    const ctx = useClipboardContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhClipboardInput = defineComponent({
  name: 'XhClipboardInput',
  setup() {
    const ctx = useClipboardContext()
    // 自己渲染 <input>：label 的 for 指的就是这个节点，不是任何外层包裹
    return () => h('input', ctx.api.value.getInputProps() as Record<string, unknown>)
  },
})

export const XhClipboardTrigger = defineComponent({
  name: 'XhClipboardTrigger',
  setup(_, { slots }) {
    const ctx = useClipboardContext()
    // 原生 <button>：Enter / Space 的激活行为交给平台，自己不再接一遍
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhClipboardIndicator = defineComponent({
  name: 'XhClipboardIndicator',
  props: {
    /** 这个标记属于哪一侧：true = 复制成功后的对钩，false（默认）= 平时的复制图标。 */
    copied: Boolean,
  },
  setup(props, { slots }) {
    const ctx = useClipboardContext()
    // 节点常挂、靠 hidden 显隐：卸载掉的是作者写的图标，替他删了他就再也拿不回来
    return () => h(
      'span',
      ctx.api.value.getIndicatorProps({ copied: props.copied }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
