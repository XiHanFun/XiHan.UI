// 行底色的先后：基础底 < 斑马纹 < 选中 < 悬停 / 键盘锚点 < 换父落点。
//
// 这几档写在同一层里，谁盖过谁由特指度与源码先后共同决定，而不是由声明的先后决定。
// jsdom 不跑级联，量出来的 backgroundColor 恒是最后一条声明，四档全都分不开；
// 只有真实浏览器算得出实际生效的那一条。
//
// 五档各喂一个互不相同的颜色再量：默认值里悬停与斑马纹取的是同一个令牌，
// 照默认值量的话「斑马纹盖住了悬停」与「悬停生效了」两种结果一模一样，分不开。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhTableBody,
  XhTableCell,
  XhTableRoot,
  XhTableRow,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const columns = [{ id: 'name', label: '名称' }]
const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]

/** 五档各一个能一眼认出来的颜色。 */
const BASE = 'rgb(1, 1, 1)'
const STRIPED = 'rgb(2, 2, 2)'
const HOVER = 'rgb(3, 3, 3)'
const SELECTED = 'rgb(4, 4, 4)'
const INSIDE = 'rgb(5, 5, 5)'

const PALETTE = [
  ['--xh-table-row-bg', BASE],
  ['--xh-table-row-bg-striped', STRIPED],
  ['--xh-table-row-bg-hover', HOVER],
  ['--xh-table-row-bg-selected', SELECTED],
  ['--xh-table-drop-inside-bg', INSIDE],
] as const

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

/** 挂一张开着斑马纹的表，返回表体里那四个数据行。 */
async function mountStriped(): Promise<HTMLElement[]> {
  host = document.createElement('div')
  for (const [name, value] of PALETTE)
    host.style.setProperty(name, value)
  document.body.append(host)
  app = createApp({
    render: () => h(XhTableRoot, { columns, rows, striped: true }, {
      default: () => [
        h(XhTableBody, null, {
          default: () => rows.map(row => h(
            XhTableRow,
            { key: row.id, value: row.id },
            { default: () => [h(XhTableCell, { value: 'name' }, { default: () => row.id })] },
          )),
        }),
      ],
    }),
  })
  app.mount(host)
  await nextTick()
  const body = host.querySelector('[data-scope="table"][data-part="body"]')!
  return [...body.querySelectorAll<HTMLElement>('[data-scope="table"][data-part="row"]')]
}

const bg = (el: HTMLElement): string => getComputedStyle(el).backgroundColor

describe('表格行底色的级联先后', () => {
  it('斑马纹盖过基础底，只盖偶数行', async () => {
    // nth-of-type 从 1 数起：第二个行盒才是偶数行
    const [odd, even] = await mountStriped()
    expect(bg(odd)).toBe(BASE)
    expect(bg(even)).toBe(STRIPED)
  })

  it('悬停与键盘锚点盖过斑马纹', async () => {
    const [odd, even] = await mountStriped()
    odd.setAttribute('data-highlighted', '')
    even.setAttribute('data-highlighted', '')
    expect(bg(odd)).toBe(HOVER)
    expect(bg(even)).toBe(HOVER)
  })

  it('选中盖过斑马纹', async () => {
    // 只量选中与斑马纹这一对。选中与悬停同时成立时按悬停画，选中仍由行首的勾选框表达
    const [odd, even] = await mountStriped()
    odd.setAttribute('data-selected', '')
    even.setAttribute('data-selected', '')
    expect(bg(odd)).toBe(SELECTED)
    expect(bg(even)).toBe(SELECTED)
  })

  it('换父落点盖过前面每一档', async () => {
    const [odd, even] = await mountStriped()
    odd.setAttribute('data-drop', 'inside')
    // 拖动时指针必然停在落点这一行上，落点与悬停恒同时成立；被拖的行还可能是选中的
    even.setAttribute('data-drop', 'inside')
    even.setAttribute('data-highlighted', '')
    even.setAttribute('data-selected', '')
    expect(bg(odd)).toBe(INSIDE)
    expect(bg(even)).toBe(INSIDE)
  })
})
