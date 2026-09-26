#!/usr/bin/env node
// 图表分类色板：从基础色板为 8 个分类色槽挑色相、排顺序、定亮暗两套档位，连同色块内的文字色写进
// tokens/chart.palette.json；emit-tokens.mjs 把它并进 semantic.light / semantic.dark 的 chart 组。
//
// 颜色按浏览器在 sRGB 显示器上的画法换算：令牌里的 OKLCH 超出 sRGB 色域时逐通道截断，与 check-tone-contrast
// 同一做法。度量与 @xihan-ui/viz 的 color 模块同一口径：OKLab 取 Ottosson 矩阵，对比度取 WCAG 相对亮度，
// 色觉障碍取 Machado–Oliveira–Fernandes 2009 严重度 1.0 的模拟矩阵（作用在线性 sRGB 上）；tooling/testing 的
// chart-palette 用例拿 viz 逐值对拍。这里不 import viz：令牌生成与门禁跑在构建之前，只能依赖 node 内置模块。
//
// 分类色板的规则，亮暗两套各自成立，承载面取各自的 bg.surface：
//   明度带        OKLCH L 亮色 0.43–0.77，暗色 0.48–0.67
//   彩度下限      C ≥ 0.10
//   对比度        每个色槽对承载面 ≥ 3:1
//   相邻          正常视觉 ΔE ≥ 15；红色弱、绿色弱模拟下 ΔE ≥ 8
//   前 3 个色槽   两两之间同相邻：散点、气泡这类任意两个标记都可能挨着的形态只保证前 3 个
//   任意两色      正常视觉 ΔE ≥ 10：隐藏、筛选都不重新分配颜色，原本不相邻的两色随时会挨在一起
//   色相分散      任意 45° 扇区（8 个色槽的平均间隔）里至多 2 个色槽
//   离开告警色    与 danger 语气的每一档正常视觉 ΔE ≥ 10：图里的红色会被读成告警，red 与发红的 orange 都落在这里
//   固定顺序      两套同一色槽同一色相，色槽 1 是品牌色相
// yellow 整族不取：同档同明度的色板里，对白底 3:1 的明度上黄色相只剩橄榄色。
//
// 在满足全部规则的排法里，取「相邻色槽在两种色觉障碍模拟下的最小 ΔE」最大的一种；并列时取任意两色正常视觉
// ΔE 的最小值更大的一种，仍并列取先搜到的。搜索是确定的：同一份基础色板永远得到同一套结果。
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const TOKENS_DIR = join(ROOT, 'tokens')
const OUT = join(TOKENS_DIR, 'chart.palette.json')

export const MODES = ['light', 'dark']
export const SLOTS = 8
export const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
/** 色槽 1 的色相：基础色板里与品牌色逐值相同的那一族。 */
export const FIRST_HUE = 'indigo'
/** 不进分类色板的色相与理由。 */
export const EXCLUDED_HUES = {
  yellow: '同档同明度的色板里，对白底 3:1 的明度上黄色相只剩橄榄色',
}
/** 色块内文字的两个候选：纯白与最深的中性档，取对比度高的一个。 */
export const ON_COLORS = ['{color.neutral.0}', '{color.neutral.950}']

export const RULES = {
  lightness: { light: [0.43, 0.77], dark: [0.48, 0.67] },
  chroma: 0.1,
  contrast: 3,
  adjacent: { distinct: 15, cvd: 8 },
  head: { slots: 3, distinct: 15, cvd: 8 },
  anyPair: 10,
  /** 色相分散：8 个色槽平均相隔 360° ÷ 8 = 45°，任意 45° 扇区里至多 2 个，同一色系（比如三个蓝）不挤在一起。 */
  hueCluster: { span: 45, max: 2 },
  /** 与 danger 语气每一档的正常视觉 ΔE 下限，与「任意两色」同一门槛。 */
  danger: 10,
  onContrast: 4.5,
  /** 有序色阶里对比度最低的一档对承载面的下限。 */
  rampContrast: 2,
  /** 同一色阶各档之间、两套同一色槽之间允许的色相偏差（度）。 */
  hueTolerance: 30,
  /** 彩度低于它算中性色，色相不参与比较。 */
  neutralChroma: 0.02,
  /** 发散色阶两臂的明度差上限：两臂等档，同一幅度读起来一样重。 */
  armLightness: 0.02,
  /** 发散中点对承载面的对比度上限：中点贴着表面，偏离越大颜色越重。 */
  centerContrast: 1.5,
}

/* ---------- 颜色空间 ---------- */

function srgbToLinear(value) {
  const v = Math.abs(value)
  return Math.sign(value) * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
}

function linearToSrgb(value) {
  const v = Math.abs(value)
  return Math.sign(value) * (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055)
}

function toLinearRgb(color) {
  return [srgbToLinear(color.r / 255), srgbToLinear(color.g / 255), srgbToLinear(color.b / 255)]
}

function fromLinearRgb(r, g, b) {
  const channel = v => Math.min(255, Math.max(0, linearToSrgb(v) * 255))
  return { r: channel(r), g: channel(g), b: channel(b) }
}

function oklabToLinearRgb(l, a, b) {
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ]
}

export function toOklab(color) {
  const [r, g, b] = toLinearRgb(color)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  }
}

export function toOklch(color) {
  const { l, a, b } = toOklab(color)
  const c = Math.hypot(a, b)
  return { l, c, h: c < 1e-7 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 }
}

/**
 * OKLCH → sRGB（r、g、b 为 0–255），超出色域的通道逐个截断。基础色板的中档允许略出 sRGB 色域，
 * 浏览器在 sRGB 显示器上就是这样把它画出来的；按降彩度收回色域算，orange、amber 这几族会差出 ΔE 5 以上。
 */
export function fromOklch({ l, c, h }) {
  const radians = (h * Math.PI) / 180
  const [r, g, b] = oklabToLinearRgb(l, c * Math.cos(radians), c * Math.sin(radians))
  return fromLinearRgb(r, g, b)
}

/** `oklch(L C H)` 字面量 → sRGB。令牌源里的颜色只有这一种写法。 */
export function parseOklch(value) {
  const hit = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(String(value).trim())
  if (!hit)
    throw new Error(`[chart-palette] 认不出的颜色 ${value}：只接受 oklch(L C H)`)
  return fromOklch({ l: Number(hit[1]), c: Number(hit[2]), h: Number(hit[3]) })
}

export function formatHex(color) {
  return `#${[color.r, color.g, color.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')}`
}

/* ---------- 度量 ---------- */

export function relativeLuminance(color) {
  const [r, g, b] = toLinearRgb(color)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a, b) {
  const x = relativeLuminance(a)
  const y = relativeLuminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/** OKLab 欧氏距离 × 100。 */
export function deltaEOk(a, b) {
  const x = toOklab(a)
  const y = toOklab(b)
  return Math.hypot(x.l - y.l, x.a - y.a, x.b - y.b) * 100
}

const CVD_MATRICES = {
  protan: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deutan: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
}

export function simulateCvd(color, kind) {
  const m = CVD_MATRICES[kind]
  const [r, g, b] = toLinearRgb(color)
  return fromLinearRgb(m[0] * r + m[1] * g + m[2] * b, m[3] * r + m[4] * g + m[5] * b, m[6] * r + m[7] * g + m[8] * b)
}

/** 红色弱与绿色弱两种模拟下 ΔE 的较小者。 */
export function cvdDelta(a, b) {
  return Math.min(...Object.keys(CVD_MATRICES).map(kind => deltaEOk(simulateCvd(a, kind), simulateCvd(b, kind))))
}

function hueDistance(a, b) {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/** 一组色相角里，落在同一段 span 度扇区内最多有几个（扇区起点取每个色相自身即可覆盖全部情形）。 */
export function hueCrowding(hues, span = RULES.hueCluster.span) {
  let most = 0
  for (const start of hues)
    most = Math.max(most, hues.filter(h => (h - start + 360) % 360 <= span).length)
  return most
}

/* ---------- 检查 ---------- */

/**
 * 一项检查的结果：worst 是该项最差的测量值，pass 为是否达标，where 指出最差值落在哪（色槽从 1 起）。
 * 门禁按 label / worst / limit 打印成表，一项不过就判红。
 */
function item(label, worst, limit, pass, where = '') {
  return { label, worst, limit, pass, where }
}

function worstOf(pairs, measure) {
  let worst = Number.POSITIVE_INFINITY
  let where = ''
  for (const [i, j] of pairs) {
    const value = measure(i, j)
    if (value < worst) {
      worst = value
      where = `${i + 1}–${j + 1}`
    }
  }
  return { worst, where }
}

function adjacentPairs(count) {
  return Array.from({ length: count - 1 }, (_, i) => [i, i + 1])
}

function allPairs(count) {
  const out = []
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++)
      out.push([i, j])
  }
  return out
}

/** 分类色板在一种模式下的全部检查；给了 danger（语气各档）才检查离开告警色。 */
export function checkCategorical(colors, { mode, surface, danger }) {
  const lch = colors.map(toOklch)
  const [low, high] = RULES.lightness[mode]
  const center = (low + high) / 2
  const farthest = lch.reduce((best, x, i) => (Math.abs(x.l - center) > Math.abs(best.l - center) ? { l: x.l, i } : best), { l: center, i: -1 })
  const minChroma = lch.reduce((best, x, i) => (x.c < best.c ? { c: x.c, i } : best), { c: Number.POSITIVE_INFINITY, i: -1 })
  const ratios = colors.map(c => contrastRatio(c, surface))
  const minRatio = Math.min(...ratios)
  const adjacent = adjacentPairs(colors.length)
  const head = allPairs(Math.min(RULES.head.slots, colors.length))
  const every = allPairs(colors.length)
  const distinct = (i, j) => deltaEOk(colors[i], colors[j])
  const cvd = (i, j) => cvdDelta(colors[i], colors[j])
  const adjCvd = worstOf(adjacent, cvd)
  const adjDistinct = worstOf(adjacent, distinct)
  const headCvd = worstOf(head, cvd)
  const headDistinct = worstOf(head, distinct)
  const anyDistinct = worstOf(every, distinct)
  const crowding = hueCrowding(lch.filter(x => x.c >= RULES.neutralChroma).map(x => x.h))
  const { span, max } = RULES.hueCluster
  return [
    item('明度带', farthest.l, `${low}–${high}`, farthest.l >= low && farthest.l <= high, farthest.i >= 0 ? `${farthest.i + 1}` : ''),
    item('彩度下限', minChroma.c, `≥ ${RULES.chroma}`, minChroma.c >= RULES.chroma, `${minChroma.i + 1}`),
    item('对比度', minRatio, `≥ ${RULES.contrast}`, minRatio >= RULES.contrast, `${ratios.indexOf(minRatio) + 1}`),
    item('相邻 · 色觉障碍 ΔE', adjCvd.worst, `≥ ${RULES.adjacent.cvd}`, adjCvd.worst >= RULES.adjacent.cvd, adjCvd.where),
    item('相邻 · 正常视觉 ΔE', adjDistinct.worst, `≥ ${RULES.adjacent.distinct}`, adjDistinct.worst >= RULES.adjacent.distinct, adjDistinct.where),
    item(`前 ${RULES.head.slots} 色两两 · 色觉障碍 ΔE`, headCvd.worst, `≥ ${RULES.head.cvd}`, headCvd.worst >= RULES.head.cvd, headCvd.where),
    item(`前 ${RULES.head.slots} 色两两 · 正常视觉 ΔE`, headDistinct.worst, `≥ ${RULES.head.distinct}`, headDistinct.worst >= RULES.head.distinct, headDistinct.where),
    item('任意两色 · 正常视觉 ΔE', anyDistinct.worst, `≥ ${RULES.anyPair}`, anyDistinct.worst >= RULES.anyPair, anyDistinct.where),
    item(`色相分散 · ${span}° 内色槽数`, crowding, `≤ ${max}`, crowding <= max),
    ...(danger ? [dangerCheck(colors, danger)] : []),
  ]
}

/** 离开告警色：每个色槽与 danger 各档的正常视觉 ΔE 取最小。 */
function dangerCheck(colors, danger, label = '离开告警色 · 正常视觉 ΔE') {
  const distances = colors.map(c => Math.min(...danger.map(d => deltaEOk(c, d))))
  const worst = Math.min(...distances)
  return item(label, worst, `≥ ${RULES.danger}`, worst >= RULES.danger, `${distances.indexOf(worst) + 1}`)
}

/** 两套分类色板同一色槽同一色相，色槽 1 是品牌色相。 */
export function checkOrder(light, dark, brand) {
  const worst = light.reduce((max, c, i) => Math.max(max, hueDistance(toOklch(c).h, toOklch(dark[i]).h)), 0)
  const first = hueDistance(toOklch(light[0]).h, toOklch(brand).h)
  return [
    item('亮暗同色相', worst, `≤ ${RULES.hueTolerance}°`, light.length === dark.length && worst <= RULES.hueTolerance),
    item('色槽 1 为品牌色相', first, `≤ ${RULES.hueTolerance}°`, first <= RULES.hueTolerance, '1'),
  ]
}

/** 色块内文字色对各自色块的对比度。 */
export function checkOnColors(fills, texts) {
  const ratios = fills.map((fill, i) => contrastRatio(fill, texts[i]))
  const worst = Math.min(...ratios)
  return [item('色块内文字', worst, `≥ ${RULES.onContrast}`, worst >= RULES.onContrast, `${ratios.indexOf(worst) + 1}`)]
}

function singleHue(colors) {
  const chromatic = colors.map(toOklch).filter(x => x.c >= RULES.neutralChroma)
  let worst = 0
  for (const [i, j] of allPairs(chromatic.length))
    worst = Math.max(worst, hueDistance(chromatic[i].h, chromatic[j].h))
  return worst
}

function monotonic(values) {
  const sign = Math.sign(values[1] - values[0])
  return sign !== 0 && values.every((v, i) => i === 0 || Math.sign(v - values[i - 1]) === sign)
}

/** 有序色阶：单色相、明度单调、对承载面由强到弱，最弱一档 ≥ 2:1。 */
export function checkOrdinal(colors, { surface }) {
  const hue = singleHue(colors)
  const ratios = colors.map(c => contrastRatio(c, surface))
  const weakest = Math.min(...ratios)
  const descending = ratios.every((r, i) => i === 0 || r < ratios[i - 1])
  return [
    item('有序 · 单色相', hue, `≤ ${RULES.hueTolerance}°`, hue <= RULES.hueTolerance),
    item('有序 · 明度单调', null, '单调', monotonic(colors.map(c => toOklch(c).l))),
    item('有序 · 由强到弱', null, '逐档递减', descending),
    item('有序 · 最弱一档对比度', weakest, `≥ ${RULES.rampContrast}`, weakest >= RULES.rampContrast, `${ratios.indexOf(weakest) + 1}`),
  ]
}

/** 顺序色阶 start → mid → end：单色相、明度单调，小值贴近表面（对比度逐档递增），终点 ≥ 3:1。 */
export function checkSequential(colors, { surface }) {
  const hue = singleHue(colors)
  const ratios = colors.map(c => contrastRatio(c, surface))
  const ascending = ratios.every((r, i) => i === 0 || r > ratios[i - 1])
  const end = ratios.at(-1)
  return [
    item('顺序 · 单色相', hue, `≤ ${RULES.hueTolerance}°`, hue <= RULES.hueTolerance),
    item('顺序 · 明度单调', null, '单调', monotonic(colors.map(c => toOklch(c).l))),
    item('顺序 · 小值贴近表面', null, '对比度逐档递增', ascending),
    item('顺序 · 终点对比度', end, `≥ ${RULES.contrast}`, end >= RULES.contrast),
  ]
}

/** 发散色阶 negative → center → positive：两臂等档且可分，两端离开告警色，中点是贴着表面的中性色。 */
export function checkDiverging([negative, center, positive], { surface, danger }) {
  const arms = Math.abs(toOklch(negative).l - toOklch(positive).l)
  const ends = Math.min(contrastRatio(negative, surface), contrastRatio(positive, surface))
  const apart = cvdDelta(negative, positive)
  const mid = toOklch(center)
  const midRatio = contrastRatio(center, surface)
  return [
    item('发散 · 两臂等档', arms, `≤ ${RULES.armLightness}`, arms <= RULES.armLightness),
    item('发散 · 两端对比度', ends, `≥ ${RULES.contrast}`, ends >= RULES.contrast),
    item('发散 · 两端色觉障碍 ΔE', apart, `≥ ${RULES.adjacent.cvd}`, apart >= RULES.adjacent.cvd),
    ...(danger ? [dangerCheck([negative, positive], danger, '发散 · 两端离开告警色')] : []),
    item('发散 · 中点中性', mid.c, `< ${RULES.neutralChroma}`, mid.c < RULES.neutralChroma),
    item('发散 · 中点贴近表面', midRatio, `≤ ${RULES.centerContrast}`, midRatio <= RULES.centerContrast),
  ]
}

/** 涨跌：两色都 ≥ 3:1，彼此在色觉障碍模拟下可分；缺省涨取成功色相、跌取危险色相。 */
export function checkRiseFall(rise, fall, { surface, success, danger }) {
  const ratio = Math.min(contrastRatio(rise, surface), contrastRatio(fall, surface))
  const apart = cvdDelta(rise, fall)
  const distinct = deltaEOk(rise, fall)
  const riseHue = hueDistance(toOklch(rise).h, toOklch(success).h)
  const fallHue = hueDistance(toOklch(fall).h, toOklch(danger).h)
  return [
    item('涨跌 · 对比度', ratio, `≥ ${RULES.contrast}`, ratio >= RULES.contrast),
    item('涨跌 · 色觉障碍 ΔE', apart, `≥ ${RULES.adjacent.cvd}`, apart >= RULES.adjacent.cvd),
    item('涨跌 · 正常视觉 ΔE', distinct, `≥ ${RULES.adjacent.distinct}`, distinct >= RULES.adjacent.distinct),
    item('涨跌 · 涨为成功色相', riseHue, `≤ ${RULES.hueTolerance}°`, riseHue <= RULES.hueTolerance),
    item('涨跌 · 跌为危险色相', fallHue, `≤ ${RULES.hueTolerance}°`, fallHue <= RULES.hueTolerance),
  ]
}

/** 「其他」与淡出：都是中性色；「其他」是一个照常可读的系列，淡出比任何色槽都弱。 */
export function checkNeutrals({ other, deemphasis }, categorical, { surface }) {
  const otherLch = toOklch(other)
  const deemLch = toOklch(deemphasis)
  const otherRatio = contrastRatio(other, surface)
  const apart = Math.min(...categorical.map(c => deltaEOk(other, c)))
  const deemRatio = contrastRatio(deemphasis, surface)
  const weakestSlot = Math.min(...categorical.map(c => contrastRatio(c, surface)))
  return [
    item('其他 · 中性', otherLch.c, `< ${RULES.neutralChroma}`, otherLch.c < RULES.neutralChroma),
    item('其他 · 对比度', otherRatio, `≥ ${RULES.contrast}`, otherRatio >= RULES.contrast),
    item('其他 · 与各色槽正常视觉 ΔE', apart, `≥ ${RULES.anyPair}`, apart >= RULES.anyPair),
    item('淡出 · 中性', deemLch.c, `< ${RULES.neutralChroma}`, deemLch.c < RULES.neutralChroma),
    item('淡出 · 弱于各色槽', deemRatio, `< ${weakestSlot.toFixed(2)}`, deemRatio < weakestSlot),
  ]
}

/* ---------- 令牌源 ---------- */

/** 原语颜色树（primitive.json 的 color 与基础色板合成一棵）与基础色板的色相名。 */
export async function loadPrimitiveColors() {
  const primitive = JSON.parse(await readFile(join(TOKENS_DIR, 'primitive.json'), 'utf8')).color
  const palette = JSON.parse(await readFile(join(TOKENS_DIR, 'primitive.palette.json'), 'utf8')).color
  return { colors: { ...primitive, ...palette }, hues: Object.keys(palette) }
}

/** danger 语气的全部档位。 */
export function dangerColors(colors) {
  return Object.entries(colors.danger).filter(([step]) => !step.startsWith('$')).map(([, token]) => parseOklch(token.$value))
}

/** `{color.<族>.<档>}` 引用 → sRGB。 */
export function resolvePrimitive(colors, ref) {
  const hit = /^\{color\.([a-z]+)\.(\d+)\}$/.exec(ref)
  const token = hit && colors[hit[1]]?.[hit[2]]
  if (!token)
    throw new Error(`[chart-palette] 原语引用 ${ref} 不存在`)
  return parseOklch(token.$value)
}

/** 两种模式的承载面：semantic.<模式>.json 的 bg.surface。 */
export async function loadSurfaces(colors) {
  const out = {}
  for (const mode of MODES) {
    const semantic = JSON.parse(await readFile(join(TOKENS_DIR, `semantic.${mode}.json`), 'utf8'))
    out[mode] = resolvePrimitive(colors, semantic.bg.surface.$value)
  }
  return out
}

/* ---------- 搜索 ---------- */

/** 一个色相在一种模式下可用的档位：明度带、彩度下限、对比度与离开告警色逐档筛。 */
function candidates(colors, hue, mode, surface, danger) {
  const out = []
  for (const step of STEPS) {
    const rgb = parseOklch(colors[hue][step].$value)
    const { l, c } = toOklch(rgb)
    const [low, high] = RULES.lightness[mode]
    if (l < low || l > high || c < RULES.chroma || contrastRatio(rgb, surface) < RULES.contrast)
      continue
    if (danger.some(d => deltaEOk(rgb, d) < RULES.danger))
      continue
    out.push({ step, rgb })
  }
  return out
}

/**
 * 分类色板的确定性搜索。节点是（色相, 亮色档, 暗色档），边值是两节点相邻时两种模式、两种色觉障碍下
 * ΔE 的最小值（相邻正常视觉不足 15 记 -1）。深度优先按边值从大到小展开，剪掉不可能胜过当前最优的分支。
 */
export function solveCategorical(colors, palette, surfaces) {
  const hues = palette.filter(name => !(name in EXCLUDED_HUES))
  if (!hues.includes(FIRST_HUE))
    throw new Error(`[chart-palette] 基础色板里没有色槽 1 的色相 ${FIRST_HUE}`)
  const danger = dangerColors(colors)
  const nodes = []
  for (const hue of hues) {
    const light = candidates(colors, hue, 'light', surfaces.light, danger)
    const dark = candidates(colors, hue, 'dark', surfaces.dark, danger)
    for (const l of light) {
      for (const d of dark)
        nodes.push({ hue, light: l, dark: d, angle: { light: toOklch(l.rgb).h, dark: toOklch(d.rgb).h } })
    }
  }
  const n = nodes.length
  const edge = new Float64Array(n * n)
  const anyPair = new Float64Array(n * n)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = nodes[i]
      const b = nodes[j]
      if (a.hue === b.hue) {
        edge[i * n + j] = -1
        anyPair[i * n + j] = -1
        continue
      }
      const distinct = Math.min(deltaEOk(a.light.rgb, b.light.rgb), deltaEOk(a.dark.rgb, b.dark.rgb))
      anyPair[i * n + j] = distinct
      edge[i * n + j] = distinct < RULES.adjacent.distinct ? -1 : Math.min(cvdDelta(a.light.rgb, b.light.rgb), cvdDelta(a.dark.rgb, b.dark.rgb))
    }
  }

  const EPSILON = 1e-9
  let best = { worst: -1, anyPair: -1, sequence: null }
  const sequence = []
  const used = new Set()
  const headOk = () => {
    for (const [i, j] of allPairs(Math.min(RULES.head.slots, sequence.length))) {
      if (edge[sequence[i] * n + sequence[j]] < RULES.head.cvd)
        return false
    }
    return true
  }
  function visit(worst) {
    if (sequence.length === SLOTS) {
      let pairFloor = Number.POSITIVE_INFINITY
      for (const [i, j] of allPairs(SLOTS))
        pairFloor = Math.min(pairFloor, anyPair[sequence[i] * n + sequence[j]])
      if (worst > best.worst + EPSILON || (worst > best.worst - EPSILON && pairFloor > best.anyPair + EPSILON))
        best = { worst, anyPair: pairFloor, sequence: [...sequence] }
      return
    }
    const last = sequence.at(-1)
    const next = []
    for (let j = 0; j < n; j++) {
      if (used.has(nodes[j].hue))
        continue
      const value = Math.min(worst, edge[last * n + j])
      if (value < RULES.adjacent.cvd || value < best.worst - EPSILON)
        continue
      if (sequence.some(i => anyPair[i * n + j] < RULES.anyPair))
        continue
      if (MODES.some(mode => hueCrowding([...sequence.map(i => nodes[i].angle[mode]), nodes[j].angle[mode]]) > RULES.hueCluster.max))
        continue
      next.push([value, j])
    }
    next.sort((a, b) => b[0] - a[0])
    for (const [value, j] of next) {
      if (value < best.worst - EPSILON)
        continue
      sequence.push(j)
      used.add(nodes[j].hue)
      if (sequence.length > RULES.head.slots || headOk())
        visit(value)
      sequence.pop()
      used.delete(nodes[j].hue)
    }
  }
  for (let i = 0; i < n; i++) {
    if (nodes[i].hue !== FIRST_HUE)
      continue
    sequence.push(i)
    used.add(FIRST_HUE)
    visit(Number.POSITIVE_INFINITY)
    sequence.pop()
    used.delete(FIRST_HUE)
  }
  if (!best.sequence)
    throw new Error('[chart-palette] 基础色板上找不到满足全部规则的 8 色排法')
  return {
    worst: best.worst,
    anyPair: best.anyPair,
    slots: best.sequence.map(i => ({ hue: nodes[i].hue, light: nodes[i].light.step, dark: nodes[i].dark.step })),
  }
}

/** 色块内文字色：两个候选里对这块色对比度高的一个。 */
export function pickOnColor(colors, fill) {
  const [first, second] = ON_COLORS.map(ref => ({ ref, ratio: contrastRatio(fill, resolvePrimitive(colors, ref)) }))
  return second.ratio > first.ratio ? second : first
}

/** 搜索结果 → chart.palette.json 的文档。 */
export function paletteDocument(colors, surfaces, solution) {
  const document = {
    $description: `由 build/emit-chart-palette.mjs 从基础色板计算，不要手改；emit-tokens.mjs 把 light / dark 两组并进对应主题的 chart 组。相邻色槽在红色弱、绿色弱模拟下的最小 ΔE ${solution.worst.toFixed(2)}，任意两色正常视觉 ΔE 的最小值 ${solution.anyPair.toFixed(2)}。`,
  }
  for (const mode of MODES) {
    const categorical = {
      $description: '分类色槽：按系列在 series 中的声明顺序分配，隐藏、筛选、排序都不重新分配；不循环，没有第 9 色。',
    }
    const on = {
      $description: '写在对应色块内部的文字色，按对比度在纯白与最深的中性档之间取一个，对色块 ≥ 4.5:1。色块外的文字一律用文字令牌。',
    }
    solution.slots.forEach((slot, i) => {
      const ref = `{color.${slot.hue}.${slot[mode]}}`
      categorical[i + 1] = { $type: 'color', $value: ref }
      const picked = pickOnColor(colors, resolvePrimitive(colors, ref))
      if (picked.ratio < RULES.onContrast)
        throw new Error(`[chart-palette] 色槽 ${i + 1}（${ref}）上两个文字候选都不到 ${RULES.onContrast}:1`)
      on[i + 1] = { $type: 'color', $value: picked.ref }
    })
    document[mode] = { chart: { 'categorical': categorical, 'on-categorical': on } }
  }
  const failures = MODES.flatMap(mode => checkCategorical(
    solution.slots.map(slot => resolvePrimitive(colors, `{color.${slot.hue}.${slot[mode]}}`)),
    { mode, surface: surfaces[mode], danger: dangerColors(colors) },
  ).filter(check => !check.pass).map(check => `${mode} ${check.label}`))
  if (failures.length > 0)
    throw new Error(`[chart-palette] 搜索结果没过检查：${failures.join('、')}`)
  return document
}

async function main() {
  const { colors, hues } = await loadPrimitiveColors()
  const surfaces = await loadSurfaces(colors)
  const solution = solveCategorical(colors, hues, surfaces)
  await writeFile(OUT, `${JSON.stringify(paletteDocument(colors, surfaces, solution), null, 2)}\n`)
  const order = solution.slots.map(slot => `${slot.hue} ${slot.light}/${slot.dark}`).join(' · ')
  console.log(`[emit-chart-palette] ${order} · 相邻色觉 ΔE ${solution.worst.toFixed(2)} · 任意两色 ΔE ${solution.anyPair.toFixed(2)} → chart.palette.json`)
}

// 被门禁与测试当模块引时只取检查与搜索，不落盘；直接跑才写文件。
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  main()
