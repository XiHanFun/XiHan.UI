// 色板轴定的是色阶满档那一端，中间各档由皮肤里一条 color-mix 在 oklab 里兑出来。
// 兑出来的那几档只有真浏览器算得出：jsdom 不解析 color-mix，计算值原样返回，那边永远是绿的。
//
// 这里量四件事：属性接得上（palette → data-palette → 私有槽）、两条轴同时写时谁赢、
// 兑出来的五档明度逐档单调（浅色深色各一遍）、格距与聚焦环的几何。
// 相邻两档的对比度棘轮在令牌层的 contrast.spec 里。
import type { XhHeatmapElement } from '../../src/elements/heatmap'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

/** 与皮肤里 [data-palette] 六条规则一一对上的满档实心底。 */
const INK: Record<string, { light: string, dark: string }> = {
  green: { light: 'oklch(0.648 0.165 149)', dark: 'oklch(0.648 0.165 149)' },
  blue: { light: 'oklch(0.62 0.16 237)', dark: 'oklch(0.62 0.16 237)' },
  orange: { light: 'oklch(0.705 0.16 70)', dark: 'oklch(0.705 0.16 70)' },
  purple: { light: 'oklch(0.577 0.213 302)', dark: 'oklch(0.577 0.213 302)' },
  red: { light: 'oklch(0.577 0.213 25)', dark: 'oklch(0.577 0.213 25)' },
  gray: { light: 'oklch(0.439 0.006 258)', dark: 'oklch(0.65 0.006 258)' },
}

/** 不写色板时的满档实心底：语义令牌 bg-brand，它本就按主题翻。 */
const DEFAULT_INK = 'oklch(0.546 0.216 258)'

const LEVELS = 5

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
  document.documentElement.removeAttribute('data-theme')
})

/** 一张最小的日历：一行一格，外加一条五格的对照条——色阶两处同源，量哪一处都一样。 */
async function mount(attrs: string): Promise<HTMLElement> {
  host = document.createElement('div')
  const items = Array.from({ length: LEVELS }, (_, level) =>
    `<span data-xh-part="legend-item" value="${level}"></span>`).join('')
  host.innerHTML = `
    <xh-heatmap start-date="2024-01-01" end-date="2024-01-07"${attrs}>
      <div data-xh-part="root">
        <div data-xh-part="grid">
          <div data-xh-part="row" value="0">
            <div data-xh-part="cell" value="2024-01-01"></div>
          </div>
        </div>
        <div data-xh-part="legend">${items}</div>
      </div>
    </xh-heatmap>
  `
  document.body.append(host)
  // 元素的接线排在下一轮更新，属性还没落到角色节点上时量出来的都是缺省值
  await host.querySelector<XhHeatmapElement>('xh-heatmap')!.updateComplete
  return host.querySelector<HTMLElement>('[data-xh-part="root"]')!
}

function ink(root: HTMLElement): string {
  return getComputedStyle(root).getPropertyValue('--xh-_heatmap-ink').trim()
}

/** 浏览器把 color-mix 算完后返回 oklab(L a b)；这里只要头一个分量。 */
function stepLightness(root: HTMLElement, level: number): number {
  const el = root.querySelectorAll<HTMLElement>('[data-part="legend-item"]')[level]!
  const css = getComputedStyle(el).backgroundColor
  const m = /oklab\(\s*([\d.]+)/.exec(css)
  if (!m)
    throw new Error(`背景色不是 oklab：${css}`)
  return Number(m[1])
}

describe('热力图色板轴：属性接到私有槽', () => {
  for (const palette of Object.keys(INK)) {
    it(`palette="${palette}" 落成 data-palette 并定住满档实心底`, async () => {
      const root = await mount(` palette="${palette}"`)
      expect(root.dataset.palette).toBe(palette)
      expect(ink(root)).toBe(INK[palette]!.light)
    })
  }

  it('不写色板时与色板轴加进来之前逐字一致', async () => {
    const root = await mount('')
    expect(root.hasAttribute('data-palette')).toBe(false)
    expect(ink(root)).toBe(DEFAULT_INK)
  })

  it('拼错取值退回不写色板那一档，不是悬空', async () => {
    expect(ink(await mount(' palette="pink"'))).toBe(DEFAULT_INK)
  })
})

describe('热力图色板轴：与语气轴的先后', () => {
  it('两个都写时色板赢——色板指名了一个具体颜色，语气只是推得出一个颜色', async () => {
    expect(ink(await mount(' palette="green" tone="danger"'))).toBe(INK.green!.light)
  })

  it('只写语气时照旧走语气', async () => {
    expect(ink(await mount(' tone="danger"'))).toBe('oklch(0.577 0.213 25)')
  })

  it('作者写死的 --xh-heatmap-ink 压过两条轴', async () => {
    const root = await mount(' palette="green" tone="danger"')
    root.style.setProperty('--xh-heatmap-ink', 'oklch(0.5 0.2 180)')
    expect(ink(root)).toBe('oklch(0.5 0.2 180)')
  })
})

describe('热力图色板轴：兑出来的五档', () => {
  for (const theme of ['light', 'dark'] as const) {
    for (const palette of [...Object.keys(INK), '']) {
      it(`${theme} ${palette || '不写色板'}：逐档明度严格单调`, async () => {
        document.documentElement.setAttribute('data-theme', theme)
        const root = await mount(palette ? ` palette="${palette}"` : '')
        const ls = Array.from({ length: LEVELS }, (_, i) => stepLightness(root, i))
        // 浅色态从亮走到暗，深色态反过来；方向由两端定，中间各档不许走回头路
        const descending = ls[0]! > ls[LEVELS - 1]!
        for (let i = 1; i < LEVELS; i++)
          expect(descending ? ls[i]! < ls[i - 1]! : ls[i]! > ls[i - 1]!).toBe(true)
      })
    }

    it(`${theme} gray：色阶摊得开，与彩色族齐平`, async () => {
      document.documentElement.setAttribute('data-theme', theme)
      const root = await mount(' palette="gray"')
      const span = Math.abs(stepLightness(root, LEVELS - 1) - stepLightness(root, 0))
      // 中性 600 档在深色态只摊得开 0.17，五档挤在一起看不出分档；换成 450 档有 0.38
      expect(span).toBeGreaterThan(0.35)
    })
  }

  // gray 那条深色规则写成 :is([data-theme='dark'] *, [data-theme='dark'])：
  // 深色标记写在热力图自己身上还是写在祖先上都算
  it('dark gray：深色标记写在热力图自己身上也换档', async () => {
    const root = await mount(' palette="gray"')
    root.dataset.theme = 'dark'
    expect(ink(root)).toBe(INK.gray!.dark)
  })
})

// 色板只改 root 上那一个私有槽，格子与图例都从 root 继承它，三种形态因此共用同一条色阶。
// 这里逐形态各铺一张，量真正画出来的那一格：形态规则里若有谁另起炉灶写死了底色，这里会红。
describe('热力图色板轴：三种形态都吃这条轴', () => {
  /** 一格 50% 档在 purple 上兑出来的明度：0.967 与 0.577 的中点。 */
  const MID_LIGHTNESS = 0.772

  /** 三种形态的角色节点身份各不相同：日历是星期行 + 日期，月历多一层月块，矩阵是行名 + 列名。 */
  const MARKUP: Record<string, string> = {
    calendar: `
      <div data-xh-part="row" value="2">
        <div data-xh-part="cell" value="2024-01-03"></div>
      </div>`,
    month: `
      <div data-xh-part="month-block" value="2024-01">
        <div data-xh-part="row" value="0">
          <div data-xh-part="cell" value="2024-01-03"></div>
        </div>
      </div>`,
    matrix: `
      <div data-xh-part="row" value="行一">
        <div data-xh-part="row-label" value="行一">行一</div>
        <div data-xh-part="cell" value="列一"></div>
      </div>`,
  }

  async function mountVariant(variant: string): Promise<HTMLElement> {
    host = document.createElement('div')
    host.innerHTML = `
      <xh-heatmap variant="${variant}" palette="purple" start-date="2024-01-01" end-date="2024-01-07" levels="5">
        <div data-xh-part="root">
          <div data-xh-part="grid">${MARKUP[variant]}</div>
        </div>
      </xh-heatmap>
    `
    document.body.append(host)
    const el = host.querySelector<XhHeatmapElement>('xh-heatmap')!
    if (variant === 'matrix') {
      el.rows = ['行一']
      el.columns = ['列一', '列二']
      // 满档 4、这一格 2，正好落在 50% 那一档
      el.value = [{ row: '行一', column: '列一', value: 2 }, { row: '行一', column: '列二', value: 4 }]
    }
    else {
      el.value = [{ date: '2024-01-03', count: 2 }, { date: '2024-01-05', count: 4 }]
    }
    await el.updateComplete
    return host.querySelector<HTMLElement>('[data-xh-part="root"]')!
  }

  for (const variant of ['calendar', 'month', 'matrix']) {
    it(`${variant}：格子按色板兑出来`, async () => {
      const root = await mountVariant(variant)
      expect(ink(root)).toBe(INK.purple!.light)
      const cell = root.querySelector<HTMLElement>('[data-part="cell"]')!
      expect(cell.dataset.level).toBe('2')
      const m = /oklab\(\s*([\d.]+)/.exec(getComputedStyle(cell).backgroundColor)
      expect(m).not.toBeNull()
      expect(Number(m![1])).toBeCloseTo(MID_LIGHTNESS, 3)
    })
  }
})

// 皮肤把格距定成「聚焦环偏移 + 环宽」（css/heatmap.css 的 --xh-_heatmap-gap），
// 聚焦环因此整圈落在格子之间的空当里，不压到相邻的格子上。这是一条几何前提，
// 只有真浏览器量得到：改小格距或改大环宽都会让环压上相邻格子，这里会红。
describe('热力图的聚焦环：环落在格子之间的空当里', () => {
  it('两格之间的空当正好是环占的宽度', async () => {
    host = document.createElement('div')
    host.innerHTML = `
      <xh-heatmap start-date="2024-01-01" end-date="2024-01-14">
        <div data-xh-part="root">
          <div data-xh-part="grid">
            <div data-xh-part="row" value="0">
              <div data-xh-part="cell" value="2024-01-01"></div>
              <div data-xh-part="cell" value="2024-01-08"></div>
            </div>
          </div>
        </div>
      </xh-heatmap>
    `
    document.body.append(host)
    await host.querySelector<XhHeatmapElement>('xh-heatmap')!.updateComplete
    const root = host.querySelector<HTMLElement>('[data-xh-part="root"]')!

    // 环宽与环偏移是自定义属性，套一个探针把它们解析成像素
    const probe = document.createElement('div')
    probe.style.cssText = 'outline-style:solid;outline-width:var(--xh-ring-width);outline-offset:var(--xh-ring-offset)'
    root.append(probe)
    const probeStyle = getComputedStyle(probe)
    const ring = Number.parseFloat(probeStyle.outlineWidth) + Number.parseFloat(probeStyle.outlineOffset)
    expect(ring).toBeGreaterThan(0)

    const [first, second] = [...root.querySelectorAll<HTMLElement>('[data-part="cell"]')]
    const gap = second!.getBoundingClientRect().left - first!.getBoundingClientRect().right
    expect(gap).toBeCloseTo(ring, 1)
  })
})
