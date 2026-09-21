// 消费方产物形态：一个只 `import '@xihan-ui/styles'` 的最小消费方，打出来的 CSS 里
// Family Recipe 只能出现一次，而且要排在第一条皮肤规则之前。
//
// 为什么盯这两件事：配方与皮肤同在 xihan.components 层，同层里只剩特指度与源序竞争。
// 每份皮肤（css/*.css）文件头都各自 `@import '../family/xxx.css'`，index.css 再逐个引皮肤——
// 消费方的打包器若不去重 @import（Tailwind v4 的 @tailwindcss/vite 自带内联器就不去重），
// 家族就被内联 65 份，且有副本排在 table.css 之后：家族粗指针热区
// `[data-xh-action-control]:is([data-xh-action-profile='row'], …)::after` 与皮肤里想压掉它的
// `[data-scope='table'][data-part='sort-trigger']::after` 同为 (0,2,1)，后出现的副本反超，
// 手机上表头排序箭头被撑成整格。
//
// 两条路一起量：
//   1. 真实 Vite（library 模式，postcss 路径）——它会去重，用来钉「配方先于第一条皮肤规则」
//      并记录产物体积基线；
//   2. 不去重的逐层展开（与 @tailwindcss/vite 的内联行为一致，与 BasicApp 生产产物里的
//      65 份对得上）——用来钉「引用图里家族只被引一次」，这是与打包器无关的形态契约。
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

/** 家族根规则：配方文件里第一条规则的选择器，每份副本恰好带一条。 */
const FAMILY_ROOT = '[data-xh-action-control]'
/** 家族粗指针热区：table.css 想用同特指度压掉的那条，副本排在它之后就反超。 */
const FAMILY_COARSE_HIT = '[data-xh-action-control]:is([data-xh-action-profile=text],[data-xh-action-profile=row],[data-xh-action-profile=disclosure-trigger]):after'
/** 皮肤规则：以 [data-scope 开头的顶层选择器。focus.css / label.css 这些公共层也是皮肤。 */
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
  it('真实 Vite 构建：家族粗指针热区只出现一次，家族根规则排在第一条皮肤规则之前', async () => {
    const css = await bundleWithVite({ minify: false })
    const minified = await bundleWithVite({ minify: true })
    const selectors = selectorsOf(css)
    // 体积基线：改形态前后对比用，随断言一起打印
    console.info(`[consumer-css-bundle] vite 产物 ${Buffer.byteLength(css)} B（未压缩）/ ${Buffer.byteLength(minified)} B（压缩）`)

    expect(countSelector(selectors, FAMILY_COARSE_HIT)).toBe(1)
    expect(countSelector(selectorsOf(minified), FAMILY_COARSE_HIT)).toBe(1)

    const family = firstIndex(selectors, selector => selector === FAMILY_ROOT)
    const skin = firstIndex(selectors, selector => SKIN_RULE.test(selector))
    expect(family).toBeGreaterThan(-1)
    expect(skin).toBeGreaterThan(-1)
    expect(family).toBeLessThan(skin)
  }, BUILD_TIMEOUT)

  it('不去重内联（@tailwindcss/vite 的行为）：index.css 的引用图里家族只被引一次', async () => {
    const css = await expandWithoutDedupe(join(STYLES_ROOT, 'index.css'))
    const selectors = selectorsOf(css)
    const copies = countSelector(selectors, FAMILY_COARSE_HIT)
    console.info(`[consumer-css-bundle] 不去重展开 ${Buffer.byteLength(css)} B，家族粗指针热区 ${copies} 份`)

    expect(copies).toBe(1)
    const family = firstIndex(selectors, selector => selector === FAMILY_ROOT)
    const skin = firstIndex(selectors, selector => SKIN_RULE.test(selector))
    expect(family).toBeLessThan(skin)
  }, BUILD_TIMEOUT)
})
