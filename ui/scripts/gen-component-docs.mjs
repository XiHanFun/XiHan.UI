// 由组件源码生成文档站的组件参考页：一个组件一页。
//
// 数据来源三处，都是机读的：
//   - headless 产物：解剖（parts）、必备部件（requiredParts）、键盘表（含 APG 出处）
//   - headless 源码类型：Schema 的 props / state / event，以及 XxxApi 接口成员
//   - 适配器源码：Vue 导出名、自定义元素标签名、组合式函数名、皮肤文件
// 中文名与分类归属来自 component-docs.manifest.json，需人工维护；
// 代码里有而 manifest 里没登记的组件会让本脚本失败，不会被静默漏掉。
//
// 示例不在生成范围内：写在 docs/.vitepress/demos/<组件>/*.vue，本脚本只负责发现并挂上去。
// 用法：node scripts/gen-component-docs.mjs [--check]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const here = path.dirname(fileURLToPath(import.meta.url))
const uiRoot = path.resolve(here, '..')
const repoRoot = path.resolve(uiRoot, '..')
const docsRoot = path.join(repoRoot, 'docs')
const outDir = path.join(docsRoot, 'components')
const demosRoot = path.join(docsRoot, '.vitepress', 'demos')

const checkOnly = process.argv.includes('--check')

// 中文名与分类：渲染与校验都读它，声明须早于使用它的函数
const manifest = JSON.parse(
  fs.readFileSync(path.join(here, 'component-docs.manifest.json'), 'utf8'),
)

/** kebab → PascalCase */
const pascal = id => id.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase())
/** kebab → camelCase */
function camel(id) {
  const p = pascal(id)
  return p[0].toLowerCase() + p.slice(1)
}

// ── 产物元数据 ────────────────────────────────────────────────────────────────

const headless = await import(
  new URL('../packages/engine/headless/dist/index.js', import.meta.url).href,
)

function runtimeMeta(id) {
  const key = camel(id)
  const anatomy = headless[`${key}Anatomy`]
  const meta = headless[`${key}Meta`]
  const keyboard = headless[`${key}Keyboard`]
  if (!anatomy || !meta || !keyboard) {
    throw new Error(`组件 ${id} 缺少 anatomy / meta / keyboard 三件中的某一件`)
  }
  return {
    parts: anatomy.parts,
    requiredParts: meta.requiredParts,
    keyboard,
  }
}

// ── 适配器产物 ────────────────────────────────────────────────────────────────

const vueIndex = fs.readFileSync(
  path.join(uiRoot, 'packages/adapters/vue/dist/index.d.ts'),
  'utf8',
)
// 产物按模块拆开之后 barrel 里不再有 declare，公开名散在 import 与末尾那条 export 列表里。
// 两种形态都收：只认 declare 会让整列 Vue 组件在文档里凭空消失
const vueExports = new Set([
  ...[...vueIndex.matchAll(/declare (?:const|function) (Xh[A-Za-z0-9]+|use[A-Za-z0-9]+)/g)].map(m => m[1]),
  ...[...vueIndex.matchAll(/\b(Xh[A-Z][A-Za-z0-9]*|use[A-Z][A-Za-z0-9]*)\b/g)].map(m => m[1]),
])

const wcDefine = fs.readFileSync(path.join(uiRoot, 'packages/adapters/web-components/src/define.ts'), 'utf8')
const wcTags = new Set([...wcDefine.matchAll(/['"`](xh-[a-z0-9-]+)['"`]/g)].map(m => m[1]))

function adapterArtifacts(id) {
  const P = pascal(id)
  // XhSwitch 与 XhSwitchThumb 都算 switch 的产物，但 XhSwitchGroup 不是——
  // 用「下一个字符不是小写」把 toggle 与 toggle-group 这类前缀重叠的组件分开
  const owned = [...vueExports].filter(
    name => name === `Xh${P}` || name.startsWith(`Xh${P}`),
  )
  const siblings = manifest.categories
    .flatMap(c => c.components.map(x => x.id))
    .filter(other => other !== id && pascal(other).startsWith(P))
  const components = owned
    .filter(name => !siblings.some(s => name.startsWith(`Xh${pascal(s)}`)))
    .sort()
  const composable = vueExports.has(`use${P}`) ? `use${P}` : null
  const tag = wcTags.has(`xh-${id}`) ? `xh-${id}` : null
  const skinPath = path.join(uiRoot, 'packages/design/styles/css', `${id}.css`)
  const skin = fs.existsSync(skinPath) ? `@xihan-ui/styles/${id}.css` : null
  return { components, composable, tag, skin }
}

// ── 类型元数据 ────────────────────────────────────────────────────────────────

const typeFiles = fs
  .readdirSync(path.join(uiRoot, 'packages/engine/headless/src'), { withFileTypes: true })
  .filter(d => d.isDirectory())
  .flatMap((d) => {
    const dir = path.join(uiRoot, 'packages/engine/headless/src', d.name)
    return fs
      .readdirSync(dir)
      .filter(f => f.endsWith('.types.ts'))
      .map(f => path.join(dir, f))
  })

// 开模块解析：popconfirm 与 float-button 的 props 是从别的组件 Omit 出来的类型别名，
// 不跟着 import 走就取不到成员。其余组件的抽取只读语法树，解析与否不影响产出。
const program = ts.createProgram(typeFiles, {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  strict: false,
})
const checker = program.getTypeChecker()

/** 取声明前的 JSDoc 正文，多行合成一行 */
function jsdoc(node, sf) {
  const ranges = ts.getLeadingCommentRanges(sf.text, node.getFullStart()) ?? []
  const block = ranges
    .map(r => sf.text.slice(r.pos, r.end))
    .filter(t => t.startsWith('/**'))
    .pop()
  if (!block)
    return ''
  return block
    .replace(/^\/\*\*/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map(line => line.replace(/^\s*\*/, '').trim())
    .filter(Boolean)
    .join(' ')
    .trim()
}

/** 把类型节点还原成源码文本，去掉换行 */
function typeText(node, sf) {
  return node.getText(sf).replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ')
}

/** 联合类型字面量成员，非联合则返回 null */
function unionMembers(node, sf) {
  if (!node)
    return null
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
    return [node.literal.text]
  }
  if (!ts.isUnionTypeNode(node))
    return null
  const out = []
  for (const t of node.types) {
    if (ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal)) {
      out.push(t.literal.text)
    }
    else if (ts.isTypeLiteralNode(t)) {
      // 事件写成 { type: 'TOGGLE'; ... } 的对象联合，取 type 字面量
      const typeProp = t.members.find(
        mm => ts.isPropertySignature(mm) && mm.name?.getText(sf) === 'type',
      )
      const lit = typeProp?.type
      if (lit && ts.isLiteralTypeNode(lit) && ts.isStringLiteral(lit.literal)) {
        out.push(lit.literal.text)
      }
    }
  }
  return out.length ? out : null
}

function typeMeta(id) {
  const P = pascal(id)
  const result = { props: [], api: [], states: null, events: null, guards: null }
  for (const sf of program.getSourceFiles()) {
    if (!typeFiles.includes(path.normalize(sf.fileName)))
      continue
    ts.forEachChild(sf, (node) => {
      if (!ts.isInterfaceDeclaration(node) && !ts.isTypeAliasDeclaration(node))
        return
      const name = node.name.text

      if (ts.isInterfaceDeclaration(node) && name === `${P}Schema`) {
        for (const member of node.members) {
          if (!ts.isPropertySignature(member) || !member.type)
            continue
          const key = member.name.getText(sf)
          if (key === 'props' && ts.isTypeLiteralNode(member.type)) {
            for (const p of member.type.members) {
              if (!ts.isPropertySignature(p) || !p.type)
                continue
              result.props.push({
                name: p.name.getText(sf),
                type: typeText(p.type, sf),
                optional: Boolean(p.questionToken),
                doc: jsdoc(p, sf),
              })
            }
          }
          if (key === 'state')
            result.states = unionMembers(member.type, sf)
          if (key === 'event')
            result.events = unionMembers(member.type, sf)
          if (key === 'guard')
            result.guards = unionMembers(member.type, sf)
        }
      }

      // 少数组件没有自己的机器，props 写成 `Omit<别人Schema['props'], …> & …` 这样的类型别名
      // （popconfirm、float-button）。只认 interface 的读法会让它们的 Props 表整页缺席。
      if (result.props.length === 0 && ts.isTypeAliasDeclaration(node) && name === `${P}Props`) {
        for (const sym of checker.getPropertiesOfType(checker.getTypeAtLocation(node.type))) {
          const decl = sym.declarations?.[0]
          if (!decl || !ts.isPropertySignature(decl) || !decl.type)
            continue
          const declSf = decl.getSourceFile()
          result.props.push({
            name: sym.name,
            type: typeText(decl.type, declSf),
            optional: Boolean(decl.questionToken),
            doc: jsdoc(decl, declSf),
          })
        }
        result.props.sort((a, b) => a.name.localeCompare(b.name))
      }

      if (ts.isInterfaceDeclaration(node) && name === `${P}Api`) {
        for (const member of node.members) {
          if (!ts.isPropertySignature(member) || !member.type)
            continue
          result.api.push({
            name: member.name.getText(sf),
            type: typeText(member.type, sf),
            doc: jsdoc(member, sf),
          })
        }
      }
    })
  }
  return result
}

// ── 示例 ─────────────────────────────────────────────────────────────────────

function demos(id) {
  const dir = path.join(demosRoot, id)
  if (!fs.existsSync(dir))
    return []
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.vue'))
    .sort()
    .map((f) => {
      const src = `${id}/${f.replace(/\.vue$/, '')}`
      // 示例的标题与说明写在文件首行注释里：`标题 | 说明`。
      // 标题在这里落成 h3，右侧目录才索引得到每个示例。
      const head
        = fs.readFileSync(path.join(dir, f), 'utf8').match(/^<!--([\s\S]*?)-->/)?.[1] ?? ''
      const [title, ...rest] = head.trim().split('|')
      // 标题与说明是作者写的散文，裸的 < 会被 Vue 编译器当成缺闭合标签的元素、
      // 让整站构建挂掉。这里统一转义，作者不必记着这条
      const prose = x => x.replace(/</g, '&lt;')
      return {
        src,
        title: title.trim() || f.replace(/\.vue$/, ''),
        description: prose(rest.join('|').trim()),
      }
    })
}

// ── 渲染 ─────────────────────────────────────────────────────────────────────

const esc = s => String(s).replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const code = s => `\`${String(s).replace(/`/g, '')}\``
// 表格单元格里的代码格：管道符不转义会被当成列分隔符，把这一格从中间切断，
// 反引号随之失配，剩下的泛型尖括号就成了没有闭合的 HTML 标签
const cell = s => code(s).replace(/\|/g, '\\|')

function renderComponent(entry, category) {
  const { id, name } = entry
  const rt = runtimeMeta(id)
  const ad = adapterArtifacts(id)
  const tm = typeMeta(id)
  const ex = demos(id)
  const required = new Set(rt.requiredParts)

  const L = []
  L.push(`# ${name} <Badge type="info" text="${id}" />`, '')
  L.push(
    `${category.label}组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。`,
    '',
  )

  // 示例排在最前：看的人先要能照着抄，其次才关心产物与契约。
  // 每个示例的标题落成 h3，右侧目录逐个索引得到。
  if (ex.length) {
    L.push('## 示例', '')
    for (const demo of ex) {
      L.push(`### ${demo.title}`, '')
      if (demo.description)
        L.push(demo.description, '')
      L.push(`<XhDemo src="${demo.src}" />`, '')
    }
  }

  // 产物
  L.push('## 产物', '')
  L.push('| 层 | 值 |', '| --- | --- |')
  if (ad.tag)
    L.push(`| 自定义元素 | ${code(`<${ad.tag}>`)} |`)
  if (ad.components.length)
    L.push(`| Vue 组件 | ${ad.components.map(code).join(' ')} |`)
  if (ad.composable)
    L.push(`| 组合式函数 | ${code(ad.composable)} |`)
  L.push(
    `| 状态机 | ${tm.states ? code(`${camel(id)}Machine`) : '无，`connect` 直接由 props 算属性'} |`,
  )
  if (ad.skin)
    L.push(`| 皮肤 | ${code(ad.skin)} |`)
  L.push('')

  // 解剖
  L.push('## 解剖', '')
  L.push(
    `部件名即 ${code('data-part')} 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 ${code('wc.missing-part')}）。`,
    '',
  )
  L.push(
    `${code(`data-scope="${id}"`)}：${
      rt.parts.map(p => (required.has(p) ? `**${code(p)}**` : code(p))).join(' · ')}`,
    '',
  )

  // Props
  if (tm.props.length) {
    L.push('## Props', '')
    L.push('| 属性 | 类型 | 必填 | 说明 |', '| --- | --- | --- | --- |')
    for (const p of tm.props) {
      L.push(
        `| ${cell(p.name)} | ${cell(p.type)} | ${p.optional ? '' : '是'} | ${esc(p.doc)} |`,
      )
    }
    L.push('')
  }

  // 状态机
  if (tm.states || tm.events) {
    L.push('## 状态机', '')
    if (tm.states)
      L.push(`**状态**：${tm.states.map(code).join(' · ')}`, '')
    if (tm.events)
      L.push(`**事件**：${tm.events.map(code).join(' · ')}`, '')
    if (tm.guards)
      L.push(`**判据**：${tm.guards.map(code).join(' · ')}`, '')
  }

  // connect API
  if (tm.api.length) {
    L.push('## connect API', '')
    L.push(
      `${code(ad.composable ?? 'connect')} 产出的对象。${code('getXxxProps()')} 铺到对应部件的宿主元素上，其余是可读状态与操作入口。`,
      '',
    )
    L.push('| 成员 | 类型 | 说明 |', '| --- | --- | --- |')
    for (const a of tm.api) {
      L.push(`| ${cell(a.name)} | ${cell(a.type)} | ${esc(a.doc)} |`)
    }
    L.push('')
  }

  // 键盘
  L.push('## 键盘', '')
  L.push(`规格出处：[W3C APG](${rt.keyboard.source})`, '')
  if (rt.keyboard.rows.length) {
    L.push('| 按键 | 生效条件 | 行为 |', '| --- | --- | --- |')
    for (const r of rt.keyboard.rows) {
      L.push(`| ${r.keys.map(code).join(' / ')} | ${esc(r.when)} | ${esc(r.does)} |`)
    }
  }
  else {
    L.push('无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。')
  }
  L.push('')

  return L.join('\n')
}

function renderIndex() {
  const total = manifest.categories.reduce((a, c) => a + c.components.length, 0)
  const L = []
  L.push('# 组件总览', '')
  L.push(
    `${total} 个组件，每个都同时提供**无头内核**（\`@xihan-ui/headless\`）、**Vue 组件**（\`@xihan-ui/vue\`）、**自定义元素**（\`@xihan-ui/web-components\`）与**默认皮肤**（\`@xihan-ui/styles\`）四份产物。四者同源：内核是唯一的行为定义，另外三份不重新实现任何逻辑。`,
    '',
  )
  L.push(
    '本册每个组件一页，页内固定为：产物 · 示例 · 解剖 · Props · 状态机 · connect API · 键盘。除示例外全部由组件源码生成，不会与代码对不上。',
    '',
  )
  for (const c of manifest.categories) {
    L.push(`## ${c.label}`, '')
    L.push(c.description, '')
    L.push('| 组件 | 标识 | 部件数 | 键盘条目 | 示例 |', '| --- | --- | --- | --- | --- |')
    for (const entry of c.components) {
      const rt = runtimeMeta(entry.id)
      const n = demos(entry.id).length
      L.push(
        `| [${entry.name}](./${entry.id}) | ${code(entry.id)} | ${rt.parts.length} | ${rt.keyboard.rows.length} | ${n || '—'} |`,
      )
    }
    L.push('')
  }
  return L.join('\n')
}

// ── 主流程 ───────────────────────────────────────────────────────────────────

const registered = new Set(
  manifest.categories.flatMap(c => c.components.map(x => x.id)),
)
const inCode = Object.keys(headless)
  .filter(k => k.endsWith('Meta'))
  .map(k => headless[k].component)

const missing = inCode.filter(id => !registered.has(id))
const extra = [...registered].filter(id => !inCode.includes(id))
if (missing.length || extra.length) {
  if (missing.length)
    console.error(`代码里有但 manifest 未登记：${missing.join(', ')}`)
  if (extra.length)
    console.error(`manifest 登记了但代码里没有：${extra.join(', ')}`)
  console.error('请更新 ui/scripts/component-docs.manifest.json')
  process.exit(1)
}

const files = new Map()
for (const c of manifest.categories) {
  for (const entry of c.components) {
    files.set(path.join(outDir, `${entry.id}.md`), renderComponent(entry, c))
  }
}
files.set(path.join(outDir, 'index.md'), renderIndex())

if (checkOnly) {
  const drifted = []
  for (const [file, content] of files) {
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
    if (current !== content)
      drifted.push(path.relative(repoRoot, file))
  }
  const known = new Set([...files.keys()].map(f => path.basename(f)))
  const orphan = fs
    .readdirSync(outDir)
    .filter(f => f.endsWith('.md') && !known.has(f))
    .map(f => `components/${f}（已不在 manifest 中）`)
  const all = [...drifted, ...orphan]
  if (all.length) {
    console.error('组件文档与源码不同步，请在 ui/ 下执行 pnpm gen:docs：')
    for (const f of all) console.error(`  ${f}`)
    process.exit(1)
  }
  console.log(`组件文档已同步（${files.size} 个文件）`)
}
else {
  fs.mkdirSync(outDir, { recursive: true })
  const known = new Set([...files.keys()].map(f => path.basename(f)))
  for (const f of fs.readdirSync(outDir)) {
    if (f.endsWith('.md') && !known.has(f))
      fs.rmSync(path.join(outDir, f))
  }
  for (const [file, content] of files) fs.writeFileSync(file, content)
  console.log(`已生成 ${files.size} 个组件文档文件`)
}
