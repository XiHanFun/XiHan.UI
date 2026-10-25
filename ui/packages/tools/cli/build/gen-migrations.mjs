// 生成 src/migrations/surface.generated.json：每个 major 的公开面差异，供 migrate 命令改名与报删除。
//
// 数据取自 git 标签上的公开面基线（ui/tooling/public-surface.json）：上一个 major 的最后一版对本 major 的首版。
// 顺带逐条核对 src/migrations/v*.ts 里手写的改名：旧名在上一版里有、新名在新版里有，对不上就报错、不生成——
// 规则写错的后果是把使用方的代码改成一个不存在的名字，宁可在这里拦下。
//
// 标签只在完整克隆里有，所以本脚本手动运行（发一个新 major 时补一套规则后跑一次），产物入库，构建与测试只读产物。
//
// 用法：node build/gen-migrations.mjs

import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { V2 } from '../src/migrations/v2.ts'
import { V3 } from '../src/migrations/v3.ts'
import { V4 } from '../src/migrations/v4.ts'
import { V5 } from '../src/migrations/v5.ts'

const PKG = dirname(dirname(fileURLToPath(import.meta.url)))
const OUT = join(PKG, 'src', 'migrations', 'surface.generated.json')
const RULES = [V2, V3, V4, V5]

const git = args => execFileSync('git', args, { cwd: PKG, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
const versions = git(['tag', '--list', 'v*']).split('\n').map(t => t.trim()).filter(t => /^v\d+\.\d+\.\d+$/.test(t))
const parse = tag => tag.slice(1).split('.').map(Number)
function newer(a, b) {
  const [x, y] = [parse(a), parse(b)]
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]
}

/** 上一个 major 的最后一版与本 major 的首版。 */
function tagsFor(major) {
  const previous = versions.filter(t => parse(t)[0] === major - 1).sort(newer).at(-1)
  const first = `v${major}.0.0`
  if (!previous || !versions.includes(first))
    throw new Error(`找不到 ${major - 1}.x 的最后一版或 ${first} 的标签`)
  return [previous, first]
}

const surfaces = new Map()
function surface(tag) {
  if (!surfaces.has(tag))
    surfaces.set(tag, JSON.parse(git(['show', `${tag}:ui/tooling/public-surface.json`])))
  return surfaces.get(tag)
}

const kebab = name => name.replace(/[A-Z]/g, (char, index) => `${index > 0 ? '-' : ''}${char.toLowerCase()}`)
const pascal = name => name.replace(/(?:^|-)([a-z0-9])/g, (_, char) => char.toUpperCase())
const lowerFirst = name => name[0].toLowerCase() + name.slice(1)
const sorted = values => [...values].sort()

/** 一版基线里的各类名字，统一成集合。 */
function view(tag) {
  const s = surface(tag)
  const elements = Array.isArray(s.elements) ? Object.fromEntries(s.elements.map(t => [t, { attributes: [], events: [] }])) : s.elements ?? {}
  const specifiers = new Set(Object.entries(s.packages ?? {}).flatMap(([pkg, subs]) => subs.map(sub => (sub === '.' ? pkg : `${pkg}${sub.slice(1)}`))))
  return {
    exportsOf: pkg => new Set(s.exports[pkg] ?? []),
    allExports: new Set(Object.values(s.exports).flat()),
    packages: Object.keys(s.exports),
    specifiers,
    scopes: Object.keys(s.anatomy ?? {}),
    parts: scope => new Set(s.anatomy?.[scope] ?? []),
    props: scope => new Set(s.componentProps?.[scope] ?? []),
    tags: Object.keys(elements),
    attributes: tag => new Set(elements[tag]?.attributes ?? []),
    css: new Set([...(s.cssSlots ?? []), ...(s.tokens ?? [])]),
    keyframes: new Set(s.keyframes ?? []),
    data: new Set(s.dataAttributes ?? []),
  }
}

/** 包内子入口（@xihan-ui/core/color）属于哪个包。 */
const packageOf = specifier => specifier.split('/').slice(0, 2).join('/')

/** 标签名按最长的组件标识前缀归到组件。 */
function scopeOfTag(tag, scopes) {
  const parts = tag.replace(/^xh-/, '').split('-')
  for (let size = parts.length; size > 0; size--) {
    const candidate = parts.slice(0, size).join('-')
    if (scopes.includes(candidate))
      return candidate
  }
  return undefined
}

const problems = []
const diffs = []

for (const rules of RULES) {
  const [fromTag, toTag] = tagsFor(rules.major)
  const A = view(fromTag)
  const B = view(toTag)
  const where = `${rules.major}（${fromTag} → ${toTag}）`
  const check = (ok, message) => {
    if (!ok)
      problems.push(`${where}：${message}`)
  }

  for (const [from, to] of Object.entries(rules.modules ?? {})) {
    check(A.specifiers.has(from), `模块 ${from} 在上一版里没有`)
    check(B.specifiers.has(to), `模块 ${to} 在新版里没有`)
  }
  for (const moved of rules.imports ?? []) {
    check(B.specifiers.has(moved.to), `模块 ${moved.to} 在新版里没有`)
    for (const [name, renamed] of Object.entries(moved.names)) {
      check(A.exportsOf(packageOf(moved.from)).has(name), `${moved.from} 在上一版里没有导出 ${name}`)
      check(B.exportsOf(packageOf(moved.to)).has(renamed === true ? name : renamed), `${moved.to} 在新版里没有导出 ${renamed === true ? name : renamed}`)
    }
  }
  for (const [from, rename] of Object.entries(rules.identifiers ?? {})) {
    const to = typeof rename === 'string' ? rename : rename.to
    check(A.allExports.has(from), `导出名 ${from} 在上一版里没有`)
    check(B.allExports.has(to), `导出名 ${to} 在新版里没有`)
  }
  for (const rename of rules.props ?? []) {
    for (const component of rename.components) {
      if (rename.only === 'web-components') {
        const tags = A.tags.filter(tag => scopeOfTag(tag, A.scopes) === component)
        check(tags.some(tag => A.attributes(tag).has(kebab(rename.from))), `<${tags.join('|')}> 在上一版里没有 attribute ${kebab(rename.from)}`)
        check(tags.some(tag => B.attributes(tag).has(kebab(rename.to))), `<${tags.join('|')}> 在新版里没有 attribute ${kebab(rename.to)}`)
        continue
      }
      check(A.props(component).has(rename.from), `${component} 在上一版里没有属性 ${rename.from}`)
      check(B.props(component).has(rename.to), `${component} 在新版里没有属性 ${rename.to}`)
    }
  }
  for (const rename of rules.events ?? []) {
    for (const component of rename.components) {
      check(A.props(component).has(`on${pascal(rename.from)}`), `${component} 在上一版里没有事件 ${rename.from}`)
      check(B.props(component).has(`on${pascal(rename.to)}`), `${component} 在新版里没有事件 ${rename.to}`)
    }
  }
  for (const rename of rules.elements ?? []) {
    check(A.tags.includes(rename.from), `元素 ${rename.from} 在上一版里没有`)
    check(B.tags.includes(rename.to), `元素 ${rename.to} 在新版里没有`)
    const scope = scopeOfTag(rename.to, B.scopes)
    for (const part of Object.values(rename.parts ?? {}))
      check(B.parts(scope).has(part), `${scope} 在新版里没有部件 ${part}`)
  }
  for (const [from, to] of Object.entries(rules.cssVariables ?? {})) {
    check(A.css.has(from), `CSS 变量 ${from} 在上一版里没有`)
    check(B.css.has(to), `CSS 变量 ${to} 在新版里没有`)
  }
  for (const [from, to] of Object.entries(rules.keyframes ?? {})) {
    check(A.keyframes.has(from), `关键帧 ${from} 在上一版里没有`)
    check(B.keyframes.has(to), `关键帧 ${to} 在新版里没有`)
  }
  for (const [from, to] of Object.entries(rules.dataAttributes ?? {})) {
    check(A.data.has(from), `${from} 在上一版里没有`)
    check(B.data.has(to), `${to} 在新版里没有`)
  }

  // —— 成批改名：组件改名按名字片段换，部件改名换部件组件；新版里有的才收 ——
  const removedExports = [...A.allExports].filter(name => !B.allExports.has(name))
  const identifiers = {}
  const elements = {}
  const cssVariables = {}
  for (const [from, to] of Object.entries(rules.components ?? {})) {
    for (const name of removedExports) {
      const candidate = name.includes(from)
        ? name.replace(from, to)
        : name.startsWith(lowerFirst(from)) ? lowerFirst(to) + name.slice(from.length) : undefined
      if (candidate && B.allExports.has(candidate) && !identifiers[name])
        identifiers[name] = candidate
    }
    const [oldTag, newTag] = [`xh-${kebab(from)}`, `xh-${kebab(to)}`]
    check(A.tags.includes(oldTag) && B.tags.includes(newTag), `元素 ${oldTag} → ${newTag} 对不上`)
    if (A.tags.includes(oldTag) && B.tags.includes(newTag))
      elements[oldTag] = newTag
    const prefix = `--xh-${kebab(from)}-`
    for (const name of A.css) {
      const candidate = `--xh-${kebab(to)}-${name.slice(prefix.length)}`
      if (name.startsWith(prefix) && !B.css.has(name) && B.css.has(candidate))
        cssVariables[name] = candidate
    }
  }
  for (const rename of rules.parts ?? []) {
    for (const component of rename.components) {
      check(A.parts(component).has(rename.from), `${component} 在上一版里没有部件 ${rename.from}`)
      check(B.parts(component).has(rename.to), `${component} 在新版里没有部件 ${rename.to}`)
      for (const suffix of ['', 'Props']) {
        const [from, to] = [`Xh${pascal(component)}${pascal(rename.from)}${suffix}`, `Xh${pascal(component)}${pascal(rename.to)}${suffix}`]
        if (A.allExports.has(from) && !B.allExports.has(from) && B.allExports.has(to))
          identifiers[from] = to
      }
    }
  }

  // —— 删除清单 ——
  const exportsByPackage = {}
  for (const pkg of A.packages) {
    const gone = [...A.exportsOf(pkg)].filter(name => !B.exportsOf(pkg).has(name))
    if (gone.length > 0)
      exportsByPackage[pkg] = sorted(gone)
  }
  const perScope = (read) => {
    const out = {}
    for (const scope of A.scopes) {
      const gone = [...read(A, scope)].filter(name => !read(B, scope).has(name))
      if (gone.length > 0)
        out[scope] = sorted(gone)
    }
    return out
  }
  const elementAttributes = {}
  for (const tag of A.tags.filter(tag => B.tags.includes(tag))) {
    const gone = [...A.attributes(tag)].filter(name => !B.attributes(tag).has(name))
    if (gone.length > 0)
      elementAttributes[tag] = sorted(gone)
  }

  diffs.push({
    major: rules.major,
    from: fromTag,
    to: toTag,
    scopes: sorted(A.scopes),
    tags: sorted(A.tags),
    renamed: { identifiers, elements, cssVariables },
    removed: {
      exports: exportsByPackage,
      subpaths: sorted([...A.specifiers].filter(s => !B.specifiers.has(s))),
      props: perScope((v, scope) => v.props(scope)),
      parts: perScope((v, scope) => v.parts(scope)),
      cssVariables: sorted([...A.css].filter(name => !B.css.has(name))),
      keyframes: sorted([...A.keyframes].filter(name => !B.keyframes.has(name))),
      elements: sorted(A.tags.filter(tag => !B.tags.includes(tag))),
      elementAttributes,
      dataAttributes: sorted([...A.data].filter(name => !B.data.has(name))),
    },
  })
  console.log(`[gen-migrations] ${where}：成批改名 ${Object.keys(identifiers).length} 个导出名、${Object.keys(elements).length} 个元素、${Object.keys(cssVariables).length} 个 CSS 变量`)
}

if (problems.length > 0) {
  console.error('[gen-migrations] ✗ 手写规则与公开面基线对不上：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  process.exit(1)
}

writeFileSync(OUT, `${JSON.stringify(diffs, null, 2)}\n`)
console.log(`[gen-migrations] 已生成 ${OUT}`)
