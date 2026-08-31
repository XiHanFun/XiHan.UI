import type { CodeLine, CodeViewApi, CodeViewProps, CodeViewTranslations } from '@xihan-ui/headless'
import type { HighlighterPort, Size } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { createHighlighter } from '@xihan-ui/code-highlight'
import { defineComponent, h, onBeforeUnmount, onMounted } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideCodeView, useCodeViewContext } from './context'
import { useCodeView } from './use-code-view'

/** 默认着色实现全组件共用一份：它无状态，没必要每块代码建一个。 */
const defaultHighlighter = createHighlighter()

/** 默认插槽的载荷：语言、行数与折叠状态，以及翻面折叠的句柄。 */
export type CodeViewRootSlotProps = Pick<CodeViewApi, 'lang' | 'lineCount' | 'lines' | 'foldable' | 'clamped' | 'setClamped'>

/** 逐行插槽的载荷。 */
export interface CodeViewLineSlotProps {
  line: CodeLine
  /** 0 基行下标。 */
  index: number
  /** 这一行显示的行号，等于 startLine + index。 */
  number: number
}

export const XhCodeViewRoot = defineComponent({
  name: 'XhCodeViewRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    code: { type: String, default: '' },
    lang: { type: String, default: undefined },
    filename: { type: String, default: undefined },
    // 三态，undefined 与 false 同样不落 data-complete
    complete: { type: Boolean, default: undefined },
    wrap: Boolean,
    lineNumbers: Boolean,
    startLine: { type: Number, default: undefined },
    highlightLines: { type: [String, Array] as PropType<string | readonly number[]>, default: undefined },
    clamp: { type: Number, default: undefined },
    // 纯受控：没有 defaultClamped，要非受控就套 collapsible
    clamped: { type: Boolean, default: undefined },
    /** 换一个着色实现（典型是接 Shiki）；显式给 null 则关掉着色。 */
    highlighter: { type: Object as PropType<HighlighterPort | null>, default: undefined },
    highlightWhileStreaming: { type: Boolean, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<CodeViewTranslations>>, default: undefined },
  },
  emits: {
    'clamp-toggle': (_details: PayloadOf<CodeViewProps, 'onClampToggle'>) => true,
    'update:clamped': (_clamped: boolean) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: CodeViewRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const configured = withXhConfig('code-view', props)
    // getter 透传保住响应性：props 变了带动 connect 重算
    const forward: CodeViewProps = {
      get code() {
        return props.code
      },
      get lang() {
        return props.lang
      },
      get filename() {
        return props.filename
      },
      get complete() {
        return props.complete
      },
      get wrap() {
        return props.wrap
      },
      get lineNumbers() {
        return props.lineNumbers
      },
      get startLine() {
        return props.startLine
      },
      get highlightLines() {
        return props.highlightLines
      },
      get clamp() {
        return props.clamp
      },
      get clamped() {
        return props.clamped
      },
      get highlighter() {
        return props.highlighter === null ? undefined : props.highlighter ?? defaultHighlighter
      },
      get highlightWhileStreaming() {
        return props.highlightWhileStreaming
      },
      get size() {
        return configured.size
      },
      get translations() {
        return configured.translations
      },
      onClampToggle: (details) => {
        emit('clamp-toggle', details)
        emit('update:clamped', details.clamped)
      },
    }
    const ctx = useCodeView(forward)
    provideCodeView(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      lang: ctx.api.value.lang,
      lineCount: ctx.api.value.lineCount,
      lines: ctx.api.value.lines,
      foldable: ctx.api.value.foldable,
      clamped: ctx.api.value.clamped,
      setClamped: ctx.api.value.setClamped,
    }))
  },
})

export const XhCodeViewHeader = defineComponent({
  name: 'XhCodeViewHeader',
  setup(_, { slots }) {
    const ctx = useCodeViewContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCodeViewFilename = defineComponent({
  name: 'XhCodeViewFilename',
  props: {
    /** 不给就取 XhCodeViewRoot 上的 filename。 */
    filename: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useCodeViewContext()
    // 渲出来了才登记：pre 的 aria-labelledby 只在这个节点真在场时才指过来
    onMounted(() => {
      ctx.filenameCount.value++
    })
    onBeforeUnmount(() => {
      ctx.filenameCount.value--
    })
    return () => h(
      'span',
      ctx.api.value.getFilenameProps() as Record<string, unknown>,
      slots.default?.() ?? props.filename,
    )
  },
})

export const XhCodeViewLangLabel = defineComponent({
  name: 'XhCodeViewLangLabel',
  setup(_, { slots }) {
    const ctx = useCodeViewContext()
    return () => h(
      'span',
      ctx.api.value.getLangLabelProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.lang,
    )
  },
})

export const XhCodeViewPre = defineComponent({
  name: 'XhCodeViewPre',
  setup(_, { slots }) {
    const ctx = useCodeViewContext()
    // 用 pre 保留代码里的空白与换行
    return () => h('pre', ctx.api.value.getPreProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhCodeViewCode = defineComponent({
  name: 'XhCodeViewCode',
  slots: Object as SlotsType<{
    line?: (props: CodeViewLineSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useCodeViewContext()
    // 行是算出来的派生结构，作者写不出 N 个节点，由组件铺；每行的内容可用 line 插槽接管
    return () => {
      const api = ctx.api.value
      return h('code', api.getCodeProps() as Record<string, unknown>, api.lines.map((line, index) => h(
        'span',
        { ...api.getLineProps({ index }) as Record<string, unknown>, key: index },
        [
          // 行号槽不开就不建节点，两个适配器同一条判据
          api.lineNumbers ? h('span', api.getLineNumberProps({ index }) as Record<string, unknown>) : null,
          h(
            'span',
            api.getLineContentProps({ index }) as Record<string, unknown>,
            slots.line?.({ line, index, number: api.lineNumberAt(index) })
            // 没有着色结果就一个文本节点，别平白多包一层 span
            ?? (line.tokens.length === 0
              ? line.text
              : line.tokens.map((token, i) => h(
                  'span',
                  { ...api.getTokenProps(token) as Record<string, unknown>, key: i },
                  token.text,
                ))),
          ),
        ],
      )))
    }
  },
})

export const XhCodeViewFoldTrigger = defineComponent({
  name: 'XhCodeViewFoldTrigger',
  setup(_, { slots }) {
    const ctx = useCodeViewContext()
    return () => h('button', ctx.api.value.getFoldTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})
