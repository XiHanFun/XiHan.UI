// 视口档：descriptions 里作者写在某一格上的 span，逐档由皮肤决定认不认。
//
// 换档由 @media (min-width) 决定，宿主视口固定改不动，所以每一档开一个那么宽的 iframe，
// 组件挂进 iframe 的文档里量。
//
// 这一条量的是「宽窄反了」：窄档皮肤要每格横跨所有列、一行只摆一组，可 span 从前是
// 连接层直接写死的 grid-column 行内样式，皮肤盖不过去——于是同一份描述里，作者标了
// span（本意是「这格要更宽」）的那一格反而比不带 span 的邻居窄一半。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhDescriptionsItem,
  XhDescriptionsLabel,
  XhDescriptionsRoot,
  XhDescriptionsValue,
} from '../../src'
import { closeFrame, frameHost, styleOf } from './viewport-frame'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  closeFrame()
})

/** 开一个给定视口宽的 iframe，把组件挂进它的文档里。 */
function mount(viewport: number, render: () => unknown): void {
  host = frameHost(viewport)
  app = createApp({ setup: () => render })
  app.mount(host)
}

function pick(selector: string): HTMLElement {
  const el = host?.querySelector(selector)
  if (!el)
    throw new Error(`没有挂上 ${selector}`)
  return el as HTMLElement
}

function all(selector: string): HTMLElement[] {
  return [...(host?.querySelectorAll(selector) ?? [])] as HTMLElement[]
}

// 第二格标了 span：一份订单详情里的长地址，作者要它比别的格宽
const ROWS = [
  { label: '订单编号', value: 'XH-2026-000183', span: undefined },
  { label: '收货地址', value: '浙江省杭州市西湖区文三路 100 号 A 座 1801 室', span: 2 },
  { label: '订单状态', value: '已发货', span: undefined },
  { label: '备注', value: '需要发票', span: undefined },
]

const ITEM = '[data-part=\'item\']'
const SPANNED = '[data-part=\'item\']:nth-child(2)'

async function mountDesc(width: number, columns: 2 | 3 | 4 | 5 | 6, bordered = false): Promise<void> {
  mount(width, () => h(XhDescriptionsRoot, { columns, bordered }, () =>
    ROWS.map(row => h(XhDescriptionsItem, { key: row.label, span: row.span }, () => [
      h(XhDescriptionsLabel, null, () => row.label),
      h(XhDescriptionsValue, null, () => row.value),
    ]))))
  await nextTick()
  await nextTick()
}

/** 各格宽度，四舍五入到整数像素。 */
function widths(): number[] {
  return all(ITEM).map(el => Math.round(el.getBoundingClientRect().width))
}

describe('descriptions 的 span 在窄档', () => {
  it('窄视口：带 span 的那格与邻居同宽，一行只摆一组', async () => {
    await mountDesc(300, 4)

    // 改之前：不带 span 的三格各 300，带 span 的那格只有 144——标了「更宽」反而更窄
    expect(widths()).toEqual([300, 300, 300, 300])
  })

  it('窄视口：带 span 的那格自己占一行，上下都没有别的格', async () => {
    await mountDesc(300, 4)
    const tops = all(ITEM).map(el => Math.round(el.getBoundingClientRect().top))

    // 四个各自的行号两两不同，四格四行
    expect(new Set(tops).size).toBe(4)
  })

  it('窄视口：长地址拿到整行的宽度，不再被压在半行里折行', async () => {
    await mountDesc(375, 4)
    const value = all('[data-part=\'value\']')[1]!

    // 改之前这一格的取值只有 181.5px 可用，长地址要多折一行
    expect(value.getBoundingClientRect().width).toBe(375)
    expect(value.scrollWidth).toBeLessThanOrEqual(value.clientWidth)
  })

  it('窄视口 + 外框：带 span 的那格右缘贴住外框，不留半行空白', async () => {
    await mountDesc(300, 4, true)
    const root = pick('[data-part=\'root\']')
    const rootBox = root.getBoundingClientRect()
    const spanned = pick(SPANNED).getBoundingClientRect()

    // 改之前这一格右缘停在中线上，右边留着 150px 的空底
    expect(rootBox.right - spanned.right).toBeLessThanOrEqual(2)
  })

  // 两列那一档本来就成立：span 被夹到列数上限，跨两列正好是整行
  it.each([2, 3, 4, 5, 6] as const)('窄视口 %i 列：每一格都占满整行，span 一律不认', async (columns) => {
    await mountDesc(300, columns)
    const set = new Set(widths())

    expect(set.size).toBe(1)
    expect([...set][0]).toBe(300)
  })
})

describe('descriptions 的 span 在换档之后', () => {
  it('中视口档 4 列（一行两格）：span 同样不认，四格等宽', async () => {
    await mountDesc(800, 4)

    // 一行只摆得下两格时认了 span 的那格反而比邻居窄，所以这一档也压成等宽
    expect(widths()).toEqual([394, 394, 394, 394])
  })

  it('宽视口档 4 列：作者写的列数生效，span 也跟着生效', async () => {
    await mountDesc(1100, 4)
    const [first, spanned] = widths()

    expect(first).toBe(266)
    // 一格 266，跨两列再加上中间那道 12px 的缝
    expect(spanned).toBe(544)
    expect(styleOf(pick(SPANNED)).gridColumn).toBe('span 2')
  })

  it('宽视口档：不带 span 的格解析成 span 1，与从前的 auto 摆法一致', async () => {
    await mountDesc(1100, 4)

    expect(styleOf(all(ITEM)[0]!).gridColumn).toBe('span 1')
  })

  it.each([300, 375, 560, 700, 768, 800, 1024, 1100])('%ipx：三档都不把自己的盒顶出横滚', async (width) => {
    await mountDesc(width, 4)
    const root = pick('[data-part=\'root\']')

    expect(root.scrollWidth).toBe(root.clientWidth)
  })
})

describe('descriptions 的 span 走的是槽，不是行内 grid-column', () => {
  it('连接层只发槽：格上没有行内 grid-column，皮肤才盖得住', async () => {
    await mountDesc(300, 4)
    const spanned = pick(SPANNED)

    expect(spanned.style.gridColumn).toBe('')
    expect(spanned.style.getPropertyValue('--xh-_descriptions-item-span')).toBe('2')
  })

  it('没写 span 的格不落这个槽，退回皮肤声明的一列', async () => {
    await mountDesc(300, 4)
    const plain = all(ITEM)[0]!

    expect(plain.getAttribute('style')).toBeNull()
    expect(styleOf(plain).getPropertyValue('--xh-_descriptions-item-span').trim()).toBe('1')
  })
})
