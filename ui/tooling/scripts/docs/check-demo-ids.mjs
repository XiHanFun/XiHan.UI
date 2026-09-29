#!/usr/bin/env node
// 门禁：挂在同一页上的示例不许声明同一个 id，按 id 取节点、指向节点的引用只能落在本示例自己的 id 上。
//
// 文档站把一页的全部示例挂进同一个 document：自定义元素版经 innerHTML 注入、脚本逐个重建执行，
// Vue / React 版是同一棵应用树里的子树。示例脚本按 document.getElementById 取节点，两份示例写了
// 同一个 id，后挂的那份取到的就是先挂那份的节点——构建、类型与其余门禁全绿，只有真浏览器里
// 才看得出（cartesian-chart/35-stream 撞过 25-stream 的 cartesian-chart-stream，是探针抓到的）。
//
// 判据按「页 × 框架」分组：
// - 页与示例的对应读 docs/**/*.md 里的 <XhDemo src="目录/基名" />，不假设一页一个目录
//   （examples/ 就分在四页上）。读不出的 <XhDemo 写法、引用了不存在的示例、没有任何一页引用的示例，
//   一律判红——不知道挂在哪页，就无从判断和谁同页。
// - 框架切换是全站一个值，同一时刻一页只挂一种框架的示例，所以只在同一框架的文件之间比对；
//   同一份示例自己的各框架版本写同一个 id 是常态，不算撞。
// - 读出的 id 分三种：
//   字面量：id="x"、id={"x"}、:id="'x'"、el.id = "x"、setAttribute("id", "x")；
//   模板串：`prefix-${k}` 按通配模式比对，与另一份示例的字面量或模式可能相等即判撞；
//   纯表达式（s.value、item.id）：读不出值。绑到本文件 useId() 的放行（框架保证全页唯一），
//   其余必须登记在 RUNTIME_IDS 并写明为什么不会撞，登了却没用上的条目判过期。
//
// 引用一侧逐文件核：按 id 取节点、指向节点的地方必须落在这份示例自己声明的 id 上。取不到自己的节点，
// 单独挂时是 null，同页挂时就是别人的（复制一份示例、改了 id 属性却漏改引用，就是这样）。引用有四处来源：
// - 脚本：getElementById(…) 的实参、querySelector(All)(…) 选择器里的 #id；
// - 属性：for / htmlFor、aria-labelledby 一族、list / form / headers 等（登记在 REFERENCE_ATTRIBUTES，
//   组件自己的 id 属性——Scrollbar 的 controls、Anchor 的 value——只在对应元素上算），href="#id"
//   （#/ 开头的是哈希路由，示例里的占位链接照 breadcrumb 的写法用它），脚本里 setAttribute 设的同名属性；
// - 组件配置与数据：漫游式引导步骤的 target: "#id"；数据表里的 href: "#id"（side-nav 的 collection 等，
//   渲染出来就是链接），与属性上的 href 同一条规则，占位链接同样写 #/…；
// - SVG / CSS 的 url(#id)。
// 绑定的属性值（:attr="…"、attr={…}）是条件式时两支分别算；与本文件某处 id 绑同一个表达式
// （:id="s.value" 配 :value="s.value"）的算作同一个节点；x.id 顺着 x 的初值追到取它时用的 id。
// 值是变量时顺着同文件的写法追到字面量：for…of 的数组字面量（[id, …] 解构取每项首位）、
// Object.entries / Object.keys 的对象字面量键、数组字面量 .map / .forEach 回调的参数、具名函数的参数
// （取各调用处的首个实参）；模板串里的 ${变量} 能追到的逐个代入，追不到的段按通配。追不到的一律判红，
// 真是运行时才定的值登进 RUNTIME_IDS。选择器不是字面量时，看得见 # 的同样判红（改成模板串才追得到），
// 看不见的未必和 id 有关；href 是表达式时多半是外链——这两种只报数。
//
// 用法：node tooling/scripts/docs/check-demo-ids.mjs
import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import process from 'node:process'

const DOCS = '../docs'
const DEMOS = '../docs/.vitepress/demos'
const TABLE = 'scripts/demo-frameworks.json'
/** docs 下不放页面的目录：主题、示例与构建缓存都在 .vitepress 里。 */
const NOT_PAGES = new Set(['.vitepress', 'node_modules', 'public'])

/**
 * 读不出值的纯表达式：示例目录 → 表达式 → 为什么不会出错。声明一侧（id 绑它）要说明不会与同页示例相撞，
 * 引用一侧（指向节点的属性绑它）要说明指向的是本示例自己的节点。
 * 本检查读不出这些值，理由就是唯一的依据，所以登了没用上的一并判红。
 */
const RUNTIME_IDS = {
  anchor: {
    's.value': '分节 id 取自同文件 sections 表的 value 字面量，都带 anchor-<示例>- 前缀；自定义元素版把同一批 id 写成字面量，由本检查按字面量核对',
    'g.value': '嵌套目录的分组链接：value 取自同文件 groups 表，sections 由它摊平而来，指向的就是本示例 :id="s.value" 的分节',
    'c.value': '嵌套目录的子项链接：value 取自 groups 表各组的 children，同样摊平进 sections，指向本示例自己的分节',
  },
  notification: {
    'item.id': 'XhNotificationItem 的 id 是队列身份，适配器把它声明成组件属性、不写进 DOM；节点 id 由组件按实例 scope 生成',
  },
}

/**
 * 值是 id 引用的属性。form：id（整值一个 id）、list（空白分隔的 id 列表）、fragment（#id）。
 * 同名属性在别处另有所指的要收窄：native 只在原生元素上算（组件的同名属性不一定落到 DOM）；
 * tag 只在这些元素 / 组件上算（controls 在 <video> 上是布尔属性，value 在表单控件上是值）；
 * part + within 认自定义元素版的作者节点：落在 <within> 里、带 data-xh-part="<part>" 的元素。
 */
const REFERENCE_ATTRIBUTES = [
  { name: /^(?:for|htmlFor)$/, form: 'id' },
  { name: /^aria-activedescendant$/, form: 'id' },
  { name: /^aria-(?:labelledby|describedby|controls|owns|flowto|details|errormessage)$/, form: 'list' },
  { name: /^(?:list|form|popovertarget|commandfor)$/, form: 'id', native: true },
  { name: /^headers$/, form: 'list', native: true },
  { name: /^(?:href|xlink:href)$/, form: 'fragment' },
  // Scrollbar 的被控滚动容器：按 id 取，并写到滑块的 aria-controls 上
  { name: /^controls$/, form: 'id', tag: /^(?:xh-scrollbar|XhScrollbarRoot)$/ },
  // Anchor 的当前区块与链接的目标区块：机器按 getElementById 取
  { name: /^value$/, form: 'id', tag: /^(?:xh-anchor|XhAnchor|XhAnchorLink)$/ },
  { name: /^value$/, form: 'id', tag: /^a$/, part: 'link', within: 'xh-anchor' },
]

const { frameworks } = JSON.parse(await readFile(TABLE, 'utf8'))
const extToFramework = new Map(frameworks.map(framework => [framework.ext, framework]))

const problems = []

function lineOf(source, index) {
  return source.slice(0, index).split('\n').length
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** HTML 注释换成等量换行：注掉的标记不算声明，行号照旧对得上。 */
function stripHtmlComments(source) {
  return source.replace(/<!--[\s\S]*?-->/g, comment => comment.replace(/[^\n]/g, ''))
}

/**
 * 从 start 起读一段 JS 表达式：跳过字符串与模板串，读到同层的 stops 字符，
 * 或越过起点所在层的右括号为止。
 */
function readExpression(source, start, stops) {
  let depth = 0
  let quote = null
  let i = start
  for (; i < source.length; i++) {
    const ch = source[i]
    if (quote) {
      if (ch === '\\')
        i++
      else if (ch === quote)
        quote = null
      continue
    }
    if (ch === '"' || ch === '\'' || ch === '`') {
      quote = ch
      continue
    }
    if ('([{'.includes(ch)) {
      depth++
    }
    else if (')]}'.includes(ch)) {
      if (depth === 0)
        break
      depth--
    }
    else if (depth === 0 && stops.includes(ch)) {
      break
    }
  }
  return source.slice(start, i).trim()
}

/** 模板串正文拆成字面段；没有 ${…} 就是字面量，全是 ${…} 则等同纯表达式。 */
function fromTemplate(body, expr) {
  const parts = body.split(/\$\{[^}]*\}/)
  if (parts.length === 1)
    return { kind: 'literal', value: body }
  if (parts.every(part => part === ''))
    return { kind: 'expr', expr }
  return { kind: 'pattern', parts }
}

/** JS 表达式 → id 声明。 */
function fromExpression(text) {
  const expr = text.trim()
  const quoted = expr.match(/^"([^"\\]*)"$/) ?? expr.match(/^'([^'\\]*)'$/)
  if (quoted)
    return { kind: 'literal', value: quoted[1] }
  const template = expr.match(/^`([^`\\]*)`$/)
  if (template)
    return fromTemplate(template[1], expr)
  return { kind: 'expr', expr }
}

/** 属性值里的 id：示例的 HTML 片段也会写在脚本的模板串里，所以带 ${…} 的按模板串算。 */
function fromAttribute(value) {
  if (value.includes('${'))
    return fromTemplate(value, value)
  if (/[\s'"`+]/.test(value) || value === '')
    return { kind: 'unreadable', value }
  return { kind: 'literal', value }
}

/**
 * 一个示例文件声明的全部 id。三种框架的写法都扫一遍：
 * id="x" 在三种文件里都是静态声明（Vue 模板、JSX、HTML，以及脚本里的 HTML 片段）；
 * :id / v-bind:id 只会出现在 Vue 模板，id={…} 只会出现在 JSX；
 * el.id = … 与 setAttribute('id', …) 是脚本里的写法。
 */
function declarations(source) {
  const out = []
  const text = stripHtmlComments(source)
  for (const m of text.matchAll(/\sid="([^"]*)"/g))
    out.push({ index: m.index + 1, ...fromAttribute(m[1]) })
  for (const m of text.matchAll(/(?::|v-bind:)id="([^"]*)"/g))
    out.push({ index: m.index, ...fromExpression(m[1]) })
  for (const m of text.matchAll(/\sid=\{/g))
    out.push({ index: m.index + 1, ...fromExpression(readExpression(text, m.index + m[0].length, '')) })
  // dataset.id 写的是 data-id，不是 id
  for (const m of text.matchAll(/(?<!dataset)\.id\s*=(?!=)/g))
    out.push({ index: m.index, ...fromExpression(readExpression(text, m.index + m[0].length, ';,\n')) })
  for (const m of text.matchAll(/\.setAttribute\(\s*(["'])id\1\s*,/g))
    out.push({ index: m.index, ...fromExpression(readExpression(text, m.index + m[0].length, ',;\n')) })
  return out.map(({ index, ...decl }) => ({ ...decl, line: lineOf(text, index) }))
}

function patternRegExp(parts) {
  return new RegExp(`^${parts.map(escapeRegExp).join('[\\s\\S]*')}$`)
}

/**
 * 两个声明能否取到同一个值。模式与模式：各自至少一段通配，只要首段互为前缀、末段互为后缀，
 * 就拼得出一个两边都匹配的串（长的首段 + 双方中段 + 长的末段）。
 */
function collide(a, b) {
  if (a.kind === 'literal' && b.kind === 'literal')
    return a.value === b.value
  if (a.kind === 'literal')
    return patternRegExp(b.parts).test(a.value)
  if (b.kind === 'literal')
    return patternRegExp(a.parts).test(b.value)
  const [headA, headB] = [a.parts[0], b.parts[0]]
  const [tailA, tailB] = [a.parts.at(-1), b.parts.at(-1)]
  return (headA.startsWith(headB) || headB.startsWith(headA))
    && (tailA.endsWith(tailB) || tailB.endsWith(tailA))
}

function label(decl) {
  return decl.kind === 'literal' ? `「${decl.value}」` : `模式「${decl.parts.join('*')}」`
}

// ── 引用：脚本按 id 取节点的地方 ────────────────────────────────────────────

const IDENTIFIER = /^[A-Z_$][\w$]*$/i

function literalOf(expr) {
  const decl = fromExpression(expr)
  return decl.kind === 'literal' ? decl.value : null
}

/** 顶层逗号切开数组 / 对象字面量的正文。 */
function splitTopLevel(body) {
  const items = []
  let depth = 0
  let quote = null
  let start = 0
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    if (quote) {
      if (ch === '\\')
        i++
      else if (ch === quote)
        quote = null
      continue
    }
    if (ch === '"' || ch === '\'' || ch === '`') {
      quote = ch
    }
    else if ('([{'.includes(ch)) {
      depth++
    }
    else if (')]}'.includes(ch)) {
      depth--
    }
    else if (ch === ',' && depth === 0) {
      items.push(body.slice(start, i).trim())
      start = i + 1
    }
  }
  items.push(body.slice(start).trim())
  return items.filter(Boolean)
}

/** 同文件里 const / let 定义的初值原文；没有或不止一处定义时返回 null。 */
function initializerOf(text, name) {
  const found = [...text.matchAll(new RegExp(`(?<![\\w$])(?:const|let)\\s+${escapeRegExp(name)}\\s*=(?!=)\\s*`, 'g'))]
  if (found.length !== 1)
    return null
  return readExpression(text, found[0].index + found[0][0].length, ';\n')
}

/** 对象字面量的键；有一项不是「键: 值」就返回 null。 */
function keysOf(body) {
  const out = []
  for (const entry of splitTopLevel(body.slice(1, -1))) {
    const m = entry.match(/^(?:"([^"]*)"|'([^']*)'|([A-Z_$][\w$]*))\s*:/i)
    if (!m)
      return null
    out.push(m[1] ?? m[2] ?? m[3])
  }
  return out
}

/**
 * 迭代源每一项给循环变量的值：数组字面量逐项取字符串（destructured 时变量是 [id, …] 的首位，
 * 取每项数组的首项）；Object.entries 配解构、Object.keys 不配解构，取对象字面量的键；
 * 标识符追到同文件唯一的 const / let 定义。读不出返回 null。
 */
function valuesOf(text, expr, destructured) {
  const source = expr.trim()
  const object = source.match(/^Object\.(entries|keys)\(\s*([A-Z_$][\w$]*)\s*\)$/i)
  if (object) {
    if ((object[1] === 'entries') !== destructured)
      return null
    const init = initializerOf(text, object[2])
    return init?.startsWith('{') ? keysOf(init) : null
  }
  if (IDENTIFIER.test(source)) {
    const init = initializerOf(text, source)
    return init === null ? null : valuesOf(text, init, destructured)
  }
  if (!source.startsWith('[') || !source.endsWith(']'))
    return null
  const out = []
  for (const item of splitTopLevel(source.slice(1, -1))) {
    const head = destructured ? (item.startsWith('[') ? splitTopLevel(item.slice(1, -1))[0] : undefined) : item
    const value = head === undefined ? null : literalOf(head)
    if (value === null)
      return null
    out.push(value)
  }
  return out
}

/** `.map(` 之前的接收者：紧挨着的数组字面量或标识符。 */
function receiverBefore(text, end) {
  if (text[end - 1] === ']') {
    let depth = 0
    for (let i = end - 1; i >= 0; i--) {
      if (text[i] === ']')
        depth++
      else if (text[i] === '[' && --depth === 0)
        return text.slice(i, end)
    }
    return null
  }
  return text.slice(0, end).match(/[A-Z_$][\w$]*$/i)?.[0] ?? null
}

/** 具名函数各调用处的首个实参；一处调用都没有，或有一处不是字面量，返回 null。 */
function callArguments(text, fn) {
  const out = []
  for (const m of text.matchAll(new RegExp(`(?<![\\w$.]|function\\s+)${escapeRegExp(fn)}\\(`, 'g'))) {
    const value = literalOf(readExpression(text, m.index + m[0].length, ','))
    if (value === null)
      return null
    out.push(value)
  }
  return out.length ? out : null
}

/**
 * 标识符在 index 处能取到的全部字面值：取它在 index 之前最近的一处绑定——for…of 的循环变量、
 * 数组方法回调的参数、具名函数（function f(id) / const f = (id) =>）的首个参数。追不到返回 null。
 */
function resolveIdentifier(text, name, index) {
  const n = escapeRegExp(name)
  const sites = []
  for (const m of text.matchAll(new RegExp(`for\\s*\\(\\s*(?:const|let|var)\\s+(\\[\\s*)?${n}(?![\\w$])[^;)]*?\\sof\\s`, 'g'))) {
    const source = readExpression(text, m.index + m[0].length, '')
    sites.push({ index: m.index, values: () => valuesOf(text, source, Boolean(m[1])) })
  }
  for (const m of text.matchAll(new RegExp(`\\.(?:map|flatMap|forEach|filter|find|some|every)\\(\\s*(?:\\(\\s*(\\[\\s*)?${n}(?![\\w$])[^)]*\\)|${n})\\s*=>`, 'g'))) {
    const receiver = receiverBefore(text, m.index)
    sites.push({ index: m.index, values: () => (receiver === null ? null : valuesOf(text, receiver, Boolean(m[1]))) })
  }
  const named = `function\\s+([A-Za-z_$][\\w$]*)\\s*\\(\\s*${n}(?![\\w$])|(?:const|let)\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*(?:async\\s*)?(?:\\(\\s*${n}(?![\\w$])[^)]*\\)|${n})\\s*=>`
  for (const m of text.matchAll(new RegExp(named, 'g')))
    sites.push({ index: m.index, values: () => callArguments(text, m[1] ?? m[2]) })
  const nearest = sites.filter(site => site.index < index).sort((a, b) => b.index - a.index)[0]
  return nearest ? nearest.values() : null
}

/** 模板串：${标识符} 能追到字面量的逐个代入，追不到的段按通配；一个字面字符都没剩就是纯表达式。 */
function templateRefs(text, body, index) {
  const pieces = body.split(/\$\{([^}]*)\}/)
  let variants = [{ parts: [pieces[0]], traced: false }]
  for (let i = 1; i < pieces.length; i += 2) {
    const expr = pieces[i].trim()
    const tail = pieces[i + 1]
    const values = IDENTIFIER.test(expr) ? resolveIdentifier(text, expr, index) : null
    variants = values
      ? variants.flatMap(v => values.map(value => ({ parts: [...v.parts.slice(0, -1), v.parts.at(-1) + value + tail], traced: true })))
      : variants.map(v => ({ ...v, parts: [...v.parts, tail] }))
  }
  return variants.map(({ parts, traced }) => {
    if (parts.length === 1)
      return { kind: 'literal', value: parts[0], traced }
    return parts.every(part => part === '') ? { kind: 'expr', expr: `\`${body}\`` } : { kind: 'pattern', parts, traced }
  })
}

/** getElementById 的实参：字面量、模板串，或能追到字面量的变量。 */
function argumentRefs(text, arg, index) {
  const template = arg.match(/^`([^`\\]*)`$/)
  if (template)
    return templateRefs(text, template[1], index)
  const decl = fromExpression(arg)
  if (decl.kind !== 'expr')
    return [decl]
  const values = IDENTIFIER.test(arg) ? resolveIdentifier(text, arg, index) : null
  return values ? values.map(value => ({ kind: 'literal', value, traced: true })) : [decl]
}

/** 选择器里的 #id（含 #${…} 段）；属性选择器先去掉——[value="#fff"] 里的 # 不是 id。 */
function selectorRefs(text, selector, index) {
  const refs = []
  for (const m of selector.replace(/\[[^\]]*\]/g, '').matchAll(/#((?:[\w-]|\$\{[^}]*\})+)/g))
    refs.push(...(m[1].includes('${') ? templateRefs(text, m[1], index) : [{ kind: 'literal', value: m[1] }]))
  return refs
}

/** 顶层条件式 a ? b : c 拆成两支；不是条件式返回 null。?. 与 ?? 不算问号。 */
function branchesOf(expr) {
  let depth = 0
  let quote = null
  let question = -1
  let nested = 0
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i]
    if (quote) {
      if (ch === '\\')
        i++
      else if (ch === quote)
        quote = null
      continue
    }
    if (ch === '"' || ch === '\'' || ch === '`') {
      quote = ch
    }
    else if ('([{'.includes(ch)) {
      depth++
    }
    else if (')]}'.includes(ch)) {
      depth--
    }
    else if (depth === 0 && ch === '?') {
      if (expr[i + 1] === '.' || expr[i + 1] === '?')
        i++
      else if (question < 0)
        question = i
      else
        nested++
    }
    else if (depth === 0 && ch === ':' && question >= 0) {
      if (nested)
        nested--
      else
        return [expr.slice(question + 1, i), expr.slice(i + 1)]
    }
  }
  return null
}

/**
 * 引用处的表达式：条件式两支分别算，undefined / null 那支不指向任何节点；与本文件某处 id 绑的是
 * 同一个表达式（:id="s.value" 配 :value="s.value"、:id="reasonId" 配 aria-describedby），
 * 两边随同一个值走，记成 bound；其余按字面量、模板串或顺着变量追。
 */
function expressionRefs(text, expr, index, bindings) {
  const source = expr.trim()
  if (/^(?:undefined|null)$/.test(source))
    return []
  const branches = branchesOf(source)
  if (branches)
    return branches.flatMap(branch => expressionRefs(text, branch, index, bindings))
  if (bindings.has(source))
    return [{ kind: 'bound', expr: source }]
  // reason.id：reason 是同文件按 id 取来的节点，指向的就是取它时的那个 id
  const own = source.match(/^([A-Z_$][\w$]*)\.id$/i)
  const lookup = own && initializerOf(text, own[1])?.match(/\.(getElementById|querySelector)\(([\s\S]*)\)$/)
  if (lookup) {
    if (lookup[1] === 'getElementById')
      return expressionRefs(text, lookup[2], index, bindings)
    const selector = literalOf(lookup[2].trim())
    if (selector !== null && /^#[\w-]+$/.test(selector))
      return [{ kind: 'literal', value: selector.slice(1) }]
  }
  return argumentRefs(text, source, index)
}

/** 属性值按形态拆成 id：list 是空白分隔的 id 列表，fragment 取 #id（#/ 开头的是哈希路由，不算）。 */
function attributeIds(value, form) {
  if (form === 'list')
    return value.split(/\s+/).filter(Boolean)
  if (form === 'fragment')
    return /^#[^/]/.test(value) ? [value.slice(1)] : []
  return value.trim() ? [value.trim()] : []
}

/** 值里带 ${…} 的属性写在脚本的模板串里（'<a href="#${id}">'），按模板串算。 */
function attributeRefs(text, value, form, index) {
  return attributeIds(value, form).flatMap(id => (id.includes('${') ? templateRefs(text, id, index) : [{ kind: 'literal', value: id }]))
}

/** 数据里 href 的类型标注（{ href: string }）不是值。 */
const HREF_TYPE = /^(?:string|undefined|null)(?:\s*\|\s*(?:string|undefined|null))*$/

/**
 * 以表达式写的 href（:href="…"、href={…}、组件数据里的 href: …）：字面量按 #id 规则取；
 * 模板串以 #（不是 #/）开头的顺着模板串追，以 ${…} 开头的看不出；其余看不出是不是 #id，
 * 多半是外链，记成 opaque 只报数。
 */
function hrefRefs(text, expr, index) {
  const source = expr.trim()
  const literal = literalOf(source)
  if (literal !== null)
    return attributeRefs(text, literal, 'fragment', index)
  const template = source.match(/^`([^`\\]*)`$/)?.[1]
  if (template !== undefined && !template.startsWith('${'))
    return /^#[^/]/.test(template) ? templateRefs(text, template.slice(1), index) : []
  return [{ kind: 'opaque-href' }]
}

/** 属性所在的起始标签：属性之前最近的一个 <名字。 */
function tagAt(tags, index) {
  let found = null
  for (const tag of tags) {
    if (tag.index >= index)
      break
    found = tag
  }
  return found
}

function referenceRule(name, tag, text, index) {
  return REFERENCE_ATTRIBUTES.find((rule) => {
    if (!rule.name.test(name))
      return false
    if (rule.native && !/^[a-z][a-z0-9]*$/.test(tag?.name ?? ''))
      return false
    if (rule.tag && !rule.tag.test(tag?.name ?? ''))
      return false
    if (rule.part && !new RegExp(`\\sdata-xh-part="${rule.part}"`).test(text.slice(tag.index, text.indexOf('>', index))))
      return false
    if (rule.within) {
      const open = text.lastIndexOf(`<${rule.within}`, index)
      if (open < 0 || text.lastIndexOf(`</${rule.within}>`, index) > open)
        return false
    }
    return true
  })
}

/**
 * 一个示例文件里按 id 取节点、指向节点的地方。选择器不是字面量（拼接、调用、追不到字面量初值的变量）时
 * 它未必和 id 有关：看得见 # 的按读不出的引用判红，看不见的记成 opaque 只报数；href 是表达式时同理，
 * 它多半是外链。bindings 是本文件里 id 绑的表达式。
 */
function references(source, bindings) {
  const text = stripHtmlComments(source)
  const out = []
  for (const m of text.matchAll(/\.getElementById\(/g)) {
    const arg = readExpression(text, m.index + m[0].length, ',')
    for (const ref of expressionRefs(text, arg, m.index, bindings))
      out.push({ ...ref, call: `getElementById(${arg})`, line: lineOf(text, m.index) })
  }

  // 属性：name="…"（三种文件）、:name="表达式"（Vue）、name={表达式}（JSX）
  const tags = [...text.matchAll(/<([A-Z][\w.-]*)/gi)].map(m => ({ index: m.index, name: m[1] }))
  for (const m of text.matchAll(/(?<=\s)(:|v-bind:)?([A-Z][\w:.-]*)=(["'{])/gi)) {
    const [, bound, name, open] = m
    const rule = referenceRule(name, tagAt(tags, m.index), text, m.index)
    if (!rule)
      continue
    const start = m.index + m[0].length
    const raw = open === '{' ? readExpression(text, start, '') : text.slice(start, text.indexOf(open, start))
    const call = `${bound ?? ''}${name}=${open === '{' ? `{${raw}}` : `"${raw}"`}`
    const line = lineOf(text, m.index)
    const fragment = rule.form === 'fragment'
    const refs = !bound && open !== '{'
      ? attributeRefs(text, raw, rule.form, m.index)
      : fragment ? hrefRefs(text, raw, m.index) : expressionRefs(text, raw, m.index, bindings)
    // href 读出来是哈希路由或外链：看过了、不指向页内节点，记一笔好报数
    if (fragment && !refs.length)
      out.push({ kind: 'route-href', call, line })
    for (const ref of refs)
      out.push({ ...ref, call, line, fragment })
  }
  // 组件数据里的链接（side-nav 的 collection、navigation-menu 的面板表）：渲染出来就是 <a href>，同一条规则
  for (const m of text.matchAll(/(?<![\w$.])href\s*:\s*/g)) {
    const value = readExpression(text, m.index + m[0].length, ',;\n')
    if (HREF_TYPE.test(value))
      continue
    const refs = hrefRefs(text, value, m.index)
    const call = `href: ${value}`
    const line = lineOf(text, m.index)
    if (!refs.length)
      out.push({ kind: 'route-href', call, line })
    for (const ref of refs)
      out.push({ ...ref, call, line, fragment: true })
  }
  // 脚本里设的引用属性：只认不挑元素的那几条（设在哪个元素上，这里看不出）
  for (const m of text.matchAll(/\.setAttribute\(\s*(["'])([\w:-]+)\1\s*,/g)) {
    const rule = REFERENCE_ATTRIBUTES.find(r => r.name.test(m[2]) && !r.tag && !r.native && !r.part)
    if (!rule)
      continue
    const arg = readExpression(text, m.index + m[0].length, ',')
    const call = `setAttribute("${m[2]}", ${arg})`
    const line = lineOf(text, m.index)
    const literal = literalOf(arg)
    const refs = literal !== null ? attributeRefs(text, literal, rule.form, m.index) : expressionRefs(text, arg, m.index, bindings)
    refs.forEach(ref => out.push({ ...ref, call, line }))
  }
  // 漫游式引导的步骤：target: "#…" 是交给组件去查的选择器
  for (const m of text.matchAll(/(?<![\w$.])target\s*:\s*(?=["'`])/g)) {
    const value = readExpression(text, m.index + m[0].length, ',;\n')
    const selector = literalOf(value) ?? value.match(/^`([^`\\]*)`$/)?.[1]
    if (selector?.includes('#')) {
      for (const ref of selectorRefs(text, selector, m.index))
        out.push({ ...ref, call: `target: ${value}`, line: lineOf(text, m.index) })
    }
  }
  // SVG 与 CSS 里的 url(#id)：渐变、裁剪、遮罩、滤镜、标记
  for (const m of text.matchAll(/url\(\s*["']?#([\w-]+)/g))
    out.push({ kind: 'literal', value: m[1], call: `url(#${m[1]})`, line: lineOf(text, m.index) })

  for (const m of text.matchAll(/\.(querySelector(?:All)?)\(/g)) {
    const arg = readExpression(text, m.index + m[0].length, ',')
    const init = IDENTIFIER.test(arg) ? initializerOf(text, arg) : null
    const selector = (init ?? arg).trim()
    const quoted = literalOf(selector)
    const template = selector.match(/^`([^`\\]*)`$/)?.[1]
    const call = `${m[1]}(${arg.replace(/\s+/g, ' ')})`
    const line = lineOf(text, m.index)
    if (quoted === null && template === undefined) {
      // 拼出来的选择器里去掉属性选择器还剩 #，就是一处读不出的 id 引用
      out.push(selector.replace(/\[[^\]]*\]/g, '').includes('#')
        ? { kind: 'expr', expr: selector, call, line }
        : { kind: 'opaque-selector', call, line })
      continue
    }
    for (const ref of selectorRefs(text, quoted ?? template, m.index))
      out.push({ ...ref, call, line })
  }
  return out
}

// ── 示例文件：目录/基名 → 各框架文件里读出的 id ────────────────────────────────

async function walk(dir, keep, skip = new Set()) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!skip.has(entry.name))
        out.push(...await walk(path, keep, skip))
    }
    else if (keep(entry.name)) {
      out.push(path)
    }
  }
  return out
}

/** @type {Map<string, Map<string, { file: string, ids: object[] }>>} 示例 → 框架 id → 文件与声明 */
const demos = new Map()
const usedRuntime = new Set()
/** 没落在本示例声明上的引用：等页面读完再看同页谁声明了它。 */
const dangling = []
let fileCount = 0
let useIdCount = 0
let runtimeCount = 0
let refCount = 0
let tracedCount = 0
let boundCount = 0
let opaqueSelectorCount = 0
let opaqueHrefCount = 0
let routeHrefCount = 0

for (const path of await walk(DEMOS, name => extToFramework.has(extname(name)))) {
  const file = relative(DEMOS, path).replaceAll('\\', '/')
  const ext = extname(file)
  const src = file.slice(0, -ext.length)
  const dir = src.split('/')[0]
  const source = await readFile(path, 'utf8')
  fileCount++

  const ids = []
  /** 本文件里 id 绑的表达式：引用处写同一个表达式，两边随同一个值走。 */
  const bindings = new Set()
  for (const decl of declarations(source)) {
    if (decl.kind === 'unreadable') {
      problems.push(`${file}:${decl.line} 的 id="${decl.value}" 读不出一个确定的值：id 写成不带空白与引号的字面量，拼接改用模板串`)
      continue
    }
    if (decl.kind !== 'expr') {
      ids.push({ ...decl, file })
      continue
    }
    bindings.add(decl.expr)
    if (/^[A-Z_$][\w$]*$/i.test(decl.expr) && new RegExp(`\\b${escapeRegExp(decl.expr)}\\s*=\\s*useId\\(\\)`).test(source)) {
      useIdCount++
      continue
    }
    if (RUNTIME_IDS[dir]?.[decl.expr]) {
      usedRuntime.add(`${dir}\0${decl.expr}`)
      runtimeCount++
      continue
    }
    problems.push(
      `${file}:${decl.line} 的 id 绑的是 ${decl.expr}，读不出值：改成字面量或带字面前缀的模板串，`
      + `绑 useId()，或登进 RUNTIME_IDS['${dir}'] 写明为什么不会与同页示例相撞`,
    )
  }

  const framework = extToFramework.get(ext).id
  for (const ref of references(source, bindings)) {
    if (ref.kind === 'opaque-selector') {
      opaqueSelectorCount++
      continue
    }
    if (ref.kind === 'route-href') {
      routeHrefCount++
      continue
    }
    if (ref.kind === 'opaque-href') {
      opaqueHrefCount++
      continue
    }
    refCount++
    if (ref.kind === 'bound') {
      boundCount++
      continue
    }
    if (ref.kind === 'expr' && RUNTIME_IDS[dir]?.[ref.expr]) {
      usedRuntime.add(`${dir}\0${ref.expr}`)
      runtimeCount++
      continue
    }
    if (ref.kind === 'expr') {
      problems.push(
        `${file}:${ref.line} 的 ${ref.call} 追不到指向哪个 id：写成字面量或模板串（拼接读不出），变量要来自同文件的数组字面量 / `
        + `Object.entries(对象字面量) 的 for…of、数组字面量的 .map / .forEach 回调、以字面量调用的具名函数参数；`
        + `实在是运行时才定的值，登进 RUNTIME_IDS['${dir}'] 写明它指向本示例的哪个节点`,
      )
      continue
    }
    if (ref.traced)
      tracedCount++
    if (!ids.some(decl => collide(ref, decl)))
      dangling.push({ ...ref, file, src, framework })
  }

  if (!demos.has(src))
    demos.set(src, new Map())
  demos.get(src).set(framework, { file, ids })
}

for (const [dir, entries] of Object.entries(RUNTIME_IDS)) {
  for (const expr of Object.keys(entries)) {
    if (!usedRuntime.has(`${dir}\0${expr}`))
      problems.push(`RUNTIME_IDS['${dir}']['${expr}'] 已过期：${dir}/ 下的示例不再用 ${expr} 绑 id 或指向节点，删掉这条登记`)
  }
}

// ── 页面：每页挂了哪些示例 ──────────────────────────────────────────────────

const DEMO_TAG = /<XhDemo\s+src="([^"]+)"\s*\/>/g
/** @type {Map<string, string[]>} 页面 → 示例 */
const pages = new Map()
const referenced = new Set()

for (const path of await walk(DOCS, name => name.endsWith('.md'), NOT_PAGES)) {
  const page = relative(DOCS, path).replaceAll('\\', '/')
  const source = await readFile(path, 'utf8')
  const tags = [...source.matchAll(/<XhDemo\b/g)]
  if (!tags.length)
    continue
  const srcs = [...source.matchAll(DEMO_TAG)].map(m => m[1])
  if (srcs.length !== tags.length)
    problems.push(`${page} 里有 ${tags.length - srcs.length} 处 <XhDemo 不是 <XhDemo src="目录/基名" /> 的写法，读不出挂的是哪份示例`)
  for (const src of srcs) {
    referenced.add(src)
    if (!demos.has(src))
      problems.push(`${page} 引用的示例 ${src} 不存在：${DEMOS} 下没有 ${src}.{${frameworks.map(f => f.ext.slice(1)).join(',')}}`)
  }
  pages.set(page, [...new Set(srcs)])
}

for (const src of demos.keys()) {
  if (!referenced.has(src))
    problems.push(`示例 ${src} 没有任何一页用 <XhDemo src="${src}" /> 引用：不知道它挂在哪页，就判断不了它和谁同页`)
}

// ── 按页 × 框架比对 ─────────────────────────────────────────────────────────

let compared = 0
const collisions = new Set()

for (const [page, srcs] of pages) {
  for (const framework of frameworks) {
    const decls = srcs.flatMap(src => (demos.get(src)?.get(framework.id)?.ids ?? []).map(decl => ({ ...decl, src })))
    compared += decls.length
    for (let i = 0; i < decls.length; i++) {
      for (let j = i + 1; j < decls.length; j++) {
        const [a, b] = [decls[i], decls[j]]
        if (a.src === b.src || !collide(a, b))
          continue
        const [first, second] = [a, b].sort((x, y) => x.file.localeCompare(y.file))
        collisions.add(
          `${page}（${framework.name}）：${first.file}:${first.line} 的 ${label(first)} 与 `
          + `${second.file}:${second.line} 的 ${label(second)} 会在同一个 document 里相撞`,
        )
      }
    }
  }
}
problems.push(...collisions)

for (const ref of dangling) {
  const owners = new Set()
  for (const srcs of pages.values()) {
    if (!srcs.includes(ref.src))
      continue
    for (const other of srcs) {
      const entry = other === ref.src ? undefined : demos.get(other)?.get(ref.framework)
      if (entry?.ids.some(decl => collide(ref, decl)))
        owners.add(entry.file)
    }
  }
  const owner = owners.size ? `；同页的 ${[...owners].join('、')} 声明了它，挂在一起时取到的是那份示例的节点` : ''
  const placeholder = ref.fragment && !owners.size ? '；只是占位链接的话写成哈希路由 #/…（breadcrumb、side-nav 示例的写法）' : ''
  problems.push(`${ref.file}:${ref.line} 的 ${ref.call} 指向 ${label(ref)}，这份示例自己没有声明它${owner}${placeholder}`)
}

if (problems.length) {
  console.error(`[check-demo-ids] ✗ ${problems.length} 处示例 id 问题：`)
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('同一页的示例共享一个 document：id 要全页唯一（给后来的那份换一个带示例名的 id，如 <组件>-<示例>-<用途>），脚本只取本示例自己声明的 id。')
  process.exit(1)
}

console.log(
  `[check-demo-ids] 通过：${pages.size} 页挂 ${demos.size} 份示例（${fileCount} 个文件），按页 × 框架核对 ${compared} 处 id 声明没有相撞；`
  + `另有 ${useIdCount} 处绑 useId()、${runtimeCount} 处登记在 RUNTIME_IDS 的运行时表达式。`
  + `${refCount} 处按 id 取节点、指向节点的引用都落在本示例自己的声明上`
  + `（${tracedCount} 处顺着变量追到字面量、${boundCount} 处与本文件的 id 绑同一个表达式）；`
  + `${routeHrefCount} 处 href（属性与组件数据）是哈希路由或外链，不指向页内节点；`
  + `另有 ${opaqueSelectorCount} 处选择器、${opaqueHrefCount} 处 href 是表达式且看不出 #id，不算引用`,
)
