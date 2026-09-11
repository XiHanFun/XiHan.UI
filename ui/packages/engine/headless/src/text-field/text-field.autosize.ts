// 多行输入的自动高度：按内容量高，行数上下限换算成像素后夹取。纯 DOM 运算，不看状态机。
import type { TextFieldAutoSize } from './text-field.types'

interface InlineDeclaration {
  readonly value: string
  readonly priority: string
}

interface AutoSizeOwnership {
  readonly blockSize: InlineDeclaration
  readonly overflowY: InlineDeclaration
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
  const errors: unknown[] = []
  try {
    writeDeclaration(el.style, 'block-size', state.blockSize)
  }
  catch (error) {
    errors.push(error)
  }
  try {
    writeDeclaration(el.style, 'overflow-y', state.overflowY)
  }
  catch (error) {
    errors.push(error)
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

function readPixel(style: CSSStyleDeclaration, property: string): number {
  const source = style.getPropertyValue(property)
  const value = Number.parseFloat(source)
  if (!Number.isFinite(value) || value < 0)
    throw new Error(`[xh] TextField autoSize 无法读取有效的 ${property} 计算值：${source || '(empty)'}`)
  return value
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

function throwWithMirrorCleanup(primary: unknown, cleanupError: unknown): never {
  throw new AggregateError(
    [primary, cleanupError],
    '[xh] TextField autoSize 测量失败并且移除测量节点失败',
    { cause: primary },
  )
}

/**
 * 在真实排版树中用一只横向书写 textarea 镜像量内容 padding-box 与单行 content-box。
 * 镜像挂到所属 Document 的 body，并显式复制目标的排版与宽度，避免触发组件业务子树观察器；
 * 结束后同步移除。
 */
function measureTextarea(
  el: HTMLTextAreaElement,
  style: CSSStyleDeclaration,
  paddingBlock: number,
): TextareaMeasurement {
  const host = el.ownerDocument.body
  if (!el.isConnected || !host)
    throw new Error('[xh] TextField autoSize 需要已连接到 Document 的 textarea')

  const mirror = el.ownerDocument.createElement('textarea')
  let failed = false
  let primary: unknown
  let measurement: TextareaMeasurement | undefined
  try {
    mirror.disabled = true
    mirror.tabIndex = -1
    mirror.rows = 1
    mirror.wrap = el.wrap
    mirror.setAttribute('aria-hidden', 'true')
    for (const property of measurementProperties) {
      const value = style.getPropertyValue(property)
      if (value)
        mirror.style.setProperty(property, value, 'important')
    }
    mirror.style.setProperty('block-size', '0', 'important')
    mirror.style.setProperty('min-block-size', '0', 'important')
    mirror.style.setProperty('max-block-size', 'none', 'important')
    mirror.style.setProperty('overflow', 'hidden', 'important')
    mirror.style.setProperty('pointer-events', 'none', 'important')
    mirror.style.setProperty('position', 'absolute', 'important')
    mirror.style.setProperty('visibility', 'hidden', 'important')
    mirror.style.setProperty('z-index', '-1', 'important')

    host.appendChild(mirror)
    mirror.value = el.value || el.placeholder || ''
    const contentPaddingBox = mirror.scrollHeight
    mirror.placeholder = ''
    mirror.value = 'x'
    const rowPaddingBox = mirror.scrollHeight
    const rowBlock = rowPaddingBox - paddingBlock
    if (!Number.isFinite(contentPaddingBox) || contentPaddingBox < paddingBlock) {
      throw new Error(`[xh] TextField autoSize 得到了无效的内容高度：${contentPaddingBox}`)
    }
    if (!Number.isFinite(rowBlock) || rowBlock <= 0)
      throw new Error(`[xh] TextField autoSize 得到了无效的单行高度：${rowBlock}`)
    measurement = { contentPaddingBox, rowBlock }
  }
  catch (error) {
    failed = true
    primary = error
  }

  if (mirror.parentNode) {
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
  if (!measurement)
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
 * autoSize 为 false 时归还首次启用前的两项内联声明；顶到 maxRows 后内部滚动。
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

  let state = ownership.get(el)
  if (!state) {
    state = {
      blockSize: readDeclaration(el.style, 'block-size'),
      overflowY: readDeclaration(el.style, 'overflow-y'),
    }
    ownership.set(el, state)
  }
  try {
    const style = view.getComputedStyle(el)
    const metrics = readBoxMetrics(style)
    const measured = measureTextarea(el, style, metrics.paddingBlock)

    el.style.setProperty('block-size', 'auto', state.blockSize.priority)
    const content = toDeclaredBlockSize(measured.contentPaddingBox, metrics)
    const min = opts.minRows != null
      ? rowsToDeclaredBlockSize(opts.minRows, measured.rowBlock, metrics)
      : null
    const max = opts.maxRows != null
      ? rowsToDeclaredBlockSize(opts.maxRows, measured.rowBlock, metrics)
      : null
    let next = content
    if (min != null)
      next = Math.max(next, min)
    if (max != null)
      next = Math.min(next, max)
    el.style.setProperty('block-size', `${next}px`, state.blockSize.priority)
    el.style.setProperty('overflow-y', max != null && content > max ? 'auto' : 'hidden', state.overflowY.priority)
  }
  catch (error) {
    restoreAfterFailure(el, error)
  }
}
