// 多行自增高只有一层滚动：滚的永远是 textarea，控件外壳只包住它，不设上限、不滚。
//
// 外壳曾按 12rem 封顶并自己滚，textarea 又按 maxRows 量高、顶到后也自己滚：minRows / maxRows
// 换算出来超过 12rem 时两条滚动条叠在一起，行数界限也被外壳截掉。
// 判据三条，缺一不可：外壳的高度恰好是 textarea 加上下描边，里面没有可滚的余量；
// textarea 的高度落在行数界限上；超出的行在 textarea 自己里面滚得到底。
import type { TextFieldSchema } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h } from 'vue'
import { XhTextFieldClearTrigger, XhTextFieldControl, XhTextFieldInput, XhTextFieldRoot } from '../../src'
import { tokenLength } from './design-token'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

interface Field {
  root: HTMLElement
  control: HTMLElement
  textarea: HTMLTextAreaElement
}

/** 定宽栏里挂一只多行字段。宽度固定是为了让行数只由换行符决定。 */
function mount(autoSize: TextFieldSchema['props']['autoSize'], value = '', hostStyle = ''): Field {
  host = document.createElement('div')
  host.style.cssText = `inline-size: 320px; ${hostStyle}`
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhTextFieldRoot, { defaultValue: value, autoSize, clearable: true }, () => [
      h(XhTextFieldControl, null, () => [
        h(XhTextFieldInput, { as: 'textarea' }),
        h(XhTextFieldClearTrigger),
      ]),
    ]),
  })
  app.mount(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    control: host.querySelector<HTMLElement>('[data-part="control"]')!,
    textarea: host.querySelector<HTMLTextAreaElement>('textarea')!,
  }
}

function lines(n: number): string {
  return Array.from({ length: n }, (_, i) => `第 ${i + 1} 行`).join('\n')
}

function height(el: Element): number {
  return el.getBoundingClientRect().height
}

function px(value: string): number {
  return Number.parseFloat(value)
}

/** textarea 的上下内距：行数换算成高度时要加回来。 */
function paddingBlock(textarea: HTMLTextAreaElement): number {
  const style = getComputedStyle(textarea)
  return px(style.paddingTop) + px(style.paddingBottom)
}

/** 由 textarea 现在的高度反推一行多高。 */
function rowOf(textarea: HTMLTextAreaElement, rows: number): number {
  return (height(textarea) - paddingBlock(textarea)) / rows
}

/** 字段里真正滚得动的那些盒：设了 auto / scroll，并且内容比可视区高。 */
function scrollers(field: Field): Element[] {
  return [field.root, ...field.root.querySelectorAll('*')].filter((el) => {
    const overflow = getComputedStyle(el).overflowY
    return (overflow === 'auto' || overflow === 'scroll') && el.scrollHeight > el.clientHeight
  })
}

/** 往块轴推到底，返回推得动的距离：0 即多出来的行取不回来。 */
function reachDown(el: HTMLElement): number {
  el.scrollTop = 99999
  return el.scrollTop
}

/** 外壳恰好包住 textarea：高度等于 textarea 加上下描边，外壳自己既没有上限也没有可滚的余量。 */
function expectShellWraps(field: Field): void {
  const style = getComputedStyle(field.control)
  expect(style.maxBlockSize).toBe('none')
  expect(field.control.scrollHeight).toBe(field.control.clientHeight)
  expect(height(field.control)).toBeCloseTo(height(field.textarea) + px(style.borderTopWidth) + px(style.borderBottomWidth), 1)
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

describe('给了 maxRows：行数界限说了算，外壳不另设上限', () => {
  it('15–22 行：空着就是 15 行高，超过 12rem 也不被外壳截掉', () => {
    const field = mount({ minRows: 15, maxRows: 22 })

    expect(height(field.textarea)).toBeGreaterThan(tokenLength('--xh-viewport-h-sm'))
    expect(rowOf(field.textarea, 15)).toBeCloseTo(px(getComputedStyle(field.textarea).lineHeight), 0)
    expectShellWraps(field)
    expect(scrollers(field)).toEqual([])
  })

  it('15–22 行：内容超过 22 行时停在 22 行，只有 textarea 一层在滚，并且滚得到底', () => {
    const field = mount({ minRows: 15, maxRows: 22 }, lines(40))
    const row = rowOf(field.textarea, 22)

    expect(row).toBeCloseTo(px(getComputedStyle(field.textarea).lineHeight), 0)
    expectShellWraps(field)
    expect(scrollers(field)).toEqual([field.textarea])
    expect(reachDown(field.textarea)).toBe(field.textarea.scrollHeight - field.textarea.clientHeight)
    expect(field.textarea.scrollTop).toBeGreaterThan(0)
  })

  it('24–24 行：内容多少都是 24 行高，多出的行在 textarea 里滚', () => {
    const empty = mount({ minRows: 24, maxRows: 24 })
    const emptyHeight = height(empty.textarea)
    expectShellWraps(empty)
    app!.unmount()
    host!.remove()

    const full = mount({ minRows: 24, maxRows: 24 }, lines(40))
    expect(height(full.textarea)).toBe(emptyHeight)
    expectShellWraps(full)
    expect(scrollers(full)).toEqual([full.textarea])
  })
})

describe('没给 maxRows：上限取 --xh-text-field-input-max-h，同样只由 textarea 滚', () => {
  it('行数少时按内容收，外壳不滚', () => {
    const field = mount(true, lines(3))

    expect(height(field.textarea)).toBeLessThan(tokenLength('--xh-viewport-h-sm'))
    expectShellWraps(field)
    expect(scrollers(field)).toEqual([])
  })

  it('行数多时 textarea 停在 12rem，超出的行在它自己里面滚', () => {
    const field = mount(true, lines(40))

    expect(height(field.textarea)).toBe(tokenLength('--xh-viewport-h-sm'))
    expectShellWraps(field)
    expect(scrollers(field)).toEqual([field.textarea])
    expect(reachDown(field.textarea)).toBe(field.textarea.scrollHeight - field.textarea.clientHeight)
  })

  it('minRows 换算超过上限时以 minRows 为准：空着就是 15 行，内容再多也停在 15 行', () => {
    const empty = mount({ minRows: 15 })
    const emptyHeight = height(empty.textarea)
    expect(emptyHeight).toBeGreaterThan(tokenLength('--xh-viewport-h-sm'))
    expect(rowOf(empty.textarea, 15)).toBeCloseTo(px(getComputedStyle(empty.textarea).lineHeight), 0)
    app!.unmount()
    host!.remove()

    const full = mount({ minRows: 15 }, lines(40))
    expect(height(full.textarea)).toBe(emptyHeight)
    expectShellWraps(full)
    expect(scrollers(full)).toEqual([full.textarea])
  })

  it('作者改了上限槽，textarea 就停在那个高度', () => {
    const field = mount(true, lines(40), '--xh-text-field-input-max-h: 80px')

    expect(height(field.textarea)).toBe(80)
    expectShellWraps(field)
    expect(scrollers(field)).toEqual([field.textarea])
  })

  it('写旧槽 --xh-text-field-control-max-h 的覆盖照常生效，新槽在场时以新槽为准', () => {
    const legacy = mount(true, lines(40), '--xh-text-field-control-max-h: 96px')
    expect(height(legacy.textarea)).toBe(96)
    expectShellWraps(legacy)
    app!.unmount()
    host!.remove()

    const both = mount(true, lines(40), '--xh-text-field-control-max-h: 96px; --xh-text-field-input-max-h: 80px')
    expect(height(both.textarea)).toBe(80)
  })

  it('没开自增高的多行框不受这条上限管：高度由使用者拖出来', () => {
    const field = mount(false, lines(40))
    expect(getComputedStyle(field.textarea).maxBlockSize).toBe('none')

    // 拖动把手写下的就是内联 block-size
    field.textarea.style.blockSize = '400px'

    expect(height(field.textarea)).toBe(400)
    expectShellWraps(field)
  })
})

describe('滚动只在 textarea 里：外壳上的部件不跟着滚走', () => {
  it('滚到看得见最后一行时，清空钮仍在框里原处', () => {
    const field = mount(true, lines(40))
    const clear = host!.querySelector<HTMLElement>('[data-part="clear-trigger"]')!
    const before = clear.getBoundingClientRect().top

    // 谁在滚就推谁：使用者看到哪层滚动条就拖哪层
    for (const el of scrollers(field))
      reachDown(el as HTMLElement)

    expect(field.textarea.scrollTop).toBeGreaterThan(0)
    expect(clear.getBoundingClientRect().top).toBe(before)
    expect(clear.getBoundingClientRect().top).toBeGreaterThanOrEqual(field.control.getBoundingClientRect().top)
  })

  it('真实键盘在末尾续行：跟着光标滚的是 textarea，外壳不动', async () => {
    const field = mount(true, lines(20))
    field.textarea.focus()
    field.textarea.setSelectionRange(field.textarea.value.length, field.textarea.value.length)

    await userEvent.keyboard('{Enter}第 21 行{Enter}第 22 行')

    expect(field.textarea.value.split('\n')).toHaveLength(22)
    expect(height(field.textarea)).toBe(tokenLength('--xh-viewport-h-sm'))
    expect(scrollers(field)).toEqual([field.textarea])
    expect(field.textarea.scrollTop).toBeGreaterThan(0)
    expect(field.control.scrollTop).toBe(0)
  })
})
