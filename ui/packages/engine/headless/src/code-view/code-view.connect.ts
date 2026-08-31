import type { CodeToken, NormalizeProps, PropTypes, Scope } from '@xihan-ui/kernel'
import type { CodeViewApi, CodeViewLineProps, CodeViewProps } from './code-view.types'
import { dataAttr, resolveLabelling } from '@xihan-ui/kernel'
import { codeViewAnatomy } from './code-view.anatomy'
import {
  CODE_VIEW_FALLBACK_LANG,
  CODE_VIEW_MAX_DIGITS,
  parseLineRanges,
  splitCodeLines,
} from './code-view.types'

const parts = codeViewAnatomy.build()

/**
 * 行高槽位与它的兜底值，兜底须与皮肤里 --xh-code-view-line-height 的兜底逐字一致，
 * 否则按行数算出的高度对不上行。
 */
const LINE_HEIGHT = 'var(--xh-code-view-line-height, var(--xh-text-code-leading))'

// 无状态机：把代码文本、着色结果与折叠态投影成各 part 的属性。
export function connectCodeView<T extends PropTypes>(
  props: CodeViewProps,
  scope: Scope,
  normalize: NormalizeProps<T>,
): CodeViewApi<T> {
  // 空串与纯空白的语言标注一律落到 plaintext，保证 lang 非空
  const lang = props.lang?.trim() || CODE_VIEW_FALLBACK_LANG
  const ids = scope.ids('code-view', 'pre', 'filename')

  // 未闭合的块默认不着色；着色实现返回 null 时同样退回纯文本
  const streaming = props.complete !== true
  const tokens: readonly CodeToken[] = props.highlighter && (!streaming || props.highlightWhileStreaming === true)
    ? props.highlighter.highlight(props.code, lang) ?? []
    : []

  const lines = splitCodeLines(props.code, tokens)
  const lineCount = lines.length
  const startLine = Number.isInteger(props.startLine) && props.startLine! > 0 ? props.startLine! : 1
  const lineNumberAt = (index: number): number => startLine + index

  const highlighted = new Set(parseLineRanges(props.highlightLines))

  // 非正数与非有限值一律当没给
  const clamp = Number.isFinite(props.clamp) && props.clamp! > 0 ? Math.floor(props.clamp!) : undefined
  const foldable = clamp !== undefined && lineCount > clamp
  const clamped = foldable && props.clamped === true

  // 折叠时把 min 一并降到 clamp 行：CSS 用值是 max(min, min(max, …))，
  // min-block-size 恒压过 max-block-size，只叠 max 的话高度纹丝不动
  const visibleLines = clamped ? Math.min(lineCount, clamp!) : lineCount
  const blockSize = `calc(${LINE_HEIGHT} * ${visibleLines})`

  // 行号槽宽由皮肤按位数档设，连接层写不了 CSS 自定义属性，只能发这个枚举
  const digits = String(Math.min(
    String(lineNumberAt(lineCount - 1)).length,
    CODE_VIEW_MAX_DIGITS,
  ))

  const labelling = resolveLabelling({
    labelId: ids.filename,
    labelCount: props.labelled === true ? 1 : 0,
    descriptionCount: 0,
    ariaLabel: props.translations?.code ?? 'Code',
  })

  const lineNumbers = !!props.lineNumbers
  const complete = dataAttr(props.complete)
  const wrap = dataAttr(!!props.wrap)

  const setClamped = (next: boolean): void => {
    if (next !== clamped)
      props.onClampToggle?.({ clamped: next })
  }

  const lineAttrs = ({ index }: CodeViewLineProps): Record<string, unknown> => ({
    'data-line-number': String(lineNumberAt(index)),
    'data-highlighted': dataAttr(highlighted.has(lineNumberAt(index))),
  })

  return {
    lang,
    lineCount,
    lines,
    lineNumberAt,
    lineNumbers,
    foldable,
    clamped,
    setClamped,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-lang': lang,
      'data-complete': complete,
      'data-clamped': dataAttr(clamped),
      'data-foldable': dataAttr(foldable),
      'data-line-numbers': dataAttr(lineNumbers),
      'data-digits': digits,
      'data-size': props.size,
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
    }),

    // 渲了它就是 pre 的可访问名，故要有 id
    getFilenameProps: () => normalize.element({
      ...parts.filename.attrs,
      id: ids.filename,
    }),

    // 纯装饰角标，对读屏隐藏
    getLangLabelProps: () => normalize.element({
      ...parts['lang-label'].attrs,
      'aria-hidden': true,
    }),

    getPreProps: () => normalize.element({
      ...parts.pre.attrs,
      ...labelling,
      'id': ids.pre,
      // <pre> 自身没有角色，光挂 aria-labelledby 是无效属性；给它一个能承载可访问名的角色，
      // 这个 Tab 停靠点才念得出文件名
      'role': 'group',
      // 提供 Tab 停靠点，横向滚动交给浏览器
      'tabindex': 0,
      'data-complete': complete,
      'data-wrap': wrap,
      // 按行数撑高度；写成 style 而非 CSS 自定义属性，WC 侧的属性铺设写不进 --* 变量
      'style': clamped
        ? { minBlockSize: blockSize, maxBlockSize: blockSize }
        : { minBlockSize: blockSize },
    }),

    getCodeProps: () => normalize.element({
      ...parts.code.attrs,
      'data-lang': lang,
      'data-wrap': wrap,
    }),

    getLineProps: line => normalize.element({
      ...parts.line.attrs,
      ...lineAttrs(line),
    }),

    // 行号由皮肤用 content: attr(data-line-number) 画：复制代码不带行号，读屏也不逐行念数字
    getLineNumberProps: line => normalize.element({
      ...parts['line-number'].attrs,
      ...lineAttrs(line),
      'aria-hidden': true,
    }),

    getLineContentProps: line => normalize.element({
      ...parts['line-content'].attrs,
      ...lineAttrs(line),
    }),

    // 记号只带种类，配色全交给皮肤按 data-kind 选择器给
    getTokenProps: token => normalize.element({
      ...parts.token.attrs,
      'data-kind': token.kind,
    }),

    getFoldTriggerProps: () => normalize.button({
      ...parts['fold-trigger'].attrs,
      'type': 'button',
      'aria-controls': ids.pre,
      'aria-expanded': clamped ? 'false' : 'true',
      'aria-label': clamped
        ? props.translations?.expand ?? 'Expand code'
        : props.translations?.collapse ?? 'Collapse code',
      'data-state': clamped ? 'closed' : 'open',
      'hidden': !foldable || undefined,
      'onClick': () => setClamped(!clamped),
    }),
  }
}
