import type { HighlighterPort, IdGenerator } from '@xihan-ui/core'
import type { CodeViewApi, CodeViewClampToggleDetails, CodeViewProps, CodeViewTranslations } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { codeViewAnatomy, codeViewMeta, connectCodeView, createCodeViewHighlighterResource } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'

const defaultHighlighter = createCodeViewHighlighterResource(() => import('@xihan-ui/code-highlight'))

// 属性缺席翻成 undefined，缺省值由 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席为 undefined、"false" 为 false、其余为 true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }

/**
 * `<xh-code-view>` —— Light-DOM 行为宿主，无状态机：wire 时算出 connectCodeView 的产出，
 * 打到作者写的角色节点上，并把逐行结构铺进 code 角色节点。
 *
 * 行是算出来的派生数据，作者写不出 N 个节点，故 code 部件的内容由本元素接管；
 * 其余各处一律不替作者生成节点。复制按钮由 `<xh-clipboard>` 组合提供。
 *
 * @customElement xh-code-view
 * @attr {string} code - 代码原文
 * @attr {string} code-lang - 围栏语言标注，空白时按 plaintext 处理
 * @attr {string} filename - 文件名；作者写了 filename 角色节点时它就是 pre 的可访问名
 * @attr {boolean} complete - 代码是否已闭合，未闭合默认不着色
 * @attr {boolean} wrap - 长行自动换行，默认关（长行横向滚动）
 * @attr {boolean} line-numbers - 显示行号槽
 * @attr {number} start-line - 首行的行号，默认 1
 * @attr {string} highlight-lines - 要高亮的行号，写成 `3,7-9`
 * @attr {number} clamp - 超过这么多行才算可折叠
 * @attr {boolean} clamped - 折叠态，纯受控
 * @attr {boolean} highlight-while-streaming - 未闭合时也着色，默认关
 * @attr {string} size - 尺寸：sm / md / lg
 * @fires clamp-toggle - 折叠态翻面的意图；detail 为 `{ clamped: boolean }`
 * @csspart root - 外壳，承载 data-lang / data-complete / data-clamped / data-digits
 * @csspart header - 文件名与语言角标那一行
 * @csspart filename - 文件名，渲了它就是 pre 的可访问名
 * @csspart lang-label - 语言角标，纯装饰且对读屏隐藏
 * @csspart pre - 横向滚动容器；tabindex=0，高度按行数写进内联样式
 * @csspart code - 全部行的容器，内容由本元素铺
 * @csspart line - 一行，承载 data-line-number / data-highlighted
 * @csspart line-number - 行号槽，皮肤用 attr() 画，对读屏隐藏
 * @csspart line-content - 该行的正文与记号
 * @csspart token - 着色生效时的一个记号，承载 data-kind
 * @csspart fold-trigger - 展开或收起，承载 aria-expanded / aria-controls
 */
export class XhCodeViewElement extends XhElement {
  static override partContract = { anatomy: codeViewAnatomy, meta: codeViewMeta }

  // 属性名用 code-lang，避开 HTML 全局属性 lang 与 HTMLElement 原生 lang 访问器。
  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字。
  static override properties = {
    code: { converter: STRING_CONVERTER },
    codeLang: { converter: STRING_CONVERTER, attribute: 'code-lang' },
    filename: { converter: STRING_CONVERTER },
    complete: { converter: BOOLEAN_CONVERTER },
    wrap: { type: Boolean },
    lineNumbers: { type: Boolean, attribute: 'line-numbers' },
    startLine: { converter: NUMBER_CONVERTER, attribute: 'start-line' },
    highlightLines: { converter: STRING_CONVERTER, attribute: 'highlight-lines' },
    clamp: { converter: NUMBER_CONVERTER },
    clamped: { converter: BOOLEAN_CONVERTER },
    highlightWhileStreaming: { converter: BOOLEAN_CONVERTER, attribute: 'highlight-while-streaming' },
    size: { converter: STRING_CONVERTER },
    // 对象值走不了 HTML 属性，只作为 property 暴露
    highlighter: { attribute: false },
    translations: { attribute: false },
  }

  declare code?: string
  declare codeLang?: string
  declare filename?: string
  declare complete?: boolean
  declare wrap?: boolean
  declare lineNumbers?: boolean
  declare startLine?: number
  declare highlightLines?: string
  declare clamp?: number
  declare clamped?: boolean
  declare highlightWhileStreaming?: boolean
  declare size?: CodeViewProps['size']
  /** 可访问名与折叠按钮的文案。 */
  declare translations?: Partial<CodeViewTranslations>

  /** 换一个着色实现（典型是接 Shiki）；置 null 关掉着色。只走 property，属性表达不了对象。 */
  declare highlighter?: HighlighterPort | null

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly codeViewScope = createScope(null, this.idGen)

  /** 上一次铺进 code 部件的那份逐行结构，用来判断要不要重铺。 */
  #painted?: string
  #releaseHighlighter?: () => void

  override connectedCallback(): void {
    super.connectedCallback()
    this.#releaseHighlighter = defaultHighlighter.subscribe(() => this.requestUpdate())
  }

  override disconnectedCallback(): void {
    this.#releaseHighlighter?.()
    this.#releaseHighlighter = undefined
    super.disconnectedCallback()
  }

  private resolvedHighlighter(): HighlighterPort | undefined {
    if (this.highlighter === null)
      return undefined
    if (this.highlighter !== undefined)
      return this.highlighter
    defaultHighlighter.request()
    return defaultHighlighter.read() ?? undefined
  }

  private viewProps(): CodeViewProps {
    return {
      code: this.code ?? '',
      lang: this.codeLang,
      filename: this.filename,
      // 作者写没写 filename 角色节点决定 pre 的可访问名指哪儿
      labelled: this.getPart('filename') != null,
      complete: this.complete,
      wrap: this.wrap,
      lineNumbers: this.lineNumbers,
      startLine: this.startLine,
      highlightLines: this.highlightLines,
      clamp: this.clamp,
      clamped: this.clamped,
      highlighter: this.resolvedHighlighter(),
      highlightWhileStreaming: this.highlightWhileStreaming,
      size: this.size,
      translations: this.translations,
      onClampToggle: (details: CodeViewClampToggleDetails) => {
        this.dispatchEvent(new CustomEvent('clamp-toggle', { detail: details, bubbles: true, composed: true }))
      },
    }
  }

  protected wire(): void {
    const api = connectCodeView(this.configured('code-view', this.viewProps()), this.codeViewScope, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('filename', api.getFilenameProps() as Record<string, unknown>)
    put('lang-label', api.getLangLabelProps() as Record<string, unknown>)
    put('pre', api.getPreProps() as Record<string, unknown>)
    put('code', api.getCodeProps() as Record<string, unknown>)
    put('fold-trigger', api.getFoldTriggerProps() as Record<string, unknown>)

    this.#paint(api)
  }

  /**
   * 把逐行结构铺进 code 部件。
   * 内容没变就不重铺——每次更新都重建节点会把用户正在拖的选区弄没。
   */
  #paint(api: CodeViewApi): void {
    const host = this.getPart('code')
    if (!host) {
      this.#painted = undefined
      return
    }
    const signature = `${api.lineNumbers}|${api.lines
      .map((line, index) => `${api.lineNumberAt(index)} ${line.tokens.map(t => `${t.kind}${t.text}`).join('')} ${line.text}`)
      .join('')}`
    if (signature === this.#painted)
      return
    this.#painted = signature

    const doc = host.ownerDocument
    const frame = doc.createDocumentFragment()
    api.lines.forEach((line, index) => {
      const row = doc.createElement('span')
      this.spreader.spread(row, api.getLineProps({ index }) as Record<string, unknown>)

      // 行号槽不开就不建节点，两个适配器同一条判据
      if (api.lineNumbers) {
        const number = doc.createElement('span')
        this.spreader.spread(number, api.getLineNumberProps({ index }) as Record<string, unknown>)
        row.appendChild(number)
      }

      const content = doc.createElement('span')
      this.spreader.spread(content, api.getLineContentProps({ index }) as Record<string, unknown>)
      // 没有着色结果就一个文本节点，别平白多包一层 span
      if (line.tokens.length === 0) {
        content.textContent = line.text
      }
      else {
        for (const token of line.tokens) {
          const span = doc.createElement('span')
          this.spreader.spread(span, api.getTokenProps(token) as Record<string, unknown>)
          span.textContent = token.text
          content.appendChild(span)
        }
      }
      row.appendChild(content)
      frame.appendChild(row)
    })
    host.replaceChildren(frame)
  }
}
