// 点字段的标签聚焦控件：库内控件直接放进字段时，label 不写 for（没有 control 部件可指），
// 由字段把焦点送到控件的焦点宿主上，弹出式触发钮只聚焦不展开；作者自写的 control 照旧走原生 for。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhFieldControl, XhFieldLabel, XhFieldRoot, XhRadioGroupRoot, XhSelectRoot, XhSelectTrigger, XhTextFieldInput, XhTextFieldRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let host: HTMLElement | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

const CONTROLS: Record<string, () => ReactNode> = {
  'text-field': () => <XhTextFieldRoot><XhTextFieldInput /></XhTextFieldRoot>,
  'select': () => <XhSelectRoot><XhSelectTrigger>请选择</XhSelectTrigger></XhSelectRoot>,
  'radio-group': () => <XhRadioGroupRoot collection={[{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]} />,
  'native': () => <XhFieldControl><input /></XhFieldControl>,
}

async function mount(kind: string): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(
      <XhFieldRoot>
        <XhFieldLabel>字段</XhFieldLabel>
        {CONTROLS[kind]!()}
      </XhFieldRoot>,
    )
  })
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
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
