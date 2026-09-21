// 粗指针下表头排序箭头的几何：箭头是排序把手的 ::after 字形，盒边长等于 --xh-control-indicator-size
// （指示符档，与同一表头里的勾选框方盒同尺；字形尺寸的契约由 table-glyph-size.spec 管），排在行内流里。把手接的是 Action Control row 档，家族在 (pointer: coarse) 下用同一个 ::after
// 把热区扩到 44px 高、100% 宽、绝对定位居中——皮肤的字形尺寸与 table.css 的粗指针覆盖
// （position / min-block-size / translate）都是 (0,2,1)，家族热区由 :where() 包住只有 (0,0,1)，
// 胜负由特指度定，不靠源序。
//
// 此前家族与皮肤同为 (0,2,1)、只靠源序压过，消费方产物里家族被内联多份（每份皮肤文件头各引一次
// family/action-control.css，不去重的打包器逐份贴进来），有副本排在 table.css 之后就反超：
// 手机上箭头被撑成整格（实测 ::after 82×44 / 142×44）。第二条用例把家族样式表原样再注入一次、
// 排在全部皮肤之后，模拟这种形态，断言仍必须成立——这是级联健壮性的护栏，不是打包器的。
import type { App } from 'vue'
import { cdp } from '@vitest/browser/context'
import actionControlCss from '@xihan-ui/styles/action-control.css?raw'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableColumnHeader,
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
const rows = [{ id: 'a' }, { id: 'b' }]

let app: App | null = null
let host: HTMLElement | null = null
let duplicate: HTMLStyleElement | null = null

afterEach(async () => {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
  app?.unmount()
  host?.remove()
  duplicate?.remove()
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

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns, rows, sort: [{ id: 'name', direction: 'asc' }] }, {
      default: () => [
        h(XhTableHeader, null, {
          default: () => [h(XhTableRow, null, {
            default: () => columns.map(column => h(XhTableColumnHeader, { key: column.id, value: column.id }, {
              default: () => h(XhTableSortTrigger, null, { default: () => column.label }),
            })),
          })],
        }),
        h(XhTableBody, null, {
          default: () => rows.map(row => h(XhTableRow, { key: row.id, value: row.id }, {
            default: () => columns.map(column => h(XhTableCell, { key: column.id, value: column.id }, { default: () => row.id })),
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

function sortTriggers(): HTMLElement[] {
  const list = [...host!.querySelectorAll<HTMLElement>('[data-scope=\'table\'][data-part=\'sort-trigger\']')]
  if (list.length !== columns.length)
    throw new Error(`排序把手数量不对：${list.length}`)
  return list
}

/** 箭头字形的盒：边长等于指示符档，排在行内流里、没有家族热区那 44px 的下限。 */
function expectArrowGlyph(trigger: HTMLElement): void {
  const icon = Number.parseFloat(getComputedStyle(root()).getPropertyValue('--xh-control-indicator-size'))
  expect([14, 16]).toContain(icon)
  const after = getComputedStyle(trigger, '::after')
  // 失败时把量到的几何一起打出来：撑成整格时是 position absolute + 列宽 × 44px
  const observed = `::after position=${after.position} width=${after.width} height=${after.height} min-block-size=${after.minBlockSize} translate=${after.translate}`
  expect(after.content, observed).toBe('""')
  expect(after.position, observed).not.toBe('absolute')
  expect(Number.parseFloat(after.width), observed).toBe(icon)
  expect(Number.parseFloat(after.height), observed).toBe(icon)
  expect(Number.parseFloat(after.minBlockSize) || 0, observed).toBe(0)
  expect(after.translate, observed).toBe('none')
}

describe('粗指针下的排序箭头', () => {
  it('箭头盒等于 --xh-control-indicator-size、留在行内流里，不被家族热区撑成整格', async () => {
    await coarsePointer()
    await mount()
    const [sorted, idle] = sortTriggers()
    expect(sorted!.getAttribute('data-sort')).toBe('asc')
    expect(sorted!.getAttribute('data-xh-action-profile')).toBe('row')
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
})
