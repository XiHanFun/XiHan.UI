// 点字段的标签聚焦控件：库内控件直接放进字段时，label 不写 for（没有 control 部件可指），
// 由字段把焦点送到控件的焦点宿主上，弹出式触发钮只聚焦不展开；作者自写的 control 照旧走原生 for。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
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

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

const CONTROLS: Record<string, () => VNode> = {
  'text-field': () => h(XhTextFieldRoot, null, () => h(XhTextFieldInput)),
  'select': () => h(XhSelectRoot, null, () => h(XhSelectTrigger, null, () => '请选择')),
  'radio-group': () => h(XhRadioGroupRoot, { collection: [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }] }),
  'native': () => h(XhFieldControl, () => h('input')),
  'signature-pad': () => h(XhSignaturePadRoot, { defaultValue: { strokes: [{ points: [{ x: 10, y: 10, pressure: 0.5 }, { x: 60, y: 40, pressure: 0.5 }] }], surface: { width: 200, height: 80 } } }),
  'transfer': () => h(XhTransferRoot, { collection: [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }] }),
  'date-picker': () => h(XhDatePickerRoot, { defaultValue: '2026-10-18' }, () => [
    h(XhDatePickerControl, null, () => [
      h(XhDatePickerSegmentGroup, null, () => (['year', 'month', 'day'] as const).map(segment => h(XhDatePickerSegment, { key: segment, segment }))),
      h(XhDatePickerClearTrigger),
      h(XhDatePickerTrigger),
    ]),
    h(XhDatePickerHiddenInput),
  ]),
  'time-picker': () => h(XhTimePickerRoot, { defaultValue: '05:03', granularity: 'minute' }, () => [
    h(XhTimePickerControl, null, () => [
      h(XhTimePickerSegmentGroup, null, () => (['hour', 'minute'] as const).map(segment => h(XhTimePickerSegment, { key: segment, segment }))),
      h(XhTimePickerClearTrigger),
      h(XhTimePickerTrigger),
    ]),
    h(XhTimePickerHiddenInput),
  ]),
}

async function mount(kind: string): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhFieldRoot, null, () => [h(XhFieldLabel, () => '字段'), CONTROLS[kind]!()]) })
  app.mount(host)
  await nextTick()
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

  // 有值时清空钮顶替日历钮（或时钟钮），日历钮 display: none；字段接线的宿主看不见时，焦点交给控件里第一个可 tab 的节点
  it.each(['date-picker', 'time-picker'])('%s：有值时日历钮让位给清空钮，点标题焦点落在控件的第一段', async (scope) => {
    await mount(scope)
    expect(getComputedStyle(part(scope, 'trigger')).display).toBe('none')
    await userEvent.click(label())
    const active = document.activeElement as HTMLElement
    expect(active.closest(`[data-scope="${scope}"][data-part="control"]`)).not.toBeNull()
    expect(active.getAttribute('role')).toBe('spinbutton')
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
