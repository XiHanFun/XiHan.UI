/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 diff view 相关实现。

import type { CodeToken, Size } from '@xihan-ui/core'
import type {
  DiffLine,
  DiffModel,
  DiffViewApi,
  DiffViewCellProps,
  DiffViewCommentRequestDetails,
  DiffViewExpandedValueChangeDetails,
  DiffViewLineRef,
  DiffViewMode,
  DiffViewSchema,
  DiffViewTranslations,
} from '@xihan-ui/headless'
import { connectDiffView, diffViewAnatomy, diffViewMachine, diffViewMeta, diffViewSides } from '@xihan-ui/headless'
import { wcNormalize } from '../dom/normalize'
import { XhElement } from '../element-base'
import { MachineController } from '../runtime/machine-controller'

// 属性缺席翻成 undefined，缺省值由机器与 connect 给出
const STRING_CONVERTER = { fromAttribute: (v: string | null) => v ?? undefined }
// 空串按缺席处理，避免 Number('') 落成 0
const NUMBER_CONVERTER = { fromAttribute: (v: string | null) => (v == null || v === '' ? undefined : Number(v)) }
// 三态：属性缺席是 undefined，写了就是 true，显式 "false" 才是 false
const BOOLEAN_CONVERTER = { fromAttribute: (v: string | null) => (v === null ? undefined : v !== 'false') }

/** 铺出来的一个正文格：评论钮与评论容器跟着它，开合与挂评论只改这几处，不重铺整份差异。 */
interface PaintedCell {
  readonly cell: DiffViewCellProps
  readonly content: HTMLElement
  readonly trigger: HTMLElement | null
  comment: HTMLElement | null
}

/** `comment-mount` 的 detail：评论容器与它挂在哪一行。 */
interface DiffViewCommentMount extends DiffViewCommentRequestDetails {
  /** 新铺出来的评论容器，作者往里放评论内容。 */
  element: HTMLElement
}

/** 词级片段的指纹：进重铺签名，片段变了才会重铺。 */
function segmentKey(line: DiffLine): string {
  return line.segments?.map(segment => `${segment.changed ? 1 : 0}${segment.text.length}`).join('|') ?? ''
}

/**
 * `<xh-diff-view>`：Light-DOM 行为宿主：作者写 root / viewport / body 三个角色节点，
 * 行由本元素按模型铺进 body。
 *
 * 行是模型计算得出的派生结构，作者无法编写 N 行，因此 body 部件的内容由本元素接管；
 * 其余各处一律不替作者生成节点。
 *
 * 行评论：挂在 commentLines 里的行，本元素在代码下方铺一个评论容器，新铺出来一个就派发一次
 * `comment-mount`，作者往 detail.element 里放评论内容。
 *
 * @customElement xh-diff-view
 * @attr {string} view - unified（默认）或 split
 * @attr {number} context-lines - 变更两侧各显示的上下文行数，其余折叠
 * @attr {boolean} wrap - 长行原地折行，默认关闭（长行横向滚动）
 * @attr {boolean} commentable - 每行正文前给一颗评论钮，点它派发 comment-request；默认关闭
 * @attr {string} size - 尺寸：sm / md / lg
 * @prop {DiffViewLineRef[]} commentLines - 挂着评论的行，写 `{ side, line }`
 * @fires expanded-value-change - 展开集合变化；detail 为 `{ value: string[] }`
 * @fires comment-request - 在某一行上点了评论钮；detail 为 `{ side, line, change, text }`
 * @fires comment-mount - 新铺出一个评论容器；detail 为 `{ side, line, change, text, element }`
 * @csspart root - 外壳，承载 data-view / data-wrap / data-truncated
 * @csspart header - 文件名与增删统计所在的行
 * @csspart summary - 增删统计位，写 data-change="added" / "removed"，数字由本元素填
 * @csspart viewport - 滚动容器，唯一的 Tab 停靠点
 * @csspart body - role=table，承载 aria-rowcount / aria-colcount
 * @csspart row - 一行，role=row + aria-rowindex + data-change
 * @csspart line-number - 行号槽，不提供 role、对读屏隐藏，皮肤用 attr() 绘制
 * @csspart line-content - 唯一暴露的内容列，role=cell + aria-colindex
 * @csspart change-label - 变更类型的读屏文字，位于内容格中并视觉隐藏
 * @csspart inline-change - 词级片段，变更处承载 data-change
 * @csspart token - 着色片段，承载 data-kind
 * @csspart gap - 折叠的上下文行，role=row
 * @csspart gap-cell - 包裹展开按钮的格，role=cell
 * @csspart gap-trigger - 展开按钮，承载 aria-expanded
 * @csspart empty - 没有任何变更时的占位
 * @csspart truncation - 截断提示条，文字由本元素填入；未截断时带 hidden
 * @csspart comment-trigger - 评论钮，由本元素铺在正文最前面；一组只占一个 Tab 位，上下方向键在组内走
 * @csspart comment-thread - 挂在正文格里、代码下方的评论容器，由本元素铺、内容由作者经 comment-mount 放
 */
export class XhDiffViewElement extends XhElement {
  static override partContract = { anatomy: diffViewAnatomy, meta: diffViewMeta }

  // 描述符逐个写全，不用对象展开，CEM 分析器的 lit 插件读不了展开元素的名字
  static override properties = {
    view: { converter: STRING_CONVERTER },
    contextLines: { converter: NUMBER_CONVERTER, attribute: 'context-lines' },
    wrap: { converter: BOOLEAN_CONVERTER },
    commentable: { converter: BOOLEAN_CONVERTER },
    size: { converter: STRING_CONVERTER },
    // 对象与数组值走不了 HTML 属性，只作为 property 暴露
    model: { attribute: false },
    expandedValue: { attribute: false },
    defaultExpandedValue: { attribute: false },
    commentLines: { attribute: false },
    translations: { attribute: false },
  }

  declare view?: DiffViewMode
  declare contextLines?: number
  declare wrap?: boolean
  declare commentable?: boolean
  declare commentLines?: readonly DiffViewLineRef[]
  declare size?: Size
  /** 差异模型，由 computeTextDiff 或 parseUnifiedPatch 计算得出。 */
  declare model?: DiffModel
  declare expandedValue?: readonly string[]
  declare defaultExpandedValue?: readonly string[]
  declare translations?: Partial<DiffViewTranslations>

  private readonly notify = (details: DiffViewExpandedValueChangeDetails): void => {
    this.dispatchEvent(new CustomEvent('expanded-value-change', { detail: details, bubbles: true, composed: true }))
  }

  private readonly requestComment = (details: DiffViewCommentRequestDetails): void => {
    this.dispatchEvent(new CustomEvent('comment-request', { detail: details, bubbles: true, composed: true }))
  }

  private readonly ctrl = new MachineController<DiffViewSchema>(this, diffViewMachine, () => ({
    model: this.model,
    view: this.view,
    contextLines: this.contextLines,
    wrap: this.wrap,
    // 作者写没写 header 角色节点决定表格的可访问名指哪儿
    labelled: this.getPart('header') != null,
    commentable: this.commentable,
    commentLines: this.commentLines,
    expandedValue: this.expandedValue,
    defaultExpandedValue: this.defaultExpandedValue,
    size: this.size,
    translations: this.translations,
    onExpandedValueChange: this.notify,
    onCommentRequest: this.requestComment,
  }))

  /** 上一次铺进 body 的那份行序，用来判断要不要重铺。 */
  #painted?: string
  /** 上一次铺出来的正文格，评论钮与评论容器就地更新。 */
  #cells: PaintedCell[] = []

  protected wire(): void {
    const api = connectDiffView(this.ctrl.service, wcNormalize)

    const put = (name: string, props: Record<string, unknown>): void => {
      const el = this.getPart(name)
      if (el)
        this.spreader.spread(el, props)
    }
    put('root', api.getRootProps() as Record<string, unknown>)
    put('header', api.getHeaderProps() as Record<string, unknown>)
    put('viewport', api.getViewportProps() as Record<string, unknown>)
    put('body', api.getBodyProps() as Record<string, unknown>)
    put('empty', api.getEmptyProps() as Record<string, unknown>)
    // 提示条的文字由本元素填：留给作者填的话，作者不填就又变回一份看着完整的残缺差异
    const truncation = this.getPart('truncation')
    if (truncation) {
      this.spreader.spread(truncation, api.getTruncationProps() as Record<string, unknown>)
      truncation.textContent = api.truncationText
    }

    // 统计位增删各一个，作者用 data-change 说明这一个是哪一档，数字由本元素填
    for (const el of this.getParts('summary')) {
      const change = el.dataset.change === 'removed' ? 'removed' : 'added'
      this.spreader.spread(el, api.getSummaryProps({ change }) as Record<string, unknown>)
      el.textContent = change === 'added' ? `+${api.stats.added}` : `−${api.stats.removed}`
    }

    this.#paint(api)
  }

  /**
   * 把行序铺进 body。
   * 内容未变时不重铺：每次更新都重建节点会丢失用户正在拖动的选区。
   */
  #paint(api: DiffViewApi): void {
    const host = this.getPart('body')
    if (!host) {
      this.#painted = undefined
      this.#cells = []
      return
    }
    const sides = diffViewSides(api.view)
    const signature = `${api.view}|${api.commentable ? 1 : 0}|${api.rows
      .map(row => (row.kind === 'gap'
        ? `g${row.gapId}:${row.hiddenCount}:${api.expandedValue.includes(row.gapId!) ? 1 : 0}`
        : `l${row.rowIndex}:${row.line!.change}:${row.revealed === true ? 1 : 0}:${segmentKey(row.line!)}:${row.line!.text}`))
      .join('\n')}`
    if (signature === this.#painted) {
      // 行序没变就不重铺，但逐格的按压面（data-pressed）住在机器里、不进签名：把展开按钮的属性刷一遍
      for (const trigger of host.querySelectorAll<HTMLElement>('[data-part="gap-trigger"]')) {
        const gapId = trigger.getAttribute('data-value')
        if (gapId !== null)
          this.spreader.spread(trigger, api.getGapTriggerProps({ gapId }) as Record<string, unknown>)
      }
      // 评论钮的停靠点与挂着的评论也不进签名：就地更新
      this.#syncComments(api)
      return
    }
    this.#painted = signature

    const doc = host.ownerDocument
    const frame = doc.createDocumentFragment()
    const cells: PaintedCell[] = []

    for (const row of api.rows) {
      if (row.kind === 'gap') {
        const gapId = row.gapId!
        const gap = doc.createElement('div')
        this.spreader.spread(gap, api.getGapProps({ gapId }) as Record<string, unknown>)
        const cell = doc.createElement('div')
        this.spreader.spread(cell, api.getGapCellProps() as Record<string, unknown>)
        const trigger = doc.createElement('button')
        this.spreader.spread(trigger, api.getGapTriggerProps({ gapId }) as Record<string, unknown>)
        trigger.textContent = `⋯ ${row.hiddenCount}`
        cell.appendChild(trigger)
        gap.appendChild(cell)
        frame.appendChild(gap)
        continue
      }

      const rowIndex = row.rowIndex
      const el = doc.createElement('div')
      this.spreader.spread(el, api.getRowProps({ rowIndex }) as Record<string, unknown>)
      for (const side of sides) {
        const number = doc.createElement('span')
        this.spreader.spread(number, api.getLineNumberProps({ rowIndex, side }) as Record<string, unknown>)
        el.appendChild(number)

        const content = doc.createElement('span')
        this.spreader.spread(content, api.getLineContentProps({ rowIndex, side }) as Record<string, unknown>)
        // 变更类型的读屏文字住在内容格里面：变更不能只靠颜色传达
        const label = doc.createElement('span')
        this.spreader.spread(label, api.getChangeLabelProps({ change: row.line!.change }) as Record<string, unknown>)
        label.textContent = api.changeLabel(row.line!.change)
        content.appendChild(label)

        // 评论钮放在正文最前面，由皮肤定位到正文让出的那一列里；空侧不建
        const cell = { rowIndex, side }
        let trigger: HTMLElement | null = null
        if (api.commentable && api.commentRefAt(cell) !== undefined) {
          trigger = doc.createElement('button')
          this.spreader.spread(trigger, api.getCommentTriggerProps(cell) as Record<string, unknown>)
          content.appendChild(trigger)
        }
        cells.push({ cell, content, trigger, comment: null })

        this.#paintText(content, api, rowIndex, side)
        el.appendChild(content)
      }
      frame.appendChild(el)
    }
    host.replaceChildren(frame)
    this.#cells = cells
    this.#syncComments(api)
  }

  /** 一格的正文：算了词级差异就先按片段裹一层，否则整行按记号铺；都没有就一个文本节点。 */
  #paintText(content: HTMLElement, api: DiffViewApi, rowIndex: number, side: DiffViewCellProps['side']): void {
    const doc = content.ownerDocument
    const segments = api.cellSegments({ rowIndex, side })
    if (segments.length > 0) {
      for (const segment of segments) {
        const span = doc.createElement('span')
        this.spreader.spread(span, api.getInlineChangeProps({ rowIndex, changed: segment.changed }) as Record<string, unknown>)
        if (segment.tokens.length === 0)
          span.textContent = segment.text
        else
          this.#paintTokens(span, api, segment.tokens)
        content.appendChild(span)
      }
      return
    }
    const tokens = api.cellTokens({ rowIndex, side })
    if (tokens.length === 0) {
      const text = api.cellText({ rowIndex, side })
      if (text !== undefined) {
        const span = doc.createElement('span')
        span.textContent = text
        content.appendChild(span)
      }
      return
    }
    this.#paintTokens(content, api, tokens)
  }

  /**
   * 评论钮刷一遍属性（Tab 停靠点在机器里）；挂着评论的格补上评论容器、没挂的撤掉。
   * 新铺出来的容器在这一拍收尾后派发 comment-mount，作者往里放内容。
   */
  #syncComments(api: DiffViewApi): void {
    const fresh: DiffViewCommentMount[] = []
    for (const painted of this.#cells) {
      const { cell, content, trigger } = painted
      if (trigger)
        this.spreader.spread(trigger, api.getCommentTriggerProps(cell) as Record<string, unknown>)
      const ref = api.commentRefAt(cell)
      if (!api.hasComment(cell) || ref === undefined) {
        painted.comment?.remove()
        painted.comment = null
        continue
      }
      if (painted.comment) {
        this.spreader.spread(painted.comment, api.getCommentThreadProps(cell) as Record<string, unknown>)
        continue
      }
      const comment = content.ownerDocument.createElement('div')
      this.spreader.spread(comment, api.getCommentThreadProps(cell) as Record<string, unknown>)
      content.appendChild(comment)
      painted.comment = comment
      const line = api.rows[cell.rowIndex - 1]?.line
      fresh.push({ ...ref, change: line?.change ?? 'context', text: line?.text ?? '', element: comment })
    }
    if (fresh.length === 0)
      return
    queueMicrotask(() => {
      for (const mount of fresh) {
        if (mount.element.isConnected)
          this.dispatchEvent(new CustomEvent<DiffViewCommentMount>('comment-mount', { detail: mount, bubbles: true, composed: true }))
      }
    })
  }

  /** 着色记号逐个铺进给定的宿主。 */
  #paintTokens(host: HTMLElement, api: DiffViewApi, tokens: readonly CodeToken[]): void {
    for (const token of tokens) {
      const span = host.ownerDocument.createElement('span')
      this.spreader.spread(span, api.getTokenProps(token) as Record<string, unknown>)
      span.textContent = token.text
      host.appendChild(span)
    }
  }
}
