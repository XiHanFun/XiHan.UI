// 粗指针 + RTL 下家族热区的落点：Action Control 家族用 ::after 把命中区扩到 44px，
// download-trigger / sortable 皮肤复制同一套几何到 ::before。热区盒比宿主大，居中必须与书写方向无关：
// 逻辑起点（inset-inline-start: 50%）配物理平移（translate: -50%）在 rtl 下是 right: 50% 再往左挪半个盒，
// 热区中心偏出宿主整整一个盒宽——宿主本身完全摸不着。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhButton, XhCheckbox, XhDownloadTrigger, XhSortableItem, XhSortableItemDragTrigger, XhSortableRoot, XhSwitch } from '../../src'
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

async function mount(render: () => VNode, selector: string): Promise<HTMLElement> {
  await coarsePointer()
  host = document.createElement('div')
  host.dir = 'rtl'
  host.style.cssText = 'padding: 80px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  const target = host.querySelector<HTMLElement>(selector)
  if (!target)
    throw new Error(`缺少 ${selector}`)
  return target
}

/** 热区在两轴都不小于宿主、扩到 44px 的那一轴不小于 44，中心与宿主同心（允许 1px 取整）。 */
function expectCentered(target: HTMLElement, pseudo: '::before' | '::after', square: boolean): void {
  const rect = target.getBoundingClientRect()
  const box = pseudoBox(target, pseudo)
  const observed = `${pseudo} ${JSON.stringify(box)} host ${JSON.stringify(rect)}`
  expect(box.height, observed).toBeGreaterThanOrEqual(44)
  expect(box.width, observed).toBeGreaterThanOrEqual(square ? 44 : rect.width - 2)
  expect(Math.abs(box.centerX - (rect.left + rect.width / 2)), observed).toBeLessThanOrEqual(1)
  expect(Math.abs(box.centerY - (rect.top + rect.height / 2)), observed).toBeLessThanOrEqual(1)
  /* 真实命中：宿主中心正上方 / 正下方 20px 的点都落在热区里 */
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  expect(document.elementFromPoint(cx, cy - 20), `${observed} 上方 20px`).toBe(target)
  expect(document.elementFromPoint(cx, cy + 20), `${observed} 下方 20px`).toBe(target)
}

describe('粗指针 + rtl 下的家族热区', () => {
  it('text 档（按钮）：::after 热区与按钮同心', async () => {
    const button = await mount(() => h(XhButton, { 'data-testid': 'b' }, () => '确定'), '[data-testid=\'b\'][data-xh-action-control]')
    expect(button.getAttribute('data-xh-action-profile')).toBe('text')
    expectCentered(button, '::after', false)
  })

  it('icon 档（图标按钮）：::after 热区 44×44 与按钮同心', async () => {
    const button = await mount(() => h(XhButton, { 'data-testid': 'b', 'iconOnly': true, 'aria-label': '更多' }), '[data-testid=\'b\'][data-xh-action-control]')
    expect(button.getAttribute('data-xh-action-profile')).toBe('icon')
    expectCentered(button, '::after', true)
  })

  it('勾选框（icon 档，皮肤在细指针下外扩过同一个 ::after）：热区与方框同心', async () => {
    const root = await mount(() => h(XhCheckbox, { 'data-testid': 'c' }), '[data-testid=\'c\'][data-part=\'root\']')
    expectCentered(root, '::after', true)
  })

  it('开关（text 档，皮肤补了行内轴 44px）：热区与轨道同心', async () => {
    const root = await mount(() => h(XhSwitch, { 'data-testid': 's' }), '[data-testid=\'s\'][data-part=\'root\']')
    expectCentered(root, '::after', true)
  })

  it('下载钮（皮肤把热区挪到 ::before）：热区与按钮同心', async () => {
    const root = await mount(() => h(XhDownloadTrigger, { 'data-testid': 'd', 'data': 'hi', 'fileName': 'a.txt' }), '[data-testid=\'d\'][data-part=\'root\']')
    expect(root.matches(':empty')).toBe(true)
    expectCentered(root, '::before', false)
  })

  it('排序把手（皮肤把热区挪到 ::before）：热区 44×44 与把手同心', async () => {
    /* 只放一条：两条密排时下一条把手的热区会盖住上一条的下沿，命中断言分不清是谁的 */
    const handle = await mount(
      () => h(XhSortableRoot, { ids: ['a'] }, () => ['a'].map(id => h(XhSortableItem, { key: id, itemId: id }, () => [
        h(XhSortableItemDragTrigger, { 'data-testid': `grip-${id}`, 'itemId': id }),
        h('span', id),
      ]))),
      '[data-testid=\'grip-a\'][data-part=\'item-drag-trigger\']',
    )
    expect(handle.matches(':empty')).toBe(true)
    expectCentered(handle, '::before', true)
  })
})
