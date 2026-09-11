// Select 的 item 插槽归作者：头像可住在 item-text 内，图标与尾部节点也可作为直属兄弟。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhAvatarFallback,
  XhAvatarRoot,
  XhIcon,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const icon = {
  name: 'document',
  viewBox: '0 0 24 24',
  attrs: {
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  },
  nodes: [{ tag: 'path', attrs: { d: 'M6 3H14L19 8V21H6Z' } }],
} as const

function byTestId(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

async function mountSelect(dir: 'ltr' | 'rtl'): Promise<void> {
  host = document.createElement('div')
  host.dir = dir
  document.body.append(host)
  app = createApp({
    render: () => h(XhSelectRoot, { dir, open: true, value: ['icon'] }, () => [
      h(XhSelectControl, null, () => [
        h(XhSelectTrigger, null, () => [h(XhSelectValueText), h(XhSelectIndicator)]),
      ]),
      h(XhSelectPositioner, null, () => [
        h(XhSelectContent, { style: { inlineSize: '280px' } }, () => [
          h(XhSelectList, null, () => [
            h(XhSelectItem, { 'value': 'avatar', 'data-testid': 'avatar-item' }, () => [
              h(XhSelectItemText, { 'data-testid': 'avatar-text' }, () => [
                h('span', { 'data-testid': 'avatar-row', 'style': 'display:inline-flex;align-items:center;gap:8px' }, [
                  h(XhAvatarRoot, { 'size': 'sm', 'data-testid': 'avatar' }, () => [
                    h(XhAvatarFallback, null, () => '刘'),
                  ]),
                  h('span', null, () => ['刘一 ', h('span', { style: { color: 'var(--xh-fg-muted)' } }, '设计组')]),
                ]),
              ]),
              h(XhSelectItemIndicator, { 'data-testid': 'avatar-indicator' }),
            ]),
            h(XhSelectItem, { 'value': 'icon', 'data-testid': 'icon-item' }, () => [
              h(XhIcon, { 'icon': icon, 'size': 'sm', 'data-testid': 'leading-icon' }),
              h(
                XhSelectItemText,
                { 'data-testid': 'icon-text' },
                () => '一段需要在作者图标与尾部提示之间稳定截断的超长选择项文字ABCDEFGHIJKLMN',
              ),
              h('span', { 'data-testid': 'trailing' }, '⌘K'),
              h(XhSelectItemIndicator, { 'data-testid': 'icon-indicator' }),
            ]),
            h(XhSelectItem, { 'value': 'raw', 'data-testid': 'raw-item' }, () => [
              h(XhIcon, { 'icon': icon, 'size': 'sm', 'data-testid': 'raw-icon' }),
              h('span', { 'data-testid': 'raw-text' }, '裸文本'),
              h('span', { 'data-testid': 'raw-trailing' }, 'Alt+R'),
              h(XhSelectItemIndicator, { 'data-testid': 'raw-indicator' }),
            ]),
          ]),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function expectOrderedWithoutOverlap(ids: string[], dir: 'ltr' | 'rtl'): void {
  const rects = ids.map(id => byTestId(id).getBoundingClientRect())
  for (let index = 1; index < rects.length; index++) {
    const previous = rects[index - 1]!
    const current = rects[index]!
    if (dir === 'ltr')
      expect(previous.right, `${ids[index - 1]} / ${ids[index]}`).toBeLessThanOrEqual(current.left)
    else
      expect(previous.left, `${ids[index - 1]} / ${ids[index]}`).toBeGreaterThanOrEqual(current.right)
  }
}

function expectComposition(dir: 'ltr' | 'rtl'): void {
  expectOrderedWithoutOverlap(['leading-icon', 'icon-text', 'trailing', 'icon-indicator'], dir)
  expectOrderedWithoutOverlap(['raw-icon', 'raw-text', 'raw-trailing', 'raw-indicator'], dir)

  const longText = byTestId('icon-text')
  expect(getComputedStyle(longText).overflow).toBe('hidden')
  expect(getComputedStyle(longText).textOverflow).toBe('ellipsis')
  expect(longText.scrollWidth).toBeGreaterThan(longText.clientWidth)

  const indicators = ['avatar-indicator', 'icon-indicator', 'raw-indicator']
    .map(id => byTestId(id).getBoundingClientRect())
  const logicalEnds = indicators.map(rect => dir === 'ltr' ? rect.right : rect.left)
  expect(Math.max(...logicalEnds) - Math.min(...logicalEnds)).toBeLessThanOrEqual(1)

  const avatar = byTestId('avatar').getBoundingClientRect()
  const avatarRow = byTestId('avatar-row').getBoundingClientRect()
  expect(avatar.left).toBeGreaterThanOrEqual(avatarRow.left)
  expect(avatar.right).toBeLessThanOrEqual(avatarRow.right)
  expect(byTestId('avatar-text').parentElement).toBe(byTestId('avatar-item'))
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
})

describe('select 作者内容组合', () => {
  it('ltr 按作者 DOM 顺序容纳头像、裸图标、正文、尾部提示与勾选', async () => {
    await mountSelect('ltr')
    expectComposition('ltr')
  })

  it('rtl 只翻转逻辑方向，不重排或重叠作者节点', async () => {
    await mountSelect('rtl')
    expectComposition('rtl')
  })
})
