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
  document.body.innerHTML = `<xh-field><div data-xh-part="root"><label data-xh-part="label">字段</label>${CONTROLS[kind]}</div></xh-field>`
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

  it('作者自写的 control：label 的 for 指着它，点标签走原生行为', async () => {
    await mount('native')
    const input = document.querySelector<HTMLInputElement>('[data-scope="field"][data-part="control"]')!
    expect(label().getAttribute('for')).toBe(input.id)
    await userEvent.click(label())
    expect(document.activeElement).toBe(input)
  })
})
