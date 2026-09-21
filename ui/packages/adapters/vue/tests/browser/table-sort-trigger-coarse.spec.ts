// 粗指针下表头排序钮的几何：箭头是排序钮的 :empty::before 兜底字形，盒边长等于 --xh-control-indicator-size
// （指示符档，与同一表头里的勾选框方盒同尺；字形尺寸的契约由 table-glyph-size.spec 管），排在钮的行内流里。
// 钮接的是 Action Control icon 档，家族在 (pointer: coarse) 下用 ::after 把热区扩到 44×44、绝对定位居中——
// 钮的 ::after 是多列排序的序号角标，table.css 的粗指针块把家族那两条 min-* 归零、角标退回内容尺寸；
// 皮肤是 (0,2,1)，家族热区由 :where() 包住只有 (0,0,1)，胜负由特指度定，不靠源序。
//
// 此前排序把手接 row 档、箭头画在 ::after 上，家族与皮肤同为 (0,2,1)、只靠源序压过，消费方产物里家族被
// 内联多份（每份皮肤文件头各引一次 family/action-control.css，不去重的打包器逐份贴进来），有副本排在
// table.css 之后就反超：手机上箭头被撑成整格（实测 ::after 82×44 / 142×44）。第二条用例把家族样式表原样
// 再注入一次、排在全部皮肤之后，模拟这种形态，断言仍必须成立——这是级联健壮性的护栏，不是打包器的。
import type { App } from 'vue'
import { cdp } from '@vitest/browser/context'
import actionControlCss from '@xihan-ui/styles/action-control.css?raw'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
  XhTableColumnLabel,
  XhTableHeader,
  XhTableRoot,
  XhTableRow,
  XhTableSortTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const columns = [
  { id: 'name', label: '名称', width: 160, sortable: true },
  { id: 'size', label: '大小', width: 120, sortable: true },
]

/** 序号角标用例专用：十二列全部参与排序，最后一列的 data-sort-index 是两位数。 */
const MANY_COLUMNS = Array.from({ length: 12 }, (_, i) => ({ id: `c${i + 1}`, label: `列 ${i + 1}`, width: 72, sortable: true }))
const MANY_SORT = MANY_COLUMNS.map(column => ({ id: column.id, direction: 'asc' as const }))
const rows = [{ id: 'a' }, { id: 'b' }]

let app: App | null = null
let host: HTMLElement | null = null
let duplicate: HTMLStyleElement | null = null

afterEach(async () => {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
  app?.unmount()
  host?.remove()
  duplicate?.remove()
  delete document.documentElement.dataset.density
  app = null
  host = null
  duplicate = null
})

async function coarsePointer(): Promise<void> {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  expect(matchMedia('(pointer: coarse)').matches).toBe(true)
}

/** 把家族样式表原样再注入一次，排在 vite 注入的全部皮肤之后：消费方产物里重复内联的副本就长这样。 */
function duplicateFamilyAfterSkins(): void {
  duplicate = document.createElement('style')
  duplicate.dataset.testDuplicateFamily = ''
  duplicate.textContent = actionControlCss
  document.head.append(duplicate)
}

interface MountOptions {
  columns?: typeof columns
  sort?: { id: string, direction: 'asc' | 'desc' }[]
}

async function mount({ columns: cols = columns, sort = [{ id: 'name', direction: 'asc' }] }: MountOptions = {}): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns: cols, rows, sort }, {
      default: () => [
        h(XhTableHeader, null, {
          default: () => [h(XhTableRow, null, {
            // 列名装在 column-label 里，排序钮是它后面一颗不包文字的独立钮
            default: () => cols.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, {
              default: () => [h(XhTableColumnLabel, null, { default: () => column.label }), h(XhTableSortTrigger)],
            })),
          })],
        }),
        h(XhTableBody, null, {
          default: () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, {
            default: () => cols.map(column => h(XhTableCell, { key: column.id, value: column.id }, { default: () => row.id })),
          })),
        }),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
}

function root(): HTMLElement {
  const element = host!.querySelector<HTMLElement>('[data-scope=\'table\'][data-part=\'root\']')
  if (!element)
    throw new Error('缺少 table 根')
  return element
}

function sortTriggers(expected = columns.length): HTMLElement[] {
  const list = [...host!.querySelectorAll<HTMLElement>('[data-scope=\'table\'][data-part=\'sort-trigger\']')]
  if (list.length !== expected)
    throw new Error(`排序把手数量不对：${list.length}`)
  return list
}

/** 箭头字形的盒：边长等于指示符档，排在钮的行内流里；钮本身仍是 16px 方盒，家族热区那 44px 的下限没落到它身上。 */
function expectArrowGlyph(trigger: HTMLElement): void {
  const icon = Number.parseFloat(getComputedStyle(root()).getPropertyValue('--xh-control-indicator-size'))
  expect([14, 16]).toContain(icon)
  const before = getComputedStyle(trigger, '::before')
  // 失败时把量到的几何一起打出来
  const observed = `::before position=${before.position} width=${before.width} height=${before.height} min-block-size=${before.minBlockSize} translate=${before.translate}`
  expect(before.content, observed).toBe('""')
  expect(before.position, observed).not.toBe('absolute')
  expect(Number.parseFloat(before.width), observed).toBe(icon)
  expect(Number.parseFloat(before.height), observed).toBe(icon)
  expect(Number.parseFloat(before.minBlockSize) || 0, observed).toBe(0)
  expect(before.translate, observed).toBe('none')
  // 钮的 ::after 是家族热区（无序号时空着）：min-* 已归零，不把钮撑成 44px
  const after = getComputedStyle(trigger, '::after')
  const box = trigger.getBoundingClientRect()
  const hit = `::after width=${after.width} height=${after.height} min=${after.minInlineSize}×${after.minBlockSize} 盒 ${box.width}×${box.height}`
  expect(Number.parseFloat(after.minInlineSize) || 0, hit).toBe(0)
  expect(Number.parseFloat(after.minBlockSize) || 0, hit).toBe(0)
  expect(box.width, hit).toBe(icon)
  expect(box.height, hit).toBe(icon)
}

describe('粗指针下的排序箭头', () => {
  it('箭头盒等于 --xh-control-indicator-size、留在行内流里，不被家族热区撑成整格', async () => {
    await coarsePointer()
    await mount()
    const [sorted, idle] = sortTriggers()
    expect(sorted!.getAttribute('data-sort')).toBe('asc')
    expect(sorted!.getAttribute('data-xh-action-profile')).toBe('icon')
    expectArrowGlyph(sorted!)
    expectArrowGlyph(idle!)
  })

  it('家族样式表重复注入在皮肤之后（消费方产物的形态），箭头几何仍成立', async () => {
    await coarsePointer()
    duplicateFamilyAfterSkins()
    await mount()
    const [sorted, idle] = sortTriggers()
    expectArrowGlyph(sorted!)
    expectArrowGlyph(idle!)
  })

  it('compact + 触屏：两位数的排序序号角标不被家族热区的行首起点过约束截断', async () => {
    document.documentElement.dataset.density = 'compact'
    await coarsePointer()
    await mount({ columns: MANY_COLUMNS, sort: MANY_SORT })
    const triggers = sortTriggers(MANY_COLUMNS.length)
    const last = triggers.at(-1)!
    expect(last.getAttribute('data-sort-index')).toBe('12')
    const after = getComputedStyle(last, '::after')
    // Chromium 把 attr() 解析成字面量报出来
    expect(after.content).toBe('"12"')
    // 角标文字自己要多宽：同字号同行高的探针量出来
    const probe = document.createElement('span')
    probe.textContent = '12'
    probe.style.position = 'absolute'
    probe.style.whiteSpace = 'nowrap'
    probe.style.fontSize = after.fontSize
    probe.style.fontFamily = after.fontFamily
    probe.style.fontWeight = after.fontWeight
    probe.style.lineHeight = after.lineHeight
    host!.append(probe)
    const textWidth = probe.getBoundingClientRect().width
    probe.remove()
    const box = last.getBoundingClientRect()
    const observed = `::after width=${after.width} inset-inline-start=${after.insetInlineStart} inset-inline-end=${after.insetInlineEnd} 文字宽 ${textWidth} 盒 ${box.width}`
    // 家族热区写了 inset-inline-start: 50%，皮肤只钉 inset-inline-end: 0：不交还行首起点，绝对定位盒被两头过约束成盒的一半
    // （14px 里只剩 7px，两位数装不下）。定位盒的 inset 计算值报的是使用值，只量宽度
    expect(Number.parseFloat(after.width), observed).toBeGreaterThanOrEqual(textWidth - 0.5)
    expect(Number.parseFloat(after.width), observed).toBeGreaterThan(box.width / 2)
  })
})
