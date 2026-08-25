// 令牌层的对比度判据：直接读令牌源算，不依赖渲染。
// axe 的 color-contrast 只管文字，非文本对比度（SC 1.4.11，控件边界）它一条都看不到，
// 那一类只能在这里守。
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const TOKENS_DIR = join(import.meta.dirname, '../tokens')

interface TokenNode { $value?: string, [k: string]: unknown }

function loadJson(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(TOKENS_DIR, name), 'utf8'))
}

const primitive = loadJson('primitive.json')

/** 高对比档只写覆盖项，按组浅合并到基础档上，得到那一档的完整取值。 */
function withOverrides(
  base: Record<string, unknown>,
  more: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...base }
  for (const [group, tokens] of Object.entries(more)) {
    if (group.startsWith('$'))
      continue
    out[group] = { ...(base[group] as object), ...(tokens as object) }
  }
  return out
}

const themes = {
  'light': loadJson('semantic.light.json'),
  'dark': loadJson('semantic.dark.json'),
  'light-more': withOverrides(loadJson('semantic.light.json'), loadJson('semantic.light.more.json')),
  'dark-more': withOverrides(loadJson('semantic.dark.json'), loadJson('semantic.dark.more.json')),
} as const

function at(root: unknown, path: string): TokenNode | undefined {
  let node = root as Record<string, unknown> | undefined
  for (const seg of path.split('.')) {
    node = node?.[seg] as Record<string, unknown> | undefined
    if (!node)
      return undefined
  }
  return node as TokenNode
}

/** 语义令牌的值是 `{color.neutral.500}` 这类引用，解析到 primitive 的终值。 */
function resolve(theme: keyof typeof themes, path: string): string {
  const node = at(themes[theme], path)
  if (!node?.$value)
    throw new Error(`令牌不存在：${theme} ${path}`)
  const ref = /^\{(.+)\}$/.exec(node.$value)
  if (!ref)
    return node.$value
  const target = at(primitive, ref[1]!)
  if (!target?.$value)
    throw new Error(`引用解析不到：${node.$value}`)
  return target.$value
}

function gammaEncode(x: number): number {
  return x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
}

/** oklch(L C H) → 线性 sRGB 三元组，超出色域的分量按 [0,1] 截断。 */
function oklchToLinearRgb(css: string): [number, number, number] {
  const m = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(css)
  if (!m)
    throw new Error(`不是 oklch 颜色：${css}`)
  const [lightness, chroma, hue] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const h = (hue * Math.PI) / 180
  const a = chroma * Math.cos(h)
  const b = chroma * Math.sin(h)

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3

  const rgb: [number, number, number] = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ]
  // 先按 sRGB 传输函数往返一次再取线性值，与浏览器把超色域颜色钳进 sRGB 的结果一致
  return rgb.map((v) => {
    const encoded = Math.min(1, Math.max(0, gammaEncode(v)))
    return encoded <= 0.04045 ? encoded / 12.92 : ((encoded + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
}

function luminance(css: string): number {
  const [r, g, b] = oklchToLinearRgb(css)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(theme: keyof typeof themes, fg: string, bg: string): number {
  const a = luminance(resolve(theme, fg))
  const b = luminance(resolve(theme, bg))
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

// 正文与次要文字，WCAG 1.4.3 AA 要求 4.5:1
const TEXT_PAIRS: ReadonlyArray<[keyof typeof themes, string, string]> = [
  ['light', 'fg.default', 'bg.canvas'],
  ['light', 'fg.default', 'bg.surface'],
  ['light', 'fg.default', 'bg.subtle'],
  ['light', 'fg.muted', 'bg.canvas'],
  ['light', 'fg.muted', 'bg.surface'],
  ['light', 'fg.muted', 'bg.subtle'],
  ['light', 'fg.subtle', 'bg.canvas'],
  ['light', 'fg.subtle', 'bg.surface'],
  ['light', 'fg.subtle', 'bg.subtle'],
  ['light', 'fg.on-brand', 'bg.brand'],
  ['light', 'fg.on-brand', 'bg.brand-hover'],
  ['light', 'fg.brand', 'bg.canvas'],
  ['light', 'fg.brand', 'bg.surface'],
  ['light', 'fg.success', 'bg.canvas'],
  ['light', 'fg.success', 'bg.surface'],
  ['light', 'fg.danger', 'bg.canvas'],
  ['light', 'fg.danger', 'bg.surface'],
  ['light', 'fg.danger-hover', 'bg.canvas'],
  ['light', 'fg.danger-hover', 'bg.subtle-hover'],
  ['light', 'fg.default', 'bg.brand-subtle'],
  ['dark', 'fg.default', 'bg.canvas'],
  ['dark', 'fg.default', 'bg.surface'],
  ['dark', 'fg.default', 'bg.subtle'],
  ['dark', 'fg.muted', 'bg.canvas'],
  ['dark', 'fg.muted', 'bg.surface'],
  ['dark', 'fg.muted', 'bg.subtle'],
  ['dark', 'fg.subtle', 'bg.canvas'],
  ['dark', 'fg.subtle', 'bg.surface'],
  ['dark', 'fg.subtle', 'bg.subtle'],
  ['dark', 'fg.on-brand', 'bg.brand'],
  ['dark', 'fg.on-brand', 'bg.brand-hover'],
  ['dark', 'fg.brand', 'bg.canvas'],
  ['dark', 'fg.brand', 'bg.surface'],
  ['dark', 'fg.success', 'bg.canvas'],
  ['dark', 'fg.success', 'bg.surface'],
  ['dark', 'fg.danger', 'bg.canvas'],
  ['dark', 'fg.danger', 'bg.surface'],
  ['dark', 'fg.danger-hover', 'bg.canvas'],
  ['dark', 'fg.danger-hover', 'bg.surface'],
  ['dark', 'fg.default', 'bg.brand-subtle'],
]

// fg.subtle 是"控件之外的说明文字"（label / description）在禁用态用的那一档：
// 它不在 1.4.3 的失效控件豁免里，必须自己达标。
const OUTSIDE_CONTROL_PAIRS: ReadonlyArray<[keyof typeof themes, string, string]> = [
  ['light', 'fg.subtle', 'bg.canvas'],
  ['light', 'fg.subtle', 'bg.subtle'],
  ['dark', 'fg.subtle', 'bg.canvas'],
  ['dark', 'fg.subtle', 'bg.surface'],
  ['dark', 'fg.subtle', 'bg.surface-raised'],
]

// 控件边界走 border.control，WCAG 1.4.11 的 3:1 是硬门槛。
// 这一族的取值判据是「中性色阶里第一个过 3:1 的档」：再退一档浅色掉到 2.59、深色掉到 2.54，
// 再进一档浅色跳到 4.73（已是正文级重量，1px 描边取到那里整屏会发硬）。
const CONTROL_BORDER_PAIRS: ReadonlyArray<[keyof typeof themes, string, string]> = [
  ['light', 'border.control', 'bg.canvas'],
  ['light', 'border.control', 'bg.surface'],
  ['light', 'border.control-hover', 'bg.canvas'],
  ['light', 'border.control-hover', 'bg.surface'],
  ['dark', 'border.control', 'bg.canvas'],
  ['dark', 'border.control', 'bg.surface'],
  ['dark', 'border.control-hover', 'bg.canvas'],
  ['dark', 'border.control-hover', 'bg.surface'],
]

// 悬停必须比静息更重，否则「悬停反而变淡」——这条比绝对值更容易在改色时被破坏。
const HOVER_ORDER: ReadonlyArray<[keyof typeof themes, string]> = [
  ['light', 'bg.canvas'],
  ['light', 'bg.surface'],
  ['dark', 'bg.canvas'],
  ['dark', 'bg.surface'],
]

// 装饰性边框（分隔线、容器描边）不在 1.4.11 的范围内，但也不许悄悄变淡：按棘轮钉住。
// 12 组一个不落——此前只钉了 8 组，surface 底那 4 组没钉。
const BORDER_RATCHET: ReadonlyArray<[keyof typeof themes, string, string, number]> = [
  ['light', 'border.default', 'bg.canvas', 1.26],
  ['light', 'border.default', 'bg.surface', 1.26],
  ['light', 'border.strong', 'bg.canvas', 1.48],
  ['light', 'border.strong', 'bg.surface', 1.48],
  ['light', 'border.subtle', 'bg.canvas', 1.1],
  ['light', 'border.subtle', 'bg.surface', 1.1],
  ['dark', 'border.default', 'bg.canvas', 1.91],
  ['dark', 'border.default', 'bg.surface', 1.71],
  ['dark', 'border.strong', 'bg.canvas', 2.54],
  ['dark', 'border.strong', 'bg.surface', 2.28],
  ['dark', 'border.subtle', 'bg.canvas', 1.31],
  ['dark', 'border.subtle', 'bg.surface', 1.18],
]

// 高对比档（data-contrast='more'）的判据：每条边界对两种底都不低于正文 AA 的那条线。
// 名单从两份覆盖文件里取并集，不手写：手写的名单只钉住写下那天存在的令牌，
// 往 .more 里新加一条不会有任何检查响，而这一档的判据本来就是「每条边界」。
const MORE_BORDERS = [...new Set(
  ['semantic.light.more.json', 'semantic.dark.more.json']
    .flatMap(name => Object.keys((loadJson(name).border ?? {}) as object))
    .map(token => `border.${token}`),
)].sort()

describe('文字对比度（WCAG 1.4.3 AA，4.5:1）', () => {
  for (const [theme, fg, bg] of TEXT_PAIRS) {
    it(`${theme} ${fg} / ${bg}`, () => {
      expect(round(contrast(theme, fg, bg))).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe('控件之外的说明文字（WCAG 1.4.3 AA，4.5:1）', () => {
  for (const [theme, fg, bg] of OUTSIDE_CONTROL_PAIRS) {
    it(`${theme} ${fg} / ${bg}`, () => {
      expect(round(contrast(theme, fg, bg))).toBeGreaterThanOrEqual(4.5)
    })
  }
})

describe('禁用态按 1.4.3 豁免，只钉住不比正文更差', () => {
  it('light fg.disabled / bg.canvas 仍可辨', () => {
    expect(round(contrast('light', 'fg.disabled', 'bg.canvas'))).toBeGreaterThanOrEqual(2.5)
  })
  it('dark fg.disabled / bg.canvas 仍可辨', () => {
    expect(round(contrast('dark', 'fg.disabled', 'bg.canvas'))).toBeGreaterThanOrEqual(2.5)
  })
})

describe('控件边界（WCAG 1.4.11，3:1）', () => {
  for (const [theme, fg, bg] of CONTROL_BORDER_PAIRS) {
    it(`${theme} ${fg} / ${bg}`, () => {
      expect(round(contrast(theme, fg, bg))).toBeGreaterThanOrEqual(3)
    })
  }

  for (const [theme, bg] of HOVER_ORDER) {
    it(`${theme} 悬停档比静息档更重（${bg}）`, () => {
      expect(contrast(theme, 'border.control-hover', bg)).toBeGreaterThan(contrast(theme, 'border.control', bg))
    })
  }
})

describe('装饰性边框棘轮（不在 1.4.11 范围内，只钉住不许更淡）', () => {
  for (const [theme, fg, bg, baseline] of BORDER_RATCHET) {
    it(`${theme} ${fg} / ${bg} 不低于 ${baseline}`, () => {
      expect(round(contrast(theme, fg, bg))).toBeGreaterThanOrEqual(baseline)
    })
  }
})

describe('高对比档（data-contrast=\'more\'）：每条边界都不低于 4.5', () => {
  for (const theme of ['light-more', 'dark-more'] as const) {
    for (const token of MORE_BORDERS) {
      for (const bg of ['bg.canvas', 'bg.surface']) {
        it(`${theme} ${token} / ${bg}`, () => {
          expect(round(contrast(theme, token, bg))).toBeGreaterThanOrEqual(4.5)
        })
      }
    }
  }

  it('高对比档确实比常规档更重', () => {
    for (const [base, more] of [['light', 'light-more'], ['dark', 'dark-more']] as const) {
      for (const token of MORE_BORDERS)
        expect(contrast(more, token, 'bg.canvas')).toBeGreaterThan(contrast(base, token, 'bg.canvas'))
    }
  })
})

describe('常规聚焦环', () => {
  for (const theme of ['light', 'dark'] as const) {
    // 环是图形不是文字，WCAG 1.4.11 要的是 3:1。这里算的是环对容器底色，
    // 环压在别的颜色上（组件自己的底、相邻的实心块）由那些组件各自守
    it(`${theme}：对画布与卡面都够到非文本那条线`, () => {
      expect(round(contrast(theme, 'ring.focus', 'bg.canvas'))).toBeGreaterThanOrEqual(3)
      expect(round(contrast(theme, 'ring.focus', 'bg.surface'))).toBeGreaterThanOrEqual(3)
    })
  }
})

// 三轴里的 tone 不改聚焦环，是因为 success / warning / info 对白底够不着对比度；
// invalid 只有 danger 一种，那条理由在它身上不成立，所以两件事分开定。
describe('校验失败的聚焦环', () => {
  for (const theme of ['light', 'dark'] as const) {
    // 环是图形不是文字，WCAG 1.4.11 要的是 3:1
    it(`${theme}：对画布与卡面都够到非文本那条线`, () => {
      expect(round(contrast(theme, 'ring.invalid', 'bg.canvas'))).toBeGreaterThanOrEqual(3)
      expect(round(contrast(theme, 'ring.invalid', 'bg.surface'))).toBeGreaterThanOrEqual(3)
    })

    it(`${theme}：与常规聚焦环取值不同，否则这条规则等于没写`, () => {
      expect(contrast(theme, 'ring.invalid', 'bg.canvas'))
        .not
        .toBe(contrast(theme, 'ring.focus', 'bg.canvas'))
    })
  }
})

/* ---------- 热力图色板轴的色阶 ---------- */

// 色阶不是一族令牌，是皮肤里一条 color-mix：0 档的空格底与满档的实心底在 oklab 里
// 逐档兑出来。兑出来什么样只有把数算出来才知道，门禁与 axe 都看不见这一条。

/** oklch 文本 → [明度, 彩度, 色相]。 */
function oklchParts(css: string): [number, number, number] {
  const m = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(css)
  if (!m)
    throw new Error(`不是 oklch 颜色：${css}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

/** oklch 文本 → oklab 三分量。 */
function toOklab(css: string): { l: number, a: number, b: number } {
  const [lightness, chroma, hue] = oklchParts(css)
  const h = (hue * Math.PI) / 180
  return { l: lightness, a: chroma * Math.cos(h), b: chroma * Math.sin(h) }
}

/** oklab 三分量 → oklch 文本，接回上面那套亮度与对比度算法。 */
function toOklch({ l, a, b }: { l: number, a: number, b: number }): string {
  const hue = (Math.atan2(b, a) * 180) / Math.PI
  return `oklch(${l} ${Math.hypot(a, b)} ${hue < 0 ? hue + 360 : hue})`
}

function primitiveValue(path: string): string {
  const node = at(primitive, path)
  if (!node?.$value)
    throw new Error(`原语不存在：${path}`)
  return node.$value
}

/** 色阶第 level 档：满档实心底按 level/(levels-1) 的比例兑进空格底。 */
function heatmapStep(ink: string, empty: string, level: number, levels: number): string {
  const p = level / (levels - 1)
  const i = toOklab(ink)
  const e = toOklab(empty)
  return toOklch({ l: p * i.l + (1 - p) * e.l, a: p * i.a + (1 - p) * e.a, b: p * i.b + (1 - p) * e.b })
}

function ratio(fg: string, bg: string): number {
  const a = luminance(fg)
  const b = luminance(bg)
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

// 缺省档数，与 headless 的 HEATMAP_LEVELS 同值
const HEATMAP_LEVELS = 5

// 满档实心底的取值，与 css/heatmap.css 的 [data-palette] 六条规则逐条对上。
// 灰是唯一按主题换档的一族：中性 600 档明度 0.439 离深色态的空格底（0.269）太近。
// 「不写色板」那一档走语义令牌 bg.brand，它本就按主题翻。
const HEATMAP_PALETTES: ReadonlyArray<[string, string | null, string | null]> = [
  ['不写色板', null, null],
  ['green', 'color.success.600', 'color.success.600'],
  ['blue', 'color.info.600', 'color.info.600'],
  ['orange', 'color.warning.600', 'color.warning.600'],
  ['purple', 'color.purple.600', 'color.purple.600'],
  ['red', 'color.danger.600', 'color.danger.600'],
  ['gray', 'color.neutral.600', 'color.neutral.450'],
]

// 四档主题各算一遍：高对比档换的是边框那一族，色阶的两端（bg.subtle 与各色板的原语）
// 在那两档里不变，但格子的描边取的是 border.default，它在高对比档换了档
const HEATMAP_THEMES = ['light', 'dark', 'light-more', 'dark-more'] as const

function heatmapInk(theme: typeof HEATMAP_THEMES[number], light: string | null, dark: string | null): string {
  const path = theme.startsWith('light') ? light : dark
  return path == null ? resolve(theme, 'bg.brand') : primitiveValue(path)
}

describe('热力图色板轴：逐档明度严格单调', () => {
  for (const theme of HEATMAP_THEMES) {
    for (const [name, light, dark] of HEATMAP_PALETTES) {
      it(`${theme} ${name}`, () => {
        const ink = heatmapInk(theme, light, dark)
        const empty = resolve(theme, 'bg.subtle')
        const ls = Array.from({ length: HEATMAP_LEVELS }, (_, i) => toOklab(heatmapStep(ink, empty, i, HEATMAP_LEVELS)).l)
        // 浅色态从亮走到暗，深色态反过来；方向由两端定，中间各档不许走回头路
        const descending = ls[0]! > ls[HEATMAP_LEVELS - 1]!
        for (let i = 1; i < HEATMAP_LEVELS; i++)
          expect(descending ? ls[i]! < ls[i - 1]! : ls[i]! > ls[i - 1]!).toBe(true)
      })
    }
  }
})

// 相邻两档的对比度棘轮。1.2 是实测最低的那一档（浅色态 orange 的 0↔1，1.225）再留一点余量：
// 分档靠的是「看得出深浅不同」，不是 WCAG 的任何一条线（格子不是文字也不是控件边界），
// 所以这里钉的是不许更淡，而不是某条规范阈值。
describe('热力图色板轴：相邻两档分得开', () => {
  for (const theme of HEATMAP_THEMES) {
    for (const [name, light, dark] of HEATMAP_PALETTES) {
      it(`${theme} ${name}`, () => {
        const ink = heatmapInk(theme, light, dark)
        const empty = resolve(theme, 'bg.subtle')
        for (let i = 1; i < HEATMAP_LEVELS; i++) {
          const lo = heatmapStep(ink, empty, i - 1, HEATMAP_LEVELS)
          const hi = heatmapStep(ink, empty, i, HEATMAP_LEVELS)
          expect(round(ratio(hi, lo))).toBeGreaterThanOrEqual(1.2)
        }
      })
    }

    // 0 档是空格、1 档是最低的有值档，这一对分不开整张图就读不出「哪几天是空的」
    it(`${theme}：0 档与 1 档各色板都分得开`, () => {
      for (const [, light, dark] of HEATMAP_PALETTES) {
        const ink = heatmapInk(theme, light, dark)
        const empty = resolve(theme, 'bg.subtle')
        const zero = heatmapStep(ink, empty, 0, HEATMAP_LEVELS)
        const one = heatmapStep(ink, empty, 1, HEATMAP_LEVELS)
        expect(round(ratio(one, zero))).toBeGreaterThanOrEqual(1.2)
      }
    })
  }
})

// 每格另有一圈 border.default 的内描边（css/heatmap.css 的 cell 与 legend-item）。
// 它是空格与浅档在底色上的边界线索，两件事各钉一条：对 0 档要看得见，
// 与满档实心底不能是同一个颜色——同色时那一档的描边等于没画。
describe('热力图色板轴：格子的描边', () => {
  for (const theme of HEATMAP_THEMES) {
    it(`${theme}：描边对 0 档的空格看得出边界`, () => {
      expect(round(ratio(resolve(theme, 'border.default'), resolve(theme, 'bg.subtle'))))
        .toBeGreaterThanOrEqual(1.1)
    })

    for (const [name, light, dark] of HEATMAP_PALETTES) {
      it(`${theme} ${name}：描边与满档实心底不同色`, () => {
        expect(heatmapInk(theme, light, dark)).not.toBe(resolve(theme, 'border.default'))
      })
    }
  }
})

// 紫不对应任何语气，只服务色板轴。它的明度与彩度逐档照 danger 族、只换色相：
// 照抄一条已经验过的明度曲线，色阶的单调与分档质量就与 red 那一列逐值相同。
describe('紫色原语沿用 danger 的明度曲线', () => {
  it('purple.600 与 danger.600 只差色相', () => {
    const [purpleL, purpleC, purpleH] = oklchParts(primitiveValue('color.purple.600'))
    const [dangerL, dangerC] = oklchParts(primitiveValue('color.danger.600'))
    expect(purpleL).toBe(dangerL)
    expect(purpleC).toBe(dangerC)
    expect(purpleH).toBe(302)
  })
})
