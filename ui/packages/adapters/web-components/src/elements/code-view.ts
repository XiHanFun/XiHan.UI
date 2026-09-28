/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 code view 相关实现。

import type { HighlighterPort, IdGenerator } from '@xihan-ui/core'
import type { CodeViewApi, CodeViewClampToggleDetails, CodeViewFoldedChangeDetails, CodeViewProps, CodeViewSchema, CodeViewTranslations } from '@xihan-ui/headless'
import { createCounterIdGenerator, createScope } from '@xihan-ui/core'
import { codeViewAnatomy, codeViewMachine, codeViewMeta, connectCodeView, createCodeViewHighlighterResource } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

const defaultHighlighter = createCodeViewHighlighterResource(() => import('@xihan-ui/code-highlight'))

// 属性缺席翻成 undefined，缺省值由 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 三态布尔：缺席为 undefined、"false" 为 false、其余为 true
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }
// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 逗号分隔的行号表；缺席为 undefined，空串是一张空表（受控地一个都不折叠）
/** 按块折叠时铺出来的一行：开合只改属性，不重铺节点。 */
interface FoldingLine {
  readonly index: number
  readonly row: HTMLElement
  readonly content: HTMLElement
  readonly trigger: HTMLElement | null
}

const LINE_LIST_CONVERTER = {
  fromAttribute: (v: string | null) => (v == null ? undefined : v.split(',').map(s => s.trim()).filter(s => s !== '').map(Number).filter(Number.isInteger)),
}

/**
 * `<xh-code-view>`：Light-DOM 行为宿主，wire 时计算 connectCodeView 的产出，
 * 接到作者编写的角色节点上，并把逐行结构铺进 code 角色节点；机器只承载按压通道（fold-trigger 的 data-pressed）。
 *
 * 行是计算得出的派生数据，作者无法编写 N 个节点，因此 code 部件的内容由本元素接管；
 * 其余各处一律不替作者生成节点。复制按钮由 `<xh-clipboard>` 组合提供。
 *
 * @customElement xh-code-view
 * @attr {string} code - 代码原文
 * @attr {string} code-lang - 围栏语言标注，空白时按 plaintext 处理
 * @attr {string} filename - 文件名；作者写了 filename 角色节点时它即为 pre 的可访问名
 * @attr {boolean} complete - 代码是否已闭合，未闭合默认不着色
 * @attr {boolean} wrap - 长行自动换行，默认关闭（长行横向滚动）
 * @attr {boolean} line-numbers - 显示行号槽
 * @attr {number} start-line - 首行的行号，默认 1
 * @attr {string} highlight-lines - 要高亮的行号，写为 `3,7-9`
 * @attr {number} clamp - 超过该行数才视为可折叠
 * @attr {boolean} clamped - 折叠态，纯受控
 * @attr {boolean} block-folding - 按缩进找出语法块，块头行首给一颗折叠钮，默认关闭
 * @attr {string} folded - 折叠着的语法块，写块头的行号、逗号分隔；受控
 * @attr {string} default-folded - 非受控时一开始就折叠着的块，写法同 folded
 * @attr {boolean} highlight-while-streaming - 未闭合时也着色，默认关闭
 * @attr {string} size - 尺寸：sm / md / lg
 * @fires clamp-toggle - 折叠态切换的意图；detail 为 `{ clamped: boolean }`
 * @fires folded-change - 语法块的折叠集合变化；detail 为 `{ folded: number[] }`
 * @csspart root - 外壳，承载 data-lang / data-complete / data-clamped / data-digits
 * @csspart header - 文件名与语言角标所在的行
 * @csspart filename - 文件名，渲染后即为 pre 的可访问名；没写内容时元素写上 filename 属性的值
 * @csspart lang-label - 语言角标，纯装饰且对读屏隐藏
 * @csspart pre - 横向滚动容器；tabindex=0，高度按行数写入内联样式
 * @csspart code - 全部行的容器，内容由本元素铺设
 * @csspart line - 一行，承载 data-line-number / data-highlighted
 * @csspart line-number - 行号槽，皮肤用 attr() 绘制，对读屏隐藏
 * @csspart line-content - 该行的正文与记号
 * @csspart token - 着色生效时的一个记号，承载 data-kind
 * @csspart fold-trigger - 展开或收起，承载 aria-expanded / aria-controls；Space / Enter 与触屏按住投影 data-pressed
 * @csspart line-fold-trigger - 语法块块头行首的折叠钮，由本元素铺在正文最前面；一组只占一个 Tab 位，上下方向键在组内走
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
    blockFolding: { type: Boolean, attribute: 'block-folding' },
    folded: { converter: LINE_LIST_CONVERTER },
    defaultFolded: { converter: LINE_LIST_CONVERTER, attribute: 'default-folded' },
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
  declare blockFolding?: boolean
  declare folded?: number[]
  declare defaultFolded?: number[]
  declare highlightWhileStreaming?: boolean
  declare size?: CodeViewProps['size']
  /** 可访问名与折叠按钮的文案。 */
  declare translations?: Partial<CodeViewTranslations>

  /** 替换着色实现（典型是接入 Shiki）；置 null 关闭着色。对象只能通过 property 设置。 */
  declare highlighter?: HighlighterPort | null

  private readonly idGen: IdGenerator = createCounterIdGenerator()
  private readonly codeViewScope = createScope(null, this.idGen)
  private readonly ctrl = new MachineController<CodeViewSchema>(this, codeViewMachine, () => this.viewProps(), { scope: this.codeViewScope })

  /** 上一次铺进 code 部件的那份逐行结构，用来判断要不要重铺。 */
  #painted?: string
  /** 开了按块折叠时记下铺出来的各行，开合变了就地改属性。 */
  #folding: FoldingLine[] = []
  #releaseHighlighter?: () => void
  /** 元素替作者写进 filename 部件的文字；作者自己写了内容就不再碰它。 */
  #filenameText?: string

  override connectedCallback(): void {
    super.connectedCallback()
    this.#releaseHighlighter = defaultHighlighter.subscribe(() => this.requestUpdate())
  }

  override disconnectedCallback(): void {
    this.#releaseHighlighter?.()
    this.#releaseHighlighter = undefined
    super.disconnectedCallback()
  }

  /**
   * 只读不请求：机器挂载时就会读一遍 props，可选包的加载不能挂在这条读路径上，
   * 否则作者在连接之后才写下的 highlighter: null 已经晚了一步。请求放在 wire 里。
   */
  private resolvedHighlighter(): HighlighterPort | undefined {
    if (this.highlighter === null)
      return undefined
    if (this.highlighter !== undefined)
      return this.highlighter
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
      blockFolding: this.blockFolding,
      folded: this.folded,
      defaultFolded: this.defaultFolded,
      highlighter: this.resolvedHighlighter(),
      highlightWhileStreaming: this.highlightWhileStreaming,
      size: this.size,
      translations: this.translations,
      onClampToggle: (details: CodeViewClampToggleDetails) => {
        this.dispatchEvent(new CustomEvent('clamp-toggle', { detail: details, bubbles: true, composed: true }))
      },
      onFoldedChange: (details: CodeViewFoldedChangeDetails) => {
        this.dispatchEvent(new CustomEvent('folded-change', { detail: details, bubbles: true, composed: true }))
      },
    }
  }

  protected wire(): void {
    // 作者没给着色实现才去请求默认的可选包；模块到达后经 subscribe 重渲一轮
    if (this.highlighter === undefined)
      defaultHighlighter.request()
    const api = connectCodeView(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('filename', api.getFilenameProps() as Record<string, unknown>)
    this.#fillFilename(api)
    put('lang-label', api.getLangLabelProps() as Record<string, unknown>)
    put('pre', api.getPreProps() as Record<string, unknown>)
    put('code', api.getCodeProps() as Record<string, unknown>)
    put('fold-trigger', api.getFoldTriggerProps() as Record<string, unknown>)

    this.#paint(api)
  }

  /**
   * filename 部件没写内容时写上 filename 属性的值，与另两端同一条规则：
   * pre 的可访问名指向这个节点，它空着读屏就读空。作者自己写了内容就不再碰它。
   */
  #fillFilename(api: CodeViewApi): void {
    const el = this.getPart('filename')
    if (!el)
      return
    const ours = this.#filenameText
    if (el.childNodes.length > 0 && (ours === undefined || el.textContent !== ours))
      return
    const text = api.filename ?? ''
    if (el.textContent !== text)
      el.textContent = text
    this.#filenameText = text
  }

  /**
   * 把逐行结构铺进 code 部件。
   * 内容未变时不重铺：每次更新都重建节点会丢失用户正在拖动的选区。
   */
  #paint(api: CodeViewApi): void {
    const host = this.getPart('code')
    if (!host) {
      this.#painted = undefined
      this.#folding = []
      return
    }
    const signature = `${api.lineNumbers}|${api.foldRegions.map(region => region.start).join(',')}|${api.lines
      .map((line, index) => `${api.lineNumberAt(index)} ${line.tokens.map(t => `${t.kind}${t.text}`).join('')} ${line.text}`)
      .join('')}`
    if (signature === this.#painted) {
      this.#refold(api)
      return
    }
    this.#painted = signature

    const doc = host.ownerDocument
    const frame = doc.createDocumentFragment()
    const folding: FoldingLine[] = []
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
      // 块头的折叠钮放在正文最前面，由皮肤定位到正文让出的那一列里；不是块头的行不建
      let trigger: HTMLElement | null = null
      if (api.isFoldStart(index)) {
        trigger = doc.createElement('button')
        this.spreader.spread(trigger, api.getLineFoldTriggerProps({ index }) as Record<string, unknown>)
        content.appendChild(trigger)
      }
      // 没有着色结果就一个文本节点，别平白多包一层 span
      if (line.tokens.length === 0) {
        // 空行不留空文本节点，与直接写 textContent 时一样
        if (line.text !== '')
          content.append(line.text)
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
      if (api.foldRegions.length > 0)
        folding.push({ index, row, content, trigger })
    })
    host.replaceChildren(frame)
    this.#folding = folding
  }

  /**
   * 结构没变、只是语法块开合或停靠点变了：就地改写各行与折叠钮的属性。
   * 不重铺节点——重铺会把焦点从刚按下的那颗钮上摘掉。
   */
  #refold(api: CodeViewApi): void {
    for (const { index, row, content, trigger } of this.#folding) {
      this.spreader.spread(row, api.getLineProps({ index }) as Record<string, unknown>)
      this.spreader.spread(content, api.getLineContentProps({ index }) as Record<string, unknown>)
      if (trigger)
        this.spreader.spread(trigger, api.getLineFoldTriggerProps({ index }) as Record<string, unknown>)
    }
  }
}
