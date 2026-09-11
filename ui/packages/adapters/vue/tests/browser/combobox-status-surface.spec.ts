// Combobox 的 content 必须继续承担 listbox 与 Presence；empty/loading 是同级 role=status。
// 单一表面、同格几何与真实退场只能在浏览器级联和布局中验证。
import type { ComboboxNode } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLoading,
  XhComboboxPositioner,
  XhComboboxRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function byTestId(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function alpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')!
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

function surfaceCount(elements: HTMLElement[]): number {
  return elements.filter((element) => {
    const style = getComputedStyle(element)
    if (style.display === 'none' || style.visibility === 'hidden')
      return false
    return alpha(style.backgroundColor) > 0
      || Number.parseFloat(style.borderTopWidth) > 0
      || style.boxShadow !== 'none'
  }).length
}

function expectSameRect(a: HTMLElement, b: HTMLElement): void {
  const left = a.getBoundingClientRect()
  const right = b.getBoundingClientRect()
  expect(left.left).toBeCloseTo(right.left, 0)
  expect(left.top).toBeCloseTo(right.top, 0)
  expect(left.right).toBeCloseTo(right.right, 0)
  expect(left.bottom).toBeCloseTo(right.bottom, 0)
}

function finishAnimations(element: HTMLElement): void {
  for (const animation of element.getAnimations())
    animation.finish()
}

function mountCombobox() {
  const collection = ref<ComboboxNode[]>([])
  const loading = ref(false)
  const open = ref(true)
  const inputValue = ref('自定义框架')
  const value = ref<string[]>([])

  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhComboboxRoot, {
      'allowCustomValue': true,
      'collection': collection.value,
      'loading': loading.value,
      'open': open.value,
      'inputValue': inputValue.value,
      'value': value.value,
      'onUpdate:open': (next: boolean) => { open.value = next },
      'onUpdate:inputValue': (next: string) => { inputValue.value = next },
      'onUpdate:value': (next: string[]) => { value.value = next },
    }, () => [
      h(XhComboboxControl, null, () => [h(XhComboboxInput, { 'data-testid': 'input' })]),
      h(XhComboboxPositioner, null, () => [
        h(XhComboboxContent, { 'data-testid': 'content' }, () => collection.value.map(node =>
          h(XhComboboxItem, { 'key': node.value, 'value': node.value, 'data-testid': `item-${node.value}` }, () => [
            h(XhComboboxItemText, null, () => node.label),
            h(XhComboboxItemIndicator),
          ]),
        )),
        h(XhComboboxEmpty, { 'data-testid': 'empty' }, () => '没有候选，按 Enter 使用当前文字'),
        h(XhComboboxLoading, { 'data-testid': 'loading' }, () => '正在查询候选'),
      ]),
    ]),
  })
  app.mount(host)
  return { collection, loading, open, inputValue, value }
}

function mountAutomaticWithoutStatus(): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhComboboxRoot, {
      collection: [],
      open: true,
      openOnClick: true,
    }),
  })
  app.mount(host)
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('combobox 单一状态表面', () => {
  it('自动结构没有状态文案时不把空 listbox 画成无文字大框', async () => {
    mountAutomaticWithoutStatus()
    await settle()
    const content = document.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='content']`)!
    const empty = document.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='empty']`)!

    expect(content.getAttribute('role')).toBe('listbox')
    expect(content.childElementCount).toBe(0)
    expect(getComputedStyle(content).visibility).toBe('hidden')
    expect(getComputedStyle(empty).display).toBe('none')
    expect(surfaceCount([content, empty])).toBe(0)
  })

  it('空态与加载态覆盖唯一 content 表面，候选恢复后状态层让位', async () => {
    const state = mountCombobox()
    await settle()
    const content = byTestId('content')
    const empty = byTestId('empty')
    const loading = byTestId('loading')
    finishAnimations(content)

    expect(content.getAttribute('role')).toBe('listbox')
    expect(empty.getAttribute('role')).toBe('status')
    expect(empty.parentElement).toBe(content.parentElement)
    expect(empty.hidden).toBe(false)
    expect(loading.hidden).toBe(true)
    expectSameRect(content, empty)
    expect(surfaceCount([content, empty])).toBe(1)

    state.loading.value = true
    await settle()
    expect(empty.hidden).toBe(true)
    expect(loading.hidden).toBe(false)
    expectSameRect(content, loading)
    expect(surfaceCount([content, loading])).toBe(1)

    state.collection.value = [{ value: 'vue', label: 'Vue' }]
    state.loading.value = false
    await settle()
    expect(byTestId('item-vue').getAttribute('role')).toBe('option')
    expect(empty.hidden).toBe(true)
    expect(loading.hidden).toBe(true)
    expect(surfaceCount([content, empty, loading])).toBe(1)

    state.loading.value = true
    await settle()
    expect(loading.hidden).toBe(true)
    expect(content.getAttribute('aria-busy')).toBe('true')
    expect(getComputedStyle(byTestId('item-vue')).visibility).toBe('visible')

    const input = byTestId('input') as HTMLInputElement
    input.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    const activeId = input.getAttribute('aria-activedescendant')
    expect(activeId).not.toBeNull()
    expect(document.getElementById(activeId!)?.getAttribute('data-testid')).toBe('item-vue')

    state.loading.value = false
    await settle()
    expect(loading.hidden).toBe(true)
  })

  it('无候选时 Enter 仍提交自由文本；关闭帧由同一 content 表面完成 Presence 退场', async () => {
    const state = mountCombobox()
    await settle()
    const content = byTestId('content')
    finishAnimations(content)
    const minimum = Number.parseFloat(getComputedStyle(content).minBlockSize)
    const input = byTestId('input') as HTMLInputElement

    input.focus()
    await userEvent.keyboard('{Enter}')
    await nextTick()
    await nextTick()

    expect(state.value.value).toEqual(['自定义框架'])
    expect(state.open.value).toBe(false)
    expect(content.getAttribute('data-state')).toBe('closed')
    expect(getComputedStyle(content).display).not.toBe('none')
    expect(getComputedStyle(content).animationName).toBe('xh-pop-out')
    expect(minimum).toBeGreaterThan(0)
    expect(content.getBoundingClientRect().height).toBeGreaterThanOrEqual(minimum * 0.9)
    expect(byTestId('empty').hidden).toBe(true)
  })
})
