// 点字段的标签聚焦控件：库内控件直接放进字段时，label 不写 for（没有 control 部件可指），
// 由字段把焦点送到控件的焦点宿主上，弹出式触发钮只聚焦不展开；作者自写的 control 照旧走原生 for。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import {
  XhDatePickerClearTrigger,
  XhDatePickerControl,
  XhDatePickerHiddenInput,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhRadioGroupRoot,
  XhSelectRoot,
  XhSelectTrigger,
  XhSignaturePadRoot,
  XhTextFieldInput,
  XhTextFieldRoot,
  XhTimePickerClearTrigger,
  XhTimePickerControl,
  XhTimePickerHiddenInput,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTrigger,
  XhTransferRoot,
} from '../../src'
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
  'signature-pad': () => <XhSignaturePadRoot defaultValue={{ strokes: [{ points: [{ x: 10, y: 10, pressure: 0.5 }, { x: 60, y: 40, pressure: 0.5 }] }], surface: { width: 200, height: 80 } }} />,
  'transfer': () => <XhTransferRoot collection={[{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }]} />,
  'date-picker': () => (
    <XhDatePickerRoot defaultValue="2026-10-18">
      <XhDatePickerControl>
        <XhDatePickerSegmentGroup>
          {(['year', 'month', 'day'] as const).map(segment => <XhDatePickerSegment key={segment} segment={segment} />)}
        </XhDatePickerSegmentGroup>
        <XhDatePickerClearTrigger />
        <XhDatePickerTrigger />
      </XhDatePickerControl>
      <XhDatePickerHiddenInput />
    </XhDatePickerRoot>
  ),
  'time-picker': () => (
    <XhTimePickerRoot defaultValue="05:03" granularity="minute">
      <XhTimePickerControl>
        <XhTimePickerSegmentGroup>
          {(['hour', 'minute'] as const).map(segment => <XhTimePickerSegment key={segment} segment={segment} />)}
        </XhTimePickerSegmentGroup>
        <XhTimePickerClearTrigger />
        <XhTimePickerTrigger />
      </XhTimePickerControl>
      <XhTimePickerHiddenInput />
    </XhTimePickerRoot>
  ),
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

  // 有值时清空钮要指针落在盒上才顶替日历钮（或时钟钮）；点标题时指针在标题上，日历钮照常在场。
  // 焦点落进控件后日历钮也不让位：收起正有焦点的钮会把焦点丢到 body
  it.each(['date-picker', 'time-picker'])('%s：有值时点标题，焦点落进控件、只聚焦不展开，焦点不丢', async (scope) => {
    await mount(scope)
    expect(getComputedStyle(part(scope, 'trigger')).display).not.toBe('none')
    await userEvent.click(label())
    const active = document.activeElement as HTMLElement
    expect(active.closest(`[data-scope="${scope}"][data-part="control"]`)).not.toBeNull()
    expect(getComputedStyle(active).display).not.toBe('none')
    expect(part(scope, 'trigger').getAttribute('aria-expanded')).toBe('false')
  })

  // 签名板的画布是 role=img、不可聚焦：有笔迹时焦点交给第一颗可聚焦的按钮
  it('signature-pad：有笔迹时点标题，焦点落在签名板里第一颗可聚焦的按钮上', async () => {
    await mount('signature-pad')
    await userEvent.click(label())
    const active = document.activeElement as HTMLElement
    expect(active.localName).toBe('button')
    expect(active.closest('[data-scope="signature-pad"][data-part="root"]')).not.toBeNull()
  })

  it('transfer：点标题，焦点落在源侧列表里', async () => {
    await mount('transfer')
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
