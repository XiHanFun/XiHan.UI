// @vitest-environment jsdom
// <xh-field> 给库内控件接线：描述链、校验三态与字段标签落在控件真正可聚焦的部件上，离开作用域即收回。
// 一致性快照只收本组件作用域的部件，不收嵌在字段里的控件的接线，所以这一面由本文件逐个控件断言。
import type { XhElement } from '../src/element-base'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'
import { FORM_CONTROL_HOST_SELECTOR } from '../src/runtime/form-control-host'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

const TEXT_FIELD = `
  <xh-text-field>
    <div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div>
  </xh-text-field>`
const SELECT = `
  <xh-select>
    <div data-xh-part="root"><button data-xh-part="trigger">选择</button><select data-xh-part="hidden-select"></select></div>
  </xh-select>`
const RADIO_GROUP = `
  <xh-radio-group>
    <div data-xh-part="root">
      <div data-xh-part="item" value="a"><input data-xh-part="hidden-input"><span data-xh-part="item-text">甲</span></div>
    </div>
  </xh-radio-group>`

function mountField(control: string, attrs = ''): HTMLElement {
  document.body.innerHTML = `
    <xh-field ${attrs}>
      <div data-xh-part="root">
        <label data-xh-part="label">邮箱</label>
        ${control}
        <p data-xh-part="description">工作邮箱</p>
        <p data-xh-part="error-text">格式不对</p>
      </div>
    </xh-field>`
  return document.querySelector('xh-field')!
}

const idOf = (field: HTMLElement, part: string): string => field.querySelector(`[data-part="${part}"][data-scope="field"]`)!.id

describe('xh-field 给库内控件接线', () => {
  it('输入框类：描述链、校验三态与字段标签落在 input 上，不停在控件宿主', async () => {
    const field = mountField(TEXT_FIELD, 'required')
    const input = field.querySelector('input')!
    await vi.waitFor(() => expect(input.getAttribute('aria-describedby')).toBe(idOf(field, 'description')))
    expect(input.getAttribute('aria-labelledby')?.split(' ')[0]).toBe(idOf(field, 'label'))
    expect(input.getAttribute('aria-required')).toBe('true')
  })

  it('invalid 时描述链带上错误文案', async () => {
    const field = mountField(TEXT_FIELD, 'invalid')
    const input = field.querySelector('input')!
    await vi.waitFor(() => expect(input.getAttribute('aria-describedby')).toBe(`${idOf(field, 'description')} ${idOf(field, 'error-text')}`))
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('触发钮类：接线落在 trigger 上', async () => {
    const field = mountField(SELECT)
    const trigger = field.querySelector('button')!
    await vi.waitFor(() => expect(trigger.getAttribute('aria-describedby')).toBe(idOf(field, 'description')))
    expect(trigger.getAttribute('aria-labelledby')?.split(' ')[0]).toBe(idOf(field, 'label'))
  })

  it('组类：描述链与字段标签并进组根', async () => {
    const field = mountField(RADIO_GROUP, 'invalid')
    const root = field.querySelector('xh-radio-group > [data-xh-part="root"]')!
    await vi.waitFor(() => expect(root.getAttribute('aria-describedby')).toBe(`${idOf(field, 'description')} ${idOf(field, 'error-text')}`))
    expect(root.getAttribute('aria-labelledby')?.split(' ')[0]).toBe(idOf(field, 'label'))
  })

  it('控件移出字段后接线收回', async () => {
    const field = mountField(TEXT_FIELD)
    const input = field.querySelector('input')!
    await vi.waitFor(() => expect(input.hasAttribute('aria-describedby')).toBe(true))
    document.body.append(field.querySelector('xh-text-field')!)
    await vi.waitFor(() => expect(input.hasAttribute('aria-describedby')).toBe(false))
    expect(input.getAttribute('aria-labelledby') ?? '').not.toContain(idOf(field, 'label'))
  })

  it('字段断开后接线收回', async () => {
    const field = mountField(TEXT_FIELD)
    const control = field.querySelector('xh-text-field')!
    const input = field.querySelector('input')!
    await vi.waitFor(() => expect(input.hasAttribute('aria-describedby')).toBe(true))
    document.body.append(control)
    field.remove()
    await vi.waitFor(() => expect(input.hasAttribute('aria-describedby')).toBe(false))
  })

  it('字段边界后面的控件不接外层字段的线', async () => {
    const field = mountField(`<xh-field-boundary>${TEXT_FIELD}</xh-field-boundary>`)
    const input = field.querySelector('input')!
    await vi.waitFor(() => expect(input.getAttribute('data-scope')).toBe('text-field'))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(input.hasAttribute('aria-describedby')).toBe(false)
  })
})

describe('字段接线的目标声明', () => {
  const tags = [...readFileSync(join(__dirname, '../src/define.ts'), 'utf8').matchAll(/^ {2}'(xh-[a-z-]+)': Xh\w+Element,$/gm)].map(m => m[1]!)
  const listed = new Set(FORM_CONTROL_HOST_SELECTOR.split(', '))
  const ctorOf = (tag: string) => customElements.get(tag) as unknown as typeof XhElement

  it('声明了 fieldTarget 的控件都在发现表里，字段接线到得了它', () => {
    const missing = tags.filter(tag => ctorOf(tag).fieldTarget && !listed.has(tag))
    expect(missing).toEqual([])
    expect(tags.filter(tag => ctorOf(tag).fieldTarget)).toHaveLength(23)
  })
})

/** 库内控件的最小结构：标签名、字段接线应落到的部件、宿主里的结构。 */
const CONTROLS: ReadonlyArray<readonly [tag: string, target: string, markup: string]> = [
  ['text-field', 'input', '<div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div>'],
  ['number-field', 'input', '<div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div>'],
  ['color-field', 'input', '<div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div><input data-xh-part="hidden-input"></div>'],
  ['combobox', 'input', '<div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div>'],
  ['mention', 'input', '<div data-xh-part="root"><input data-xh-part="input"><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div>'],
  ['tags-input', 'input', '<div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div>'],
  ['select', 'trigger', '<div data-xh-part="root"><button data-xh-part="trigger">选择</button><select data-xh-part="hidden-select"></select></div>'],
  ['cascader', 'trigger', '<div data-xh-part="root"><div data-xh-part="control"><button data-xh-part="trigger">选择</button></div></div>'],
  ['tree-select', 'trigger', '<div data-xh-part="root"><div data-xh-part="control"><button data-xh-part="trigger">选择</button></div></div>'],
  ['date-picker', 'trigger', '<div data-xh-part="root"><div data-xh-part="control"><div data-xh-part="segment-group"></div><button data-xh-part="trigger">选择</button></div><input data-xh-part="hidden-input"><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div>'],
  ['date-range-picker', 'trigger', '<div data-xh-part="root"><div data-xh-part="control"><div data-xh-part="segment-group"></div><div data-xh-part="segment-group"></div><button data-xh-part="trigger">选择</button></div><input data-xh-part="hidden-input"><input data-xh-part="hidden-input"><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div>'],
  ['time-picker', 'trigger', '<div data-xh-part="root"><div data-xh-part="control"><div data-xh-part="segment-group"></div><button data-xh-part="trigger">选择</button></div><input data-xh-part="hidden-input"><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div>'],
  ['time-range-picker', 'trigger', '<div data-xh-part="root"><div data-xh-part="control"><div data-xh-part="segment-group"></div><div data-xh-part="segment-group"></div><button data-xh-part="trigger">选择</button></div><input data-xh-part="hidden-input"><input data-xh-part="hidden-input"><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div>'],
  ['checkbox', 'root', '<button data-xh-part="root"><span data-xh-part="indicator"></span></button>'],
  ['switch', 'root', '<button data-xh-part="root"><span data-xh-part="thumb"></span></button>'],
  ['radio-group', 'root', '<div data-xh-part="root"><div data-xh-part="item" value="a"><input data-xh-part="hidden-input"><span data-xh-part="item-text">甲</span></div></div>'],
  ['checkbox-group', 'root', '<div data-xh-part="root"><div data-xh-part="item" value="a"><input data-xh-part="hidden-input"><span data-xh-part="item-text">甲</span></div></div>'],
  ['toggle-group', 'root', '<div data-xh-part="root"><button data-xh-part="item" value="a">甲</button></div>'],
  ['color-swatch-picker', 'root', '<div data-xh-part="root"><div data-xh-part="item" value="#3b82f6"><input data-xh-part="hidden-input"><span data-xh-part="swatch"></span></div></div>'],
  ['pin-input', 'root', '<div data-xh-part="root"><input data-xh-part="input" index="0"></div>'],
  ['rating', 'control', '<div data-xh-part="root"><div data-xh-part="control"><span data-xh-part="item" value="1"></span></div></div>'],
  ['slider', 'thumb', '<div data-xh-part="root"><div data-xh-part="control"><div data-xh-part="track"></div><div data-xh-part="thumb" index="0"></div></div></div>'],
]

describe('库内控件放进 xh-field', () => {
  it.each(CONTROLS)('%s：描述链与字段标签落在 %s 部件上', async (tag, target, markup) => {
    const field = mountField(`<xh-${tag}>${markup}</xh-${tag}>`, 'invalid')
    const el = () => field.querySelector(`xh-${tag} [data-xh-part="${target}"], xh-${tag} > [data-xh-part="${target}"]`)!
    await vi.waitFor(() => expect(el().getAttribute('aria-describedby')).toBe(`${idOf(field, 'description')} ${idOf(field, 'error-text')}`))
    expect(el().getAttribute('aria-labelledby')?.split(' ')[0]).toBe(idOf(field, 'label'))
    expect(el().getAttribute('data-scope')).toBe(tag)
  })
})
