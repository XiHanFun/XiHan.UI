#!/usr/bin/env node
// 读 tokens/palette.seeds.json（十二个色相角）→ 按品牌曲线派生每个色相的 11 档 → 写 tokens/primitive.palette.json。
//
// 曲线与 src/runtime/brand.ts 的 BASE_L / BASE_C 逐值同源（tests/palette.spec.ts 拿 color.brand 与运行时的
// deriveBrandScale 逐档核对，两处漂移就红）：明度逐档与 color.brand 同值，彩度取基线彩度在该明度、该色相下
// 收进 sRGB 色域的最大值。同一档跨色相同一明度，换色相不改对比度。
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const TOKENS_DIR = join(ROOT, 'tokens')
const SEEDS = join(TOKENS_DIR, 'palette.seeds.json')
const OUT = join(TOKENS_DIR, 'primitive.palette.json')

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

/* 基线品牌曲线，与 src/runtime/brand.ts 逐值一致。 */
const BASE_L = { 50: 0.971, 100: 0.936, 200: 0.885, 300: 0.809, 400: 0.702, 500: 0.623, 600: 0.546, 700: 0.488, 800: 0.424, 900: 0.379, 950: 0.282 }
const BASE_C = { 50: 0.014, 100: 0.032, 200: 0.062, 300: 0.105, 400: 0.165, 500: 0.214, 600: 0.216, 700: 0.196, 800: 0.164, 900: 0.132, 950: 0.089 }
const GAMUT_EPS = 0.05

/** OKLCH → 线性 sRGB，不截断（CSS Color 4 / Ottosson 矩阵）。 */
function oklchToLinearRgb(l, c, h) {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)
  const l3 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m3 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s3 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ]
}

function inSrgbGamut(l, c, h) {
  return oklchToLinearRgb(l, c, h).every(v => v >= -GAMUT_EPS && v <= 1 + GAMUT_EPS)
}

/** 固定 L 与 H，把 C 收到 sRGB 色域内的最大可用值；与运行时 clampChroma 同一二分。 */
function clampChroma(l, c, h) {
  if (inSrgbGamut(l, c, h))
    return c
  let lo = 0
  let hi = c
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2
    if (inSrgbGamut(l, mid, h))
      lo = mid
    else hi = mid
  }
  return lo
}

const fmt = (n, digits) => String(Number(n.toFixed(digits)))
/** 彩度只往小了取整：二分找到的是色域内的最大值，四舍五入往上一跳就出界。 */
const fmtChroma = c => String(Math.floor(c * 1000 + 1e-9) / 1000)

/**
 * 一个色相的 11 档：明度与彩度逐档取基线，彩度再按该档明度、该色相收进 sRGB 色域。
 * 不像 deriveBrandScale 那样按种子彩度等比缩放：种子是色相角而不是一枚颜色，黄、青这类在中档
 * 装不下基线彩度的色相，浅档仍取得到基线的鲜度。色相 258 与 color.brand 逐值一致。
 */
export function derivePalette(hue) {
  const out = {}
  for (const step of STEPS)
    out[step] = `oklch(${fmt(BASE_L[step], 3)} ${fmtChroma(clampChroma(BASE_L[step], BASE_C[step], hue))} ${fmt(hue, 2)})`
  return out
}

async function main() {
  const seeds = JSON.parse(await readFile(SEEDS, 'utf8'))
  const color = {}
  for (const [name, seed] of Object.entries(seeds)) {
    if (name.startsWith('$'))
      continue
    if (!/^[a-z]+$/.test(name) || typeof seed?.hue !== 'number' || seed.hue < 0 || seed.hue >= 360)
      throw new Error(`[emit-palette] 种子 ${name} 不合法：名字只许小写字母，hue 是 [0, 360) 的数`)
    const scale = derivePalette(seed.hue)
    color[name] = { $description: `基础色板 ${name}（色相 ${seed.hue}）：11 档由 build/emit-palette.mjs 按品牌曲线派生，改种子请改 palette.seeds.json。` }
    for (const step of STEPS)
      color[name][step] = { $type: 'color', $value: scale[step] }
  }
  const document = {
    $description: '由 build/emit-palette.mjs 从 palette.seeds.json 生成，不要手改。基础色板：十二个色相 × 11 档，明度逐档与 color.brand 同值。',
    color,
  }
  await writeFile(OUT, `${JSON.stringify(document, null, 2)}\n`)
  console.log(`[emit-palette] ${Object.keys(color).length} 个色相 × ${STEPS.length} 档 → primitive.palette.json`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  await main()
