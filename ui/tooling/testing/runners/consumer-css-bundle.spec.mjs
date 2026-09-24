// 消费方产物形态：一个只 `import '@xihan-ui/styles'` 的最小消费方，打出来的 CSS 里
// Family Recipe 只能出现一次，且落在四份公共层（focus / label / description / pointer）之后、
// 第一条组件皮肤规则之前——与 tooling/scripts/tokens/check-layer-order.mjs 守的是同一契约。
//
// 为什么盯这三件事：配方、公共层与皮肤同在 xihan.components 层，同层里只剩特指度与源序竞争。
//   - 皮肤对配方物理属性的覆盖只有配方先出现才成立：家族粗指针热区曾与皮肤里想压掉它的
//     `[data-scope='table'][data-part='sort-trigger']::after` 同为 (0,2,1)，排在皮肤之后的
//     副本反超，手机上表头排序箭头被撑成整格。
//   - 配方对公共层的覆盖只有公共层先出现才成立：field-chrome 把内嵌 input 的聚焦环置 none
//     与 focus.css 的公共环同为 (0,3,0)，家族排在 focus.css 之前 input 就多画一圈。
//   - 主入口 index.css 是生成的扁平文件，家族在源入口标出的内联点只内联一次，各皮肤剥掉自带的
//     family @import；此前每份皮肤各自 @import 家族，不去重 @import 的打包器（@tailwindcss/vite
//     自带内联器就不去重）把家族内联 65 份。
//
// 两条路一起量：
//   1. 真实 Vite（library 模式，postcss 路径）——它会去重，用来钉真实打包后的位置关系并记录
//      产物体积基线；
//   2. 不去重的逐层展开（与 @tailwindcss/vite 的内联行为一致，与 BasicApp 生产产物里的
//      65 份对得上）——用来钉「引用图里家族只被引一次」，这是与打包器无关的形态契约。
//
// 位置关系按样式规则的选择器序判定，不依赖注释是否被打包器保留：公共层的每条选择器在产物里的
// 首次出现（皮肤可以照抄同一条选择器来压过公共层，但首次出现的一定是公共层那份）都要在家族根
// 规则之前；家族根规则要在第一条不属于公共层的 [data-scope 规则之前。
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'

const UI_ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const STYLES_ROOT = join(UI_ROOT, 'packages/design/styles')
const FIXTURE_ROOT = join(import.meta.dirname, 'fixtures/consumer-css')
/** 一次 Vite 构建要读百余份皮肤，显式给超时，不依赖 vitest 默认 5s。 */
const BUILD_TIMEOUT = 60_000

/** 家族根规则：配方文件里第一条规则的选择器（forced-colors 里还有一条同选择器的变体，只看首次出现）。 */
const FAMILY_ROOT = '[data-xh-action-control]'
/** 家族粗指针热区：由 :where() 包住的 (0,0,1)，皮肤的覆盖靠特指度就赢；这里只数它出现几份。 */
const FAMILY_COARSE_HIT = ':where([data-xh-action-control]:is([data-xh-action-profile=text],[data-xh-action-profile=row],[data-xh-action-profile=disclosure-trigger])):after'
/** 排在家族之前的公共层，与 check-layer-order 的 PUBLIC_LAYERS 一致。 */
const PUBLIC_LAYERS = ['focus.css', 'label.css', 'description.css', 'pointer.css']
/** 组件皮肤规则：以 [data-scope 开头、且不是公共层里那条的顶层选择器。 */
const SKIN_RULE = /^\[data-scope\b/

/** 去引号、去空白、`::after` 归一到 `:after`：minify 与否、单双引号都比得出同一条选择器。 */
function normalizeSelector(selector) {
  return selector.replace(/["']/g, '').replace(/\s+/g, '').replace(/::/g, ':')
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * 顺序扫出全部样式规则的选择器（不含 @ 规则头），按出现位置排列。
 * 一个 `{` 前面、上一个 `{` / `}` / `;` 之后的那段文字就是选择器。
 */
function selectorsOf(css) {
  const out = []
  const source = stripComments(css)
  let last = 0
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]
    if (ch === '{') {
      const raw = source.slice(last, i).trim()
      last = i + 1
      if (raw && !raw.startsWith('@'))
        out.push({ selector: normalizeSelector(raw), index: i })
    }
    else if (ch === '}' || ch === ';') {
      last = i + 1
    }
  }
  return out
}

function countSelector(selectors, target) {
  return selectors.filter(entry => entry.selector === target).length
}

function firstIndex(selectors, predicate) {
  const hit = selectors.find(entry => predicate(entry.selector))
  return hit ? hit.index : -1
}

/** 读四份公共层源文件，按文件收集各自的全部选择器（归一化后）。 */
async function publicLayerSelectors() {
  const out = new Map()
  for (const name of PUBLIC_LAYERS) {
    const css = await readFile(join(STYLES_ROOT, 'css', name), 'utf8')
    out.set(name, selectorsOf(css).map(entry => entry.selector))
  }
  return out
}

/**
 * 与 check-layer-order 同一契约：四份公共层的每条规则都在家族根规则之前，第一条组件皮肤规则在它之后。
 * 家族只有一份由调用方先按粗指针热区数好。
 */
async function expectFamilyBetweenPublicLayersAndSkins(selectors) {
  const publicLayers = await publicLayerSelectors()
  const publicSet = new Set([...publicLayers.values()].flat())

  const family = firstIndex(selectors, selector => selector === FAMILY_ROOT)
  expect(family, `家族根规则 ${FAMILY_ROOT} 应出现在产物里`).toBeGreaterThan(-1)

  for (const [name, list] of publicLayers) {
    expect(list.length, `${name} 里应有样式规则`).toBeGreaterThan(0)
    for (const selector of list) {
      const at = firstIndex(selectors, candidate => candidate === selector)
      expect(at, `公共层 ${name} 的 \`${selector}\` 应出现在产物里`).toBeGreaterThan(-1)
      expect(at, `公共层 ${name} 的 \`${selector}\` 应排在家族根规则之前——配方对公共层的同特指度覆盖只有公共层先出现才成立`).toBeLessThan(family)
    }
  }

  const skin = firstIndex(selectors, selector => SKIN_RULE.test(selector) && !publicSet.has(selector))
  expect(skin, '产物里应有组件皮肤规则').toBeGreaterThan(-1)
  expect(family, '家族根规则应排在第一条组件皮肤规则之前——皮肤对配方的同特指度覆盖只有配方先出现才成立').toBeLessThan(skin)
}

/** 最小消费方跑一次真实 Vite 构建，拿回产出的那一份 CSS。 */
async function bundleWithVite({ minify }) {
  const result = await build({
    root: FIXTURE_ROOT,
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      cssMinify: minify,
      lib: { entry: join(FIXTURE_ROOT, 'index.js'), formats: ['es'], fileName: 'index' },
    },
  })
  const outputs = Array.isArray(result) ? result : [result]
  const asset = outputs.flatMap(bundle => bundle.output).find(chunk => chunk.type === 'asset' && chunk.fileName.endsWith('.css'))
  if (!asset)
    throw new Error('Vite 构建没有产出 CSS')
  return String(asset.source)
}

/**
 * 不去重地逐层展开相对 @import：每遇到一条就把目标文件整份贴进来，同一文件被引几次就贴几次。
 * 这正是 @tailwindcss/vite 自带内联器的行为；包外的 @import（令牌）原样保留。
 */
async function expandWithoutDedupe(file) {
  const source = await readFile(file, 'utf8')
  const lines = []
  for (const line of source.split('\n')) {
    const imported = line.match(/^\s*@import\s+['"]([^'"]+)['"]\s*;/)
    if (!imported || !imported[1].startsWith('.')) {
      lines.push(line)
      continue
    }
    lines.push(await expandWithoutDedupe(resolve(dirname(file), imported[1])))
  }
  return lines.join('\n')
}

describe('消费方产物里的家族形态', () => {
  it('真实 Vite 构建：家族粗指针热区只出现一次，家族落在四份公共层之后、第一条组件皮肤规则之前', async () => {
    const css = await bundleWithVite({ minify: false })
    const minified = await bundleWithVite({ minify: true })
    const selectors = selectorsOf(css)
    // 体积基线：改形态前后对比用，随断言一起打印
    console.info(`[consumer-css-bundle] vite 产物 ${Buffer.byteLength(css)} B（未压缩）/ ${Buffer.byteLength(minified)} B（压缩）`)

    expect(countSelector(selectors, FAMILY_COARSE_HIT)).toBe(1)
    expect(countSelector(selectorsOf(minified), FAMILY_COARSE_HIT)).toBe(1)
    await expectFamilyBetweenPublicLayersAndSkins(selectors)
  }, BUILD_TIMEOUT)

  it('不去重内联（@tailwindcss/vite 的行为）：index.css 的引用图里家族只被引一次，位置同上', async () => {
    const css = await expandWithoutDedupe(join(STYLES_ROOT, 'index.css'))
    const selectors = selectorsOf(css)
    const copies = countSelector(selectors, FAMILY_COARSE_HIT)
    console.info(`[consumer-css-bundle] 不去重展开 ${Buffer.byteLength(css)} B，家族粗指针热区 ${copies} 份`)

    expect(copies).toBe(1)
    await expectFamilyBetweenPublicLayersAndSkins(selectors)
  }, BUILD_TIMEOUT)
})
