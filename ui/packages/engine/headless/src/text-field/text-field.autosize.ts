/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 多行输入的自动高度：按内容量高，行数上下限换算成像素后夹取。纯 DOM 运算，不看状态机。
// 滚动只发生在 textarea 一层：上限给了 maxRows 取 maxRows，没给取 textarea 自己的 max-block-size，
// 都不低于 minRows；夹取结果写进 block-size，max-block-size 由这里接管，外层不必再封顶。
import type { TextFieldAutoSize } from './text-field.types'

interface InlineDeclaration {
  readonly value: string
  readonly priority: string
}

interface AutoSizeOwnership {
  readonly blockSize: InlineDeclaration
  readonly maxBlockSize: InlineDeclaration
  readonly overflowY: InlineDeclaration
  /** 观察这只 textarea 宽度的 ResizeObserver；所属 Window 没有它、或给不出边框盒尺寸时为 null，宽度改按计算值比对 */
  observer: ResizeObserver | null
  /** 上一次量高的全部输入与量完写下的内联声明；全都没变就不重量 */
  signature?: string
  /** 当前配置：宽度变了照它重量 */
  autoSize?: boolean | TextFieldAutoSize
  /** 观察到的边框盒宽：镜像按它定宽，不再读计算宽度 */
  borderInlineSize?: number
  /** 上一次量高时镜像用的边框盒宽：观察到的宽度和它不同就重量 */
  measuredInlineSize?: number
}

interface TextareaBoxMetrics {
  readonly boxSizing: 'border-box' | 'content-box'
  readonly paddingBlock: number
  readonly borderBlock: number
}

interface TextareaMeasurement {
  readonly contentPaddingBox: number
  readonly rowBlock: number
}

// 只复制会改变横向书写 textarea 行盒或软换行宽度的属性；镜像不是通用样式克隆器。
const measurementProperties = [
  'border-bottom-style',
  'border-bottom-width',
  'border-left-style',
  'border-left-width',
  'border-right-style',
  'border-right-width',
  'border-top-style',
  'border-top-width',
  'box-sizing',
  'width',
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-optical-sizing',
  'font-size',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-variation-settings',
  'font-weight',
  'hyphens',
  'letter-spacing',
  'line-height',
  'overflow-wrap',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'scrollbar-gutter',
  'scrollbar-width',
  'tab-size',
  'text-indent',
  'text-rendering',
  'text-transform',
  'white-space',
  'word-break',
  'word-spacing',
] as const

const ownership = new WeakMap<HTMLTextAreaElement, AutoSizeOwnership>()

// 每个 Window 一只观察器：textarea 可能在 iframe 里，用它所属 Window 的那一份
const resizeObservers = new WeakMap<Window, ResizeObserver>()

// 每个 Document 的字体加载代数：网页字体加载完，同样的值与样式也可能换行不同，下一次更新照旧重量
const fontGenerations = new WeakMap<Document, { value: number }>()

function fontGeneration(doc: Document): number {
  let generation = fontGenerations.get(doc)
  if (!generation) {
    const created = { value: 0 }
    doc.fonts?.addEventListener('loadingdone', () => {
      created.value++
    })
    fontGenerations.set(doc, created)
    generation = created
  }
  return generation.value
}

// 布局宽度以 1/64 像素为单位，差不到一个单位就是同一个宽度
function sameInlineSize(a: number, b: number | undefined): boolean {
  return b !== undefined && Math.abs(a - b) < 1 / 64
}

function onResize(entries: readonly ResizeObserverEntry[]): void {
  for (const entry of entries) {
    const el = entry.target as HTMLTextAreaElement
    const state = ownership.get(el)
    if (!state)
      continue
    const inlineSize = entry.borderBoxSize?.[0]?.inlineSize
    state.borderInlineSize = inlineSize
    if (inlineSize === undefined) {
      // 给不出边框盒尺寸：不再观察，之后按计算宽度比对
      state.observer?.unobserve(el)
      state.observer = null
    }
    // 没量过就不补量；宽度和量高时用的一样（自己写 block-size 引起的观察也在这里）也不重量
    if (state.signature === undefined || (inlineSize !== undefined && sameInlineSize(inlineSize, state.measuredInlineSize)))
      continue
    state.signature = undefined
    try {
      autoSizeTextarea(el, state.autoSize)
    }
    catch (error) {
      // 一只框量失败不拦下同一批里的其他框；错误照样报出去
      queueMicrotask(() => {
        throw error
      })
    }
  }
}

function observeInlineSize(el: HTMLTextAreaElement, view: Window): ResizeObserver | null {
  const Observer = (view as Window & typeof globalThis).ResizeObserver
  if (typeof Observer !== 'function')
    return null
  let observer = resizeObservers.get(view)
  if (!observer) {
    observer = new Observer(onResize)
    resizeObservers.set(view, observer)
  }
  observer.observe(el)
  return observer
}

/**
 * 量高要用到的全部输入：值（空时取占位符）、换行方式、行数配置、样式表上限、字体加载代数、书写方向与排字样式；全都没变，量出来也不会变。
 * 这些读法只触发样式计算、不触发排版；宽度由 ResizeObserver 盯着，只有没有观察器时才读计算宽度。
 */
function inputSignature(
  el: HTMLTextAreaElement,
  opts: TextFieldAutoSize,
  style: CSSStyleDeclaration,
  ceiling: string,
  widthObserved: boolean,
): string {
  const parts: string[] = [
    el.value,
    el.value ? '' : el.placeholder,
    el.wrap,
    String(opts.minRows ?? ''),
    String(opts.maxRows ?? ''),
    ceiling,
    String(fontGeneration(el.ownerDocument)),
    style.getPropertyValue('writing-mode'),
  ]
  for (const property of measurementProperties) {
    if (property !== 'width' || !widthObserved)
      parts.push(style.getPropertyValue(property))
  }
  return parts.join('\u0000')
}

/** 接管的三项内联声明的现状：别处改了它们就得重量、重写。 */
function inlineSignature(el: HTMLTextAreaElement): string {
  return ['block-size', 'max-block-size', 'overflow-y']
    .map(name => `${el.style.getPropertyValue(name)}!${el.style.getPropertyPriority(name)}`)
    .join('\u0000')
}

function readDeclaration(style: CSSStyleDeclaration, name: string): InlineDeclaration {
  return {
    value: style.getPropertyValue(name),
    priority: style.getPropertyPriority(name),
  }
}

function writeDeclaration(style: CSSStyleDeclaration, name: string, declaration: InlineDeclaration): void {
  if (declaration.value)
    style.setProperty(name, declaration.value, declaration.priority)
  else
    style.removeProperty(name)
}

function restoreTextarea(el: HTMLTextAreaElement): void {
  const state = ownership.get(el)
  if (!state)
    return
  ownership.delete(el)
  state.observer?.unobserve(el)
  const errors: unknown[] = []
  for (const [name, declaration] of [
    ['block-size', state.blockSize],
    ['max-block-size', state.maxBlockSize],
    ['overflow-y', state.overflowY],
  ] as const) {
    try {
      writeDeclaration(el.style, name, declaration)
    }
    catch (error) {
      errors.push(error)
    }
  }
  if (errors.length === 1)
    throw errors[0]
  if (errors.length > 1)
    throw new AggregateError(errors, '[xh] TextField autoSize 归还多项内联声明失败', { cause: errors[0] })
}

function restoreAfterFailure(el: HTMLTextAreaElement, primary: unknown): never {
  try {
    restoreTextarea(el)
  }
  catch (cleanupError) {
    throw new AggregateError(
      [primary, cleanupError],
      '[xh] TextField autoSize 失败并且归还内联声明失败',
      { cause: primary },
    )
  }
  throw primary
}

/**
 * 这只 textarea 所在的环境有没有排版：没有排版的环境（jsdom 一类）里计算样式多是空串。
 * 写入方向、盒模型、行高任一取不到，就量不出高度；这时安静跳过，不当作配置或样式错误。
 */
function layoutUnavailable(style: CSSStyleDeclaration): boolean {
  return ['writing-mode', 'box-sizing', 'line-height'].some(property => style.getPropertyValue(property) === '')
}

function readPixel(style: CSSStyleDeclaration, property: string): number {
  const source = style.getPropertyValue(property)
  const value = Number.parseFloat(source)
  if (!Number.isFinite(value) || value < 0)
    throw new Error(`[xh] TextField autoSize 无法读取有效的 ${property} 计算值：${source || '(empty)'}`)
  return value
}

/**
 * 样式表给 textarea 的块向上限（与声明盒同一口径）：none 即不封顶。
 * 百分比、内在尺寸关键字等要等布局才知道多高的取值不猜，明确失败。
 */
function readStyleCeiling(source: string): number | null {
  if (source === 'none')
    return null
  if (!/^\d+(?:\.\d+)?px$/.test(source)) {
    throw new Error(
      `[xh] TextField autoSize 只接受 none 或 px 的 max-block-size 计算值，当前为 ${source || '(empty)'}`,
    )
  }
  return Number.parseFloat(source)
}

function readBoxMetrics(style: CSSStyleDeclaration): TextareaBoxMetrics {
  const writingMode = style.getPropertyValue('writing-mode')
  if (writingMode !== 'horizontal-tb') {
    throw new Error(
      `[xh] TextField autoSize 只支持 writing-mode: horizontal-tb，当前为 ${writingMode || '(empty)'}`,
    )
  }
  const boxSizing = style.getPropertyValue('box-sizing')
  if (boxSizing !== 'border-box' && boxSizing !== 'content-box')
    throw new Error(`[xh] TextField autoSize 不支持 box-sizing: ${boxSizing || '(empty)'}`)
  return {
    boxSizing,
    paddingBlock: readPixel(style, 'padding-top') + readPixel(style, 'padding-bottom'),
    borderBlock: readPixel(style, 'border-top-width') + readPixel(style, 'border-bottom-width'),
  }
}

/** 计算样式给出的边框盒宽；宽度不是像素值（没渲染时的 auto 一类）时为 undefined。 */
function computedBorderInlineSize(style: CSSStyleDeclaration): number | undefined {
  const width = Number.parseFloat(style.getPropertyValue('width'))
  if (!Number.isFinite(width))
    return undefined
  if (style.getPropertyValue('box-sizing') === 'border-box')
    return width
  return width
    + readPixel(style, 'padding-left') + readPixel(style, 'padding-right')
    + readPixel(style, 'border-left-width') + readPixel(style, 'border-right-width')
}

function throwWithMirrorCleanup(primary: unknown, cleanupError: unknown): never {
  throw new AggregateError(
    [primary, cleanupError],
    '[xh] TextField autoSize 测量失败并且移除测量节点失败',
    { cause: primary },
  )
}

/** 一只横向书写的 textarea 镜像：抄目标的排版属性，宽度已知时直接按边框盒宽定宽，不再读计算宽度。 */
function createMirror(el: HTMLTextAreaElement, style: CSSStyleDeclaration, borderInlineSize: number | undefined): HTMLTextAreaElement {
  const mirror = el.ownerDocument.createElement('textarea')
  mirror.disabled = true
  mirror.tabIndex = -1
  mirror.rows = 1
  mirror.wrap = el.wrap
  mirror.setAttribute('aria-hidden', 'true')
  for (const property of measurementProperties) {
    if (property === 'width' && borderInlineSize !== undefined)
      continue
    const value = style.getPropertyValue(property)
    if (value)
      mirror.style.setProperty(property, value, 'important')
  }
  if (borderInlineSize !== undefined) {
    mirror.style.setProperty('box-sizing', 'border-box', 'important')
    mirror.style.setProperty('width', `${borderInlineSize}px`, 'important')
  }
  mirror.style.setProperty('block-size', '0', 'important')
  mirror.style.setProperty('min-block-size', '0', 'important')
  mirror.style.setProperty('max-block-size', 'none', 'important')
  mirror.style.setProperty('overflow', 'hidden', 'important')
  mirror.style.setProperty('pointer-events', 'none', 'important')
  mirror.style.setProperty('position', 'absolute', 'important')
  mirror.style.setProperty('visibility', 'hidden', 'important')
  mirror.style.setProperty('z-index', '-1', 'important')
  return mirror
}

/**
 * 在真实排版树中用两只横向书写 textarea 镜像量内容 padding-box 与单行 content-box：一只放内容、一只放一个字，
 * 一起挂上、一次排版读完两个高度。镜像挂到所属 Document 的 body，并显式复制目标的排版与宽度，避免触发组件业务子树观察器；
 * 结束后同步移除。两次读到的 scrollHeight 都是 0 时说明没有排版，返回 null。
 */
function measureTextarea(
  el: HTMLTextAreaElement,
  style: CSSStyleDeclaration,
  paddingBlock: number,
  borderInlineSize: number | undefined,
): TextareaMeasurement | null {
  const host = el.ownerDocument.body
  if (!el.isConnected || !host)
    throw new Error('[xh] TextField autoSize 需要已连接到 Document 的 textarea')

  const mirrors: HTMLTextAreaElement[] = []
  let failed = false
  let primary: unknown
  let measurement: TextareaMeasurement | null | undefined
  try {
    const content = createMirror(el, style, borderInlineSize)
    mirrors.push(content)
    const row = createMirror(el, style, borderInlineSize)
    mirrors.push(row)
    content.value = el.value || el.placeholder || ''
    row.value = 'x'
    host.append(content, row)
    const contentPaddingBox = content.scrollHeight
    const rowPaddingBox = row.scrollHeight
    const rowBlock = rowPaddingBox - paddingBlock
    if (contentPaddingBox === 0 && rowPaddingBox === 0) {
      measurement = null
    }
    else {
      if (!Number.isFinite(contentPaddingBox) || contentPaddingBox < paddingBlock) {
        throw new Error(`[xh] TextField autoSize 得到了无效的内容高度：${contentPaddingBox}`)
      }
      if (!Number.isFinite(rowBlock) || rowBlock <= 0)
        throw new Error(`[xh] TextField autoSize 得到了无效的单行高度：${rowBlock}`)
      measurement = { contentPaddingBox, rowBlock }
    }
  }
  catch (error) {
    failed = true
    primary = error
  }

  for (const mirror of mirrors) {
    if (!mirror.parentNode)
      continue
    try {
      mirror.parentNode.removeChild(mirror)
    }
    catch (cleanupError) {
      if (failed)
        throwWithMirrorCleanup(primary, cleanupError)
      throw cleanupError
    }
  }
  if (failed)
    throw primary
  if (measurement === undefined)
    throw new Error('[xh] TextField autoSize 未得到 textarea 测量结果')
  return measurement
}

function toDeclaredBlockSize(paddingBox: number, metrics: TextareaBoxMetrics): number {
  return metrics.boxSizing === 'border-box'
    ? paddingBox + metrics.borderBlock
    : paddingBox - metrics.paddingBlock
}

function rowsToDeclaredBlockSize(rows: number, rowBlock: number, metrics: TextareaBoxMetrics): number {
  const contentBox = rows * rowBlock
  return metrics.boxSizing === 'border-box'
    ? contentBox + metrics.paddingBlock + metrics.borderBlock
    : contentBox
}

function validRows(name: 'minRows' | 'maxRows', value: number | undefined): void {
  if (value === undefined)
    return
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1)
    throw new RangeError(`[xh] TextField autoSize.${name} 必须是大于等于 1 的有限整数`)
}

/** 严格校验行数边界；无效配置不做夹取，也不沿用上一份配置。 */
export function validateTextFieldAutoSize(
  autoSize: boolean | TextFieldAutoSize | undefined,
): boolean | TextFieldAutoSize | undefined {
  if (!autoSize || autoSize === true)
    return autoSize
  validRows('minRows', autoSize.minRows)
  validRows('maxRows', autoSize.maxRows)
  if (autoSize.minRows !== undefined
    && autoSize.maxRows !== undefined
    && autoSize.minRows > autoSize.maxRows) {
    throw new RangeError('[xh] TextField autoSize.minRows 不能大于 maxRows')
  }
  return autoSize
}

/**
 * 量一次并写回 block-size：内容与单行高度都取所属 Document 的真实 textarea 排版结果。
 * autoSize 为 false 时归还首次启用前的三项内联声明；顶到上限后内部滚动。
 */
export function autoSizeTextarea(el: HTMLTextAreaElement, autoSize: boolean | TextFieldAutoSize | undefined): void {
  let opts: TextFieldAutoSize
  try {
    const valid = validateTextFieldAutoSize(autoSize)
    if (!valid) {
      restoreTextarea(el)
      return
    }
    opts = valid === true ? {} : valid
  }
  catch (error) {
    restoreAfterFailure(el, error)
  }
  const view = el.ownerDocument.defaultView
  if (!view) {
    restoreAfterFailure(el, new Error('[xh] TextField autoSize 需要 textarea 所属 Document 的 Window'))
  }
  // 计算样式是活的：取一次，之后归还内联上限再读，读到的就是归还之后的值。没有排版就量不出高度：不接管、不写任何内联声明
  const style = view.getComputedStyle(el)
  if (layoutUnavailable(style))
    return

  let state = ownership.get(el)
  if (!state) {
    state = {
      blockSize: readDeclaration(el.style, 'block-size'),
      maxBlockSize: readDeclaration(el.style, 'max-block-size'),
      overflowY: readDeclaration(el.style, 'overflow-y'),
      observer: observeInlineSize(el, view),
    }
    ownership.set(el, state)
  }
  state.autoSize = autoSize
  try {
    const inline = inlineSignature(el)
    // 没给 maxRows 时上限取样式表：先归还作者的内联上限再读计算值，读到的是样式表与作者给的上限，不是上一次接管时写下的 none
    let current: InlineDeclaration | undefined
    let ceilingSource = ''
    if (opts.maxRows == null) {
      current = readDeclaration(el.style, 'max-block-size')
      writeDeclaration(el.style, 'max-block-size', state.maxBlockSize)
      ceilingSource = style.getPropertyValue('max-block-size')
    }
    // 量高的输入全都没变，接管的内联声明也没被别处改过：量出来不会变，上限放回去，不量、不写
    const input = inputSignature(el, opts, style, ceilingSource, state.observer !== null)
    if (state.signature === `${input}\u0001${inline}`) {
      if (current)
        writeDeclaration(el.style, 'max-block-size', current)
      return
    }
    const metrics = readBoxMetrics(style)
    const styleCeiling = opts.maxRows == null ? readStyleCeiling(ceilingSource) : null
    const inlineSize = state.borderInlineSize ?? computedBorderInlineSize(style)
    const measured = measureTextarea(el, style, metrics.paddingBlock, inlineSize)
    // 量不出高度：上限放回这一轮动手之前的样子，高度不动
    if (!measured) {
      if (current)
        writeDeclaration(el.style, 'max-block-size', current)
      return
    }

    el.style.setProperty('block-size', 'auto', state.blockSize.priority)
    const content = toDeclaredBlockSize(measured.contentPaddingBox, metrics)
    const floor = opts.minRows != null
      ? rowsToDeclaredBlockSize(opts.minRows, measured.rowBlock, metrics)
      : null
    const ceiling = opts.maxRows != null
      ? rowsToDeclaredBlockSize(opts.maxRows, measured.rowBlock, metrics)
      : styleCeiling
    let next = content
    if (ceiling != null)
      next = Math.min(next, ceiling)
    if (floor != null)
      next = Math.max(next, floor)
    el.style.setProperty('block-size', `${next}px`, state.blockSize.priority)
    // 上限已折进 block-size：样式表的上限不再截它，maxRows 或 minRows 换算得比它高时照样生效
    el.style.setProperty('max-block-size', 'none', state.maxBlockSize.priority)
    el.style.setProperty('overflow-y', content > next ? 'auto' : 'hidden', state.overflowY.priority)
    state.signature = `${input}\u0001${inlineSignature(el)}`
    state.measuredInlineSize = inlineSize
  }
  catch (error) {
    restoreAfterFailure(el, error)
  }
}
