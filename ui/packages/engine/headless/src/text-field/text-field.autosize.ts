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
 * 量一次并写回 block-size：先归零再读 scrollHeight，行数界限按当下行高换算。
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
    const line = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2 || 20
    const padding = (Number.parseFloat(style.paddingBlockStart) || 0) + (Number.parseFloat(style.paddingBlockEnd) || 0)
    const border = (Number.parseFloat(style.borderBlockStartWidth) || 0) + (Number.parseFloat(style.borderBlockEndWidth) || 0)

    el.style.setProperty('block-size', 'auto', state.blockSize.priority)
    const content = el.scrollHeight + border
    const min = opts.minRows != null ? opts.minRows * line + padding + border : null
    const max = opts.maxRows != null ? opts.maxRows * line + padding + border : null
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
