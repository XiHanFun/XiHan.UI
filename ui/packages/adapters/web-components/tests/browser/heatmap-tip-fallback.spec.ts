// 详情条的落点靠 calc() 折算，只有真实浏览器会把「百分比减无单位数」判成非法并整条丢掉；
// jsdom 不解析 calc，这条在那边永远是绿的。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const ROOT_H = 200
const ROOT_W = 300
/** 探针里把格间距钉死，断言算的是 calc 的结果而不是当下的令牌值。 */
const GAP = 6

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

interface Probe {
  /** 条的起始缘离 root 内边距盒上沿多远。 */
  start: number
  /** 条的末缘离 root 内边距盒上沿多远。 */
  end: number
}

/** 一个定尺寸的 root 加一条详情条；私有槽给不给由调用方定，量出条的实际落点。 */
function mount(vars: Record<string, string>, attrs: string): { root: HTMLElement, tip: HTMLElement } {
  const style = `position: relative; inline-size: ${ROOT_W}px; block-size: ${ROOT_H}px; --xh-_heatmap-gap: ${GAP}px;`
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="heatmap" data-part="root" style="${style}">
      <div data-scope="heatmap" data-part="tooltip" ${attrs}>条</div>
    </div>
  `
  document.body.append(host)
  const root = host.firstElementChild as HTMLElement
  const tip = root.querySelector<HTMLElement>('[data-part="tooltip"]')!
  for (const [key, value] of Object.entries(vars))
    tip.style.setProperty(key, value)
  return { root, tip }
}

/** 块轴上的落点：条的上下沿离 root 内边距盒上沿多远。 */
function probe(vars: Record<string, string>, placement: string): Probe {
  const { root, tip } = mount(vars, `data-placement="${placement}"`)
  const rootRect = root.getBoundingClientRect()
  const tipRect = tip.getBoundingClientRect()
  return { start: tipRect.top - rootRect.top, end: tipRect.bottom - rootRect.top }
}

/** 行内轴上的落点：条的前后沿离 root 内边距盒起始缘多远。 */
function probeInline(vars: Record<string, string>, inline: string): Probe {
  const { root, tip } = mount(vars, `data-placement="block-end"${inline ? ` data-inline-anchor="${inline}"` : ''}`)
  const rootRect = root.getBoundingClientRect()
  const tipRect = tip.getBoundingClientRect()
  return { start: tipRect.left - rootRect.left, end: tipRect.right - rootRect.left }
}

const MEASURED = {
  '--xh-_heatmap-tip-x': '10px',
  '--xh-_heatmap-tip-y': '50px',
  '--xh-_heatmap-tip-w': '12px',
  '--xh-_heatmap-tip-h': '12px',
}

describe('热力图详情条的落点', () => {
  it('量测过的落点两个方向都算得出来', () => {
    // 摆下边：从格子下沿再让开一个格间距
    expect(probe(MEASURED, 'block-end').start).toBeCloseTo(50 + 12 + GAP, 1)
    // 摆上边：按末缘定位，条自己多高都贴着格子上沿
    expect(probe(MEASURED, 'block-start').end).toBeCloseTo(50 - GAP, 1)
  })

  it('条从格子的哪一缘长出去：末缘那一档按格子的末沿定位，条自己多宽都贴着它', () => {
    const late = { ...MEASURED, '--xh-_heatmap-tip-x': '260px' }
    // 不写 data-inline-anchor 就是从起始缘往后长，末沿落在哪由条自己的宽决定
    expect(probeInline(late, '').start).toBeCloseTo(260, 1)
    // 末缘那一档：条的末沿正好压在格子的末沿上（260 + 12），不再越过 root 的末缘
    expect(probeInline(late, 'end').end).toBeCloseTo(260 + 12, 1)
    expect(probeInline(late, 'end').end).toBeLessThanOrEqual(ROOT_W)
  })

  it('还没量到时兜底的落点也算得出来：四个私有槽都带长度单位', () => {
    // 不写内联样式，走皮肤里那四个缺省值
    expect(probe({}, 'block-end').start).toBeCloseTo(GAP, 1)
    // 无单位的 0 会让 block-start 那条 calc 作废、两头都变 auto，条子掉回静态位置
    expect(probe({}, 'block-start').end).toBeCloseTo(-GAP, 1)
  })
})
