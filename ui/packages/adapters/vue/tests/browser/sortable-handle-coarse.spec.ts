// 粗指针下的排序把手：没塞图标时抓手（两条竖线）画在把手的 ::after 上，家族 icon 档的热区规则
// 却也落在同一个 ::after 上——皮肤只写了抓手的宽高与描边，定位、44×44 下限与 -50% 平移都从家族
// 漏进来，两条竖线被撑成 44px 高、跨出 24px 的把手。抓手钉回行内流后热区改由 ::before 给。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot } from '../../src'
import { coarsePointer, finePointer, pseudoBox } from './pseudo-box'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await finePointer()
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.cssText = 'padding: 80px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhSortableRoot, { ids: ['a', 'b'] }, () => ['a', 'b'].map(id => h(XhSortableItem, { key: id, itemId: id }, () => [
      h(XhSortableItemDragTrigger, { 'data-testid': `grip-${id}`, 'itemId': id }),
      h('span', id),
    ]))),
  })
  app.mount(host)
  await nextTick()
  const handle = host.querySelector<HTMLElement>('[data-testid=\'grip-a\'][data-part=\'item-drag-trigger\']')
  if (!handle)
    throw new Error('缺少 sortable 把手')
  expect(handle.matches(':empty')).toBe(true)
  return handle
}

function expectGrip(handle: HTMLElement): void {
  const grip = getComputedStyle(handle, '::after')
  const box = pseudoBox(handle, '::after')
  const observed = `::after position=${grip.position} min=${grip.minInlineSize}×${grip.minBlockSize} translate=${grip.translate} box=${JSON.stringify(box)}`
  expect(grip.position, observed).toBe('static')
  expect(box.width, observed).toBe(4)
  expect(box.height, observed).toBe(12)
  expect(grip.borderLeftWidth, observed).toBe('1px')
}

describe('粗指针下的排序把手', () => {
  it('细指针：抓手是 4×12 的两条竖线，把手本体 24px，没有第二颗伪元素', async () => {
    const handle = await mount()
    expectGrip(handle)
    expect(handle.getBoundingClientRect().width).toBe(24)
    expect(getComputedStyle(handle, '::before').content).toBe('none')
  })

  it('粗指针：抓手不变，热区由 ::before 扩到 44×44 且与把手同心', async () => {
    await coarsePointer()
    const handle = await mount()
    expectGrip(handle)
    const rect = handle.getBoundingClientRect()
    const target = pseudoBox(handle, '::before')
    const observed = `::before ${JSON.stringify(target)} handle ${JSON.stringify(rect)}`
    expect(getComputedStyle(handle, '::before').content, observed).toBe('""')
    expect(target.width, observed).toBeGreaterThanOrEqual(44)
    expect(target.height, observed).toBeGreaterThanOrEqual(44)
    expect(Math.abs(target.centerX - (rect.left + rect.width / 2)), observed).toBeLessThanOrEqual(1)
    expect(Math.abs(target.centerY - (rect.top + rect.height / 2)), observed).toBeLessThanOrEqual(1)
  })
})
