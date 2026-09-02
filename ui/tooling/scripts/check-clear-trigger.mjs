#!/usr/bin/env node
// 门禁：清空 / 关闭 / 移除按钮按四类契约各走一套，槽名、尺寸基准、圆角、空态、按压反馈、焦点模型逐项对表。
//
// 四类：
// ① 内嵌清空钮（输入控件里与指示符并排的那颗）：tabindex=-1 不占 Tab 位但不对读屏隐藏、
//    有 aria-label、pointerdown 不夺焦、点完发 VALUE.CLEAR 并把焦点送回宿主；没值就 hidden（不灰留位）；
//    尺寸 --xh-<c>-action-size → --xh-control-action-size，圆角 --xh-<c>-action-radius → --xh-shape-control。
// ② 独立动作钮（file-upload / signature-pad 的清空）：普通 Tab 位按钮，空时不收不灰、只打 data-empty；
//    高 --xh-<c>-clear-h → --xh-control-h-sm。
// ③ 浮层角落关闭钮：--xh-<c>-close-size → --xh-control-h-sm，--xh-<c>-close-radius → --xh-shape-control；
//    字形颜色也得留使用者槽——常态一个、悬停换色的再一个，写死语义令牌等于这颗叉的颜色改不动。
// ④ 标签内移除钮：尺寸基准 --xh-control-indicator-size，圆角 --xh-shape-inset；行级删除钮同 ①的尺寸基准。
// 四类都要有 :active 按压反馈（走 --xh-motion-scale-press）与 [hidden]{display:none}。
import { readFile } from 'node:fs/promises'

const SKINS = 'packages/design/styles/css'
const HEADLESS = 'packages/engine/headless/src'

/** ① 内嵌清空钮：组件 → 点完焦点该回到的部件（只用于提示文案，判据看 connect 里有没有 focus 调用）。 */
const EMBEDDED = ['cascader', 'tree-select', 'combobox', 'date-picker', 'time-picker', 'text-field', 'tags-input', 'select', 'popselect', 'date-field', 'time-field']
/** ② 独立动作钮。 */
const STANDALONE = ['file-upload', 'signature-pad']
/**
 * ③ 浮层角落关闭钮；值是尺寸基准的例外。
 * image-viewer：全屏看片的 chrome 钮按触控靶走 lg。
 * toast：那颗叉排在单行短消息里，不在面板角上——28px 比一行正文的行盒还高，走行级动作钮那一档。
 */
const CLOSE = { 'dialog': null, 'drawer': null, 'popover': null, 'tour': null, 'toast': '--xh-control-action-size', 'alert': null, 'floating-panel': null, 'image-viewer': '--xh-control-h-lg', 'notification': null }
/** 部件名与 close-trigger 不同的，逐条登记（通知的叉在卡片那一层，叫 item-close-trigger）。 */
const CLOSE_PART = { notification: 'item-close-trigger' }
/**
 * ③ 前景槽的例外：这颗叉不自定前景，颜色随别处走。
 * 登记了却其实有槽的照样报，免得名单变成过期的免检通行证。
 */
const CLOSE_FG_EXCEPTION = { 'image-viewer': '看图时整块 chrome 盖住页面，叉的颜色随那层继承（color: inherit），自己不定前景' }
/** ④ 标签内移除钮（组件 → 部件）与行级删除钮。 */
const CHIP_REMOVE = { 'tag': 'close-trigger', 'tags-input': 'item-delete-trigger', 'select': 'item-delete-trigger' }
const ROW_DELETE = { 'file-upload': 'item-delete-trigger', 'dynamic-input': 'item-delete-trigger' }

const problems = []

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 取某部件的所有规则块（选择器含该部件），合成一份文本便于查声明。 */
function rulesOf(css, scope, part) {
  const re = new RegExp(`\\[data-scope='${esc(scope)}'\\]\\[data-part='${esc(part)}'\\]([^{]*)\\{([^{}]*)\\}`, 'g')
  return [...css.matchAll(re)].map(m => ({ tail: m[1], body: m[2] }))
}

function has(rules, pred) {
  return rules.some(r => pred(r.tail, r.body))
}

async function skin(name) {
  try {
    return (await readFile(`${SKINS}/${name}.css`, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  }
  catch {
    problems.push(`${name}.css 读不到——组件改名了就把名单一起改`)
    return null
  }
}

async function connect(name) {
  try {
    return (await readFile(`${HEADLESS}/${name}/${name}.connect.ts`, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
  }
  catch {
    problems.push(`${name}.connect.ts 读不到`)
    return null
  }
}

/** 抠出 getXxxProps 的函数体（到下一个 getXxxProps 或对象末尾）。 */
function getter(src, name) {
  const i = src.indexOf(`${name}:`)
  if (i < 0)
    return null
  const rest = src.slice(i + name.length + 1)
  const next = rest.search(/\n\s{4}get[A-Z][A-Za-z]*Props\s*[:(]/)
  return next < 0 ? rest : rest.slice(0, next)
}

function checkButtonSkin(c, part, { sizeSlot, sizeToken, radiusSlot, radiusToken, press = true }) {
  return async (css) => {
    const rules = rulesOf(css, c, part)
    if (!rules.length) {
      problems.push(`${c}.css 没有 [data-part='${part}'] 的规则`)
      return
    }
    const sizeRe = new RegExp(`(?:inline-size|block-size):\\s*var\\(${esc(sizeSlot)},\\s*var\\(${esc(sizeToken)}\\)\\)`)
    if (!has(rules, (t, b) => t.trim() === '' && sizeRe.test(b)))
      problems.push(`${c}.css [${part}] 尺寸该写 var(${sizeSlot}, var(${sizeToken}))`)
    const radiusRe = new RegExp(`border-radius:\\s*var\\(${esc(radiusSlot)},\\s*var\\(${esc(radiusToken)}\\)\\)`)
    if (!has(rules, (t, b) => t.trim() === '' && radiusRe.test(b)))
      problems.push(`${c}.css [${part}] 圆角该写 var(${radiusSlot}, var(${radiusToken}))`)
    if (!has(rules, (t, b) => /^\[hidden\]/.test(t.trim()) && /display:\s*none/.test(b)))
      problems.push(`${c}.css [${part}] 缺 [hidden] { display: none }`)
    if (press) {
      if (!has(rules, (t, b) => /:active/.test(t) && /--xh-motion-scale-press/.test(b)))
        problems.push(`${c}.css [${part}] 缺 :active 按压反馈（scale: var(--xh-motion-scale-press)）`)
      if (!has(rules, (t, b) => t.trim() === '' && /transition:[^;]*\bscale\b/.test(b)))
        problems.push(`${c}.css [${part}] transition 里没有 scale——按下与松手是硬切`)
    }
  }
}

/**
 * 取值链上的第一个 var() 是不是这个组件的使用者槽。
 * 全局语义令牌（--xh-fg-muted 这类）不算出口：它一改整站跟着变，
 * 使用者要单改这一颗按钮改不到；私有槽（--xh-_ 开头）也不算，那是皮肤自己的中转。
 */
function consumerSlot(comp, value) {
  const m = /var\(\s*(--xh-[a-z0-9-]+)/.exec(value)
  return m && m[1].startsWith(`--xh-${comp}-`) ? m[1] : null
}

/** 取某组规则里第一条 color 声明的取值（避开 background-color 之类带后缀的属性名）。 */
function colorIn(rules, pick) {
  for (const r of rules) {
    if (!pick(r.tail))
      continue
    // 取值段不许以空白开头：与前面那段 \s* 的匹配面重叠会让引擎在长声明上退化成多项式回溯
    const m = /(?:^|[;\s])color:\s*([^;\s][^;]*);/.exec(r.body)
    if (m)
      return m[1].trim()
  }
  return null
}

/** ③ 关闭钮的字形颜色：常态必须走使用者槽，悬停换色的那条也得走。 */
function checkCloseForeground(c, part, css) {
  const rules = rulesOf(css, c, part)
  const base = colorIn(rules, t => t.trim() === '')
  const excused = CLOSE_FG_EXCEPTION[c]
  if (base && consumerSlot(c, base)) {
    if (excused)
      problems.push(`${c} 已有 --xh-${c}-close-fg 一类的前景槽，CLOSE_FG_EXCEPTION 里那条登记过期了，删掉`)
  }
  else if (!excused) {
    problems.push(`${c}.css [${part}] 前景色没留使用者槽，该写 color: var(--xh-${c}-close-fg, <语义令牌>)`)
  }
  const hover = colorIn(rules, t => /:hover/.test(t))
  if (hover && !consumerSlot(c, hover))
    problems.push(`${c}.css [${part}] 悬停换了字色却没留槽，该写 color: var(--xh-${c}-close-fg-hover, <语义令牌>)`)
}

// ① 内嵌清空钮
for (const c of EMBEDDED) {
  const css = await skin(c)
  if (css) {
    await checkButtonSkin(c, 'clear-trigger', {
      sizeSlot: `--xh-${c}-action-size`,
      sizeToken: '--xh-control-action-size',
      radiusSlot: `--xh-${c}-action-radius`,
      radiusToken: '--xh-shape-control',
    })(css)
    if (!has(rulesOf(css, c, 'clear-trigger'), t => /:empty::before/.test(t)) || !/--xh-glyph-mark-close/.test(css))
      problems.push(`${c}.css [clear-trigger] 缺 :empty::before 兜底字形（--xh-glyph-mark-close）`)
    if (/:hover[^{]*\{[^}]*opacity/.test(css) && /\[data-part='clear-trigger'\]/.test(css) && /:has\(/.test(css))
      problems.push(`${c}.css 清空钮还在靠 :hover 显形 / :has() 让位——互斥走 data-clearable`)
  }
  const src = await connect(c)
  if (src) {
    const g = getter(src, 'getClearTriggerProps')
    if (!g) {
      problems.push(`${c}.connect.ts 没有 getClearTriggerProps`)
      continue
    }
    if (!/['"]tabindex['"]:\s*-1/.test(g))
      problems.push(`${c} 清空钮缺 tabindex: -1——它不占 Tab 位，清空走键盘行`)
    if (/aria-hidden/.test(g))
      problems.push(`${c} 清空钮不该 aria-hidden——读屏用户按虚拟光标仍要找得到它`)
    if (!/aria-label/.test(g))
      problems.push(`${c} 清空钮缺 aria-label（translations.clearTrigger）`)
    if (!/onPointerDown/.test(g) || !/preventDefault/.test(g))
      problems.push(`${c} 清空钮缺 onPointerDown preventDefault——按下会把焦点从宿主夺走`)
    if (!/VALUE\.CLEAR/.test(g))
      problems.push(`${c} 清空钮点击该发 VALUE.CLEAR`)
    if (!/(?:\.focus|\bfocus[A-Z]\w*)\s*\(/.test(g))
      problems.push(`${c} 清空钮点完没把焦点送回宿主`)
    if (!/['"]hidden['"]:/.test(g))
      problems.push(`${c} 清空钮没值时该 hidden`)
    if (/['"]disabled['"]:/.test(g) || /data-disabled/.test(g))
      problems.push(`${c} 清空钮不该再打 disabled / data-disabled——没值即 hidden，不灰留位`)
  }
}

// ② 独立动作钮
for (const c of STANDALONE) {
  const css = await skin(c)
  if (css) {
    const rules = rulesOf(css, c, 'clear-trigger')
    const hRe = new RegExp(`block-size:\\s*var\\(--xh-${esc(c)}-clear-h,\\s*var\\(--xh-control-h-sm\\)\\)`)
    if (!has(rules, (t, b) => t.trim() === '' && hRe.test(b)))
      problems.push(`${c}.css [clear-trigger] 高该写 var(--xh-${c}-clear-h, var(--xh-control-h-sm))`)
    if (!has(rules, (t, b) => /:active/.test(t) && /--xh-motion-scale-press/.test(b)))
      problems.push(`${c}.css [clear-trigger] 缺 :active 按压反馈`)
  }
  const src = await connect(c)
  if (src) {
    const g = getter(src, 'getClearTriggerProps')
    if (!g) {
      problems.push(`${c}.connect.ts 没有 getClearTriggerProps`)
      continue
    }
    if (/tabindex/.test(g) || /aria-hidden/.test(g))
      problems.push(`${c} 的清空是独立动作钮，进 Tab 序、不对读屏隐藏`)
    if (!/aria-label/.test(g))
      problems.push(`${c} 清空钮缺 aria-label（translations.clearTrigger）`)
    if (!/data-empty/.test(g))
      problems.push(`${c} 清空钮空时该打 data-empty（不收起也不禁用，免得焦点掉回 body）`)
    if (/['"]hidden['"]:/.test(g))
      problems.push(`${c} 清空钮不该 hidden`)
  }
}

// ③ 浮层角落关闭钮
for (const [c, sizeException] of Object.entries(CLOSE)) {
  const css = await skin(c)
  if (!css)
    continue
  const part = CLOSE_PART[c] ?? 'close-trigger'
  await checkButtonSkin(c, part, {
    sizeSlot: `--xh-${c}-close-size`,
    sizeToken: sizeException ?? '--xh-control-h-sm',
    radiusSlot: `--xh-${c}-close-radius`,
    radiusToken: '--xh-shape-control',
  })(css)
  checkCloseForeground(c, part, css)
}

// ④ 标签内移除钮与行级删除钮
for (const [c, part] of Object.entries(CHIP_REMOVE)) {
  const css = await skin(c)
  if (!css)
    continue
  const rules = rulesOf(css, c, part)
  const sizeRe = /(?:inline-size|block-size):\s*var\(--xh-[a-z-]+-size,\s*var\(--xh-control-indicator-size\)\)/
  if (!has(rules, (t, b) => t.trim() === '' && sizeRe.test(b)))
    problems.push(`${c}.css [${part}] 标签内移除钮尺寸该以 --xh-control-indicator-size 为基准（带使用者槽）`)
  const radiusRe = /border-radius:\s*var\(--xh-[a-z-]+-radius,\s*var\(--xh-shape-inset\)\)/
  if (!has(rules, (t, b) => t.trim() === '' && radiusRe.test(b)))
    problems.push(`${c}.css [${part}] 标签内移除钮圆角该是 --xh-shape-inset（带使用者槽）`)
  if (!has(rules, (t, b) => /:active/.test(t) && /--xh-motion-scale-press/.test(b)))
    problems.push(`${c}.css [${part}] 缺 :active 按压反馈`)
}
for (const [c, part] of Object.entries(ROW_DELETE)) {
  const css = await skin(c)
  if (!css)
    continue
  const rules = rulesOf(css, c, part)
  const sizeRe = /(?:inline-size|block-size):\s*var\(--xh-[a-z-]+-size,\s*var\(--xh-control-action-size\)\)/
  if (!has(rules, (t, b) => t.trim() === '' && sizeRe.test(b)))
    problems.push(`${c}.css [${part}] 行级删除钮尺寸该以 --xh-control-action-size 为基准（带使用者槽）`)
  const radiusRe = /border-radius:\s*var\(--xh-[a-z-]+-radius,\s*var\(--xh-shape-control\)\)/
  if (!has(rules, (t, b) => t.trim() === '' && radiusRe.test(b)))
    problems.push(`${c}.css [${part}] 行级删除钮圆角该是 --xh-shape-control（带使用者槽）`)
  if (!has(rules, (t, b) => /:active/.test(t) && /--xh-motion-scale-press/.test(b)))
    problems.push(`${c}.css [${part}] 缺 :active 按压反馈`)
}

if (problems.length) {
  console.error('[check-clear-trigger] ✗ 清空 / 关闭 / 移除按钮没按契约走：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const n = EMBEDDED.length + STANDALONE.length + Object.keys(CLOSE).length + Object.keys(CHIP_REMOVE).length + Object.keys(ROW_DELETE).length
console.log(`[check-clear-trigger] 通过：${n} 处清空 / 关闭 / 移除按钮都按四类契约走`)
