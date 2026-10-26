#!/usr/bin/env node
// 读 tokens/brand.presets.json（预设 id → 基础色板的色相名）与 palette.seeds.json（色相角）→ 派生每档预设的 11 档品牌原语
// → 写 tokens/primitive.brand-presets.json。
//
// 每档的目标是基线品牌曲线（基础色板色相 258 的 indigo，即原缺省品牌）那一档的 WCAG 相对亮度：彩度取基线彩度、按候选
// 明度收进 sRGB 色域，二分明度直到相对亮度对上。基础色板按明度对齐，绿、青这类色相同一明度下相对亮度偏高，白字压 600 档
// 到不了 4.5；按相对亮度对齐之后，语义层与语气层在缺省品牌上成立的每一对对比度，对每一档预设同样成立。
//
// 缺省品牌（primitive.json 的 color.brand，色相 DEFAULT_BRAND_HUE = 277）同样是这条基线上派生的一档，tests/brand-presets.spec.ts
// 守着两边逐值一致。预设对齐的是基线而不是 color.brand：color.brand 的明度已经取整到三位，拿它当目标再反求一遍会让
// 各档预设漂 0.001；对齐基线时 indigo 预设逐值就是原缺省品牌。
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BASE_C, BASE_HUE, clampChroma, derivePalette, fmt, fmtChroma, oklchToLinearRgb, STEPS } from './emit-palette.mjs'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const TOKENS_DIR = join(ROOT, 'tokens')
const PRESETS = join(TOKENS_DIR, 'brand.presets.json')
const SEEDS = join(TOKENS_DIR, 'palette.seeds.json')
const OUT = join(TOKENS_DIR, 'primitive.brand-presets.json')

const PRESET_ID = /^[a-z][a-z0-9-]*$/

/** 缺省品牌的色相：靛蓝。各档明度按基线曲线的相对亮度反求，写在 primitive.json 的 color.brand 里。 */
export const DEFAULT_BRAND_HUE = 277

/** 相对亮度的目标：基线品牌曲线（色相 BASE_HUE 那一族）的 11 档。 */
export function baselineScale() {
  return derivePalette(BASE_HUE)
}

/** WCAG 相对亮度：分量先截进 [0,1]，与浏览器把出界的 oklch 裁进 sRGB 一致。 */
export function relativeLuminance(l, c, h) {
  const [r, g, b] = oklchToLinearRgb(l, c, h).map(v => Math.min(1, Math.max(0, v)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function parseOklch(css) {
  const m = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(css)
  if (!m)
    throw new Error(`[emit-brand-presets] 不是 oklch(L C H)：${css}`)
  return { l: Number(m[1]), c: Number(m[2]), h: Number(m[3]) }
}

/** 某色相上相对亮度等于 target 的那一档：明度二分，彩度取 baseC 按明度收进色域。 */
function solveStep(target, baseC, hue) {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (relativeLuminance(mid, clampChroma(mid, baseC, hue), hue) < target)
      lo = mid
    else hi = mid
  }
  const l = Number(fmt((lo + hi) / 2, 3))
  return `oklch(${fmt(l, 3)} ${fmtChroma(clampChroma(l, baseC, hue))} ${fmt(hue, 2)})`
}

/**
 * 一个色相上的品牌梯度：11 档的相对亮度逐档对齐 base。base 是基线品牌曲线的 11 档 oklch 字面量（baselineScale()）。
 * 色相取基线的那一个时，得到的就是基线本身（明度与彩度逐值一致）；缺省品牌就是 DEFAULT_BRAND_HUE 上的这一套。
 */
export function deriveBrandPreset(hue, base) {
  const out = {}
  for (const step of STEPS) {
    const { l, c, h } = parseOklch(base[step])
    out[step] = solveStep(relativeLuminance(l, c, h), BASE_C[step], hue)
  }
  return out
}

async function main() {
  const presets = JSON.parse(await readFile(PRESETS, 'utf8'))
  const seeds = JSON.parse(await readFile(SEEDS, 'utf8'))
  const base = baselineScale()
  const out = {}
  for (const [id, preset] of Object.entries(presets)) {
    if (id.startsWith('$'))
      continue
    if (!PRESET_ID.test(id))
      throw new Error(`[emit-brand-presets] 预设 id ${id} 不合法：小写字母开头、小写字母 / 数字 / 连字符组成`)
    const seed = seeds[preset?.palette]
    if (typeof seed?.hue !== 'number')
      throw new Error(`[emit-brand-presets] 预设 ${id} 的 palette 「${preset?.palette}」不在 palette.seeds.json 里`)
    const scale = deriveBrandPreset(seed.hue, base)
    out[id] = { $description: `预设品牌 ${id}（基础色板 ${preset.palette}，色相 ${seed.hue}）：11 档由 build/emit-brand-presets.mjs 按基线品牌曲线的相对亮度派生，改预设请改 brand.presets.json。` }
    for (const step of STEPS)
      out[id][step] = { $type: 'color', $value: scale[step] }
  }
  const document = {
    $description: '由 build/emit-brand-presets.mjs 从 brand.presets.json 生成，不要手改。预设品牌：每档 × 11 级，相对亮度逐级与基线品牌曲线（色相 258）一致，与缺省品牌 color.brand 同一做法。',
    brandPresets: out,
  }
  await writeFile(OUT, `${JSON.stringify(document, null, 2)}\n`)
  console.log(`[emit-brand-presets] ${Object.keys(out).length} 档预设品牌 × ${STEPS.length} 级 → primitive.brand-presets.json`)
}

// 被 tests/brand-presets.spec.ts 当模块引时只取派生函数，不落盘；直接跑才写文件。
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  main()
