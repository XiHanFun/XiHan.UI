#!/usr/bin/env node
// 门禁：同一个概念在两个以上组件里用同一个字面量当默认值时，必须先立语义令牌再指过去。
//
// 组件覆盖槽的第二参数是「默认值」不是「兜底」，它必须有；但它一旦在多个组件里写成同一个
// 字面量，那就是一条没被命名的设计决策——改的时候得逐个组件找，找漏一个就长歪一处。
//
// 扫描面是**默认值**的两种写法，两种都算：使用者槽 `var(--xh-x-measure, 32rem)`，
// 以及私有槽赋值 `--xh-_x-measure: 32rem`（先灌进私有槽再消费）。只扫前一种的话，
// 同一条抄写换个写法就整个绕过去了。
//
// 不扫裸声明（`padding: 12px` 这类没有槽的直写）：实测跨组件重复的裸声明是几何常量——
// 1px 发丝线配 -1px 压边、50% 居中、180deg 翻转、grid-column: 2 落位——它们不是设计档位，
// 逼它们令牌化是错的。裸声明该不该留槽由 check-spacing-slots 那条判据管。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

/**
 * 不必令牌化的默认值：它们是 CSS 本身的语义，不是设计档位。
 * 100% / 100vh 是「整个」，50% 是「一半」，0 0 0 transparent 是「没有阴影但占着过渡的形状」。
 */
const NOT_A_SCALE = new Set([
  'transparent',
  'none',
  'auto',
  'inherit',
  'currentColor',
  '0',
  '1',
  '50%',
  '100%',
  '100vh',
  '0 0 0 transparent',
])

/**
 * 括号配平地读出每一处 `var(名字, 默认值)`。
 *
 * 早先这里用的是 `var\(\s*(--xh-[\w-]+)\s*,([^;()]*)\)`——默认值类里排除了括号，
 * 于是任何**带括号的默认值**整条匹配不上：`calc(...)`、`0 1px 2px oklch(...)` 这类
 * 阴影与算式全都看不见，而它们恰恰是最容易在几个组件之间抄来抄去的那一类。
 */
function readSlots(text) {
  const out = []
  for (let i = text.indexOf('var('); i >= 0; i = text.indexOf('var(', i + 1)) {
    let depth = 0
    let end = i + 3
    for (; end < text.length && depth >= 0; end++) {
      if (text[end] === '(')
        depth++
      else if (text[end] === ')' && --depth === 0)
        break
    }
    if (end >= text.length)
      continue
    const inner = text.slice(i + 4, end)
    let nested = 0
    let comma = -1
    for (let k = 0; k < inner.length; k++) {
      if (inner[k] === '(') {
        nested++
      }
      else if (inner[k] === ')') {
        nested--
      }
      else if (inner[k] === ',' && nested === 0) {
        comma = k
        break
      }
    }
    if (comma < 0)
      continue
    const name = inner.slice(0, comma).trim()
    if (!name.startsWith('--xh-'))
      continue
    out.push({ name, fallback: normalise(inner.slice(comma + 1)) })
  }
  return out
}

/**
 * 私有槽的赋值：`--xh-_x-measure: 32rem`。
 *
 * 它与 `var(--xh-x-measure, 32rem)` 是同一件事——都是一条设计决策的默认值，
 * 只是先灌进私有槽再消费。不扫它，同一条抄写换个写法就绕过去了。
 */
function readPrivateDefaults(text) {
  return [...text.matchAll(/(--xh-_[\w-]+)\s*:([^;{}]+);/g)]
    .map(hit => ({ name: hit[1], fallback: normalise(hit[2]) }))
}

/** 折行的取值与写在一行的是同一个字面量：空白归一，否则同一条抄写分成两组。 */
function normalise(value) {
  return value.trim().replace(/\s+/g, ' ')
}

/** 注释挖空：注释里的写法不是取值。 */
const strip = css => css.replace(/\/\*[\s\S]*?\*\//g, ' ')

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))

/** key = 「槽位后缀 = 字面量」，value = 用到它的组件集合。 */
const groups = new Map()
/** 同上，但只收使用者槽——后缀那条判据只对使用者槽成立，理由见下。 */
const publicGroups = new Map()

function collect(map, comp, name, fallback) {
  // 默认值本身是另一个令牌时不算「没被命名的决策」——它已经指到语义层了
  if (fallback.startsWith('var(') || NOT_A_SCALE.has(fallback))
    return
  // 私有槽前缀多一个下划线，两种都剥掉，剩下的那截才是「这是个什么」
  const prefix = name.startsWith(`--xh-_${comp}-`) ? `--xh-_${comp}-` : `--xh-${comp}-`
  const suffix = name.startsWith(prefix) ? name.slice(prefix.length) : name
  const key = `${suffix} = ${fallback}`
  const set = map.get(key) ?? new Set()
  set.add(comp)
  map.set(key, set)
}

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const src = strip(await readFile(join(STYLES_DIR, file), 'utf8'))
  for (const { name, fallback } of readSlots(src)) {
    collect(groups, comp, name, fallback)
    collect(publicGroups, comp, name, fallback)
  }
  for (const { name, fallback } of readPrivateDefaults(src))
    collect(groups, comp, name, fallback)
}

/**
 * 值相同、背后却不是同一条决策的，逐条写明理由；名单之外一律受管。
 * 键与上面那张表的 key 同形：`槽位后缀 = 字面量`。
 * 每条都要真被用来放行过一次——不再有两个以上组件写这个值，就是一张过期的免检通行证。
 */
const SAME_VALUE = {
  // 两处都只是「四个数字宽」这个内容度量：code-view 的 4ch 是按行号位数分档那把梯子的
  // 第四级（1ch 到 7ch 逐级各一条），diff-view 的 4ch 是固定默认。改其中一处不会想改另一处，
  // 收成一支设计令牌反而把梯子和默认值绑死
  'gutter = 4ch': 'code-view 是按位数分档的梯子的第四级，diff-view 是固定默认',
}

const shared = [...groups].filter(([key, comps]) => !(key in SAME_VALUE) && comps.size >= 2)
/** 登记了却已经不重复的：名单过期。 */
const staleExempt = Object.keys(SAME_VALUE).filter(key => (groups.get(key)?.size ?? 0) < 2)

// 同一个槽位后缀在多个组件里各写各的字面量（trigger-min-w = 10rem / 12rem / 14rem）：
// 值互异所以上面那条抓不到，但它们是同一个概念，同样该收成一个语义令牌。
//
// 这条只对使用者槽成立：使用者槽的后缀是对外的契约名，同名就该是同一件事。私有槽的名字
// 是各家自取的内部简写，同名不同义是常态（色板拇指与开关拇指都叫 thumb-size），
// 拿它当「同一个概念」的判据只会逼出一张名不副实的例外表。
const bySuffix = new Map()
for (const [key, comps] of publicGroups) {
  const suffix = key.slice(0, key.indexOf(' = '))
  if (!bySuffix.has(suffix))
    bySuffix.set(suffix, new Map())
  for (const comp of comps)
    bySuffix.get(suffix).set(comp, key.slice(key.indexOf(' = ') + 3))
}
/** 后缀相同但概念不同的，逐条写明理由；名单之外一律受管。 */
const DISTINCT = {
  'column-min-w': '级联的列是一列选项文字，时间选择器的列是两位数字',
  // 同名不同面：看图的关闭钮压在暗遮罩上，只能往固定的深色兑；标签的移除钮在标签里面，
  // 实心 / 淡底 / 描边三种形态下底色各不相同，只有从 currentColor 兑才三种都压得住
  'close-bg-hover': 'image-viewer 的关闭钮压在暗遮罩上，tag 的移除钮压在标签自己的底上',
  'close-bg-active': '同 close-bg-hover',
}
const divergent = [...bySuffix].filter(([suffix, byComp]) => !(suffix in DISTINCT) && byComp.size >= 2 && new Set(byComp.values()).size >= 2)
for (const suffix of Object.keys(DISTINCT)) {
  const byComp = bySuffix.get(suffix)
  if (!byComp || byComp.size < 2 || new Set(byComp.values()).size < 2)
    divergent.push([suffix, new Map([['（名单）', '登在 DISTINCT 里但已不互异，删掉这条']])])
}

if (shared.length || divergent.length || staleExempt.length) {
  if (staleExempt.length)
    console.error('[check-shared-slots] ✗ SAME_VALUE 里这些登记已经没有两个以上组件写同一个值了，名单过期，删掉这几条：')
  for (const key of staleExempt)
    console.error(`  ${key}  —— ${SAME_VALUE[key]}`)
  if (shared.length)
    console.error('[check-shared-slots] ✗ 这些默认值在多个组件里重复，先立语义令牌再指过去：')
  for (const [key, comps] of shared.sort((a, b) => b[1].size - a[1].size))
    console.error(`  ${key}  —— ${comps.size} 个组件: ${[...comps].sort().join(' ')}`)
  if (divergent.length)
    console.error('[check-shared-slots] ✗ 同一个槽位后缀在多个组件里各写各的字面量，这是同一个概念，收成一个语义令牌：')
  for (const [suffix, byComp] of divergent)
    console.error(`  ${suffix}  —— ${[...byComp].map(([c, v]) => `${c}=${v}`).join(' / ')}`)
  process.exit(1)
}

console.log(`[check-shared-slots] 通过：${files.length} 份皮肤 · ${groups.size} 处字面量默认值（使用者槽与私有槽赋值都在内）没有跨组件重复（值同而决策不同的登记 ${Object.keys(SAME_VALUE).length} 条）；${publicGroups.size} 处使用者槽的后缀没有同名异值`)
