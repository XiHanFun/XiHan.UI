// 点字段的标签聚焦控件：库内控件直接放进字段时，label 不写 for（没有 control 部件可指），
// 由字段把焦点送到控件的焦点宿主上，弹出式触发钮只聚焦不展开；作者自写的 control 照旧走原生 for。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

const CONTROLS: Record<string, string> = {
  'text-field': '<xh-text-field><div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"></div></div></xh-text-field>',
  'select': '<xh-select><div data-xh-part="root"><button data-xh-part="trigger">请选择</button><select data-xh-part="hidden-select"></select></div></xh-select>',
  'radio-group': '<xh-radio-group><div data-xh-part="root"><div data-xh-part="item" value="a"><input data-xh-part="hidden-input"><span data-xh-part="item-text">甲</span></div><div data-xh-part="item" value="b"><input data-xh-part="hidden-input"><span data-xh-part="item-text">乙</span></div></div></xh-radio-group>',
  'native': '<input data-xh-part="control">',
}

async function mount(kind: string): Promise<void> {
  await mountMarkup(CONTROLS[kind]!)
}

async function mountMarkup(control: string): Promise<void> {
  document.body.innerHTML = `<xh-field><div data-xh-part="root"><label data-xh-part="label">字段</label>${control}</div></xh-field>`
  await settle()
}

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function label(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="field"][data-part="label"]')!
}

function part(scope: string, name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!
}

describe('点字段标签聚焦控件', () => {
  it('text-field：焦点落到输入框，label 不写 for', async () => {
    await mount('text-field')
    expect(label().hasAttribute('for')).toBe(false)
    await userEvent.click(label())
    expect(document.activeElement).toBe(part('text-field', 'input'))
  })

  it('select：焦点落到触发钮，只聚焦不展开', async () => {
    await mount('select')
    await userEvent.click(label())
    expect(document.activeElement).toBe(part('select', 'trigger'))
    expect(part('select', 'trigger').getAttribute('aria-expanded')).toBe('false')
  })

  it('radio-group：组根不可聚焦，焦点落到里面第一个可 tab 的选项', async () => {
    await mount('radio-group')
    await userEvent.click(label())
    expect(document.activeElement?.closest('[data-scope="radio-group"][data-part="item"]')).not.toBeNull()
  })

  // 有值时清空钮要指针落在盒上才顶替日历钮（或时钟钮）；点标题时指针在标题上，日历钮照常在场。
  // 焦点落进控件后日历钮也不让位：收起正有焦点的钮会把焦点丢到 body
  it.each([
    ['date-picker', '2026-10-18'],
    ['date-range-picker', ['2026-10-01', '2026-10-18']],
    ['time-picker', '05:03'],
    ['time-range-picker', ['09:00', '18:00']],
  ] as const)('%s：有值时点标题，焦点落进控件、只聚焦不展开，焦点不丢', async (scope, value) => {
    await mountMarkup(`<xh-${scope}></xh-${scope}>`)
    const element = document.querySelector<HTMLElement & { value?: unknown, updateComplete: Promise<boolean> }>(`xh-${scope}`)!
    element.value = value
    await settle()
    expect(getComputedStyle(part(scope, 'trigger')).display).not.toBe('none')
    await userEvent.click(label())
    const active = document.activeElement as HTMLElement
    expect(element.contains(active)).toBe(true)
    expect(getComputedStyle(active).display).not.toBe('none')
    expect(part(scope, 'trigger').getAttribute('aria-expanded')).toBe('false')
  })

  // 签名板的画布是 role=img、不可聚焦：有笔迹时焦点交给第一颗可聚焦的按钮
  it('signature-pad：有笔迹时点标题，焦点落在签名板里第一颗可聚焦的按钮上', async () => {
    await mountMarkup('<xh-signature-pad></xh-signature-pad>')
    const pad = document.querySelector<HTMLElement & { value?: unknown }>('xh-signature-pad')!
    pad.value = { strokes: [{ points: [{ x: 10, y: 10, pressure: 0.5 }, { x: 60, y: 40, pressure: 0.5 }] }], surface: { width: 200, height: 80 } }
    await settle()
    await userEvent.click(label())
    const active = document.activeElement as HTMLElement
    expect(active.localName).toBe('button')
    expect(active.closest('[data-scope="signature-pad"][data-part="root"]')).not.toBeNull()
  })

  it('transfer：点标题，焦点落在源侧列表里', async () => {
    await mountMarkup('<xh-transfer></xh-transfer>')
    const transfer = document.querySelector<HTMLElement & { collection?: unknown }>('xh-transfer')!
    transfer.collection = [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]
    await settle()
    await userEvent.click(label())
    const active = document.activeElement as HTMLElement
    expect(active.closest('[data-scope="transfer"][data-part="list"][data-side="source"]')).not.toBeNull()
  })

  it('作者自写的 control：label 的 for 指着它，点标签走原生行为', async () => {
    await mount('native')
    const input = document.querySelector<HTMLInputElement>('[data-scope="field"][data-part="control"]')!
    expect(label().getAttribute('for')).toBe(input.id)
    await userEvent.click(label())
    expect(document.activeElement).toBe(input)
  })
})
