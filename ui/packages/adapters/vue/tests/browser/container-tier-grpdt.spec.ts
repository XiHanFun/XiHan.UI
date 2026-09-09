// 容器档：diff-view 的并排视图与 transfer 的两栏面板，在窄盒里换成堆叠。
//
// 门槛是这两块盒自己的宽度，不是视口——差异视图常嵌在半宽的评审栏里、穿梭框常放在
// 对话框里，视口再宽也不影响盒里放不放得下两列。所以这里不套 iframe，只挂一个定宽的
// 外层 div：容器查询读的就是它给的宽度。
//
// 窄档量的是"看得见"：并排时新侧那一列整个落在首屏之外，只看得见旧侧，而看新侧正是
// 差异视图的全部意义；穿梭框窄档时两块面板各自被挤到条目文字都放不下。
import type { App } from 'vue'
import { computeTextDiff } from '@xihan-ui/headless'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDiffViewBody,
  XhDiffViewRoot,
  XhDiffViewViewport,
  XhTransferItem,
  XhTransferItemCheckbox,
  XhTransferItemText,
  XhTransferList,
  XhTransferPanelCount,
  XhTransferPanelHeader,
  XhTransferPanelTitle,
  XhTransferRoot,
  XhTransferSearch,
  XhTransferSelectAllTrigger,
  XhTransferSourcePanel,
  XhTransferTargetPanel,
  XhTransferToSourceTrigger,
  XhTransferToTargetTrigger,
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

/** 挂一个定宽的外层 div，组件的根就是查询容器本身。 */
function mount(width: number, render: () => unknown): void {
  host = document.createElement('div')
  host.style.cssText = `width: ${width}px`
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
}

function pick(selector: string): HTMLElement {
  const el = host?.querySelector(selector)
  if (!el)
    throw new Error(`没有挂上 ${selector}`)
  return el as HTMLElement
}

function box(selector: string): DOMRect {
  return pick(selector).getBoundingClientRect()
}

const BEFORE = `export function resolveConnectionString(options: ResolveOptions): string {
  const base = options.base ?? DEFAULT_BASE
  return normalize(base, options.database)
}`
const AFTER = `export function resolveConnectionString(options: ResolveOptions): string {
  const base = options.base ?? DEFAULT_FALLBACK_BASE
  return normalizeConnection(base, options.database, options.timezone)
}`

async function mountDiff(width: number, wrap = false): Promise<void> {
  const model = computeTextDiff(BEFORE, AFTER)
  mount(width, () => h(XhDiffViewRoot, { model, view: 'split', wrap }, () => [
    h(XhDiffViewViewport, null, () => [h(XhDiffViewBody)]),
  ]))
  await nextTick()
  await nextTick()
}

const OLD_NUMBER = '[data-part=\'line-number\'][data-side=\'old\']'
const NEW_NUMBER = '[data-part=\'line-number\'][data-side=\'new\']'
const NEW_CONTENT = '[data-part=\'line-content\'][data-side=\'new\']'

describe('diff-view 并排视图的容器档', () => {
  it('窄盒：新侧落到旧侧下方，两侧同起一列', async () => {
    await mountDiff(375)
    const oldNum = box(OLD_NUMBER)
    const newNum = box(NEW_NUMBER)

    expect(newNum.top).toBeGreaterThan(oldNum.top)
    expect(newNum.left).toBeCloseTo(oldNum.left, 1)
  })

  it('窄盒：新侧那一列落在首屏里，不必横滚就看得见', async () => {
    await mountDiff(375)
    const viewport = pick('[data-part=\'viewport\']')
    const visibleRight = viewport.getBoundingClientRect().left + viewport.clientWidth

    // 并排时新侧的行号槽落在 x=650、可视只到 373，整列都在首屏之外
    expect(box(NEW_NUMBER).right).toBeLessThanOrEqual(visibleRight)
  })

  it('窄盒：正文只按单侧的最长行撑宽，不再是两侧之和', async () => {
    await mountDiff(375)
    const stacked = box('[data-part=\'body\']').width

    await mountDiff(1280)
    const sideBySide = box('[data-part=\'body\']').width

    // 并排时两侧各带一份行号槽与一份正文，堆叠之后只剩一份
    expect(stacked).toBeLessThan(sideBySide * 0.6)
  })

  it('窄盒：开了换行之后整份差异收在盒里，一点横滚都不剩', async () => {
    await mountDiff(375, true)
    const viewport = pick('[data-part=\'viewport\']')

    // 并排时单侧只剩 132px，一行代码要折成 4 行；堆叠后单侧拿到整个盒宽
    expect(viewport.scrollWidth).toBe(viewport.clientWidth)
  })

  it('宽盒：两侧回到同一行并排', async () => {
    await mountDiff(1280)
    const oldNum = box(OLD_NUMBER)
    const newNum = box(NEW_NUMBER)

    expect(newNum.top).toBeCloseTo(oldNum.top, 1)
    expect(newNum.left).toBeGreaterThan(oldNum.right)
  })

  it('宽盒：接缝那条左边线只在并排时画', async () => {
    await mountDiff(1280)
    const wide = getComputedStyle(pick(NEW_NUMBER)).borderInlineStartWidth

    await mountDiff(375)
    const narrow = getComputedStyle(pick(NEW_NUMBER)).borderInlineStartWidth

    expect(Number.parseFloat(wide)).toBeGreaterThan(0)
    expect(Number.parseFloat(narrow)).toBe(0)
  })

  it('窄盒：堆叠只换了排布，split 的语义与读屏播报照旧', async () => {
    await mountDiff(375)

    expect(pick('[data-part=\'root\']').dataset.view).toBe('split')
    // 两列的表格语义不随排布走：列数与列号都还在
    expect(pick('[data-part=\'body\']').getAttribute('aria-colcount')).toBe('2')
    expect(pick('[data-part=\'line-content\'][data-side=\'old\']').getAttribute('aria-colindex')).toBe('1')
    expect(pick(NEW_CONTENT).getAttribute('aria-colindex')).toBe('2')

    // 变更类型的读屏文字仍在无障碍树里：视觉隐藏，不是 display: none
    const label = pick('[data-part=\'change-label\']')
    expect(getComputedStyle(label).display).not.toBe('none')
    expect(label.textContent?.trim()).not.toBe('')
  })
})

const ITEMS = [
  { value: 'a', label: '组织架构与岗位' },
  { value: 'b', label: '数据字典维护' },
  { value: 'c', label: '定时任务调度' },
]

async function mountTransfer(width: number): Promise<void> {
  const panel = (title: string) => [
    h(XhTransferPanelHeader, null, () => [
      h(XhTransferSelectAllTrigger, null, () => '全选'),
      h(XhTransferPanelTitle, null, () => title),
      h(XhTransferPanelCount),
    ]),
    h(XhTransferSearch),
    h(XhTransferList, null, () => ITEMS.map(item =>
      h(XhTransferItem, { key: item.value, value: item.value }, () => [
        h(XhTransferItemCheckbox),
        h(XhTransferItemText, null, () => item.label),
      ]))),
  ]
  mount(width, () => h(XhTransferRoot, { collection: ITEMS, searchable: true }, () => [
    h(XhTransferSourcePanel, null, () => panel('可选权限')),
    h(XhTransferToTargetTrigger),
    h(XhTransferToSourceTrigger),
    h(XhTransferTargetPanel, null, () => panel('已选权限')),
  ]))
  await nextTick()
  await nextTick()
}

const SOURCE = '[data-part=\'source-panel\']'
const TARGET = '[data-part=\'target-panel\']'
const TO_TARGET = '[data-part=\'to-target-trigger\']'
const TO_SOURCE = '[data-part=\'to-source-trigger\']'

describe('transfer 两栏面板的容器档', () => {
  it('窄盒：两块面板各占满一行，目标在源下方', async () => {
    await mountTransfer(375)
    const root = box('[data-part=\'root\']')
    const source = box(SOURCE)
    const target = box(TARGET)

    expect(source.width).toBeCloseTo(root.width, 1)
    expect(target.width).toBeCloseTo(root.width, 1)
    expect(target.top).toBeGreaterThanOrEqual(source.bottom)
  })

  it('窄盒：条目文字与面板标题都放得下，不再被削', async () => {
    await mountTransfer(375)
    const text = pick('[data-part=\'item-text\']')
    const title = pick('[data-part=\'panel-title\']')

    // 并排时源面板只剩 160px，条目文字要 98px 却只分到 74px
    expect(text.scrollWidth).toBeLessThanOrEqual(text.clientWidth)
    expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth)
  })

  it('窄盒：两颗搬运钮并排在中间一行，夹着中线', async () => {
    await mountTransfer(375)
    const root = box('[data-part=\'root\']')
    const toTarget = box(TO_TARGET)
    const toSource = box(TO_SOURCE)

    expect(toTarget.top).toBeCloseTo(toSource.top, 1)
    expect(toTarget.right).toBeLessThanOrEqual(toSource.left)
    // 一个在中线左、一个在中线右
    const middle = root.left + root.width / 2
    expect(toTarget.right).toBeLessThanOrEqual(middle)
    expect(toSource.left).toBeGreaterThanOrEqual(middle)
  })

  it('窄盒：兜底箭头改指上下，与面板真正的去向对上', async () => {
    await mountTransfer(375)
    const narrowDown = getComputedStyle(pick(TO_TARGET), '::before').maskImage
    const narrowUp = getComputedStyle(pick(TO_SOURCE), '::before').maskImage

    await mountTransfer(1024)
    const wideRight = getComputedStyle(pick(TO_TARGET), '::before').maskImage
    const wideLeft = getComputedStyle(pick(TO_SOURCE), '::before').maskImage

    expect(narrowDown).not.toBe(wideRight)
    expect(narrowUp).not.toBe(wideLeft)
    expect(narrowDown).not.toBe(narrowUp)
  })

  it('宽盒：回到两栏并排，两颗钮在中间那栏上下相遇', async () => {
    await mountTransfer(1024)
    const source = box(SOURCE)
    const target = box(TARGET)
    const toTarget = box(TO_TARGET)
    const toSource = box(TO_SOURCE)

    expect(target.top).toBeCloseTo(source.top, 1)
    expect(toTarget.left).toBeGreaterThanOrEqual(source.right)
    expect(toTarget.right).toBeLessThanOrEqual(target.left)
    expect(toTarget.bottom).toBeLessThanOrEqual(toSource.top)
  })

  it.each([320, 375, 560, 640, 768, 1024])('%ipx：两档都不把自己的盒顶出横滚', async (width) => {
    await mountTransfer(width)
    const root = pick('[data-part=\'root\']')

    expect(root.scrollWidth).toBe(root.clientWidth)
  })
})
