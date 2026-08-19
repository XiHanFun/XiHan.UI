// 由组件源码生成文档站的组件参考页：一个组件一页。
//
// 数据来源三处，都是机读的：
//   - headless 产物：解剖（parts）、必备部件（requiredParts）、键盘表（含 APG 出处）
//   - headless 源码类型：Schema 的 props / state / event，以及 XxxApi 接口成员
//   - 适配器源码：Vue 导出名、自定义元素标签名、组合式函数名、皮肤文件
// 中文名与分类归属来自 component-docs.manifest.json，需人工维护；
// 代码里有而 manifest 里没登记的组件会让本脚本失败，不会被静默漏掉。
//
// 示例不在生成范围内：写在 docs/.vitepress/demos/<组件>/ 下，本脚本只负责发现并挂上去。
// 同一个示例的各框架版本同名不同扩展名（01-basic.vue / 01-basic.html），按基名归并成一条，
// 落进页面的 src 不带扩展名，由文档站按当前选中的框架取对应文件。
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

// 示例的框架清单：id / 显示名 / 扩展名 / 语法高亮语言 / 文档站是否已接入渲染。
// 本脚本、门禁与文档站读同一份，加一个框架只改那个文件
const { frameworks } = JSON.parse(
  fs.readFileSync(path.join(here, 'demo-frameworks.json'), 'utf8'),
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

// 自定义元素清单：公开事件与可覆盖令牌都已由 cem 采集，按标签名取用即可，
// 不必在这里再解析一遍源码。
const cem = JSON.parse(
  fs.readFileSync(path.join(uiRoot, 'packages/adapters/web-components/custom-elements.json'), 'utf8'),
)
const cemByTag = new Map()
for (const mod of cem.modules ?? []) {
  for (const decl of mod.declarations ?? []) {
    if (decl.tagName)
      cemByTag.set(decl.tagName, decl)
  }
}

/** 公开事件与组件级令牌。没有自定义元素的组件（纯 Vue 产物）两样都空。 */
function elementSurface(id) {
  const decl = cemByTag.get(`xh-${id}`)
  return {
    events: decl?.events ?? [],
    cssProps: (decl?.cssProperties ?? []).map(p => p.name).sort(),
  }
}

// ── 连接层属性面：数据属性与 ARIA ─────────────────────────────────────────────

const headlessSrc = path.join(uiRoot, 'packages/engine/headless/src')

/**
 * 收集 connect 源码里的顶层 const：属性值常写成 `const stateAttr = open ? 'open' : 'closed'`
 * 这样的中间量，不顺着查一层，表里落下的就是「stateAttr」这种对读者无意义的名字。
 */
function localBindings(sf) {
  const map = new Map()
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer)
      map.set(node.name.text, node)
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return map
}

/** 字符串字面量联合类型 → `'a' | 'b'`；不是这种类型返回 null。 */
function literalUnionText(typeNode, sf) {
  const members = unionMembers(typeNode, sf)
  return members ? members.map(m => `'${m}'`).join(' | ') : null
}

/** 把属性值表达式压成一句人读得懂的话；认不出就原样截断。 */
function readAttrValue(node, sf, locals, seen = new Set()) {
  if (!node)
    return ''

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    return `'${node.text}'`
  if (node.kind === ts.SyntaxKind.TrueKeyword)
    return `'true'`
  if (node.kind === ts.SyntaxKind.FalseKeyword)
    return `'false'`

  if (ts.isParenthesizedExpression(node))
    return readAttrValue(node.expression, sf, locals, seen)

  if (ts.isConditionalExpression(node)) {
    const a = readAttrValue(node.whenTrue, sf, locals, seen)
    const b = readAttrValue(node.whenFalse, sf, locals, seen)
    return a && b && a !== b ? `${a} | ${b}` : a || b
  }

  // `${ids.label} ${ids.value-text}` 这类拼接：逐段解出来再拼回去
  if (ts.isTemplateExpression(node)) {
    const parts = [node.head.text]
    for (const span of node.templateSpans)
      parts.push(readAttrValue(span.expression, sf, locals, seen), span.literal.text)
    return parts.join('').trim()
  }

  if (ts.isPropertyAccessExpression(node)) {
    const owner = node.expression.getText(sf)
    // ids.content：scope.ids() 发的部件 id
    if (owner === 'ids')
      return `\`${node.name.text}\` 部件的 id`
    // prop('translations')?.close：落成 props.translations.close 更好读
    if (/^prop\('translations'\)$/.test(owner))
      return `props.translations.${node.name.text}`
    // position?.placement：落位是定位引擎按可用空间算出来的，不是 props 里那个首选值
    if (owner === 'position' && node.name.text === 'placement')
      return '定位引擎算出的实际落位'
  }
  if (ts.isElementAccessExpression(node)
    && node.expression.getText(sf) === 'ids'
    && ts.isStringLiteral(node.argumentExpression)) {
    return `\`${node.argumentExpression.text}\` 部件的 id`
  }

  if (ts.isCallExpression(node)) {
    const fn = node.expression.getText(sf)
    // prop('x') 直读同名 prop；dataAttr/ariaAttr 条件为真才落到 DOM 上
    if (fn === 'prop' && ts.isStringLiteral(node.arguments[0]))
      return `props.${node.arguments[0].text}`
    if (fn === 'dataAttr')
      return `''（条件成立时才出现）`
    if (fn === 'ariaAttr')
      return `'true'（条件成立时才出现）`
    // triggerId(x) / contentId(x) 一族：按名字就能认出是在发某个部件的 id
    const idHelper = /^(\w+)Id$/.exec(fn)
    if (idHelper)
      return `\`${idHelper[1].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}\` 部件的 id`
    // stateAttr(item) 这类本地小函数：查到声明，优先读它的返回类型，其次读函数体
    const decl = ts.isIdentifier(node.expression) ? locals.get(fn) : null
    const fnNode = decl?.initializer
    if (fnNode && (ts.isArrowFunction(fnNode) || ts.isFunctionExpression(fnNode)) && !seen.has(fn)) {
      const next = new Set(seen).add(fn)
      const byType = literalUnionText(fnNode.type, sf)
      if (byType)
        return byType
      if (ts.isArrowFunction(fnNode) && !ts.isBlock(fnNode.body))
        return readAttrValue(fnNode.body, sf, locals, next)
    }
  }

  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
    return readAttrValue(node.left, sf, locals, seen) || readAttrValue(node.right, sf, locals, seen)

  // 中间量顺着查一层：const stateAttr = open ? 'open' : 'closed'
  if (ts.isIdentifier(node) && !seen.has(node.text)) {
    const decl = locals.get(node.text)
    if (decl) {
      const next = new Set(seen).add(node.text)
      const byType = literalUnionText(decl.type, sf)
      if (byType)
        return byType
      const resolved = readAttrValue(decl.initializer, sf, locals, next)
      if (resolved)
        return resolved
    }
  }

  const text = typeText(node, sf)
  return text.length > 56 ? `${text.slice(0, 53)}…` : text
}

/** getXxxProps → 部件名，驼峰段转 kebab。 */
function getterPart(getter) {
  return getter
    .replace(/^get/, '')
    .replace(/Props$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * 从 connect 源码里把每个部件铺到 DOM 上的 data-* / aria-* / role 抓出来。
 * 只认字面量键，动态拼出来的键抓不到——那类目前一个都没有。
 */
function attrSurface(id, parts, states) {
  const file = path.join(headlessSrc, id, `${id}.connect.ts`)
  if (!fs.existsSync(file))
    return { data: [], aria: [] }
  const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  const locals = localBindings(sf)
  const data = []
  const aria = []
  const seen = new Set()

  const collect = (node, part) => {
    if (ts.isObjectLiteralExpression(node)) {
      for (const m of node.properties) {
        if (!ts.isPropertyAssignment(m) || !m.name)
          continue
        const key = ts.isStringLiteral(m.name) || ts.isIdentifier(m.name) ? m.name.text : null
        if (!key)
          continue
        const isAria = key.startsWith('aria-') || key === 'role'
        const bucket = key.startsWith('data-') ? data : isAria ? aria : null
        if (!bucket)
          continue
        const dedupe = `${part} ${key}`
        if (seen.has(dedupe))
          continue
        seen.add(dedupe)
        bucket.push({ part, attr: key, value: readAttrValue(m.initializer, sf, locals) })
      }
    }
    ts.forEachChild(node, c => collect(c, part))
  }

  const visit = (node) => {
    // 返回对象里的 getXxxProps 一支就是一个部件的属性面
    if ((ts.isPropertyAssignment(node) || ts.isMethodDeclaration(node)) && node.name) {
      const name = node.name.getText(sf)
      if (/^get[A-Z]\w*Props$/.test(name)) {
        collect(node, getterPart(name))
        return
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)

  const order = new Map(parts.map((x, i) => [x, i]))
  const sorter = (a, b) =>
    (order.get(a.part) ?? 99) - (order.get(b.part) ?? 99) || a.attr.localeCompare(b.attr)
  // state.get() 就是状态机的当前状态：直接落成状态全集，读者不必再翻状态机那一节
  const stateUnion = states?.map(x => `'${x}'`).join(' | ')
  const resolve = r => (stateUnion && r.value === 'state.get()' ? { ...r, value: stateUnion } : r)
  return { data: data.map(resolve).sort(sorter), aria: aria.map(resolve).sort(sorter) }
}

// ── 皮肤特征：动效 / 响应式 / RTL ─────────────────────────────────────────────

/** 默认皮肤里能直接读出来的几件事；没有皮肤返回 null，对应章节整个不出。 */
function skinTraits(id) {
  const file = path.join(uiRoot, 'packages/design/styles/css', `${id}.css`)
  if (!fs.existsSync(file))
    return null
  const css = fs.readFileSync(file, 'utf8')
  const uniq = re => [...new Set([...css.matchAll(re)].map(m => m[1].trim()))].sort()
  return {
    keyframes: uniq(/@keyframes\s+([\w-]+)/g),
    layers: uniq(/@layer\s+([\w.]+)/g),
    queries: uniq(/@(?:container|media)[^({]*\(([^)]+)\)/g).filter(
      q => !q.includes('prefers-reduced-motion') && !q.includes('prefers-color-scheme'),
    ),
    transition: /^\s*transition(?:-[a-z]+)?\s*:/m.test(css),
    reduceMotion: css.includes('prefers-reduced-motion'),
    logical: /(?:margin|padding|inset|border)-inline|inline-(?:start|end)/.test(css),
    dirRules: /\[dir=|:dir\(/.test(css),
  }
}

// ── 人工文案：与组件源码同放，本脚本只负责搬运 ────────────────────────────────

// 允许的小节名。写错的名字直接报错，不会静默丢掉一整段
const PROSE_SECTIONS = ['何时使用', '何时不用', '特性', '无障碍', '响应式', 'RTL', '组合', '最佳实践', '反模式']

/**
 * 读 <id>/<id>.doc.md：首个 ## 之前是概述，其后按小节名切开。
 * 文件缺席返回 null，页面照常生成，缺口由 --check 列出来。
 */
function prose(id) {
  const file = path.join(headlessSrc, id, `${id}.doc.md`)
  if (!fs.existsSync(file))
    return null
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
  const chunks = raw.split(/^## +/m)
  const out = { overview: chunks[0].replace(/^# .*$/m, '').trim(), sections: {} }
  for (const chunk of chunks.slice(1)) {
    const nl = chunk.indexOf('\n')
    const title = (nl === -1 ? chunk : chunk.slice(0, nl)).trim()
    if (!PROSE_SECTIONS.includes(title))
      throw new Error(`${id}.doc.md 里有未知小节「${title}」，可用：${PROSE_SECTIONS.join(' / ')}`)
    const body = (nl === -1 ? '' : chunk.slice(nl + 1)).trim()
    if (body)
      out.sections[title] = body
  }
  if (!out.overview)
    throw new Error(`${id}.doc.md 缺少概述（首个 ## 之前的正文）`)
  return out
}

// ── Vue 插槽 ──────────────────────────────────────────────────────────────────

const vueComponentRoot = path.join(uiRoot, 'packages/adapters/vue/src/components')

/** components/ 下的全部 .ts，含直接挂在根上的单文件组件。 */
function vueComponentFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name)
    if (d.isDirectory())
      return vueComponentFiles(full)
    return d.isFile() && d.name.endsWith('.ts') ? [full] : []
  })
}

const slotFiles = vueComponentFiles(vueComponentRoot)
const slotProgram = ts.createProgram(slotFiles, {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  strict: false,
})

/**
 * Vue 组件名 → 它声明的插槽。
 *
 * 只收 `slots: Object as SlotsType<{…}>` 这一种写法——门禁要求带载荷的插槽都这么写，
 * 所以这里列出的就是「作者能拿到载荷」的那些；纯转发内容的 default 插槽不声明，也不必列。
 */
const slotsByComponent = new Map()
for (const sf of slotProgram.getSourceFiles()) {
  if (!slotFiles.includes(path.normalize(sf.fileName)))
    continue
  ts.forEachChild(sf, (node) => {
    if (!ts.isVariableStatement(node))
      return
    for (const decl of node.declarationList.declarations) {
      const compName = decl.name.getText(sf)
      const init = decl.initializer
      if (!compName.startsWith('Xh') || !init || !ts.isCallExpression(init))
        continue
      const arg = init.arguments[0]
      if (!arg || !ts.isObjectLiteralExpression(arg))
        continue
      const slotsProp = arg.properties.find(
        p => ts.isPropertyAssignment(p) && p.name.getText(sf) === 'slots',
      )
      // 形态是 `Object as SlotsType<{…}>`：取 as 后面那个类型的第一个类型实参
      const asExpr = slotsProp?.initializer
      if (!asExpr || !ts.isAsExpression(asExpr))
        continue
      const ref = asExpr.type
      if (!ts.isTypeReferenceNode(ref) || ref.typeName.getText(sf) !== 'SlotsType')
        continue
      const lit = ref.typeArguments?.[0]
      if (!lit || !ts.isTypeLiteralNode(lit))
        continue
      const rows = []
      for (const m of lit.members) {
        if (!ts.isPropertySignature(m) || !m.type)
          continue
        // 值恒为函数类型，它的首个形参就是载荷；无形参即不带载荷
        const payload = ts.isFunctionTypeNode(m.type) && m.type.parameters.length
          ? typeText(m.type.parameters[0].type, sf)
          : ''
        rows.push({
          name: m.name.getText(sf).replace(/^['"]|['"]$/g, ''),
          optional: !!m.questionToken,
          payload,
          doc: jsdoc(m, sf),
        })
      }
      if (rows.length)
        slotsByComponent.set(compName, rows)
    }
  })
}

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

      // 没有自己机器的组件，props 不在 Schema 里，而是单独一个 XxxProps：
      // 有的写成 `Omit<别人Schema['props'], …> & …` 这样的类型别名（popconfirm、float-button），
      // 更多的直接写成 interface（qr-code、badge、card 等 30 余个）。两种形态都要认，
      // 少认一种就是整页 Props 表缺席——qr-code 的 pixelSize 曾因此全站无处可查。
      if (result.props.length === 0
        && (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node))
        && name === `${P}Props`) {
        // 别名取它右边那个类型，接口取声明自身
        const target = ts.isTypeAliasDeclaration(node) ? node.type : node
        for (const sym of checker.getPropertiesOfType(checker.getTypeAtLocation(target))) {
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

/** 取示例首行注释里的 `标题 | 说明`：标记语言写 `<!-- -->`，脚本写 `//`。 */
function demoHead(text) {
  return (text.match(/^<!--([\s\S]*?)-->/) ?? text.match(/^\/\/(.*)/))?.[1] ?? ''
}

function demos(id) {
  const dir = path.join(demosRoot, id)
  if (!fs.existsSync(dir))
    return []
  // 各框架的同名文件归成一条，键是不带扩展名的基名
  const byBase = new Map()
  for (const file of fs.readdirSync(dir).sort()) {
    const fw = frameworks.find(f => file.endsWith(f.ext))
    if (!fw)
      continue
    const base = file.slice(0, -fw.ext.length)
    if (!byBase.has(base))
      byBase.set(base, new Map())
    byBase.get(base).set(fw.id, file)
  }
  // 标题与说明是作者写的散文，裸的 < 会被 Vue 编译器当成缺闭合标签的元素、
  // 让整站构建挂掉。这里统一转义，作者不必记着这条
  const prose = x => x.replace(/</g, '&lt;')
  return [...byBase.keys()].sort().map((base) => {
    // 标题与说明取 Vue 那份，Vue 缺席就取存在的第一份
    const files = byBase.get(base)
    const file = files.get('vue') ?? [...files.values()][0]
    // 标题在这里落成 h3，右侧目录才索引得到每个示例。
    const head = demoHead(fs.readFileSync(path.join(dir, file), 'utf8'))
    const [title, ...rest] = head.trim().split('|')
    return {
      src: `${id}/${base}`,
      title: title.trim() || base,
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
  const es = elementSurface(id)
  const at = attrSurface(id, rt.parts, tm.states)
  const sk = skinTraits(id)
  const doc = prose(id)
  const required = new Set(rt.requiredParts)

  const L = []
  const push = (...xs) => L.push(...xs)
  /** 人工小节：写了才出，没写这一节整个不出现。 */
  const authored = title => doc?.sections[title]

  push(`# ${name} <Badge type="info" text="${id}" />`, '')
  push(
    doc?.overview
    ?? `${category.label}组件。这一节尚未撰写，见 packages/engine/headless/src/${id}/${id}.doc.md。`,
    '',
  )

  for (const title of ['何时使用', '何时不用', '特性']) {
    const text = authored(title)
    if (text)
      push(`## ${title}`, '', text, '')
  }

  // 示例排在契约之前：看的人先要能照着抄，其次才关心产物与契约。
  // 每个示例的标题落成 h3，右侧目录逐个索引得到。
  if (ex.length) {
    push('## 示例', '')
    for (const demo of ex) {
      push(`### ${demo.title}`, '')
      if (demo.description)
        push(demo.description, '')
      push(`<XhDemo src="${demo.src}" />`, '')
    }
  }

  // 产物
  push('## 产物', '')
  push('| 层 | 值 |', '| --- | --- |')
  if (ad.tag)
    push(`| 自定义元素 | ${code(`<${ad.tag}>`)} |`)
  if (ad.components.length)
    push(`| Vue 组件 | ${ad.components.map(code).join(' ')} |`)
  if (ad.composable)
    push(`| 组合式函数 | ${code(ad.composable)} |`)
  push(`| 状态机 | ${tm.states ? code(`${camel(id)}Machine`) : '无，`connect` 直接由 props 算属性'} |`)
  if (ad.skin)
    push(`| 皮肤 | ${code(ad.skin)} |`)
  push('')

  // 解剖
  push('## 解剖', '')
  push(
    `部件名即 ${code('data-part')} 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 ${code('wc.missing-part')}）。`,
    '',
  )
  push(
    `${code(`data-scope="${id}"`)}：${
      rt.parts.map(x => (required.has(x) ? `**${code(x)}**` : code(x))).join(' · ')}`,
    '',
  )

  // Props
  if (tm.props.length) {
    push('## Props', '')
    push('| 属性 | 类型 | 必填 | 说明 |', '| --- | --- | --- | --- |')
    for (const x of tm.props)
      push(`| ${cell(x.name)} | ${cell(x.type)} | ${x.optional ? '' : '是'} | ${esc(x.doc)} |`)
    push('')
  }

  // 事件：使用者真正要监听的那一组，与下面「状态」里的内部事件名不是一回事
  if (es.events.length) {
    push('## 事件', '')
    push(
      `自定义元素派发这些事件，Vue 组件对应同名 emit；载荷都在 ${code('detail')} 上。可双向绑定的值另有 ${code('update:xxx')}，见 Props。`,
      '',
    )
    push('| 事件 | 载荷 | 说明 |', '| --- | --- | --- |')
    for (const e of es.events)
      push(`| ${cell(e.name)} | ${cell(e.type?.text ?? '')} | ${esc(e.description ?? '')} |`)
    push('')
  }

  // 插槽：按 Vue 组件分组，只列带载荷的那些
  const slotRows = ad.components.flatMap(
    comp => (slotsByComponent.get(comp) ?? []).map(x => ({ comp, ...x })),
  )
  if (slotRows.length) {
    push('## 插槽', '')
    push(
      '作者能拿到载荷的插槽。只转发内容、不带载荷的默认插槽不在此列——那类直接写子节点即可。',
      '',
    )
    push('| Vue 组件 | 插槽 | 载荷 | 说明 |', '| --- | --- | --- | --- |')
    for (const x of slotRows)
      push(`| ${cell(x.comp)} | ${cell(x.name)} | ${x.payload ? cell(x.payload) : '—'} | ${esc(x.doc)} |`)
    push('')
  }

  // 状态：对外能看见的是数据属性，内部转移是状态机
  const stateAttrs = at.data.filter(a => a.attr === 'data-state')
  if (tm.states || tm.events || stateAttrs.length) {
    push('## 状态', '')
    if (stateAttrs.length) {
      push(`对外可见的状态落在 ${code('data-state')} 上，写样式与断言都读它：`, '')
      push('| 部件 | 取值 |', '| --- | --- |')
      for (const a of stateAttrs)
        push(`| ${cell(a.part)} | ${esc(a.value)} |`)
      push('')
    }
    if (tm.states || tm.events) {
      push('状态机内部转移，写样式与业务都用不到；要监听变化请看上面的「事件」。', '')
      if (tm.states)
        push(`**状态**：${tm.states.map(code).join(' · ')}`, '')
      if (tm.events)
        push(`**事件**：${tm.events.map(code).join(' · ')}`, '')
      if (tm.guards)
        push(`**判据**：${tm.guards.map(code).join(' · ')}`, '')
    }
  }

  // connect API
  if (tm.api.length) {
    push('## connect API', '')
    push(
      `${code(ad.composable ?? 'connect')} 产出的对象。${code('getXxxProps()')} 铺到对应部件的宿主元素上，其余是可读状态与操作入口。`,
      '',
    )
    push('| 成员 | 类型 | 说明 |', '| --- | --- | --- |')
    for (const a of tm.api)
      push(`| ${cell(a.name)} | ${cell(a.type)} | ${esc(a.doc)} |`)
    push('')
  }

  // 键盘
  push('## 键盘', '')
  push(`规格出处：[W3C APG](${rt.keyboard.source})`, '')
  if (rt.keyboard.rows.length) {
    push('| 按键 | 生效条件 | 行为 |', '| --- | --- | --- |')
    for (const r of rt.keyboard.rows)
      push(`| ${r.keys.map(code).join(' / ')} | ${esc(r.when)} | ${esc(r.does)} |`)
  }
  else {
    push('无键盘交互（不接收焦点，或焦点行为完全由原生元素提供）。')
  }
  push('')

  // 无障碍：ARIA 由 connect 铺，作者不必手写；屏幕阅读器的实际念法另行补充
  const a11y = authored('无障碍')
  if (at.aria.length || a11y) {
    push('## 无障碍', '')
    if (at.aria.length) {
      push(`下面这些由 ${code('connect')} 铺到部件上，作者不必自己写；重复写反而会覆盖掉正确值。`, '')
      push('| 部件 | 属性 | 值 |', '| --- | --- | --- |')
      for (const a of at.aria)
        push(`| ${cell(a.part)} | ${cell(a.attr)} | ${esc(a.value)} |`)
      push('')
    }
    if (a11y)
      push(a11y, '')
  }

  // 样式：皮肤怎么挂、怎么覆盖
  if (sk && ad.skin) {
    push('## 样式', '')
    push(
      `默认皮肤 ${code(ad.skin)} 按部件选择：${code(`[data-scope="${id}"][data-part="${rt.parts[0]}"]`)}。`
      + `它落在 ${sk.layers.map(code).join(' 与 ')} 层；业务样式不写进 ${code('@layer')} 即高于全部库层，`
      + `要按层压过来就写进 ${code('xihan.overrides')}。`,
      '',
    )
  }

  // 数据属性：皮肤与断言的选择面
  if (at.data.length) {
    push('## 数据属性', '')
    push(`由 ${code('connect')} 产出并铺到部件上，皮肤与测试都据此选择；${code('data-disabled')} 这类无值属性在条件不成立时整个不出现。`, '')
    push('| 部件 | 属性 | 值 |', '| --- | --- | --- |')
    for (const a of at.data)
      push(`| ${cell(a.part)} | ${cell(a.attr)} | ${esc(a.value)} |`)
    push('')
  }

  // 可覆盖的令牌：改这一个组件的外观从这里下手，不必去翻皮肤源码
  if (es.cssProps.length) {
    push('## CSS 变量', '')
    push(
      '本组件皮肤读的组件级令牌，写在组件自身或任意祖先上都生效。缺省值来自[设计令牌](../guide/theme)，不设即按缺省走。',
      '',
    )
    push(es.cssProps.map(code).join(' · '), '')
  }

  // 动效：皮肤里实际声明了什么就写什么
  if (sk && (sk.keyframes.length || sk.transition)) {
    push('## 动效', '')
    const bits = []
    if (sk.keyframes.length)
      bits.push(`关键帧 ${sk.keyframes.map(code).join(' · ')} 随皮肤自带，不引用别处文件里的名字`)
    if (sk.transition)
      bits.push(`状态切换走 ${code('transition')}`)
    push(`${bits.join('；')}。时长与缓动读[动效令牌](../guide/motion)，改令牌即改全局节奏。`, '')
    push(
      sk.reduceMotion
        ? `${code('prefers-reduced-motion: reduce')} 下本组件另有降级规则。`
        : '系统开启减弱动效时由令牌层统一收敛，皮肤不另作判断。',
      '',
    )
  }

  // 响应式：皮肤里真有条件规则才出这一节
  const responsive = authored('响应式')
  if ((sk && sk.queries.length) || responsive) {
    push('## 响应式', '')
    if (sk?.queries.length)
      push(`皮肤内置条件规则：${sk.queries.map(code).join(' · ')}。`, '')
    if (responsive)
      push(responsive, '')
  }

  // RTL
  const rtl = authored('RTL')
  if ((sk && (sk.logical || sk.dirRules)) || rtl) {
    push('## RTL', '')
    const bits = []
    if (sk?.logical)
      bits.push(`皮肤用逻辑属性排布（${code('inline-start')} 一族），${code('dir="rtl"')} 下自动镜像`)
    if (sk?.dirRules)
      bits.push(`另有按 ${code('dir')} 分支的规则`)
    if (bits.length)
      push(`${bits.join('；')}。`, '')
    if (rtl)
      push(rtl, '')
  }

  for (const title of ['组合', '最佳实践', '反模式']) {
    const text = authored(title)
    if (text)
      push(`## ${title}`, '', text, '')
  }

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
    '本册每个组件一页，页内小节固定：概述 · 何时使用 · 何时不用 · 特性 · 示例 · 产物 · 解剖 · Props · 事件 · 插槽 · 状态 · connect API · 键盘 · 无障碍 · 样式 · 数据属性 · CSS 变量 · 动效 · 响应式 · RTL · 组合 · 最佳实践 · 反模式。'
    + '其中契约类的小节由组件源码、连接层与皮肤直接生成，不会与代码对不上；讲取舍的几节与组件源码同放，见各组件目录下的 doc.md。'
    + '某一节没有内容时整节不出现，不留空标题。',
    '',
  )
  L.push('不是组件、但同样由本库提供的东西——全局配置、命令式的对话框与轻提示、流式 Markdown 渲染、代码着色——收在[服务与运行时](../runtime/)。', '')
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

// 人工文案的缺口：不拦生成，但每次都报出来，免得悄悄躺着
const proseless = [...registered].filter(id => !prose(id))

const files = new Map()
for (const c of manifest.categories) {
  for (const entry of c.components) {
    files.set(path.join(outDir, `${entry.id}.md`), renderComponent(entry, c))
  }
}
files.set(path.join(outDir, 'index.md'), renderIndex())

if (checkOnly) {
  if (proseless.length) {
    console.error(`这些组件还没写文案，请补 <id>.doc.md：${proseless.join(', ')}`)
    process.exit(1)
  }
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
  if (proseless.length)
    console.log(`其中 ${proseless.length} 个还没写人工文案：${proseless.join(', ')}`)
}
