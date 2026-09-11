// Mention 的 content 保持 listbox 与 Presence 宿主；empty/loading 是同级 role=status。
// 单一表面、隐藏候选和真实退场需要 Chromium 的级联、布局与事件流。
import type { MentionNode } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhMentionContent,
  XhMentionEmpty,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionLoading,
  XhMentionPositioner,
  XhMentionRoot,
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

function mountMention(withStatus = true, hiddenCandidate = false) {
  const collection = ref<MentionNode[]>(hiddenCandidate ? [{ value: 'hidden', label: '隐藏候选' }] : [])
  const loading = ref(false)
  const value = ref('')

  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhMentionRoot, {
      'collection': collection.value,
      'loading': loading.value,
      'value': value.value,
      'translations': { input: '正文', content: '提及谁' },
      'onUpdate:value': (next: string) => { value.value = next },
    }, () => [
      h(XhMentionInput, { 'data-testid': 'input' }),
      h(XhMentionPositioner, null, () => [
        h(XhMentionContent, { 'data-testid': 'content' }, () => collection.value.map(node =>
          h(XhMentionItem, {
            'key': node.value,
            'value': node.value,
            'hidden': hiddenCandidate || undefined,
            'data-testid': `item-${node.value}`,
          }, () => h(XhMentionItemText, null, () => node.label)),
        )),
        ...(withStatus
          ? [
              h(XhMentionEmpty, { 'data-testid': 'empty' }, () => '没有匹配的人选'),
              h(XhMentionLoading, { 'data-testid': 'loading' }, () => '查询中…'),
            ]
          : []),
      ]),
    ]),
  })
  app.mount(host)
  return { collection, loading, value }
}

async function typeMention(text: string): Promise<void> {
  const input = byTestId('input') as HTMLInputElement
  input.focus()
  input.value = text
  input.setSelectionRange(text.length, text.length)
  input.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }))
  await settle()
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('mention 单一状态表面', () => {
  it('零候选与 loading 共用唯一 content 表面，候选到达后状态层让位', async () => {
    const state = mountMention()
    await typeMention('@li')
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

    state.collection.value = [{ value: 'lilei', label: '李雷' }]
    await settle()
    const item = byTestId('item-lilei')
    expect(loading.hidden).toBe(true)
    expect(getComputedStyle(item).visibility).toBe('visible')
    expect(content.getAttribute('aria-busy')).toBe('true')
    expect((byTestId('input') as HTMLInputElement).getAttribute('aria-activedescendant')).toBe(item.id)

    state.loading.value = false
    await settle()
    expect(content.hasAttribute('aria-busy')).toBe(false)
    expect(empty.hidden).toBe(true)
    expect(loading.hidden).toBe(true)
  })

  it('全部候选 hidden 且没有状态部件时不画空框，也不留下活动候选', async () => {
    mountMention(false, true)
    await typeMention('@')
    const content = byTestId('content')
    const input = byTestId('input')

    expect(content.querySelectorAll(`[data-part='item']:not([hidden])`)).toHaveLength(0)
    expect(getComputedStyle(content).visibility).toBe('hidden')
    expect(surfaceCount([content])).toBe(0)
    expect(input.hasAttribute('aria-activedescendant')).toBe(false)
  })

  it('无候选时 Enter 不提交或改写正文，content 仍完成 Presence 退场', async () => {
    const state = mountMention()
    await typeMention('@nobody')
    const content = byTestId('content')
    finishAnimations(content)
    const minimum = Number.parseFloat(getComputedStyle(content).minBlockSize)
    const input = byTestId('input')
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })

    input.dispatchEvent(enter)
    await nextTick()
    await nextTick()

    expect(enter.defaultPrevented).toBe(false)
    expect(state.value.value).toBe('@nobody')
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(content.getAttribute('data-state')).toBe('closed')
    expect(getComputedStyle(content).display).not.toBe('none')
    expect(getComputedStyle(content).animationName).toBe('xh-pop-out')
    expect(content.getBoundingClientRect().height).toBeGreaterThanOrEqual(minimum * 0.9)
  })
})
