import type { HighlighterPort, Size } from '@xihan-ui/core'
import type { CodeLine, CodeViewApi, CodeViewProps, CodeViewTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { CodeViewProvider, useCodeViewContext } from './context'
import { useCodeView, useDefaultHighlighter } from './use-code-view'

/** 函数式 children 的载荷：语言、行数与折叠状态，以及翻面折叠的句柄。 */
export type CodeViewRootSlotProps = Pick<CodeViewApi, 'lang' | 'lineCount' | 'lines' | 'foldable' | 'clamped' | 'setClamped'>

/** 逐行 children 的载荷。 */
export interface CodeViewLineSlotProps {
  line: CodeLine
  /** 0 基行下标。 */
  index: number
  /** 这一行显示的行号，等于 startLine + index。 */
  number: number
}

/** 根上自有的那些取值；lang 是围栏语言标注、不是原生的文档语言，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'lang'>

export interface XhCodeViewRootProps extends RootElementProps {
  code?: string
  /** 围栏语言标注，空白一律落 plaintext。 */
  lang?: string
  /** 文件名，渲染在 header 里；渲出 filename 部件后它就是 pre 的可访问名。 */
  filename?: string
  /** 代码是否已闭合，未闭合时按行数预撑高度且默认不着色。 */
  complete?: boolean
  /** 长行自动换行，默认关（长行横向滚动）。 */
  wrap?: boolean
  /** 渲染行号槽。 */
  lineNumbers?: boolean
  /** 首行的行号，默认 1。 */
  startLine?: number
  /** 要高亮的行号，写成 `'3,7-9'` 或行号数组。 */
  highlightLines?: string | readonly number[]
  /** 超过这么多行才算可折叠。 */
  clamp?: number
  /** 折叠态，纯受控——没有 defaultClamped，要非受控就套 collapsible。 */
  clamped?: boolean
  /** 换一个着色实现（典型是接 Shiki）；显式给 null 则关掉着色。 */
  highlighter?: HighlighterPort | null
  /** 块还没闭合时也着色，默认关。 */
  highlightWhileStreaming?: boolean
  /** 尺寸：sm / md / lg。 */
  size?: Size
  translations?: Partial<CodeViewTranslations>
  /** 折叠态翻面的意图；clamped 是纯受控的，落不落由宿主决定。 */
  onClampToggle?: CodeViewProps['onClampToggle']
  children?: SlotChildren<CodeViewRootSlotProps>
}

export function XhCodeViewRoot({
  code,
  lang,
  filename,
  complete,
  wrap,
  lineNumbers,
  startLine,
  highlightLines,
  clamp,
  clamped,
  highlighter,
  highlightWhileStreaming,
  size,
  translations,
  onClampToggle,
  children,
  ...rest
}: XhCodeViewRootProps): ReactNode {
  const configured = withXhConfig('code-view', {
    code,
    lang,
    filename,
    complete,
    wrap,
    lineNumbers,
    startLine,
    highlightLines,
    clamp,
    clamped,
    highlightWhileStreaming,
    size,
    translations,
    onClampToggle,
  })
  const fallback = useDefaultHighlighter()
  const ctx = useCodeView({
    ...configured,
    code: configured.code ?? '',
    highlighter: highlighter === null ? undefined : highlighter ?? fallback ?? undefined,
  } as CodeViewProps)
  const { api } = ctx
  return (
    <CodeViewProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          lang: api.lang,
          lineCount: api.lineCount,
          lines: api.lines,
          foldable: api.foldable,
          clamped: api.clamped,
          setClamped: api.setClamped,
        })}
      </div>
    </CodeViewProvider>
  )
}

XhCodeViewRoot.xhEvents = ['clamp-toggle'] as const

export interface XhCodeViewHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhCodeViewHeader({ children, ...rest }: XhCodeViewHeaderProps): ReactNode {
  const ctx = useCodeViewContext()
  return <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCodeViewFilenameProps extends ComponentPropsWithRef<'span'> {
  /** 不写 children 时显示它。 */
  filename?: string
}
export function XhCodeViewFilename({ children, filename, ...rest }: XhCodeViewFilenameProps): ReactNode {
  const ctx = useCodeViewContext()
  // 渲出来了才登记：pre 的 aria-labelledby 只在这个节点真在场时才指过来
  const { registerFilename } = ctx
  useEffect(() => registerFilename(), [registerFilename])
  return (
    <span {...mergeReactProps(ctx.api.getFilenameProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? filename}
    </span>
  )
}

export interface XhCodeViewLangLabelProps extends ComponentPropsWithRef<'span'> {}
export function XhCodeViewLangLabel({ children, ...rest }: XhCodeViewLangLabelProps): ReactNode {
  const ctx = useCodeViewContext()
  return (
    <span {...mergeReactProps(ctx.api.getLangLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? ctx.api.lang}
    </span>
  )
}

export interface XhCodeViewPreProps extends ComponentPropsWithRef<'pre'> {}
/** 用 pre 保留代码里的空白与换行。 */
export function XhCodeViewPre({ children, ...rest }: XhCodeViewPreProps): ReactNode {
  const ctx = useCodeViewContext()
  return <pre {...mergeReactProps(ctx.api.getPreProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</pre>
}

export interface XhCodeViewCodeProps extends Omit<ComponentPropsWithRef<'code'>, 'children'> {
  /** 逐行接管这一行的正文；不给就按着色结果铺。 */
  children?: SlotChildren<CodeViewLineSlotProps>
}
/** 行是算出来的派生结构，作者写不出 N 个节点，由组件铺。 */
export function XhCodeViewCode({ children, ...rest }: XhCodeViewCodeProps): ReactNode {
  const ctx = useCodeViewContext()
  const { api } = ctx
  return (
    <code {...mergeReactProps(api.getCodeProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {api.lines.map((line, index) => (
        <span key={index} {...api.getLineProps({ index }) as Record<string, unknown>}>
          {/* 行号槽不开就不建节点，两个适配器同一条判据 */}
          {api.lineNumbers ? <span {...api.getLineNumberProps({ index }) as Record<string, unknown>} /> : null}
          <span {...api.getLineContentProps({ index }) as Record<string, unknown>}>
            {children === undefined
              // 没有着色结果就一个文本节点，别平白多包一层 span
              ? (line.tokens.length === 0
                  ? line.text
                  : line.tokens.map((token, i) => (
                      <span key={i} {...api.getTokenProps(token) as Record<string, unknown>}>{token.text}</span>
                    )))
              : renderSlot(children, { line, index, number: api.lineNumberAt(index) })}
          </span>
        </span>
      ))}
    </code>
  )
}

export interface XhCodeViewFoldTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhCodeViewFoldTrigger({ children, ...rest }: XhCodeViewFoldTriggerProps): ReactNode {
  const ctx = useCodeViewContext()
  return <button {...mergeReactProps(ctx.api.getFoldTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</button>
}
