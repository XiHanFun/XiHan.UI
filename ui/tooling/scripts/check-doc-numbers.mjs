#!/usr/bin/env node
// 门禁：README 与文档站正文里写死的数字，逐条与代码里的真值对账。
//
// 表里一条 = 一个文件 · 一条带捕获组的正则 · 一个返回真值的函数。正则在文件里命中几处就
// 校几处，任何一处对不上都判失败，并打印「文件:行 · 文档写 X · 实际 Y · 怎么数出来的」。
// 命中零处也判失败：正文改写过、正则没跟着改，等于这条数字从此无人看管。
//
// 刻意的约数（「约 66 kB」「留一成余量」这类）登记进 APPROX，登记项在文件里也必须仍能命中。
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const repoRoot = join(uiRoot, '..')

const HEADLESS = join(uiRoot, 'packages/engine/headless/src')
const SKIN_CSS = join(uiRoot, 'packages/design/styles/css')

const read = path => readFile(join(uiRoot, path), 'utf8')
const readRepo = path => readFile(join(repoRoot, path), 'utf8')

/** 目录下形如 <name>/<name>.<suffix> 的组件目录名。 */
async function componentDirs(suffix) {
  const dirs = (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name)
  const out = []
  for (const name of dirs) {
    try {
      await readFile(join(HEADLESS, name, `${name}.${suffix}`), 'utf8')
      out.push(name)
    }
    catch {}
  }
  return out.sort()
}

/** 数组字面量 `const NAME = [ '…', '…' ]` 里的字符串条目数。 */
function countStringLiterals(source, constName) {
  const start = source.search(new RegExp(`^(?:export )?const ${constName}\\b`, 'm'))
  if (start === -1)
    throw new Error(`源码里找不到 ${constName}`)
  const open = source.indexOf('[', source.indexOf('=', start))
  const close = source.indexOf(']', open)
  return (source.slice(open, close).match(/'[^']+'/g) ?? []).length
}

/** 对象字面量 `const NAME: … = { … }` 的顶层键数（键一律缩进两格）。 */
function countTopLevelKeys(source, constName) {
  const start = source.search(new RegExp(`^const ${constName}\\b.*\\{$`, 'm'))
  if (start === -1)
    throw new Error(`源码里找不到 ${constName}`)
  const lines = source.slice(start).split('\n')
  let n = 0
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '}')
      break
    if (/^ {2}'?[\w-]+'?: /.test(lines[i]))
      n++
  }
  return n
}

const cache = new Map()
const once = (key, fn) => (cache.has(key) ? cache.get(key) : (cache.set(key, fn()), cache.get(key)))

// —— 真值取法。每一条都带一句「怎么数出来的」，失败信息里原样打出去。——

const truth = {
  全局令牌数: {
    how: 'packages/design/tokens/tokens.json 的键数（原语层 + 语义层）',
    async value() {
      const raw = await read('packages/design/tokens/tokens.json')
      return Object.keys(JSON.parse(raw)).length
    },
  },
  组件数加一: {
    how: '组件数 + 1（政策页里「新增第 N 个组件是 minor」的那个 N）',
    async value() {
      return (await once('anatomy', () => componentDirs('anatomy.ts'))).length + 1
    },
  },
  组件数: {
    how: 'packages/engine/headless/src 下带 <name>.anatomy.ts 的目录数',
    async value() {
      return (await once('anatomy', () => componentDirs('anatomy.ts'))).length
    },
  },
  键盘规格条数: {
    how: '全部 <name>.keyboard.ts 里 id 行的总数',
    async value() {
      const names = await once('kbd', () => componentDirs('keyboard.ts'))
      let n = 0
      for (const name of names) {
        const src = await readFile(join(HEADLESS, name, `${name}.keyboard.ts`), 'utf8')
        n += (src.match(/\bid: '[^']*\.kbd\.[^']*'/g) ?? []).length
      }
      return n
    },
  },
  gate串里的结构检查数: {
    how: 'package.json 的 gate 串里出现的 check-*.mjs 去重后条数',
    async value() {
      const pkg = JSON.parse(await read('package.json'))
      return new Set(pkg.scripts.gate.match(/check-[a-z-]+\.mjs/g) ?? []).size
    },
  },
  单独的gate脚本数: {
    how: 'package.json 里 gate: 开头的脚本条目数',
    async value() {
      const pkg = JSON.parse(await read('package.json'))
      return Object.keys(pkg.scripts).filter(k => k.startsWith('gate:')).length
    },
  },
  体积预算条数: {
    how: '.size-limit.json 的条目数',
    async value() {
      return JSON.parse(await read('.size-limit.json')).length
    },
  },
  皮肤份数: {
    how: 'packages/design/styles/css 下的 .css 文件数',
    async value() {
      return (await readdir(SKIN_CSS)).filter(f => f.endsWith('.css')).length
    },
  },
  组件皮肤份数: {
    how: '皮肤文件名与组件目录名对得上的那些',
    async value() {
      const comps = new Set(await once('anatomy', () => componentDirs('anatomy.ts')))
      const files = (await readdir(SKIN_CSS)).filter(f => f.endsWith('.css'))
      return files.filter(f => comps.has(f.slice(0, -4))).length
    },
  },
  共享皮肤份数: {
    how: '皮肤文件总数减去与组件同名的那些',
    async value() {
      return (await truth.皮肤份数.value()) - (await truth.组件皮肤份数.value())
    },
  },
  自定义元素数: {
    how: 'packages/adapters/web-components/src/define.ts 里 defineElement( 的次数',
    async value() {
      const src = await read('packages/adapters/web-components/src/define.ts')
      return (src.match(/defineElement\(/g) ?? []).length
    },
  },
  CEM元素数: {
    how: 'custom-elements.json 里带 tagName 的声明数',
    async value() {
      const cem = JSON.parse(await read('packages/adapters/web-components/custom-elements.json'))
      return cem.modules.flatMap(m => m.declarations ?? []).filter(d => d.tagName).length
    },
  },
  当前版本: {
    how: 'packages/adapters/vue/package.json 的 version（17 个库包由 changesets 的 fixed 组锁步同版）',
    async value() {
      const raw = await read('packages/adapters/vue/package.json')
      return JSON.parse(raw).version
    },
  },
  公开包数: {
    how: 'packages/*/* 里 private 不为 true 的 package.json 数',
    async value() {
      let n = 0
      for (const group of (await readdir(join(uiRoot, 'packages'), { withFileTypes: true })).filter(d => d.isDirectory())) {
        for (const pkg of await readdir(join(uiRoot, 'packages', group.name))) {
          try {
            if (!JSON.parse(await read(`packages/${group.name}/${pkg}/package.json`)).private)
              n++
          }
          catch {}
        }
      }
      return n
    },
  },
  仅主入口的包数: {
    how: 'package.json 的 exports 里除 . 与 ./package.json 外没有别的键的公开包数',
    async value() {
      let n = 0
      for (const group of (await readdir(join(uiRoot, 'packages'), { withFileTypes: true })).filter(d => d.isDirectory())) {
        for (const pkg of await readdir(join(uiRoot, 'packages', group.name))) {
          try {
            const p = JSON.parse(await read(`packages/${group.name}/${pkg}/package.json`))
            if (p.private)
              continue
            const keys = Object.keys(p.exports ?? {}).filter(k => k !== '.' && k !== './package.json')
            if (keys.length === 0)
              n++
          }
          catch {}
        }
      }
      return n
    },
  },
  Vue导出组件数: {
    how: 'packages/adapters/vue/src/index.ts 的值导出里 Xh 开头的去重条数',
    async value() {
      const src = await read('packages/adapters/vue/src/index.ts')
      const names = new Set()
      for (const block of src.matchAll(/^export\s+\{([\s\S]*?)\}\s+from/gm)) {
        for (const raw of block[1].split(',')) {
          const name = raw.trim().split(/\s+as\s+/).pop()?.trim()
          if (name && /^Xh[A-Z]/.test(name))
            names.add(name)
        }
      }
      return names.size
    },
  },
  表单字段组件数: {
    how: '<name>.types.ts 的 props 里带 name?: string 的组件数',
    async value() {
      const names = await once('anatomy', () => componentDirs('anatomy.ts'))
      let n = 0
      for (const name of names) {
        const src = await readFile(join(HEADLESS, name, `${name}.types.ts`), 'utf8').catch(() => '')
        if (/^\s{4}name\?: string/m.test(src))
          n++
      }
      return n
    },
  },
  首方图标数: {
    how: 'packages/design/icons/src/svg 下的 .svg 文件数',
    async value() {
      return (await readdir(join(uiRoot, 'packages/design/icons/src/svg'))).filter(f => f.endsWith('.svg')).length
    },
  },
  内置背景效果数: {
    how: 'backgrounds 的 BUILTIN_EFFECT_NAMES 条目数',
    async value() {
      return countStringLiterals(await read('packages/features/backgrounds/src/effects/builtin-names.ts'), 'BUILTIN_EFFECT_NAMES')
    },
  },
  内置音效语义数: {
    how: 'sound 的 BUILTIN_SOUND_NAMES 条目数',
    async value() {
      return countStringLiterals(await read('packages/features/sound/src/types.ts'), 'BUILTIN_SOUND_NAMES')
    },
  },
  进场预设数: {
    how: 'animations 的 presets.ts 里 enter 对象的顶层键数',
    async value() {
      return countTopLevelKeys(await read('packages/features/animations/src/presets.ts'), 'enter')
    },
  },
  注意预设数: {
    how: 'animations 的 presets.ts 里 attention 对象的顶层键数',
    async value() {
      return countTopLevelKeys(await read('packages/features/animations/src/presets.ts'), 'attention')
    },
  },
  品牌原语档数: {
    how: 'tokens 运行时的 BRAND_STEPS 条目数',
    async value() {
      return countStringLiterals(await read('packages/design/tokens/src/runtime/brand.ts'), 'BRAND_STEPS')
    },
  },
  placement取值数: {
    how: 'kernel 的 Side × Align 组合数（center 写成无后缀）',
    async value() {
      const src = await read('packages/engine/kernel/src/types/position.ts')
      const sides = (src.match(/export type Side = ([^\n]+)/)?.[1].match(/'[^']+'/g) ?? []).length
      const aligns = (src.match(/export type Align = ([^\n]+)/)?.[1].match(/'[^']+'/g) ?? []).length
      return sides * aligns
    },
  },
  CommonMark用例总数: {
    how: 'markdown 的 commonmark-baseline.json 各节 total 之和',
    async value() {
      const base = JSON.parse(await read('packages/features/markdown/tests/commonmark-baseline.json'))
      return Object.values(base).reduce((a, s) => a + s.total, 0)
    },
  },
  CommonMark通过数: {
    how: 'markdown 的 commonmark-baseline.json 各节 pass 之和',
    async value() {
      const base = JSON.parse(await read('packages/features/markdown/tests/commonmark-baseline.json'))
      return Object.values(base).reduce((a, s) => a + s.pass, 0)
    },
  },
  摘掉HTML两节的用例数: {
    how: 'commonmark-baseline.json 的 total 之和减去 HTML blocks 与 Raw HTML 两节',
    async value() {
      const base = JSON.parse(await read('packages/features/markdown/tests/commonmark-baseline.json'))
      const all = Object.values(base).reduce((a, s) => a + s.total, 0)
      return all - base['HTML blocks'].total - base['Raw HTML'].total
    },
  },
  摘掉HTML两节的通过数: {
    how: 'commonmark-baseline.json 的 pass 之和减去 HTML blocks 与 Raw HTML 两节',
    async value() {
      const base = JSON.parse(await read('packages/features/markdown/tests/commonmark-baseline.json'))
      const all = Object.values(base).reduce((a, s) => a + s.pass, 0)
      return all - base['HTML blocks'].pass - base['Raw HTML'].pass
    },
  },
  轻提示同屏上限: {
    how: 'vue 的 toast-service.ts 里 useToaster 的 max',
    async value() {
      const src = await read('packages/adapters/vue/src/services/toast-service.ts')
      return Number(src.match(/useToaster\(\{[^}]*\bmax:\s*(\d+)/)[1])
    },
  },
}

// —— 登记表：文件 · 正则（一个捕获组）· 真值。——

const CN_DIGITS = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }

/** 阿拉伯数字或百以内的中文数字 → number。 */
function parseCount(text) {
  if (/^\d+$/.test(text))
    return Number(text)
  const s = text.trim()
  if (!s.includes('十'))
    return CN_DIGITS[s] ?? Number.NaN
  const [high, low] = s.split('十')
  const tens = high === '' ? 1 : (CN_DIGITS[high] ?? Number.NaN)
  const ones = low === '' ? 0 : (CN_DIGITS[low] ?? Number.NaN)
  return tens * 10 + ones
}

const TABLE = [
  // 发版当天最容易漏的一批：正文里「当前版本是 X」的陈述
  ['README.md', /npm 上是 `([\w.-]+)` \*\*预发布版\*\*/, '当前版本'],
  ['README.md', /当前版本 `([\w.-]+)`（`latest`/, '当前版本'],
  ['docs/index.md', /库包已发布到 npm，当前版本 `([\w.-]+)`/, '当前版本'],
  ['docs/introduction.md', /已发布到 npm，当前版本 `([\w.-]+)`/, '当前版本'],
  ['docs/installation.md', /都已发布到 npm，当前版本 `([\w.-]+)`/, '当前版本'],
  ['docs/faq.md', /库包已发布到 npm，当前版本 `([\w.-]+)`/, '当前版本'],
  ['docs/faq.md', /两个 dist-tag 都指向 `([\w.-]+)`/, '当前版本'],
  ['docs/changelog.md', /锁步同版，当前版本 `([\w.-]+)`/, '当前版本'],
  // 文档站是私有包，但版本号一直照着库包写；不登记就会像此前那样停在 alpha.1
  ['docs/package.json', /"version": "([\w.-]+)"/, '当前版本'],
  ['docs/guide/metadata.md', /XiHan\.UI 曦寒视图 v([\w.-]+)/, '当前版本'],
  ['docs/guide/metadata.md', /宿主：vue v([\w.-]+)/, '当前版本'],
  ['docs/npm-package-dependency.md', /^\| `@xihan-ui\/[\w-]+` \| `([\w.-]+)`/m, '当前版本'],
  ['docs/npm-package-dependency.md', /个包都已发布到 npm，版本 `([\w.-]+)`/, '当前版本'],
  ['docs/npm-package-dependency.md', /发布时展开为 `\^([\w.-]+)` 区间/, '当前版本'],
  ['README.md', /Components-(\d+)-1f6feb/, '组件数'],
  ['README.md', /\*\*实验性项目\*\*：(\d+) 个组件/, '组件数'],
  ['README.md', /- \*\*(\d+) 个组件\*\* - 覆盖/, '组件数'],
  ['README.md', /已经能用的：(\d+) 个组件/, '组件数'],
  ['README.md', /^(\d+) 个公开包均已发布至 npm/m, '公开包数'],
  ['README.md', /一条命令跑 (\d+) 项结构检查/, 'gate串里的结构检查数'],

  ['ui/README.md', /^(\d+) components, each shipping/m, '组件数'],
  ['ui/README.md', /\| (\d+) components as anatomy/, '组件数'],
  ['ui/README.md', /checks the (\d+) budgets/, '体积预算条数'],
  ['ui/README_cn.md', /^(\d+) 个组件，每个都有/m, '组件数'],
  ['ui/README_cn.md', /\| (\d+) 个组件的 anatomy/, '组件数'],
  ['ui/README_cn.md', /里的 (\d+) 条产物限额/, '体积预算条数'],

  ['docs/guide/versioning.md', /\| Vue 组件导出 `Xh\*` \| \d+（(\d+) 个家族）/, '组件数'],
  ['docs/guide/versioning.md', /\| 无头内核 `connect\*` \| (\d+) \|/, '组件数'],
  ['docs/guide/versioning.md', /\| `xxxAnatomy` \/ `xxxMeta` \/ `xxxKeyboard` 三组导出对象 \| 各 (\d+) \|/, '组件数'],
  ['docs/guide/versioning.md', /\| WC 元素上的 `static partContract` \| (\d+) \|/, '组件数'],
  ['docs/guide/versioning.md', /\| `data-scope` 取值（组件身份） \| (\d+) \|/, '组件数'],
  ['docs/guide/versioning.md', /新增第 (\d+) 个组件是 minor/, '组件数加一'],
  ['docs/guide/versioning.md', /\| `custom-elements.json`（CEM） \| 1 份 \/ (\d+) 个元素/, '自定义元素数'],
  ['docs/guide/versioning.md', /注册 (\d+) \+ `xh-background`/, '自定义元素数'],
  ['docs/guide/versioning.md', /调它就注册全部 (\d+) 个元素/, '自定义元素数'],
  ['docs/guide/versioning.md', /看它在不在上表列的那 (\d+) 个全局令牌里/, '全局令牌数'],
  ['docs/index.md', /· (\d+) 个组件 ·/, '组件数'],
  ['docs/index.md', /键盘规格表，共 (\d+) 条/, '键盘规格条数'],
  ['docs/introduction.md', /当前提供 \*\*(\d+) 个组件\*\*/, '组件数'],
  ['docs/introduction.md', /键盘规格表\*\*（共 (\d+) 条）/, '键盘规格条数'],
  ['docs/overview.md', /\| (\d+) 个组件的解剖/, '组件数'],
  ['docs/faq.md', /\*\*(\d+) 个\*\*。每个组件同时有/, '组件数'],
  ['docs/faq.md', /覆盖全部 (\d+) 个组件/, '组件数'],
  ['docs/faq.md', /^(\d+) 个公开包都在 npm 上/m, '公开包数'],

  ['docs/installation.md', /XiHan\.UI 的 (\d+) 个公开包/, '公开包数'],
  ['docs/installation.md', /(\d+) 个组件的示例都是真实组件/, '组件数'],
  ['docs/installation.md', /一等图标集，当前 (\d+) 枚/, '首方图标数'],
  ['docs/installation.md', /pnpm gate {9}# (\d+) 项结构门禁/, 'gate串里的结构检查数'],
  ['docs/installation.md', /全量是 (\d+) 份皮肤加令牌/, '皮肤份数'],

  ['docs/guide/a11y.md', /全库共 \*\*(\d+) 条\*\*/, '键盘规格条数'],
  ['docs/guide/a11y.md', /散落在 (\d+) 个组件上/, '组件数'],
  ['docs/guide/testing.md', /`pnpm gate` 跑 (\d+) 项结构检查/, 'gate串里的结构检查数'],
  ['docs/guide/testing.md', /另有分层依赖检查与([\d一二三四五六七八九十]+)项单独的门禁/, '单独的gate脚本数'],
  ['docs/guide/testing.md', /^(\d+) 条产物各有上限/m, '体积预算条数'],
  ['docs/guide/forms.md', /^(\d+) 个：checkbox、/m, '表单字段组件数'],
  ['docs/guide/position.md', /\| (\d+) 种：四个方向/, 'placement取值数'],
  ['docs/guide/styling.md', /派生 (\d+) 档原语/, '品牌原语档数'],
  ['docs/guide/backgrounds.md', /^(\d+) 个：`aurora`/m, '内置背景效果数'],
  ['docs/guide/backgrounds.md', /这 (\d+) 个\*\*不自动注册\*\*/, '内置背景效果数'],
  ['docs/guide/backgrounds.md', /registerBuiltinEffects\(\) \/\/ (\d+) 个内置效果全部注册/, '内置背景效果数'],
  ['docs/guide/backgrounds.md', /一定带上全部 (\d+) 个效果/, '内置背景效果数'],
  ['docs/guide/sound.md', /内置 (\d+) 个语义名/, '内置音效语义数'],
  ['docs/guide/animations.md', /(\d+) 个进场预设/, '进场预设数'],
  ['docs/guide/animations.md', /(\d+) 个注意预设/, '注意预设数'],

  ['docs/adapters/vue.md', /全部 (\d+) 个导出组件/, 'Vue导出组件数'],
  ['docs/adapters/web-components.md', /注册全部 (\d+) 个 xh-\* 元素/, '自定义元素数'],
  ['docs/adapters/web-components.md', /（CEM 格式），(\d+) 个元素的标签名/, 'CEM元素数'],

  ['docs/npm-package-dependency.md', /^(\d+) 个包都已发布到 npm/m, '公开包数'],
  ['docs/npm-package-dependency.md', /每份皮肤一条 CSS，共 (\d+) 条/, '皮肤份数'],
  ['docs/npm-package-dependency.md', /（(\d+) 份组件皮肤/, '组件皮肤份数'],
  ['docs/npm-package-dependency.md', /\+ (\d+) 份共享层）/, '共享皮肤份数'],
  ['docs/npm-package-dependency.md', /其余([\d一二三四五六七八九十]+)个包（/, '仅主入口的包数'],

  ['docs/runtime/markdown.md', /当前对官方 (\d+) 条用例/, 'CommonMark用例总数'],
  ['docs/runtime/markdown.md', /当前对官方 \d+ 条用例的一致率是 (\d+)\//, 'CommonMark通过数'],
  ['docs/runtime/markdown.md', /摘掉之后的一致率是 \d+\/(\d+)/, '摘掉HTML两节的用例数'],
  ['docs/runtime/markdown.md', /摘掉之后的一致率是 (\d+)\//, '摘掉HTML两节的通过数'],
  ['docs/runtime/services.md', /每个位置默认最多同时留 (\d+) 条/, '轻提示同屏上限'],
]

/** 刻意的约数：不参与对账，但登记项必须仍能在文件里命中，免得留下一条早已不存在的豁免。 */
const APPROX = [
  ['docs/installation.md', /压缩后约 (\d+) kB gzip/, '皮肤增删就漂，取整到十位，不逐份对账'],
  ['docs/guide/backgrounds.md', /实测约 (\d+) kB（gzip 约 [\d.]+ kB），占整包四成/, '打包器与压缩档位不同结果就不同，只作量级参考'],
  ['docs/guide/testing.md', /预算一律按实测留一成余量/, '余量是口径不是数字，逐条限额各自取整'],
]

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length
}

const problems = []
let checked = 0

for (const [file, pattern, key] of TABLE) {
  const entry = truth[key]
  if (!entry) {
    problems.push(`${file}  登记的真值取法 ${key} 不存在`)
    continue
  }
  const source = await readRepo(file)
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)
  const hits = [...source.matchAll(global)]
  if (hits.length === 0) {
    problems.push(`${file}  正则 ${pattern} 一处都没命中——正文改写过就把这条登记一起改掉，别让数字失去看管`)
    continue
  }
  const actual = await entry.value()
  for (const hit of hits) {
    checked++
    const written = typeof actual === 'string' ? hit[1] : parseCount(hit[1])
    if (written !== actual)
      problems.push(`${file}:${lineOf(source, hit.index)}  文档写 ${hit[1]}，实际 ${actual}（${entry.how}）`)
  }
}

for (const [file, pattern, why] of APPROX) {
  const source = await readRepo(file)
  if (!pattern.test(source))
    problems.push(`${file}  约数登记「${why}」已经命中不到——正文改了就把这条从 APPROX 删掉`)
}

if (problems.length) {
  console.error(`文档里的数字与代码对不上（${problems.length} 处）：\n`)
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('\n改法：先按括号里的口径把真值数出来，再改正文；正文的写法变了就同步改本脚本 TABLE 里的正则。')
  process.exit(1)
}

console.log(`文档数字对账通过：${TABLE.length} 条登记、${checked} 处命中，另有 ${APPROX.length} 条约数登记在案。`)
