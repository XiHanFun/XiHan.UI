import type { ClipboardSchema } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { provideClipboard, useClipboardContext } from './context'
import { useClipboard } from './use-clipboard'

type ClipboardProps = ClipboardSchema['props']

export const XhClipboardRoot = defineComponent({
  name: 'XhClipboardRoot',
  props: {
    // 属性缺席即没给要复制的文本，落回空串
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
    // 必须是原生 <label>，connect 把 for 写向 input
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
    // 自己渲染 <input>，label 的 for 指向这个节点
    return () => h('input', ctx.api.value.getInputProps() as Record<string, unknown>)
  },
})

export const XhClipboardTrigger = defineComponent({
  name: 'XhClipboardTrigger',
  setup(_, { slots }) {
    const ctx = useClipboardContext()
    // 原生 <button>，激活行为交给平台
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
    // 节点常挂，靠 hidden 显隐
    return () => h(
      'span',
      ctx.api.value.getIndicatorProps({ copied: props.copied }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
