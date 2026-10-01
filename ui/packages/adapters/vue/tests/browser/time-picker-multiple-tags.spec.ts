// 多选的时间选择器：浮层里各列拼出草稿，按「添加」收进值；选中的时刻在输入行里排成标签，段位让位、
// 展开钮常驻做键盘入口；标签不截短、放不下就折行，表单一值一份隐藏输入。
// 显隐、折行与真实点击只有真实浏览器量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerConfirmTrigger,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerHiddenInput,
  XhTimePickerItem,
  XhTimePickerPositioner,
  XhTimePickerPreset,
  XhTimePickerPresetGroup,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTagList,
  XhTimePickerTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

const PRESETS = [{ value: '12:00', label: '午休' }]

interface Mounted { changes: string[][] }

async function mount(props: Record<string, unknown>): Promise<Mounted> {
  host = document.createElement('div')
  document.body.append(host)
  const changes: string[][] = []
  app = createApp({
    render: () => h(XhTimePickerRoot, {
      'locale': 'zh-CN',
      'hourCycle': 24,
      'name': 'slots',
      'selectionMode': 'multiple',
      'presets': PRESETS,
      ...props,
      'onValue-change': (details: { value: string[] }) => changes.push(details.value),
    }, () => [
      h(XhTimePickerControl, null, () => [
        h(XhTimePickerTagList),
        h(XhTimePickerSegmentGroup, null, () => [h(XhTimePickerSegment, { segment: 'hour' }), h('span', ':'), h(XhTimePickerSegment, { segment: 'minute' })]),
        h(XhTimePickerClearTrigger),
        h(XhTimePickerTrigger),
      ]),
      h(XhTimePickerHiddenInput),
      h(XhTimePickerPositioner, null, () => [
        h(XhTimePickerContent, null, () => [
          h(XhTimePickerPresetGroup, null, () => PRESETS.map(preset => h(XhTimePickerPreset, { key: preset.value, value: preset.value }))),
          h(XhTimePickerColumn, { unit: 'hour' }, () => ['08', '09', '10'].map(value => h(XhTimePickerItem, { key: value, value }))),
          h(XhTimePickerColumn, { unit: 'minute' }, () => ['00', '30'].map(value => h(XhTimePickerItem, { key: value, value }))),
          h(XhTimePickerConfirmTrigger, null, () => '添加'),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  return { changes }
}

function part(name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='time-picker'][data-part='${name}']`)
  if (!el)
    throw new Error(`找不到 time-picker 的 ${name}`)
  return el
}

function item(unit: string, value: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope='time-picker'][data-part='column'][data-value='${unit}'] [data-part='item'][data-value='${value}']`)
  if (!el)
    throw new Error(`找不到 ${unit} 列的 ${value}`)
  return el
}

/** 在场的标签；摘掉的那枚会在原处留一个替身播完退场，带 data-state=closed，不算。 */
function tags(): HTMLElement[] {
  return [...part('tag-list').querySelectorAll<HTMLElement>(`[data-scope='tag'][data-part='root'][data-value]:not([data-state='closed'])`)]
}

describe('time-picker 多选成标签', () => {
  it('列上点选只拼草稿；按「添加」收进值并排成标签，浮层不收，改一列就能接着添', async () => {
    const { changes } = await mount({ defaultOpen: true })
    expect(getComputedStyle(part('segment-group')).display).toBe('none')
    const add = part('confirm-trigger') as HTMLButtonElement
    expect(add.disabled).toBe(true)
    item('hour', '09').click()
    item('minute', '30').click()
    await nextTick()
    expect(changes).toEqual([])
    expect(add.disabled).toBe(false)
    add.click()
    await nextTick()
    item('minute', '00').click()
    await nextTick()
    part('confirm-trigger').click()
    await nextTick()
    expect(changes.at(-1)).toEqual(['09:00', '09:30'])
    expect(tags().map(tag => tag.textContent?.trim())).toEqual(['09:00', '09:30'])
    expect(part('content').hidden).toBe(false)
  })

  it('快捷选项点一下切换选中，浮层不收', async () => {
    const { changes } = await mount({ defaultOpen: true })
    const preset = part('preset')
    preset.click()
    await nextTick()
    expect(changes.at(-1)).toEqual(['12:00'])
    part('preset').click()
    await nextTick()
    expect(changes.at(-1)).toEqual([])
    expect(part('content').hidden).toBe(false)
  })

  it('有值时展开钮不给清空钮让位；在它上面退格摘掉最后一个', async () => {
    const { changes } = await mount({ defaultValue: ['08:00', '09:30'] })
    expect(getComputedStyle(part('trigger')).display).not.toBe('none')
    expect(getComputedStyle(part('clear-trigger')).display).not.toBe('none')
    part('trigger').focus()
    part('trigger').dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }))
    await nextTick()
    expect(changes.at(-1)).toEqual(['08:00'])
    expect(document.activeElement).toBe(part('trigger'))
  })

  it('标签放不下就折到下一行，文字不截短；两颗钮留在首行', async () => {
    await mount({ maxTagCount: 8, defaultValue: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'] })
    for (const tag of tags()) {
      const label = tag.querySelector<HTMLElement>(`[data-scope='tag'][data-part='label']`)!
      expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1)
    }
    const rows = tags().map(tag => Math.round(tag.getBoundingClientRect().top))
    expect(new Set(rows).size).toBeGreaterThan(1)
    expect(part('trigger').getBoundingClientRect().top).toBeLessThan(Math.max(...rows))
  })

  it('表单出口：一个选中值一份同名隐藏输入', async () => {
    await mount({ defaultValue: ['08:00', '09:30'] })
    const inputs = [...host!.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="slots"]')]
    expect(inputs.map(input => input.value)).toEqual(['08:00', '09:30'])
  })
})
