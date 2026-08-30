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
  const start = source.search(new RegExp(`^(?:export )?const ${constName}\\b.*\\{$`, 'm'))
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

/** 数组字面量 `const NAME = [ '…' ]` 里的字符串条目，按原序。 */
function stringLiterals(source, constName) {
  const start = source.search(new RegExp(`^(?:export )?const ${constName}\\b`, 'm'))
  if (start === -1)
    throw new Error(`源码里找不到 ${constName}`)
  const open = source.indexOf('[', source.indexOf('=', start))
  return (source.slice(open, source.indexOf(']', open)).match(/'[^']+'/g) ?? []).map(s => s.slice(1, -1))
}

/** 联合类型 `export type NAME = 'a' | 'b'` 的成员，按原序。 */
function unionMembers(source, typeName) {
  const line = source.match(new RegExp(`^export type ${typeName} = ([^\\n]+)`, 'm'))
  if (!line)
    throw new Error(`源码里找不到 ${typeName}`)
  return (line[1].match(/'[^']+'/g) ?? []).map(s => s.slice(1, -1))
}

/** 剥掉 CSS 块注释——注释里写着的选择器不算这份皮肤真的消费了它。 */
const stripCssComments = source => source.replace(/\/\*[\s\S]*?\*\//g, '')

const cache = new Map()
const once = (key, fn) => (cache.has(key) ? cache.get(key) : (cache.set(key, fn()), cache.get(key)))

/** 目录下递归取 [绝对路径, 内容]，只收指定后缀。 */
async function readTree(dir, ext) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await readTree(full, ext))
    else if (entry.name.endsWith(ext))
      out.push([full, await readFile(full, 'utf8')])
  }
  return out
}

/** 两级 packages 目录下 private 不为 true 的 package.json。 */
function publicPackages() {
  return once('pkgs', async () => {
    const out = []
    for (const group of (await readdir(join(uiRoot, 'packages'), { withFileTypes: true })).filter(d => d.isDirectory())) {
      for (const pkg of await readdir(join(uiRoot, 'packages', group.name))) {
        try {
          const json = JSON.parse(await read(`packages/${group.name}/${pkg}/package.json`))
          if (!json.private)
            out.push(json)
        }
        catch {}
      }
    }
    return out
  })
}

/** 公开面基线（tooling/public-surface.json）。 */
const surface = () => once('surface', async () => JSON.parse(await read('tooling/public-surface.json')))

/** 基线里 { 键: 名字数组 } 形态的那几维，摊平后的条数。 */
const sumLists = map => Object.values(map).reduce((n, v) => n + v.length, 0)

/** custom-elements.json 里带 tagName 的元素声明。 */
function cemElements() {
  return once('cem', async () => {
    const cem = JSON.parse(await read('packages/adapters/web-components/custom-elements.json'))
    return cem.modules.flatMap(m => m.declarations ?? []).filter(d => d.tagName)
  })
}

/** CommonMark 逐节基线：{ 节名: { pass, total } }。 */
const cmBaseline = () => once('cm', async () => JSON.parse(await read('packages/features/markdown/tests/commonmark-baseline.json')))

/** DTCG 令牌源文件。 */
const tokenSet = name => once(`token:${name}`, async () => JSON.parse(await read(`packages/design/tokens/tokens/${name}.json`)))

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
  吃控件最小宽度令牌的皮肤数: {
    how: 'packages/design/styles/css 下引用 --xh-control-min-w 的 .css 文件数',
    async value() {
      const files = (await readdir(SKIN_CSS)).filter(f => f.endsWith('.css'))
      let hit = 0
      for (const file of files) {
        if ((await readFile(join(SKIN_CSS, file), 'utf8')).includes('var(--xh-control-min-w)'))
          hit += 1
      }
      return hit
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
    how: 'vue 的 toast-service.ts 里私有队列的 max 缺省值',
    async value() {
      const src = await read('packages/adapters/vue/src/services/toast-service.ts')
      return Number(src.match(/\bmax = (\d+)/)[1])
    },
  },
  自定义元素数加一: {
    how: '自定义元素数 + 1（正文里「defineXhElements() 注册 N + xh-background」的那个总数，xh-background 由 defineXhBackground 单独注册）',
    async value() {
      return (await truth.自定义元素数.value()) + 1
    },
  },
  CommonMark一致率: {
    how: 'commonmark-baseline.json 的 pass 之和 ÷ total 之和 × 100，保留一位小数',
    async value() {
      const base = await cmBaseline()
      const pass = Object.values(base).reduce((a, s) => a + s.pass, 0)
      const total = Object.values(base).reduce((a, s) => a + s.total, 0)
      return (pass / total * 100).toFixed(1)
    },
  },
  摘掉HTML两节的一致率: {
    how: '同上，但 pass 与 total 都先减去 HTML blocks 与 Raw HTML 两节',
    async value() {
      const base = await cmBaseline()
      const pass = Object.values(base).reduce((a, s) => a + s.pass, 0) - base['HTML blocks'].pass - base['Raw HTML'].pass
      const total = Object.values(base).reduce((a, s) => a + s.total, 0) - base['HTML blocks'].total - base['Raw HTML'].total
      return (pass / total * 100).toFixed(1)
    },
  },
  CommonMark规范版本: {
    how: 'pnpm-workspace.yaml 的 catalog 里 commonmark-spec 的版本（markdown 包按 catalog: 取它）',
    async value() {
      return (await read('pnpm-workspace.yaml')).match(/^\s+commonmark-spec:\s*(\S+)/m)[1]
    },
  },
  内置音效主题数: {
    how: 'sound 的 src/index.ts 里形如 export { xxxSoundTheme } from \'./themes/…\' 的单名导出数',
    async value() {
      const src = await read('packages/features/sound/src/index.ts')
      return (src.match(/export \{ \w+SoundTheme \} from '\.\/themes\//g) ?? []).length
    },
  },
  内核端口数: {
    how: 'packages/engine/kernel/src/types 下的 .ts 文件数——一个端口一份类型契约文件',
    async value() {
      return (await readdir(join(uiRoot, 'packages/engine/kernel/src/types'))).filter(f => f.endsWith('.ts')).length
    },
  },
  着色记号种类数: {
    how: 'kernel 的 CodeTokenKind 联合成员数减去 plain（plain 是「没着色」，不算一类记号）',
    async value() {
      const src = await read('packages/engine/kernel/src/types/highlighter.ts')
      return unionMembers(src, 'CodeTokenKind').filter(m => m !== 'plain').length
    },
  },
  背景画质档数: {
    how: 'backgrounds 的 BackgroundQuality 联合成员数',
    async value() {
      return unionMembers(await read('packages/features/backgrounds/src/types.ts'), 'BackgroundQuality').length
    },
  },
  背景画质档名单: {
    how: 'BackgroundQuality 的成员按原序逐个用反引号包起来，斜杠分隔',
    async value() {
      return unionMembers(await read('packages/features/backgrounds/src/types.ts'), 'BackgroundQuality').map(m => `\`${m}\``).join(' / ')
    },
  },
  字号档数: {
    how: 'tokens 的 primitive.json 里 font-size 的键数',
    async value() {
      return Object.keys((await tokenSet('primitive'))['font-size']).length
    },
  },
  字号rem值表: {
    how: 'primitive.json 的 font-size 各档取值按原序去掉 rem，斜杠分隔',
    async value() {
      return Object.values((await tokenSet('primitive'))['font-size']).map(t => t.$value.replace('rem', '')).join(' / ')
    },
  },
  字号px值表: {
    how: '同上各档乘以 16（根字号 16 时的像素值），斜杠分隔',
    async value() {
      return Object.values((await tokenSet('primitive'))['font-size']).map(t => Number.parseFloat(t.$value) * 16).join(' / ')
    },
  },
  字形三档尺寸: {
    how: 'semantic.base.json 的 glyph.size-sm / size-md / size-lg 去掉 px，斜杠分隔',
    async value() {
      const glyph = (await tokenSet('semantic.base')).glyph
      return ['size-sm', 'size-md', 'size-lg'].map(k => glyph[k].$value.replace('px', '')).join(' / ')
    },
  },
  字形展示四档尺寸: {
    how: 'semantic.base.json 的 glyph.size-xl / size-2xl / size-3xl / size-4xl 去掉 px，斜杠分隔',
    async value() {
      const glyph = (await tokenSet('semantic.base')).glyph
      return ['size-xl', 'size-2xl', 'size-3xl', 'size-4xl'].map(k => glyph[k].$value.replace('px', '')).join(' / ')
    },
  },
  动作钮尺寸: {
    how: 'semantic.base.json 的 control.action-size 去掉 px',
    async value() {
      return Number.parseFloat((await tokenSet('semantic.base')).control['action-size'].$value)
    },
  },
  紧凑动作钮尺寸: {
    how: 'semantic.compact.json 的 control.action-size 去掉 px',
    async value() {
      return Number.parseFloat((await tokenSet('semantic.compact')).control['action-size'].$value)
    },
  },
  指示器尺寸: {
    how: 'semantic.base.json 的 control.indicator-md 去掉 px（indicator-size 现在是它的别名）',
    async value() {
      return Number.parseFloat((await tokenSet('semantic.base')).control['indicator-md'].$value)
    },
  },
  紧凑指示器尺寸: {
    how: 'semantic.compact.json 的 control.indicator-md 去掉 px',
    async value() {
      return Number.parseFloat((await tokenSet('semantic.compact')).control['indicator-md'].$value)
    },
  },
  图标白名单标签表: {
    how: 'icons 的 build/whitelist.mjs 里 ALLOWED_TAGS 的条目，按原序逐个用反引号包起来，空格分隔',
    async value() {
      const src = await read('packages/design/icons/build/whitelist.mjs')
      return stringLiterals(src, 'ALLOWED_TAGS').map(t => `\`${t}\``).join(' ')
    },
  },
  出JS的公开包数: {
    how: '公开包里 exports 至少有一个子路径带 types 的那些（styles 只出 CSS，不算）',
    async value() {
      return (await publicPackages()).filter(p => Object.entries(p.exports ?? {}).some(([k, v]) => k !== './package.json' && JSON.stringify(v).includes('"types"'))).length
    },
  },
  带类型的入口数: {
    how: '公开包 exports 里除 ./package.json 外、目标带 types 的子路径条数',
    async value() {
      let n = 0
      for (const pkg of await publicPackages()) {
        for (const [key, target] of Object.entries(pkg.exports ?? {})) {
          if (key !== './package.json' && JSON.stringify(target).includes('"types"'))
            n++
        }
      }
      return n
    },
  },
  基线名字总数: {
    how: 'public-surface.json 六项求和（令牌 + data-* + 组件覆盖槽 + 导出名 + 部件配对 + 组件 prop），与 check-public-surface 打印的那个数同一个公式',
    async value() {
      const base = await surface()
      return base.tokens.length + base.dataAttributes.length + base.cssSlots.length
        + sumLists(base.exports) + sumLists(base.anatomy) + sumLists(base.componentProps ?? {})
    },
  },
  基线子入口条数: {
    how: 'public-surface.json 的 packages 各数组求和',
    async value() {
      return sumLists((await surface()).packages)
    },
  },
  基线导出名数: {
    how: 'public-surface.json 的 exports 各数组求和',
    async value() {
      return sumLists((await surface()).exports)
    },
  },
  基线部件配对数: {
    how: 'public-surface.json 的 anatomy 各数组求和（一条 = 一个组件的一个部件）',
    async value() {
      return sumLists((await surface()).anatomy)
    },
  },
  基线去重部件名数: {
    how: 'public-surface.json 的 anatomy 摊平后去重的部件名数',
    async value() {
      return new Set(Object.values((await surface()).anatomy).flat()).size
    },
  },
  基线组件数: {
    how: 'public-surface.json 的 anatomy 键数（一个键 = 一个 data-scope）',
    async value() {
      return Object.keys((await surface()).anatomy).length
    },
  },
  基线组件prop数: {
    how: 'public-surface.json 的 componentProps 各数组求和',
    async value() {
      return sumLists((await surface()).componentProps)
    },
  },
  基线data属性种数: {
    how: 'public-surface.json 的 dataAttributes 条数',
    async value() {
      return (await surface()).dataAttributes.length
    },
  },
  基线dataState取值数: {
    how: 'public-surface.json 的 dataStateValues 条数',
    async value() {
      return (await surface()).dataStateValues.length
    },
  },
  基线令牌数: {
    how: 'public-surface.json 的 tokens 条数',
    async value() {
      return (await surface()).tokens.length
    },
  },
  基线层名数: {
    how: 'public-surface.json 的 cssLayers 条数',
    async value() {
      return (await surface()).cssLayers.length
    },
  },
  基线覆盖槽数: {
    how: 'public-surface.json 的 cssSlots 条数',
    async value() {
      return (await surface()).cssSlots.length
    },
  },
  基线元素数: {
    how: 'public-surface.json 的 elements 键数',
    async value() {
      return Object.keys((await surface()).elements).length
    },
  },
  requiredParts条数: {
    how: 'headless 每份 <name>.meta.ts 里 requiredParts: [ … ] 的字符串条目求和',
    async value() {
      const names = await once('anatomy', () => componentDirs('anatomy.ts'))
      let n = 0
      for (const name of names) {
        const src = await readFile(join(HEADLESS, name, `${name}.meta.ts`), 'utf8').catch(() => '')
        const list = src.match(/requiredParts:\s*\[([\s\S]*?)\]/)
        if (list)
          n += (list[1].match(/'[^']*'/g) ?? []).length
      }
      return n
    },
  },
  CEM观察属性声明数: {
    how: 'custom-elements.json 里各元素 attributes 数组的条数之和',
    async value() {
      return (await cemElements()).reduce((n, d) => n + (d.attributes?.length ?? 0), 0)
    },
  },
  CEM观察属性名数: {
    how: 'custom-elements.json 里全部 attribute 名去重后的个数',
    async value() {
      return new Set((await cemElements()).flatMap(d => (d.attributes ?? []).map(a => a.name))).size
    },
  },
  CEM事件声明数: {
    how: 'custom-elements.json 里各元素 events 数组的条数之和',
    async value() {
      return (await cemElements()).reduce((n, d) => n + (d.events?.length ?? 0), 0)
    },
  },
  CEM事件名数: {
    how: 'custom-elements.json 里全部事件名去重后的个数',
    async value() {
      return new Set((await cemElements()).flatMap(d => (d.events ?? []).map(e => e.name))).size
    },
  },
  CEM命令式方法数: {
    how: 'custom-elements.json 里 kind 为 method、且 privacy 既不是 private 也不是 protected 的成员数（基类方法在 CEM 里都标了 protected/private，直接数 members 会多出几百条）',
    async value() {
      return (await cemElements()).flatMap(d => (d.members ?? []).filter(m => m.kind === 'method' && m.privacy !== 'private' && m.privacy !== 'protected')).length
    },
  },
  带命令式方法的元素数: {
    how: '同上口径下至少有一个命令式方法的元素个数',
    async value() {
      return (await cemElements()).filter(d => (d.members ?? []).some(m => m.kind === 'method' && m.privacy !== 'private' && m.privacy !== 'protected')).length
    },
  },
  CEM无attribute字段数: {
    how: 'custom-elements.json 里 kind 为 field、privacy 是 public、且没有 attribute 的成员数',
    async value() {
      return (await cemElements()).flatMap(d => (d.members ?? []).filter(m => m.kind === 'field' && m.privacy === 'public' && !m.attribute)).length
    },
  },
  CEM无attribute字段名数: {
    how: '同上口径下的字段名去重后的个数',
    async value() {
      return new Set((await cemElements()).flatMap(d => (d.members ?? []).filter(m => m.kind === 'field' && m.privacy === 'public' && !m.attribute).map(m => m.name))).size
    },
  },
  Details类型数: {
    how: 'headless 的 src/index.ts 里以 Details 结尾的类型名去重后的个数',
    async value() {
      const src = await read('packages/engine/headless/src/index.ts')
      return new Set([...src.matchAll(/\b(\w+Details)\b/g)].map(m => m[1])).size
    },
  },
  CustomEvent构造处数: {
    how: 'web-components 的 src 下 new CustomEvent 的出现次数',
    async value() {
      const files = await readTree(join(uiRoot, 'packages/adapters/web-components/src'), '.ts')
      return files.reduce((n, [, src]) => n + (src.match(/new CustomEvent/g) ?? []).length, 0)
    },
  },
  冒泡的CustomEvent处数: {
    how: '同一批文件里 bubbles: true 的出现次数',
    async value() {
      const files = await readTree(join(uiRoot, 'packages/adapters/web-components/src'), '.ts')
      return files.reduce((n, [, src]) => n + (src.match(/bubbles: true/g) ?? []).length, 0)
    },
  },
  皮肤消费的属性名数: {
    how: '皮肤 CSS 剥掉块注释后，选择器里 [data-… 的属性名去重数，排除解剖的 data-scope 与 data-part',
    async value() {
      return (await once('skinAttrs', skinDataAttrs)).names
    },
  },
  皮肤属性配对数: {
    how: '同上口径下「皮肤文件 × 属性名」去重后的条数',
    async value() {
      return (await once('skinAttrs', skinDataAttrs)).pairs
    },
  },
  适配器数: {
    how: 'packages/adapters 下的目录数',
    async value() {
      return (await readdir(join(uiRoot, 'packages/adapters'), { withFileTypes: true })).filter(d => d.isDirectory()).length
    },
  },
  适配器名单: {
    how: 'packages/adapters 下的目录名，斜杠分隔',
    async value() {
      return (await readdir(join(uiRoot, 'packages/adapters'), { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).join(' / ')
    },
  },
  适配器名单字面量: {
    how: 'packages/adapters 下的目录名写成单引号数组条目（kernel 的 metadata.ts 里那份手写清单该长的样子）',
    async value() {
      return (await readdir(join(uiRoot, 'packages/adapters'), { withFileTypes: true })).filter(d => d.isDirectory()).map(d => `'${d.name}'`).join(', ')
    },
  },
  a11y存量违规条数: {
    how: 'tooling/testing/src/a11y/known.ts 的 knownA11yViolations 键数，加上 wcA11yBaseline.known 里 WC 独有的键（两张表是包含关系，直接数键总数会重复计）',
    async value() {
      const src = await read('tooling/testing/src/a11y/known.ts')
      const wcOnly = (src.slice(src.indexOf('wcA11yBaseline')).match(/^ {4}[\w-]+: \{ '/gm) ?? []).length
      return countTopLevelKeys(src, 'knownA11yViolations') + wcOnly
    },
  },
  a11y重放豁免条数: {
    how: 'tooling/testing/src/a11y/known.ts 的 replayExempt 键数',
    async value() {
      return countTopLevelKeys(await read('tooling/testing/src/a11y/known.ts'), 'replayExempt')
    },
  },
  废弃登记表状态: {
    how: '库包 src 里 registerDeprecation( 的调用处数（不含 kernel 自己那份定义）；一处都没有时正文写「空」',
    async value() {
      let n = 0
      for (const group of (await readdir(join(uiRoot, 'packages'), { withFileTypes: true })).filter(d => d.isDirectory())) {
        for (const pkg of await readdir(join(uiRoot, 'packages', group.name))) {
          const files = await readTree(join(uiRoot, 'packages', group.name, pkg, 'src'), '.ts').catch(() => [])
          for (const [path, src] of files) {
            if (path.endsWith('deprecations.ts'))
              continue
            n += (src.match(/\bregisterDeprecation\(/g) ?? []).length
          }
        }
      }
      return n === 0 ? '空' : `${n} 条`
    },
  },
  运行时第三方依赖数: {
    how: '公开包 dependencies 里非 @xihan-ui/ 开头的名字去重数（宿主框架 vue 是 peer，不算在内）',
    async value() {
      return (await once('thirdParty', thirdPartyRuntimeDeps)).length
    },
  },
  运行时第三方依赖名: {
    how: '同上口径的名字本身，逗号分隔',
    async value() {
      return (await once('thirdParty', thirdPartyRuntimeDeps)).join('、')
    },
  },
  消费端Node主版本下限: {
    how: '公开包 engines.node 的主版本（17 份必须一致，不一致就报错）',
    async value() {
      const declared = new Set((await publicPackages()).map(p => p.engines?.node))
      if (declared.size !== 1)
        throw new Error(`公开包的 engines.node 不一致：${[...declared].join(' / ')}`)
      return Number([...declared][0].match(/\d+/)[0])
    },
  },
  开发期Node下限: {
    how: 'ui/package.json 的 engines.node 去掉 >=',
    async value() {
      return JSON.parse(await read('package.json')).engines.node.replace('>=', '')
    },
  },
  开发期pnpm下限: {
    how: 'ui/package.json 的 engines.pnpm 去掉 >=',
    async value() {
      return JSON.parse(await read('package.json')).engines.pnpm.replace('>=', '')
    },
  },
  开发期Node主版本下限: {
    how: 'ui/package.json 的 engines.node 的主版本',
    async value() {
      return Number(JSON.parse(await read('package.json')).engines.node.match(/\d+/)[0])
    },
  },
  开发期pnpm主版本下限: {
    how: 'ui/package.json 的 engines.pnpm 的主版本',
    async value() {
      return Number(JSON.parse(await read('package.json')).engines.pnpm.match(/\d+/)[0])
    },
  },
  WC元素类导出数: {
    how: 'tooling/public-surface.json 里 @xihan-ui/web-components 形如 Xh*Element 的导出名',
    async value() {
      const surface = JSON.parse(await read('tooling/public-surface.json'))
      const wc = surface.exports['@xihan-ui/web-components']
      const names = Array.isArray(wc) ? wc : Object.values(wc).flat()
      return names.filter(n => /^Xh[A-Za-z0-9]+Element$/.test(n)).length
    },
  },
  用指针原语的组件数: {
    how: 'headless 的组件目录里引了 @xihan-ui/pointer 的那些',
    async value() {
      const dirs = (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name)
      let n = 0
      for (const name of dirs) {
        const files = await readdir(join(HEADLESS, name), { withFileTypes: true, recursive: true })
        for (const entry of files) {
          if (!entry.isFile() || !entry.name.endsWith('.ts'))
            continue
          const src = await readFile(join(entry.parentPath ?? entry.path, entry.name), 'utf8')
          if (src.includes('@xihan-ui/pointer')) {
            n++
            break
          }
        }
      }
      return n
    },
  },
}

/** 皮肤 CSS 真正消费的 data-* 属性：剥注释、排除解剖那两个。 */
async function skinDataAttrs() {
  const files = (await readdir(SKIN_CSS)).filter(f => f.endsWith('.css')).sort()
  const names = new Set()
  const pairs = new Set()
  for (const file of files) {
    const src = stripCssComments(await readFile(join(SKIN_CSS, file), 'utf8'))
    for (const hit of src.matchAll(/\[(data-[\w-]+)/g)) {
      if (hit[1] === 'data-scope' || hit[1] === 'data-part')
        continue
      names.add(hit[1])
      pairs.add(`${file}|${hit[1]}`)
    }
  }
  return { names: names.size, pairs: pairs.size }
}

/** 公开包 dependencies 里的第三方名字。 */
async function thirdPartyRuntimeDeps() {
  const names = new Set()
  for (const pkg of await publicPackages()) {
    for (const dep of Object.keys(pkg.dependencies ?? {})) {
      if (!dep.startsWith('@xihan-ui/'))
        names.add(dep)
    }
  }
  return [...names].sort()
}

// CommonMark 逐节的通过数与用例数：包 README 与文档站都逐节抄了这两个数。
for (const section of ['HTML blocks', 'Raw HTML', 'List items', 'Lists', 'Link reference definitions', 'Tabs', 'Indented code blocks']) {
  truth[`CommonMark「${section}」通过数`] = {
    how: `commonmark-baseline.json 里「${section}」一节的 pass`,
    async value() {
      return (await cmBaseline())[section].pass
    },
  }
  truth[`CommonMark「${section}」用例数`] = {
    how: `commonmark-baseline.json 里「${section}」一节的 total`,
    async value() {
      return (await cmBaseline())[section].total
    },
  }
}

// —— 登记表：文件 · 正则（一个捕获组）· 真值。——

const CN_DIGITS = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 }
// 英文 README 也把小数目写成词（two recorded entries / one replay exemption）
const EN_DIGITS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }

/** 阿拉伯数字、百以内的中文数字，或十以内的英文数词 → number。 */
function parseCount(text) {
  if (/^\d+$/.test(text))
    return Number(text)
  const s = text.trim()
  if (Object.hasOwn(EN_DIGITS, s.toLowerCase()))
    return EN_DIGITS[s.toLowerCase()]
  if (!s.includes('十'))
    return CN_DIGITS[s] ?? Number.NaN
  const [high, low] = s.split('十')
  const tens = high === '' ? 1 : (CN_DIGITS[high] ?? Number.NaN)
  const ones = low === '' ? 0 : (CN_DIGITS[low] ?? Number.NaN)
  return tens * 10 + ones
}

const TABLE = [
  // 发版当天最容易漏的一批：正文里「当前版本是 X」的陈述
  // 文档站是私有包，但版本号一直照着库包写；不登记就会像此前那样停在 alpha.1
  ['README.md', /Components-(\d+)-1f6feb/, '组件数'],
  ['README.md', /- \*\*(\d+) components\*\* - covering/, '组件数'],
  ['README.md', /In the box: (\d+) components/, '组件数'],
  ['README.md', /^(\d+) public packages/m, '公开包数'],
  ['README.md', /one command runs (\d+) structural checks/, 'gate串里的结构检查数'],

  ['README_cn.md', /Components-(\d+)-1f6feb/, '组件数'],
  ['README_cn.md', /- \*\*(\d+) 个组件\*\* - 覆盖/, '组件数'],
  ['README_cn.md', /库里有的：(\d+) 个组件/, '组件数'],
  ['README_cn.md', /^(\d+) 个公开包/m, '公开包数'],
  ['README_cn.md', /一条命令跑 (\d+) 项结构检查/, 'gate串里的结构检查数'],

  ['ui/README.md', /^(\d+) components, each shipping/m, '组件数'],
  ['ui/README.md', /\| (\d+) components as anatomy/, '组件数'],
  ['ui/README.md', /checks the (\d+) budgets/, '体积预算条数'],
  ['ui/README.md', /The (\d+) public packages are released in lockstep/, '公开包数'],
  ['ui/README_cn.md', /^(\d+) 个组件，每个都有/m, '组件数'],
  ['ui/README_cn.md', /(\d+) 个公开包锁步发版/, '公开包数'],
  ['ui/README_cn.md', /\| (\d+) 个组件的 anatomy/, '组件数'],
  ['ui/README_cn.md', /里的 (\d+) 条产物限额/, '体积预算条数'],

  ['docs/guide/versioning.md', /\| Vue 组件导出 `Xh\*` \| \d+（(\d+) 个家族）/, '组件数'],
  ['docs/guide/versioning.md', /\| 无头内核 `connect\*` \| (\d+) \|/, '组件数'],
  ['docs/guide/versioning.md', /\| `xxxAnatomy` \/ `xxxMeta` \/ `xxxKeyboard` 三组导出对象 \| 各 (\d+) \|/, '组件数'],
  ['docs/guide/versioning.md', /\| WC 的元素类导出 `Xh\*Element` \| (\d+) \|/, 'WC元素类导出数'],
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
  ['docs/guide/pointer.md', /这一层，(\d+) 个组件在用/, '用指针原语的组件数'],
  ['docs/guide/styling.md', /^(\d+) 份皮肤吃这条令牌/m, '吃控件最小宽度令牌的皮肤数'],
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

  ['docs/npm-package-dependency.md', /每份皮肤一条 CSS，共 (\d+) 条/, '皮肤份数'],
  ['docs/npm-package-dependency.md', /（(\d+) 份组件皮肤/, '组件皮肤份数'],
  ['docs/npm-package-dependency.md', /\+ (\d+) 份共享层）/, '共享皮肤份数'],
  ['docs/npm-package-dependency.md', /其余([\d一二三四五六七八九十]+)个包（/, '仅主入口的包数'],

  ['docs/runtime/markdown.md', /当前对官方 (\d+) 条用例/, 'CommonMark用例总数'],
  ['docs/runtime/markdown.md', /当前对官方 \d+ 条用例的一致率是 (\d+)\//, 'CommonMark通过数'],
  ['docs/runtime/markdown.md', /摘掉之后的一致率是 \d+\/(\d+)/, '摘掉HTML两节的用例数'],
  ['docs/runtime/markdown.md', /摘掉之后的一致率是 (\d+)\//, '摘掉HTML两节的通过数'],
  ['docs/runtime/services.md', /最多同时留 (\d+) 条/, '轻提示同屏上限'],

  // 包 README——npm 把它们当落地页，改数字的人一般只翻文档站，这一片最容易停在旧值
  ['ui/packages/README.md', /`headless` 的 (\d+) 个/, '组件数'],
  ['ui/packages/README.md', /(\d+) 个组件共享同一套机器/, '组件数'],
  ['ui/packages/adapters/vue/README.md', /^Vue 3 适配器：(\d+) 个组件的 Vue 形态/m, '组件数'],
  ['ui/packages/engine/headless/README.md', /^(\d+) 个组件的无视觉实现/m, '组件数'],
  ['ui/packages/design/styles/README.md', /^默认皮肤：(\d+) 份纯 CSS/m, '皮肤份数'],
  ['ui/packages/engine/kernel/README.md', /以及([\d一二三四五六七八九十两]+)个端口的类型契约/, '内核端口数'],
  ['ui/packages/engine/code-highlight/README.md', /只分([\d一二三四五六七八九十两]+)类：注释、字符串、数字、关键字、标点/, '着色记号种类数'],
  ['ui/packages/features/sound/README.md', /([\d一二三四五六七八九十两]+)套内置主题/, '内置音效主题数'],
  ['ui/packages/features/animations/README.md', /(\d+) 个进场预设/, '进场预设数'],
  ['ui/packages/features/animations/README.md', /(\d+) 个注意预设/, '注意预设数'],
  ['ui/packages/features/backgrounds/README.md', /`quality` ([\d一二三四五六七八九十两]+)档（/, '背景画质档数'],
  ['ui/packages/features/backgrounds/README.md', /`quality` [\d一二三四五六七八九十两]+档（([^）]+)）/, '背景画质档名单'],
  ['ui/packages/design/icons/README.md', /^标签：(.+)$/m, '图标白名单标签表'],
  ['ui/packages/design/tokens/README.md', /`font-size\.\*` ([\d一二三四五六七八九十两]+)档是 rem/, '字号档数'],
  ['ui/packages/design/tokens/README.md', /档是 rem（([^）]+)）/, '字号rem值表'],
  ['ui/packages/design/tokens/README.md', /），对应 ([^）]+)px。/, '字号px值表'],
  ['ui/packages/design/tokens/README.md', /`glyph\.size-sm\/md\/lg` 是 px（([^）]+)）/, '字形三档尺寸'],
  ['ui/packages/design/tokens/README.md', /`glyph\.size-xl\/2xl\/3xl\/4xl` 是 px（([^）]+)）/, '字形展示四档尺寸'],
  ['ui/packages/design/tokens/README.md', /`control\.action-size`（(\d+)px，compact \d+px）/, '动作钮尺寸'],
  ['ui/packages/design/tokens/README.md', /`control\.action-size`（\d+px，compact (\d+)px）/, '紧凑动作钮尺寸'],
  ['ui/packages/design/tokens/README.md', /`control\.indicator-size`（(\d+)px，compact \d+px）/, '指示器尺寸'],
  ['ui/packages/design/tokens/README.md', /`control\.indicator-size`（\d+px，compact (\d+)px）/, '紧凑指示器尺寸'],

  // markdown 包 README 逐节抄了一致率基线，掉一节就得同步改
  ['ui/packages/features/markdown/README.md', /当前对官方 (\d+) 条用例的一致率/, 'CommonMark用例总数'],
  ['ui/packages/features/markdown/README.md', /的一致率：(\d+)\/\d+（[\d.]+%）/, 'CommonMark通过数'],
  ['ui/packages/features/markdown/README.md', /的一致率：\d+\/(\d+)（[\d.]+%）/, 'CommonMark用例总数'],
  ['ui/packages/features/markdown/README.md', /的一致率：\d+\/\d+（([\d.]+)%）/, 'CommonMark一致率'],
  ['ui/packages/features/markdown/README.md', /摘掉之后的一致率是 (\d+)\/\d+（[\d.]+%）/, '摘掉HTML两节的通过数'],
  ['ui/packages/features/markdown/README.md', /摘掉之后的一致率是 \d+\/(\d+)（[\d.]+%）/, '摘掉HTML两节的用例数'],
  ['ui/packages/features/markdown/README.md', /摘掉之后的一致率是 \d+\/\d+（([\d.]+)%）/, '摘掉HTML两节的一致率'],
  ['ui/packages/features/markdown/README.md', /\| HTML blocks \| (\d+)\/\d+ \|/, 'CommonMark「HTML blocks」通过数'],
  ['ui/packages/features/markdown/README.md', /\| HTML blocks \| \d+\/(\d+) \|/, 'CommonMark「HTML blocks」用例数'],
  ['ui/packages/features/markdown/README.md', /\| Raw HTML \| (\d+)\/\d+ \|/, 'CommonMark「Raw HTML」通过数'],
  ['ui/packages/features/markdown/README.md', /\| Raw HTML \| \d+\/(\d+) \|/, 'CommonMark「Raw HTML」用例数'],
  ['ui/packages/features/markdown/README.md', /`List items` (\d+)\/\d+/, 'CommonMark「List items」通过数'],
  ['ui/packages/features/markdown/README.md', /`List items` \d+\/(\d+)/, 'CommonMark「List items」用例数'],
  ['ui/packages/features/markdown/README.md', /`Lists` (\d+)\/\d+/, 'CommonMark「Lists」通过数'],
  ['ui/packages/features/markdown/README.md', /`Lists` \d+\/(\d+)/, 'CommonMark「Lists」用例数'],
  ['ui/packages/features/markdown/README.md', /`Link reference definitions` (\d+)\/\d+/, 'CommonMark「Link reference definitions」通过数'],
  ['ui/packages/features/markdown/README.md', /`Link reference definitions` \d+\/(\d+)/, 'CommonMark「Link reference definitions」用例数'],
  ['ui/packages/features/markdown/README.md', /`Tabs` (\d+)\/\d+/, 'CommonMark「Tabs」通过数'],
  ['ui/packages/features/markdown/README.md', /`Tabs` \d+\/(\d+)/, 'CommonMark「Tabs」用例数'],
  ['ui/packages/features/markdown/README.md', /`Indented code blocks` 一节 (\d+)\/\d+ 全过/, 'CommonMark「Indented code blocks」通过数'],
  ['ui/packages/features/markdown/README.md', /`Indented code blocks` 一节 \d+\/(\d+) 全过/, 'CommonMark「Indented code blocks」用例数'],
  ['ui/packages/features/markdown/README.md', /CommonMark ([\d.]+)）/, 'CommonMark规范版本'],

  // 仓库两份 README 的开头段：版本号、无障碍存量、一致率、本地开发的 Node/pnpm 下限
  ['ui/README.md', /backlog is down to (\w+) recorded entries/, 'a11y存量违规条数'],
  ['ui/README.md', /plus (\w+) replay exemption/, 'a11y重放豁免条数'],
  ['ui/README.md', /CommonMark subset, (\d+)\/\d+/, 'CommonMark通过数'],
  ['ui/README.md', /CommonMark subset, \d+\/(\d+)/, 'CommonMark用例总数'],
  ['ui/README.md', /Requires Node ≥ (\d+) and pnpm ≥ \d+/, '开发期Node主版本下限'],
  ['ui/README.md', /Requires Node ≥ \d+ and pnpm ≥ (\d+)/, '开发期pnpm主版本下限'],
  ['ui/README_cn.md', /存量违规登记表只剩([\d一二三四五六七八九十两]+)条/, 'a11y存量违规条数'],
  ['ui/README_cn.md', /另有([\d一二三四五六七八九十两]+)条 breadcrumb 的步骤重放豁免/, 'a11y重放豁免条数'],
  ['ui/README_cn.md', /一致率 (\d+)\/\d+）/, 'CommonMark通过数'],
  ['ui/README_cn.md', /一致率 \d+\/(\d+)）/, 'CommonMark用例总数'],
  ['ui/README_cn.md', /要求 Node ≥ (\d+)、pnpm ≥ \d+/, '开发期Node主版本下限'],
  ['ui/README_cn.md', /要求 Node ≥ \d+、pnpm ≥ (\d+)/, '开发期pnpm主版本下限'],

  // 公开面那一段：数全部从 tooling/public-surface.json 推，别再重实现一遍采集
  ['docs/guide/versioning.md', /public-surface\.json`，(\d+) 个名字/, '基线名字总数'],
  ['docs/guide/versioning.md', /包名与 (\d+) 条子入口/, '基线子入口条数'],
  ['docs/guide/versioning.md', /条子入口、(\d+) 个导出名/, '基线导出名数'],
  ['docs/guide/versioning.md', /个导出名、(\d+) 个 `data-scope`/, '基线组件数'],
  ['docs/guide/versioning.md', /`data-scope` 与 (\d+) 条部件配对/, '基线部件配对数'],
  ['docs/guide/versioning.md', /^(\d+) 个组件的 \d+ 个 prop 名/m, '基线组件数'],
  ['docs/guide/versioning.md', /个组件的 (\d+) 个 prop 名/, '基线组件prop数'],
  ['docs/guide/versioning.md', /个 prop 名、(\d+) 种 `data-\*`/, '基线data属性种数'],
  ['docs/guide/versioning.md', /种 `data-\*`、(\d+) 个 `data-state` 取值/, '基线dataState取值数'],
  ['docs/guide/versioning.md', /`data-state` 取值、(\d+) 个令牌/, '基线令牌数'],
  ['docs/guide/versioning.md', /^(\d+) 个 `@layer` 名、/m, '基线层名数'],
  ['docs/guide/versioning.md', /`@layer` 名、(\d+) 个组件覆盖槽/, '基线覆盖槽数'],
  ['docs/guide/versioning.md', /个组件覆盖槽、(\d+) 个自定义元素及其/, '基线元素数'],
  ['docs/guide/versioning.md', /\| `@layer` 名与声明顺序 \| (\d+) \|/, '基线层名数'],
  ['docs/guide/versioning.md', /\| 组件覆盖槽 \| (\d+)（覆盖 \d+ 个组件）/, '基线覆盖槽数'],
  ['docs/guide/versioning.md', /当前用到的 (\d+) 个 `data-state` 取值全部受约束/, '基线dataState取值数'],
  ['docs/guide/versioning.md', /\| (\d+) 个令牌名/, '全局令牌数'],
  ['docs/guide/versioning.md', /共 (\d+) 个带类型的入口/, '带类型的入口数'],
  ['docs/guide/versioning.md', /\| `exports` 子路径 \| (\d+) 个 JS 入口/, '带类型的入口数'],
  ['docs/guide/versioning.md', /个包中 (\d+) 个出 JS/, '出JS的公开包数'],
  ['docs/guide/versioning.md', /\| `data-part` 取值（部件名） \| (\d+) 个不同名字/, '基线去重部件名数'],
  ['docs/guide/versioning.md', /（部件名） \| \d+ 个不同名字 \/ (\d+) 条「组件 × 部件」配对/, '基线部件配对数'],
  ['docs/guide/versioning.md', /取值即上面 (\d+) 个/, '基线去重部件名数'],
  ['docs/guide/versioning.md', /\| `meta\.requiredParts`（必备部件） \| (\d+) 条/, 'requiredParts条数'],

  // 「17 个公开包」散落处。changelog 只锚这一句，底下的历史条目不碰
  ['docs/guide/versioning.md', /^## (\d+) 个包必须同版本安装/m, '公开包数'],
  ['docs/guide/versioning.md', /^(\d+) 个包锁步发布/m, '公开包数'],
  ['docs/guide/versioning.md', /全部 (\d+) 个包一起发同一个号/, '公开包数'],
  ['docs/guide/versioning.md', /^(\d+) 个包中 \d+ 个出 JS/m, '公开包数'],
  ['docs/guide/versioning.md', /^\| 包名 \| (\d+) \|/m, '公开包数'],
  ['docs/guide/versioning.md', /下面两张表覆盖 (\d+) 个包中的 \d+ 个/, '公开包数'],
  ['docs/guide/versioning.md', /守着 (\d+) 包锁步/, '公开包数'],
  ['docs/guide/versioning.md', /「(\d+) 个包必须同版本」/, '公开包数'],
  ['docs/guide/versioning.md', /门禁保证 (\d+) 个 package\.json 同版本/, '公开包数'],
  ['docs/guide/versioning.md', /不是全部 (\d+) 个 \|/, '公开包数'],

  // 适配器：kernel 里那份手写清单读不到文件系统，只能靠门禁比对目录
  ['ui/packages/engine/kernel/src/metadata.ts', /adapters: Object\.freeze\(\[([^\]]*)\]\)/, '适配器名单字面量'],
  ['docs/guide/metadata.md', /渲染适配器（([^）]+)）/, '适配器名单'],
  ['docs/guide/metadata.md', /：([\d一二三四五六七八九十两]+)个适配器的接入方式/, '适配器数'],

  // 自定义元素那张表：数全部从 custom-elements.json 推
  ['docs/guide/versioning.md', /\| 自定义元素标签 `xh-\*` \| (\d+)（/, '自定义元素数加一'],
  ['docs/guide/versioning.md', /\| observed attribute \| (\d+) 条声明 \/ \d+ 个不同名字/, 'CEM观察属性声明数'],
  ['docs/guide/versioning.md', /\| observed attribute \| \d+ 条声明 \/ (\d+) 个不同名字/, 'CEM观察属性名数'],
  ['docs/guide/versioning.md', /\| attribute 名词汇表本身 \| (\d+) \|/, 'CEM观察属性名数'],
  ['docs/guide/versioning.md', /\| `CustomEvent` 名 \| (\d+) 个名字 \/ \d+ 条/, 'CEM事件名数'],
  ['docs/guide/versioning.md', /\| `CustomEvent` 名 \| \d+ 个名字 \/ (\d+) 条/, 'CEM事件声明数'],
  ['docs/guide/versioning.md', /（(\d+) 处中 \d+ 处）/, 'CustomEvent构造处数'],
  ['docs/guide/versioning.md', /（\d+ 处中 (\d+) 处）/, '冒泡的CustomEvent处数'],
  ['docs/guide/versioning.md', /\| (\d+) 个 `\*Details` 类型 \|/, 'Details类型数'],
  ['docs/guide/versioning.md', /\| (\d+) 条（涉及 \d+ 个字段名）/, 'CEM无attribute字段数'],
  ['docs/guide/versioning.md', /\| \d+ 条（涉及 (\d+) 个字段名）/, 'CEM无attribute字段名数'],
  ['docs/guide/versioning.md', /\| 命令式方法 \| (\d+)（分布在 \d+ 个元素）/, 'CEM命令式方法数'],
  ['docs/guide/versioning.md', /\| 命令式方法 \| \d+（分布在 (\d+) 个元素）/, '带命令式方法的元素数'],

  // 自带皮肤真正消费的 data-*：剥掉 CSS 注释后数，排除解剖那两个
  ['docs/guide/versioning.md', /自带皮肤自己就消费了 (\d+) 个属性名/, '皮肤消费的属性名数'],
  ['docs/guide/versioning.md', /个属性名 \/ (\d+) 条「皮肤 × 属性」配对/, '皮肤属性配对数'],

  // 其余「当前状态是 X」式陈述
  ['docs/guide/versioning.md', /登记表当前为(空|\d+ 条)/, '废弃登记表状态'],
  ['docs/guide/versioning.md', /\| Node（安装并运行本库） \| \*\*≥ (\d+)\*\*/, '消费端Node主版本下限'],
  ['docs/installation.md', /\| Node（装包使用） \| ≥ (\d+)，/, '消费端Node主版本下限'],
  ['docs/installation.md', /（参与本仓开发） \| ≥ ([\d.]+) \/ ≥ [\d.]+ \|/, '开发期Node下限'],
  ['docs/installation.md', /（参与本仓开发） \| ≥ [\d.]+ \/ ≥ ([\d.]+) \|/, '开发期pnpm下限'],
  ['docs/index.md', /运行时第三方依赖只有([\d一二三四五六七八九十两]+)个/, '运行时第三方依赖数'],
  ['docs/introduction.md', /运行时第三方依赖只有([\d一二三四五六七八九十两]+)个/, '运行时第三方依赖数'],
  ['docs/introduction.md', /运行时第三方依赖只有[\d一二三四五六七八九十两]+个（`([^`]+)`/, '运行时第三方依赖名'],
  ['docs/overview.md', /唯一登记在案的例外是 `([^`]+)`/, '运行时第三方依赖名'],
  ['README.md', /the only third-party runtime dependency is `([^`]+)`/, '运行时第三方依赖名'],
  ['README_cn.md', /运行时第三方依赖只有 `([^`]+)`/, '运行时第三方依赖名'],
  ['docs/faq.md', /另有 breadcrumb ([\d一二三四五六七八九十两]+)条步骤重放豁免/, 'a11y重放豁免条数'],
  ['docs/guide/a11y.md', /当前共([\d一二三四五六七八九十两]+)条/, 'a11y存量违规条数'],
  ['docs/guide/a11y.md', /只剩([\d一二三四五六七八九十两]+)个组件在真机里推不到用例终态/, 'a11y重放豁免条数'],
]

/** 刻意的约数：不参与对账，但登记项必须仍能在文件里命中，免得留下一条早已不存在的豁免。 */
const APPROX = [
  ['docs/installation.md', /压缩后约 (\d+) kB gzip/, '皮肤增删就漂，取整到十位，不逐份对账'],
  ['docs/guide/pointer.md', /整包压缩后 ([\d.]+) kB/, '产物体积随实现走，随 size-limit 的限额一起看，不逐次对账'],
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
