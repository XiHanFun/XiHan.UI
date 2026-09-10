// 聚焦环压着的那块面，得看得见环。
//
// 环往内收一个环宽，外沿与元素边框外沿重合，环内侧紧挨着的就是元素自己那块面。
// 这一份把每一档挂进页面，用键盘落焦，读算完的 outline-color 与环内侧那块色，
// 按 WCAG 2.2 SC 1.4.11 的非文本对比算比值，低于 3:1 判红。
// 实心面吃默认环与透空的面灌了 currentColor，两个方向都由这一个比值判。
// 失效档按 SC 1.4.11 豁免比值，但环不许消失：outline 仍是实线、环色不透明、与面分得开。
// 环被皮肤撤掉的档不量比值，撤环的那条规则必须登在静态门禁登记表的 ringless 分区里。
//
// 档位从皮肤自己推，不写名单：
//   · 配方 —— 样式表里给某个部件画面（background）或改环色的每一条规则
//   · 上下文 —— 灌槽位或改面、改前景的状态规则，写在祖先上或写在同一个部件上，
//     与配方逐个组合、再两两叠加，组合把面或前景改掉了才另算一档
//   · 语气 —— 面或前景随 data-tone 变的档，六族各算一档
//   · 主题 —— 浅深各跑一遍
// 面不由库画的部件（皮肤只给它声明槽、面归使用者）不进档位表：环内侧那块色不是库的。
//
// 推导时漏在门外的分支逐条点名，登在 focus-ring-face-contrast.dropped.json 里，两侧反查：
// 登记的分支必须仍然漏在门外、漏在门外的分支必须已登记，任一条不成立即判红。
// 本侧算出的实心档（面压默认环不到 3:1 的档）按静态门禁的键写进 focus-ring-face-contrast.solid.json，
// 同样两侧反查。
//
// 与静态门禁 check-focus-ring-surface 的分母逐条对账，键先归成同一形态（focus-ring-surface-key 的 canonicalKeys）：
//   · 静态算出的每档实心档，本侧都挂得出来、量出来也是实心的，环撤没撤两侧一致；
//     叠出同一份面的组合与同一棵树被两份配方推出来的那份只量一次，顺着 aliases 找到量过的那一档
//   · 本侧量出的每档实心档，静态要么算出了同一块面（同键、或覆盖它的档，比值对得上），
//     要么登在 declared 里说明为什么算不出
//   · 静态登记为不接焦点的面，本侧也不给它挂档
// 对不上的逐条登在 focus-ring-face-contrast.reconcile.json 里写明理由，两侧反查：
// 登记的必须仍然对不上、对不上的必须已登记。
// 三张表都用 VITE_FOCUS_RING_UPDATE=1 重跑本份来重写，reconcile 表新进的条目理由留空由人补。
import { commands, userEvent } from '@vitest/browser/context'
import { allSuites } from '@xihan-ui/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import surfaceRegistry from '../../../../../tooling/scripts/focus-ring-surface-registry.json'
import { renderFixtureNode, resolveRoot } from '../fixture-vnode'
import droppedRegistry from './focus-ring-face-contrast.dropped.json'
import reconcileRegistry from './focus-ring-face-contrast.reconcile.json'
import solidRegistry from './focus-ring-face-contrast.solid.json'
import { canonicalKeys, coversKey, parseStaticCompound, renderStaticCompound, splitTop, staticKey } from './focus-ring-surface-key'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 重写三张登记表的开关：VITE_ 前缀的环境变量由 vite 透传进浏览器。 */
const UPDATE = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_FOCUS_RING_UPDATE === '1'
const DROPPED_FILE = 'tests/browser/focus-ring-face-contrast.dropped.json'
const SOLID_FILE = 'tests/browser/focus-ring-face-contrast.solid.json'
const RECONCILE_FILE = 'tests/browser/focus-ring-face-contrast.reconcile.json'

// ── 颜色 ──

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

/** 把一串颜色按从下到上的顺序叠在白底上，返回叠完的 sRGB 三分量。 */
function composite(layers: readonly string[]): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 1, 1)
  for (const layer of layers) {
    // 取值解析不了时 fillStyle 保持不变，先置透明，免得把上一层重画一遍
    ctx.fillStyle = 'transparent'
    ctx.fillStyle = layer
    ctx.fillRect(0, 0, 1, 1)
  }
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0]!, d[1]!, d[2]!]
}

function luminance([r, g, b]: readonly [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: readonly [number, number, number], b: readonly [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * 环内侧那一摞色：从最外层祖先到元素自己的底色，透的那几层由下面一层透上来。
 * 描边不计——环往内收一个环宽，正好把与环同厚或更细的那圈描边盖在底下。
 */
function insideStack(el: Element): string[] {
  const stack: string[] = []
  for (let node: Element | null = el; node; node = node.parentElement)
    stack.push(getComputedStyle(node).backgroundColor)
  return stack.reverse()
}

/** 任意 CSS 颜色写法（含 var()）算完之后的取值：画布不认变量，先让引擎算一遍。 */
function resolve(value: string): string {
  const probe = document.createElement('span')
  probe.style.color = value
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** 一个颜色串的 alpha：rgb() 是 1，rgba() 读第四个分量。 */
function alphaOf(color: string): number {
  const m = /rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*([\d.]+)\s*)?\)/.exec(color)
  return m ? (m[1] === undefined ? 1 : Number(m[1])) : 1
}

// ── 从皮肤推档位 ──

interface Compound {
  scope?: string
  part?: string
  attrs: [string, string][]
  /** :not() 排掉的属性条件与其余伪类，按静态门禁的写法渲染好，只进键不进挂载。 */
  nots: string[]
  pseudos: string[]
  /** 挂载时为了让私有槽有地方声明而补出来的 root，不是选择器里写的。 */
  synthetic?: boolean
}

interface Recipe {
  scope: string
  part: string
  chain: Compound[]
  /** 环由 :focus-within 画在这一层上，焦点落在它里面的节点上。 */
  focusWithin: boolean
  /** 原选择器，用来核对挂出来的节点确实命中这一档。 */
  branch: string
  signature: string
}

/** 套在配方上的档：形态、语气、尺寸、状态这类写在祖先上或同一个部件上的规则。 */
interface Context {
  scope: string
  chain: Compound[]
  label: string
  signature: string
}

/** 展开 :is() / :where() 里的并列项，一条分支拆成多条。 */
function expandGroups(selector: string): string[] {
  const m = /:(?:is|where)\(([^()]*)\)/.exec(selector)
  if (!m)
    return [selector]
  return m[1]!.split(',').flatMap(alt =>
    expandGroups(selector.slice(0, m.index) + alt.trim() + selector.slice(m.index + m[0].length)),
  )
}

/** 一条选择器列表拆成分支：顶层逗号先拆，再展开 :is() / :where()。 */
function branchesOf(selectorText: string): string[] {
  return splitTop(selectorText, ch => ch === ',').flatMap(raw => expandGroups(raw.replace(/\s+/g, ' ')))
}

/** 括号与方括号之外的空格与 > 才是后代关系。 */
function splitCompounds(branch: string): string[] {
  const out: string[] = []
  let depth = 0
  let current = ''
  for (const ch of branch) {
    if (ch === '[' || ch === '(')
      depth++
    else if (ch === ']' || ch === ')')
      depth--
    if (depth === 0 && (ch === ' ' || ch === '>')) {
      if (current)
        out.push(current)
      current = ''
      continue
    }
    current += ch
  }
  if (current)
    out.push(current)
  return out
}

/** 挂不出来的写法：要真实指针、要伪元素、要相邻兄弟、要空内容、要原生禁用或隐藏。 */
const UNMOUNTABLE = /::|:hover|:active|:has\(|:empty|:disabled|:checked|:indeterminate|:placeholder|:autofill|[~+*]|\[hidden\]|\[inert\]|\[disabled\]|:dir\(|:lang\(|:root/

/** 这条分支里挂不出来的那个写法；:not() 排掉的条件不算，裸节点天然满足。 */
function unmountableIn(branch: string): string | null {
  return UNMOUNTABLE.exec(branch.replace(/:not\([^()]*\)/g, ''))?.[0] ?? null
}

function parseCompound(text: string): Compound {
  // 功能性伪类里的条件（:not(...) 这类）不照搬到节点上，挂完用原选择器核对
  const bare = text.replace(/:[a-z-]+\([^()]*\)/g, '')
  const attrs: [string, string][] = []
  for (const m of bare.matchAll(/\[([a-z-]+)(?:=["']?([^"'\]]*)["']?)?\]/g))
    attrs.push([m[1]!, m[2] ?? ''])
  const scope = attrs.find(a => a[0] === 'data-scope')?.[1]
  const part = attrs.find(a => a[0] === 'data-part')?.[1]
  const parsed = parseStaticCompound(text)
  return {
    scope,
    part,
    attrs: attrs.filter(a => a[0] !== 'data-scope' && a[0] !== 'data-part'),
    nots: parsed ? parsed.nots.map(renderStaticCompound) : [],
    pseudos: parsed ? parsed.pseudos : [],
  }
}

/** 库随包发出去的样式表里，所有不带条件（不在 @media / @container / @supports 里）的规则。 */
function unconditionalRules(): CSSStyleRule[] {
  const out: CSSStyleRule[] = []
  const walk = (list: CSSRuleList, conditional: boolean) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) {
        if (!conditional)
          out.push(rule)
      }
      else if ('cssRules' in rule) {
        const grouping = rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule
          || rule.constructor.name === 'CSSContainerRule'
        walk((rule as CSSGroupingRule).cssRules, conditional || grouping)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules, false)
    }
    catch {}
  }
  return out
}

/** 推导时漏在门外的分支：分支 → 漏掉的缘由。 */
const dropped = new Map<string, string>()
function drop(branch: string, why: string): void {
  if (!dropped.has(branch))
    dropped.set(branch, why)
}

/** 一条分支拆成配方：挂不出来的写法与没点名部件的分支各自点名记下。 */
function toRecipe(branch: string, record: boolean): Recipe | null {
  if (!branch.includes('data-part'))
    return null
  const unmountable = unmountableIn(branch)
  if (unmountable) {
    if (record)
      drop(branch, `写法挂不出来：${unmountable}`)
    return null
  }
  const compounds = splitCompounds(branch)
  const chain = compounds.map(parseCompound)
  const target = chain[chain.length - 1]!
  const scope = target.scope ?? chain.find(c => c.scope)?.scope
  if (!target.part || !scope) {
    if (record)
      drop(branch, '分支没点名部件')
    return null
  }
  const focusWithin = /:focus-within/.test(compounds[compounds.length - 1]!)
  const signature = JSON.stringify([chain.map(c => [c.scope, c.part, [...c.attrs].sort()]), focusWithin])
  return { scope, part: target.part, chain, focusWithin, branch, signature }
}

/** 这条规则画不画面、改不改环色。只灌槽位的规则不算画面：面由读槽的那条规则画出来。 */
function paintsFaceOrRing(style: CSSStyleDeclaration): boolean {
  if (style.getPropertyValue('background') || style.getPropertyValue('background-color'))
    return true
  return Array.from(style).includes('--xh-_ring-color')
}

/**
 * 能当上下文套到别的档上的规则：灌槽位的（面由读槽的规则画出来），
 * 以及直接改面或前景的状态档（失效、选中这类）——两个状态叠在一起时环色规则与面各归一条。
 */
function shapesTier(style: CSSStyleDeclaration): boolean {
  return Array.from(style).some(prop => prop.startsWith('--'))
    || !!(style.getPropertyValue('background') || style.getPropertyValue('background-color') || style.getPropertyValue('color'))
}

/** 这条规则把环撤了：outline 是 none 或宽度为零。 */
function turnsRingOff(style: CSSStyleDeclaration): boolean {
  return style.getPropertyValue('outline-style').trim() === 'none' || /^0(?:px)?$/.test(style.getPropertyValue('outline-width').trim())
}

/** 环色随前景走的部件：皮肤给它灌过 --xh-_ring-color，前景一变环就跟着变。 */
const ringFollowsColor = new Set<string>()

/** 画面的规则先收，只改环色的聚焦规则后收：同一个状态两边都写了时，键与原选择器取画面那条。 */
function recipes(): Recipe[] {
  const bySignature = new Map<string, Recipe>()
  const rules = unconditionalRules().filter(rule => paintsFaceOrRing(rule.style))
  const paintsFace = (rule: CSSStyleRule) => !!(rule.style.getPropertyValue('background') || rule.style.getPropertyValue('background-color'))
  for (const rule of [...rules.filter(paintsFace), ...rules.filter(rule => !paintsFace(rule))]) {
    for (const branch of branchesOf(rule.selectorText)) {
      const recipe = toRecipe(branch, true)
      if (recipe && !bySignature.has(recipe.signature))
        bySignature.set(recipe.signature, recipe)
    }
  }
  return [...bySignature.values()]
}

function contexts(): Context[] {
  const bySignature = new Map<string, Context>()
  for (const rule of unconditionalRules()) {
    if (!shapesTier(rule.style))
      continue
    for (const branch of branchesOf(rule.selectorText)) {
      // 改环色的聚焦规则自己就是配方，不再当上下文套一遍
      if (/:focus-(?:visible|within)/.test(branch))
        continue
      const recipe = toRecipe(branch, false)
      // 没写状态属性的那条是缺省档，配方自己挂出来就是它，不另算上下文
      if (!recipe || recipe.chain.every(c => c.attrs.length === 0))
        continue
      const anchor = recipe.chain[recipe.chain.length - 1]!
      const attrs = recipe.chain.flatMap(c => c.attrs.map(([k, v]) => (v ? `${k.replace('data-', '')}=${v}` : k.replace('data-', '')))).join(' ')
      const label = `${recipe.scope}/${anchor.part} ${attrs}`
      const signature = `${recipe.scope}|${recipe.signature}`
      if (!bySignature.has(signature))
        bySignature.set(signature, { scope: recipe.scope, chain: recipe.chain, label, signature })
    }
  }
  return [...bySignature.values()]
}

// ── 把一档挂进页面 ──

/** 真实组件里这个部件渲染成什么标签，没测到就用 div。 */
const tags = new Map<string, string>()
/** 谁套得住谁：部件 → 真实组件里出现在它外面的那些部件。 */
const ancestors = new Map<string, Set<string>>()

function nest(outer: string, inner: string) {
  if (outer === inner)
    return
  if (!ancestors.has(inner))
    ancestors.set(inner, new Set())
  ancestors.get(inner)!.add(outer)
}

let host: HTMLElement | null = null

/**
 * 给页面铺上本主题的底与字，与无障碍扫描同一块底、同一支字。
 * 透空的面透到最后透出来的是这块底；没写 color 的部件继承的是这支字，
 * 环取 currentColor 时取的就是它。
 */
function paintPage(): void {
  document.body.style.backgroundColor = 'var(--xh-bg-canvas)'
  document.body.style.color = 'var(--xh-fg-default)'
}

/** 链子里没有本 scope 的 root 时补一层在最外面：私有槽多半声明在 root 上。 */
function withRoot(chain: Compound[], scope: string): Compound[] {
  return chain.some(c => (c.scope ?? scope) === scope && c.part === 'root')
    ? chain
    : [{ scope, part: 'root', attrs: [], nots: [], pseudos: [], synthetic: true }, ...chain]
}

/** 两节落在同一个节点上：属性合在一起。 */
function mergeCompound(a: Compound, b: Compound): Compound {
  return {
    ...a,
    scope: a.scope ?? b.scope,
    attrs: [...a.attrs, ...b.attrs],
    nots: [...new Set([...a.nots, ...b.nots])],
    pseudos: [...new Set([...a.pseudos, ...b.pseudos])],
    synthetic: !!a.synthetic && !!b.synthetic,
  }
}

/**
 * 上下文的链子逐条接进配方的链子，接成一棵树：同一个节点（同 scope 同 part）合并，不摆两遍。
 * 摆两遍时里面那层会把祖先灌的槽用缺省档盖回去，形态档当场失效。
 * 上下文的落点就是配方那个部件时，两条的属性合在同一个节点上，上下文的祖先补到外面。
 */
function assemble(recipe: Recipe, contexts: readonly Context[]): Compound[] {
  const same = (a: Compound, b: Compound) => (a.scope ?? recipe.scope) === (b.scope ?? recipe.scope) && a.part === b.part
  let chain = recipe.chain.map(c => ({ ...c }))
  for (const context of contexts) {
    const ctx = context.chain
    const anchor = ctx[ctx.length - 1]!
    const last = chain.length - 1
    if (same(anchor, chain[last]!)) {
      chain[last] = mergeCompound(chain[last]!, anchor)
      const extra: Compound[] = []
      for (const c of ctx.slice(0, -1)) {
        const at = chain.findIndex((m, i) => i < last && same(m, c))
        if (at === -1)
          extra.push(c)
        else
          chain[at] = mergeCompound(chain[at]!, c)
      }
      chain = [...extra, ...chain]
    }
    else {
      const out = [...ctx]
      let i = 0
      for (; i < chain.length; i++) {
        const head = chain[i]!
        const at = out.findIndex(c => same(c, head))
        if (at === -1)
          break
        out[at] = mergeCompound(out[at]!, head)
      }
      chain = [...out, ...chain.slice(i)]
    }
  }
  return withRoot(chain, recipe.scope)
}

/** 按配方摆一棵裸节点树：皮肤是纯 CSS，认的就是 data-scope / data-part 与那几个状态属性。 */
function mount(recipe: Recipe, contexts: readonly Context[], tone: string | null): { target: HTMLElement, focusTarget: HTMLElement } {
  host?.remove()
  host = document.createElement('div')
  document.body.append(host)

  const chain = assemble(recipe, contexts)

  let parent: HTMLElement = host
  let target: HTMLElement = host
  chain.forEach((compound, index) => {
    const last = index === chain.length - 1
    const scope = compound.scope ?? recipe.scope
    const tag = last && !recipe.focusWithin ? (tags.get(`${scope}/${compound.part}`) ?? 'div') : 'div'
    const el = document.createElement(tag)
    el.dataset.scope = scope
    if (compound.part)
      el.dataset.part = compound.part
    // 定位层落位才露（reset.css 的契约），不打这一条整棵浮层都是隐形的
    if (compound.part === 'positioner')
      el.dataset.positioned = ''
    // 选择器只写了 [data-tone] 的那一节，挂的时候填上本档的语气
    for (const [name, value] of compound.attrs)
      el.setAttribute(name, name === 'data-tone' && !value && tone ? tone : value)
    parent.append(el)
    parent = el
    if (last)
      target = el
  })
  // 语气打在这棵树外面那层：语气槽沿继承流下来，选择器里写了 [data-tone] 的那一节才自己带上
  if (tone)
    host.setAttribute('data-tone', tone)

  let focusTarget = target
  if (recipe.focusWithin) {
    const inner = document.createElement('input')
    target.append(inner)
    focusTarget = inner
  }
  else {
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')
      target.textContent = '文'
    target.tabIndex = 0
  }
  return { target, focusTarget }
}

/** 挂出来的节点是不是真的命中这一档：焦点伪类先摘掉，其余条件必须逐条成立。 */
function reproduces(recipe: Recipe, target: HTMLElement): boolean {
  try {
    return target.matches(recipe.branch.replace(/:focus-(?:visible|within)/g, ''))
  }
  catch {
    return false
  }
}

/** 撤环的规则里，命中这个节点的那些分支（焦点伪类摘掉后比对），写成静态门禁的键。 */
function ringOffKeys(target: HTMLElement): string[] {
  const keys = new Set<string>()
  for (const rule of unconditionalRules()) {
    if (!turnsRingOff(rule.style))
      continue
    for (const branch of splitTop(rule.selectorText, ch => ch === ',')) {
      let hit = false
      try {
        hit = target.matches(branch.replace(/:focus-(?:visible|within)/g, ''))
      }
      catch {}
      if (hit)
        keys.add(staticKey(branch) ?? branch)
    }
  }
  return [...keys]
}

/** 同标签裸元素的 UA 底色。 */
const uaFace = new Map<string, string>()
function uaFaceOf(tag: string): string {
  if (!uaFace.has(tag)) {
    const probe = document.createElement(tag)
    document.body.append(probe)
    uaFace.set(tag, getComputedStyle(probe).backgroundColor)
    probe.remove()
  }
  return uaFace.get(tag)!
}

/**
 * 这块面归使用者：库的样式表里没有一条画面的规则命中这个节点，
 * 算出来的底色就是同标签裸元素的 UA 底色。环内侧那块色不是库画的，量它量的是 UA。
 */
function consumerOwnsFace(target: HTMLElement): boolean {
  if (getComputedStyle(target).backgroundColor !== uaFaceOf(target.tagName.toLowerCase()))
    return false
  for (const rule of unconditionalRules()) {
    if (!(rule.style.getPropertyValue('background') || rule.style.getPropertyValue('background-color')))
      continue
    for (const branch of splitTop(rule.selectorText, ch => ch === ',')) {
      try {
        if (target.matches(branch.replace(/:focus-(?:visible|within)/g, '')))
          return false
      }
      catch {}
    }
  }
  return true
}

/**
 * 这一档量出来的面色（环内侧那一摞叠完的色），用来判断上下文或语气改没改动它。
 * 环取 currentColor 的那些部件，前景也一并计入——它们的环随前景走。
 */
function paintOf(recipe: Recipe, contexts: readonly Context[], tone: string | null): string {
  const { target, focusTarget } = mount(recipe, contexts, tone)
  // 落焦之后再读：有的档的面与前景是 :focus-visible 那条规则给的
  focus(focusTarget)
  const face = composite(insideStack(target)).join()
  return ringFollowsColor.has(`${recipe.scope}/${recipe.part}`)
    ? `${face}|${getComputedStyle(target).color}`
    : face
}

/** 没写语气与写了语气各量一遍：只在某一族语气下才与缺省档分开的上下文也得算一档。 */
function paintPair(recipe: Recipe, contexts: readonly Context[]): string {
  return `${paintOf(recipe, contexts, null)}|${paintOf(recipe, contexts, 'danger')}`
}

// ── 可聚焦部件：真实组件里测出来的 ──

/** 挂一遍每个套件的每种形态，记下真拿得到焦点的部件、它们的标签名与嵌套关系。 */
function harvestFocusable(): Set<string> {
  const found = new Set<string>()
  const stage = document.createElement('div')
  document.body.append(stage)
  for (const suite of allSuites) {
    const shapes: { props: Record<string, unknown>, tree: typeof suite.fixture }[] = [{ props: {}, tree: suite.fixture }]
    for (const c of suite.cases) {
      if (c.props || c.fixture)
        shapes.push({ props: (c.props ?? {}) as Record<string, unknown>, tree: c.fixture ? c.fixture(suite.fixture) : suite.fixture })
    }
    for (const shape of shapes) {
      let app: ReturnType<typeof createApp> | null = null
      try {
        const Root = resolveRoot(suite.component)
        app = createApp({
          setup: () => () => h(Root, { ...shape.tree.attrs, ...shape.props }, {
            default: () => shape.tree.children?.map(c => renderFixtureNode(c, suite.component)) ?? [],
          }),
        })
        app.mount(stage)
        for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('[data-scope][data-part]'))) {
          const scope = el.dataset.scope!
          for (let up = el.parentElement?.closest<HTMLElement>('[data-scope][data-part]'); up; up = up.parentElement?.closest<HTMLElement>('[data-scope][data-part]') ?? null)
            nest(`${up.dataset.scope}/${up.dataset.part}`, `${scope}/${el.dataset.part}`)
          if (!el.matches('a[href],button,input,select,textarea,[tabindex]'))
            continue
          if (el.hasAttribute('inert') || el.closest('[inert]'))
            continue
          const key = `${scope}/${el.dataset.part}`
          found.add(key)
          if (!tags.has(key))
            tags.set(key, el.tagName.toLowerCase())
        }
      }
      catch {}
      finally {
        app?.unmount()
      }
    }
  }
  stage.remove()
  return found
}

/** 一致性套件里 activeElement 点名过的部件，也是焦点落点。 */
function namedBySuites(): Set<string> {
  const named = new Set<string>()
  const push = (component: string, ref: unknown) => {
    const raw = typeof ref === 'string' ? ref : (ref as { part?: string } | null | undefined)?.part
    if (typeof raw === 'string')
      named.add(`${component}/${raw.replace(/\[\d+\]$/, '')}`)
  }
  for (const suite of allSuites) {
    for (const c of suite.cases) {
      push(suite.component, c.initial?.activeElement)
      for (const s of c.steps ?? []) {
        push(suite.component, (s as { expect?: { activeElement?: unknown } }).expect?.activeElement)
        if ((s as { kind?: string }).kind === 'focus')
          push(suite.component, (s as { part?: string }).part)
      }
    }
  }
  return named
}

/** 皮肤自己为它写过聚焦规则的部件——写了这条就是当它会拿到焦点。 */
function namedBySkins(): Set<string> {
  const out = new Set<string>()
  for (const rule of unconditionalRules()) {
    const ring = rule.style.getPropertyValue('--xh-_ring-color')
    for (const branch of splitTop(rule.selectorText, ch => ch === ',')) {
      const compounds = splitCompounds(branch.replace(/\s+/g, ' '))
      const parsed = compounds.map(parseCompound)
      // 顺手记下选择器里写明的嵌套：写成后代关系就是当外层套得住内层
      for (let i = 1; i < parsed.length; i++) {
        for (let j = 0; j < i; j++) {
          const outer = parsed[j]!
          const inner = parsed[i]!
          if (outer.scope && outer.part && inner.part)
            nest(`${outer.scope}/${outer.part}`, `${inner.scope ?? outer.scope}/${inner.part}`)
        }
      }
      const target = parsed[parsed.length - 1]!
      const scope = target.scope ?? parsed.find(c => c.scope)?.scope
      if (!scope || !target.part)
        continue
      if (ring)
        ringFollowsColor.add(`${scope}/${target.part}`)
      if (/:focus-(?:visible|within)/.test(branch))
        out.add(`${scope}/${target.part}`)
    }
  }
  return out
}

const focusable = harvestFocusable()
const named = namedBySuites()
const skinFocus = namedBySkins()

/** 解剖里 *-trigger 一律是钮：真实组件里没渲染到的那几颗（要交互才出现的）照样收。 */
const isTrigger = (part: string) => part === 'trigger' || part.endsWith('-trigger')

function takesFocus(scope: string, part: string): boolean {
  const key = `${scope}/${part}`
  return focusable.has(key) || named.has(key) || skinFocus.has(key) || isTrigger(part)
}

// ── 档位表 ──

const TONES = ['brand', 'neutral', 'success', 'warning', 'danger', 'info'] as const
const THEMES = ['light', 'dark'] as const

interface Tier {
  label: string
  recipe: Recipe
  contexts: Context[]
  tone: string | null
  theme: 'light' | 'dark'
  /** 这一档按静态门禁的写法：组件 + 选择器里写出来的那几节。 */
  key: string
}

/**
 * 这个上下文套不套得住这一档：写在同一个部件上的直接合并；
 * 写在祖先上的，外层那一节要真的在真实组件里出现在它外面。
 */
function wraps(context: Context, recipe: Recipe): boolean {
  const anchor = context.chain[context.chain.length - 1]!
  const outer = `${anchor.scope ?? context.scope}/${anchor.part}`
  const inner = `${recipe.scope}/${recipe.part}`
  if (outer === inner)
    return true
  const observed = ancestors.get(inner)
  // 真实组件里没渲染到的部件（要交互才出现的那些），只认本 scope 的 root 当外层
  return observed ? observed.has(outer) : outer === `${recipe.scope}/root`
}

function describeAttrs(recipe: Recipe): string {
  const bits = recipe.chain.flatMap(c => c.attrs.map(([k, v]) => (v ? `${k.replace('data-', '')}=${v}` : k.replace('data-', ''))))
  return bits.length ? bits.join(' ') : '基础档'
}

/** 挂出来的这棵树写成静态门禁的键：补出来的 root 不写，data-scope 只在选择器里写了时才写，:not() 与伪类照静态门禁的写法接在后面。 */
function tierKey(recipe: Recipe, contexts: readonly Context[]): string {
  const compounds = assemble(recipe, contexts).filter(c => !c.synthetic).map((c) => {
    const attrs = new Map<string, Set<string>>()
    if (c.part)
      attrs.set('data-part', new Set([c.part]))
    if (c.scope)
      attrs.set('data-scope', new Set([c.scope]))
    for (const [k, v] of c.attrs) {
      if (!attrs.has(k))
        attrs.set(k, new Set())
      attrs.get(k)!.add(v)
    }
    const bits = [...attrs.keys()].sort().map((k) => {
      const vals = [...attrs.get(k)!].filter(Boolean).sort()
      return vals.length === 0 ? `[${k}]` : vals.length === 1 ? `[${k}='${vals[0]}']` : `[${k}=:is(${vals.join(',')})]`
    })
    return [...bits, ...[...c.nots].sort().map(n => `:not(${n})`), ...[...c.pseudos].sort().map(p => `:${p}`)].join('')
  })
  return `${recipe.scope} ${compounds.join(' ')}`
}

/** 同一棵树、同一个落焦方式，只算一档。 */
function stateOf(recipe: Recipe, contexts: readonly Context[]): string {
  return JSON.stringify([assemble(recipe, contexts).map(c => [c.scope ?? recipe.scope, c.part, [...c.attrs].sort()]), recipe.focusWithin])
}

/** 同一个 DOM 状态被两份配方推出来的次数，只报数，不另算档。 */
let merged = 0

/**
 * 没另算一档的组合归到哪一档：叠出同一份面与前景的组合、同一棵树被两份配方推出来的那份，
 * 各自记下它量的是哪个键。键都是规范形态，对账时顺着这张表找到量过的那一档。
 */
const aliases = new Map<string, string>()
function alias(from: string, to: string): void {
  const target = canonicalKeys(to)[0]!
  for (const key of canonicalKeys(from)) {
    if (key !== target && !aliases.has(key))
      aliases.set(key, target)
  }
}

function buildTiers(): Tier[] {
  const out: Tier[] = []
  const states = new Map<string, string>()
  const allContexts = contexts()
  for (const recipe of recipes()) {
    if (!takesFocus(recipe.scope, recipe.part)) {
      drop(recipe.branch, `部件不接焦点：${recipe.scope}/${recipe.part}`)
      continue
    }
    const { target, focusTarget } = mount(recipe, [], null)
    if (!reproduces(recipe, target)) {
      drop(recipe.branch, '挂出来对不上')
      continue
    }
    // 焦点落不上去的档（藏起来的、被压成不可聚焦的）没有环可量
    focusTarget.focus()
    if (document.activeElement !== focusTarget) {
      drop(recipe.branch, '焦点落不上去')
      continue
    }
    if (consumerOwnsFace(target)) {
      drop(recipe.branch, `面归使用者：<${target.tagName.toLowerCase()}> 的底色是 UA 的，库没给它画面`)
      continue
    }
    const base = paintPair(recipe, [])
    // 上下文只有把这个部件的面（或环随前景走时的前景）改掉了的那些才另算一档；
    // 改出同一个取值的上下文只留头一个，同一份量法不重复报
    const seen = new Map<string, Context[]>([[base, []]])
    const admit = (contexts: Context[]): boolean => {
      const paint = paintPair(recipe, contexts)
      const { target: inner, focusTarget: innerFocus } = mount(recipe, contexts, null)
      // 上下文的属性把配方自己那条规则挤掉了，这不是这一档
      if (!reproduces(recipe, inner))
        return false
      const label = `${recipe.branch} ⟵ ${contexts.map(c => c.label).join(' + ')}`
      // 套上这层上下文之后焦点还落不落得上去（藏起来的浮层壳会把整棵子树按下去）
      innerFocus.focus()
      if (document.activeElement !== innerFocus) {
        if (!seen.has(paint))
          drop(label, '焦点落不上去')
        return false
      }
      // 叠出来的面与前景已经量过：记下它归到哪一档，不另算
      const kept = seen.get(paint)
      if (kept) {
        alias(tierKey(recipe, contexts), tierKey(recipe, kept))
        return false
      }
      if (consumerOwnsFace(inner)) {
        drop(label, `面归使用者：<${inner.tagName.toLowerCase()}> 的底色是 UA 的，库没给它画面`)
        return false
      }
      seen.set(paint, contexts)
      return true
    }
    const wrapping = allContexts.filter(context => wraps(context, recipe))
    const singles = new Set(wrapping.filter(context => admit([context])))
    // 形态与状态各写一条时，两条叠在一起才是那一档：幽灵形态只给按下档灌了槽，
    // 单独套上面不变，与按下档叠在一起面才换。每个改了面的上下文与其余每个上下文各叠一遍
    for (let i = 0; i < wrapping.length; i++) {
      for (let j = i + 1; j < wrapping.length; j++) {
        if (singles.has(wrapping[i]!) || singles.has(wrapping[j]!))
          admit([wrapping[i]!, wrapping[j]!])
      }
    }
    for (const contexts of seen.values()) {
      const state = stateOf(recipe, contexts)
      const key = tierKey(recipe, contexts)
      const first = states.get(state)
      if (first !== undefined) {
        merged++
        alias(key, first)
        continue
      }
      states.set(state, key)
      const plain = paintOf(recipe, contexts, null)
      // 面或前景随语气走的档，六族各算一档；不随的只算一档
      const tones: (string | null)[] = paintOf(recipe, contexts, 'danger') === plain ? [null] : [...TONES]
      for (const tone of tones) {
        for (const theme of THEMES) {
          out.push({
            label: `${recipe.scope}/${recipe.part} · ${describeAttrs(recipe)}${contexts.length ? ` · 上下文 ${contexts.map(c => c.label).join(' + ')}` : ''} · ${tone ?? '无语气'} · ${theme}`,
            recipe,
            contexts,
            tone,
            theme,
            key,
          })
        }
      }
    }
  }
  host?.remove()
  host = null
  return out
}

/** 把焦点送过去，再把在跑的过渡推到终点；:focus-visible 只在键盘模态下匹配，模态在推档位表之前切进去。 */
function focus(el: HTMLElement): void {
  el.focus()
  settle()
}

paintPage()
// 先按一次真实按键把浏览器切进键盘模态，之后的程序化聚焦才匹配 :focus-visible
await userEvent.tab()
const tiers = buildTiers()

afterEach(() => {
  host?.remove()
  host = null
  delete document.documentElement.dataset.theme
})

/**
 * 把在跑的过渡推到终点：焦点一落，面与描边正在皮肤给的那段过渡里，
 * 这时候读到的是插值中的那一帧，不是落焦后的取值。
 */
function settle(): void {
  for (const animation of document.getAnimations()) {
    try {
      animation.finish()
    }
    catch {}
  }
}

/** 键盘锚点轻档的底是 --xh-bg-subtle-hover（浅色 neutral-200），默认环 brand-500 压上去 2.95。 */
const 轻档的灰底 = '键盘锚点轻档的底是 --xh-bg-subtle-hover（浅色 neutral-200），默认环 brand-500 压上去 2.95；静态门禁把 :is(:hover, [data-highlighted]) 整支当悬停档，看不见这块面，给它灌 currentColor 会多出一条算不出实心档的规则。过线要换这一档的面或给它一支专用环色'
/** 实心标签进轻档后底换成灰底、字仍是浅字，两支环色都不到线。 */
const 实心标签的轻档 = '实心标签进键盘锚点轻档后底换成 --xh-bg-subtle-hover（浅色 neutral-200），字仍是实心档那支 fg-on-brand：默认环 2.95，currentColor 只有 1.26。过线要换这一档的面'
/** 标签反白后删除叉的字没跟着换，环取到的是那支灰。 */
const 删除叉的灰字 = '连接层不给删除叉发 data-highlighted，皮肤里 [item-delete-trigger][data-highlighted] 那条换色规则从不命中：标签反白成实心语气底后叉仍是 fg-muted 的灰字，currentColor 环取到的就是这支灰（浅色 neutral 语气下与面同色）。过线要在连接层给叉带上 stateAttrs，或把换色规则改锚在标签的 data-highlighted 上'

/**
 * 明知不达标、且换环色那一行救不回来的档。键是档位标签，值写一句差在哪、过线要动什么。
 * 两侧反查：登记的档必须仍挂得出来、仍在画环、也仍然不达标，三条有一条不成立即判登记过期。
 */
/** 删除钮在实心标签里：select 只传 subtle / outline，solid 档挂不出来。 */
const 删除钮在实心标签里 = 'select 的连接层只把 subtle / outline 传给标签，solid 是 tag.css 有规则、在 select 里却挂不出来的档；判据从夹具学到 tag/root 套着 select/item-delete-trigger 之后把那条上下文也套了上来。删除钮退役成 tag 自己的 close-trigger 后这一档随之消失'

const KNOWN = new Map<string, string>([
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid · 无语气 · light', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid · 无语气 · dark', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · brand · light', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · brand · dark', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · neutral · light', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · neutral · dark', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · danger · light', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · danger · dark', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · success · light', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · success · dark', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · warning · light', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · warning · dark', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · info · light', 删除钮在实心标签里],
  ['select/item-delete-trigger · 基础档 · 上下文 tag/root variant=solid tone · info · dark', 删除钮在实心标签里],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item state=checked · brand · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item state=checked · danger · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item state=checked · info · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item state=checked · neutral · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item state=checked · success · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item state=checked · warning · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · brand · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · danger · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · info · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · neutral · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · success · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · warning · light', 轻档的灰底],
  ['tag-group/item · variant=outline · 上下文 tag-group/item highlighted · 无语气 · light', 轻档的灰底],
  ['tag-group/item · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · brand · light', 实心标签的轻档],
  ['tag-group/item · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · danger · light', 实心标签的轻档],
  ['tag-group/item · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · info · light', 实心标签的轻档],
  ['tag-group/item · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · neutral · light', 实心标签的轻档],
  ['tag-group/item · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · success · light', 实心标签的轻档],
  ['tag-group/item · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · warning · light', 实心标签的轻档],
  ['tag-group/item · variant=subtle · 上下文 tag-group/item highlighted + tag-group/item state=checked · brand · light', 轻档的灰底],
  ['tag-group/item · variant=subtle · 上下文 tag-group/item highlighted + tag-group/item state=checked · danger · light', 轻档的灰底],
  ['tag-group/item · variant=subtle · 上下文 tag-group/item highlighted + tag-group/item state=checked · info · light', 轻档的灰底],
  ['tag-group/item · variant=subtle · 上下文 tag-group/item highlighted + tag-group/item state=checked · neutral · light', 轻档的灰底],
  ['tag-group/item · variant=subtle · 上下文 tag-group/item highlighted + tag-group/item state=checked · success · light', 轻档的灰底],
  ['tag-group/item · variant=subtle · 上下文 tag-group/item highlighted + tag-group/item state=checked · warning · light', 轻档的灰底],
  ['tag-group/item · variant=subtle · 上下文 tag-group/item highlighted · 无语气 · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · brand · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · danger · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · info · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · neutral · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · success · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · warning · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · brand · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · danger · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · info · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · neutral · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · success · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · warning · light', 轻档的灰底],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=solid · 无语气 · light', 实心标签的轻档],
  ['tag-group/item · 基础档 · 上下文 tag-group/item highlighted · 无语气 · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · brand · light', 实心标签的轻档],
  ['tag-group/item-delete-trigger · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · danger · light', 实心标签的轻档],
  ['tag-group/item-delete-trigger · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · info · light', 实心标签的轻档],
  ['tag-group/item-delete-trigger · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · neutral · light', 实心标签的轻档],
  ['tag-group/item-delete-trigger · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · success · light', 实心标签的轻档],
  ['tag-group/item-delete-trigger · variant=solid · 上下文 tag-group/item highlighted + tag-group/item state=checked · warning · light', 实心标签的轻档],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · brand · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · danger · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · info · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · neutral · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · success · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item state=checked · warning · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · brand · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · danger · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · info · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · neutral · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · success · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=outline tone · warning · light', 轻档的灰底],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted + tag-group/item variant=solid · 无语气 · light', 实心标签的轻档],
  ['tag-group/item-delete-trigger · 基础档 · 上下文 tag-group/item highlighted · 无语气 · light', 轻档的灰底],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · brand · dark', 删除叉的灰字],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · brand · light', 删除叉的灰字],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · danger · dark', 删除叉的灰字],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · danger · light', 删除叉的灰字],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · info · dark', 删除叉的灰字],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · info · light', 删除叉的灰字],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · neutral · light', 删除叉的灰字],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · success · dark', 删除叉的灰字],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · success · light', 删除叉的灰字],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · warning · dark', 删除叉的灰字],
  ['tags-input/item-delete-trigger · 基础档 · 上下文 tags-input/item highlighted · warning · light', 删除叉的灰字],
])

/** 静态门禁登记表里撤了环的那些档；分区还没建时是空表，撤环的档一律判红。 */
const ringless: Record<string, unknown> = (surfaceRegistry as { ringless?: Record<string, unknown> }).ringless ?? {}

const round = (n: number) => Math.round(n * 100) / 100

/** 两张登记表与本次算出来的对拍，差异逐条列出来。 */
function diffRegistry<T>(computed: Record<string, T>, registry: Record<string, T>, same: (a: T, b: T) => boolean): string[] {
  const problems: string[] = []
  for (const [key, value] of Object.entries(computed)) {
    if (!(key in registry))
      problems.push(`扫到了、表里没有：${key} —— ${JSON.stringify(value)}`)
    else if (!same(value, registry[key]!))
      problems.push(`表里的取值过期：${key} —— 表里 ${JSON.stringify(registry[key])}，算出来 ${JSON.stringify(value)}`)
  }
  for (const key of Object.keys(registry)) {
    if (!(key in computed))
      problems.push(`表里有、已经扫不到：${key}`)
  }
  return problems
}

const sorted = <T>(obj: Record<string, T>): Record<string, T> => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)))

/** 一个规范键量出来的结果：面压默认环的最低比值（取最低的那一档的主题与语气）、环撤没撤。 */
interface Measured { ratio: number, theme: string, tone: string | null, ringOff: boolean }

let measuredAll: Map<string, Measured> | null = null

/**
 * 每一档挂出来、落焦、量一遍，按规范键收：同一个键多档（语气、主题）只留比值最低的。
 * 面在落焦之后读：有的档的面由 :focus-visible 那条规则铺。
 */
function measureAll(): Map<string, Measured> {
  if (measuredAll)
    return measuredAll
  const out = new Map<string, Measured>()
  for (const tier of tiers) {
    document.documentElement.dataset.theme = tier.theme
    paintPage()
    const { target, focusTarget } = mount(tier.recipe, tier.contexts, tier.tone)
    focus(focusTarget)
    const ringOff = ringOffKeys(target).length > 0
    const stack = insideStack(target)
    const ratio = round(contrast(composite([...stack, resolve('var(--xh-ring-focus)')]), composite(stack)))
    for (const key of canonicalKeys(tier.key)) {
      const prev = out.get(key)
      if (!prev || ratio < prev.ratio)
        out.set(key, { ratio, theme: tier.theme, tone: tier.tone, ringOff })
    }
  }
  host?.remove()
  host = null
  delete document.documentElement.dataset.theme
  measuredAll = out
  return out
}

/** 顺着 aliases 找到量过的那个键；量过的键自己就是终点。 */
function resolveAlias(key: string, measured: Map<string, Measured>): string {
  let cur = key
  for (let i = 0; i < 8 && !measured.has(cur) && aliases.has(cur); i++)
    cur = aliases.get(cur)!
  return cur
}

/** 静态门禁登记表里算出来的实心档、算不出实心档的 currentColor 规则、不接焦点的面。 */
const staticSolid: Record<string, { ratio: number, ring: string }> = (surfaceRegistry as { solid?: Record<string, { ratio: number, ring: string }> }).solid ?? {}
const staticDeclared: string[] = Object.keys((surfaceRegistry as { declared?: Record<string, string> }).declared ?? {})
const staticUnfocusable: string[] = Object.keys((surfaceRegistry as { unfocusable?: Record<string, string> }).unfocusable ?? {})

/** 两侧算比值的路子不同（静态在 oklab 里解令牌、本侧在画布上叠八位色），允许这么大的出入。 */
const RATIO_SLACK = 0.05

/** 登记表的一条：found 是本次对账写出来的差异，why 由人补。 */
interface ReconcileEntry { found: string, why: string }
interface Reconcile { static: Record<string, ReconcileEntry>, browser: Record<string, ReconcileEntry>, unfocusable: Record<string, ReconcileEntry> }

describe('聚焦环压着的那块面', () => {
  it('已知不达标的登记表不过期', () => {
    const labels = new Set(tiers.map(t => t.label))
    for (const key of KNOWN.keys())
      expect(labels.has(key), `${key} 登记在表里，档位表里却挂不出这一档`).toBe(true)
  })

  it('推出来的档位表不空，灌过环色的部件都在场', () => {
    const 说明 = `推出 ${tiers.length} 档 / ${new Set(tiers.map(t => t.recipe.signature)).size} 份配方 / ${new Set(tiers.map(t => t.key)).size} 个静态键，合并了 ${merged} 个重复状态，漏在门外 ${dropped.size} 条分支`
    expect(tiers.length, 说明).toBeGreaterThan(0)
    // 环取 currentColor 的那几档必须都在场：它们是这条定案本身
    const 灌过的 = [...ringFollowsColor].filter(key => tiers.some(t => `${t.recipe.scope}/${t.recipe.part}` === key))
    expect(灌过的.length, `皮肤给 ${ringFollowsColor.size} 个部件灌过环色，档位表里只挂得出 ${灌过的.length} 个：缺 ${[...ringFollowsColor].filter(k => !灌过的.includes(k)).join('、')}`)
      .toBe(ringFollowsColor.size)
  })

  it('推导时漏在门外的分支，逐条登记且两侧对得上', async () => {
    const computed = sorted(Object.fromEntries(dropped))
    if (UPDATE)
      await commands.writeFile(DROPPED_FILE, `${JSON.stringify(computed, null, 2)}\n`)
    const problems = diffRegistry(computed, droppedRegistry as Record<string, string>, (a, b) => a === b)
    expect(problems, `${DROPPED_FILE} 与本次推导对不上（VITE_FOCUS_RING_UPDATE=1 重跑可重写）：\n${problems.join('\n')}`).toEqual([])
  })

  it('本侧算出的实心档，按静态门禁的键登记且两侧对得上', async () => {
    interface Solid { ratio: number, theme: string, tone: string | null }
    const computed: Record<string, Solid> = {}
    // 环压根没画在这一档上的，实心与否与对账无关，不进这张表
    for (const [key, m] of measureAll()) {
      if (!m.ringOff && m.ratio < 3)
        computed[key] = { ratio: m.ratio, theme: m.theme, tone: m.tone }
    }
    const table = sorted(computed)
    if (UPDATE)
      await commands.writeFile(SOLID_FILE, `${JSON.stringify(table, null, 2)}\n`)
    const problems = diffRegistry(table, solidRegistry as Record<string, Solid>, (a, b) => a.ratio === b.ratio && a.theme === b.theme && a.tone === b.tone)
    expect(problems, `${SOLID_FILE} 与本次算出的实心档对不上（VITE_FOCUS_RING_UPDATE=1 重跑可重写）：\n${problems.join('\n')}`).toEqual([])
  })

  it('与静态门禁的分母互相认识：实心档两个方向逐条对得上，不接焦点的面两侧一致', async () => {
    const measured = measureAll()
    const lookup = (key: string) => {
      const at = resolveAlias(key, measured)
      const m = measured.get(at)
      return m ? { at, ...m } : null
    }
    const where = (m: Measured) => `${m.theme} · ${m.tone ?? '无语气'}`
    const found: Reconcile = { static: {}, browser: {}, unfocusable: {} }

    // 一：静态算出的每档实心档，本侧都挂得出来、量出来也是实心的，环撤没撤两侧一致
    for (const [key, entry] of Object.entries(staticSolid)) {
      const reasons: string[] = []
      for (const canon of canonicalKeys(key)) {
        const hit = lookup(canon)
        if (!hit) {
          reasons.push(`本侧挂不出 ${canon}`)
          continue
        }
        const via = hit.at === canon ? '' : `（归到 ${hit.at}）`
        if (entry.ring === 'off' && !hit.ringOff)
          reasons.push(`静态登记环已撤，本侧${via}环还在`)
        if (entry.ring !== 'off' && hit.ringOff)
          reasons.push(`静态登记环取 ${entry.ring}，本侧${via}环被撤了`)
        if (Math.abs(hit.ratio - entry.ratio) > RATIO_SLACK)
          reasons.push(`静态算 ${entry.ratio}:1，本侧${via}量到 ${hit.ratio}:1（${where(hit)}）`)
      }
      if (reasons.length)
        found.static[key] = { found: reasons.join('；'), why: '' }
    }

    // 二：本侧量出的每档实心档（环还在的那些，即 solid 表），静态要么算出了同一块面（同键、或覆盖它的档，比值对得上），
    // 要么登在 declared 里说明为什么算不出
    const staticCanon = Object.entries(staticSolid).flatMap(([k, e]) => canonicalKeys(k).map(c => [c, e] as const))
    const declaredCanon = staticDeclared.flatMap(canonicalKeys)
    for (const [key, m] of measured) {
      if (m.ringOff || m.ratio >= 3)
        continue
      const computed = staticCanon.filter(([s]) => s === key || coversKey(s, key))
      if (computed.some(([, e]) => Math.abs(e.ratio - m.ratio) <= RATIO_SLACK))
        continue
      if (declaredCanon.some(d => d === key || coversKey(d, key)))
        continue
      found.browser[key] = {
        found: computed.length
          ? `静态算到覆盖它的档 ${computed.map(([s, e]) => `${s}（${e.ratio}:1）`).join('、')}，本侧量到 ${m.ratio}:1（${where(m)}）`
          : `静态没算出这一档，本侧量到 ${m.ratio}:1（${where(m)}）`,
        why: '',
      }
    }

    // 三：静态登记为不接焦点的面，本侧也不给它挂档
    for (const key of staticUnfocusable) {
      const m = /^([\w-]+) \[([\w-]+)\]$/.exec(key)
      const keys = m ? [...new Set(tiers.filter(t => t.recipe.scope === m[1] && t.recipe.part === m[2]).map(t => t.key))] : []
      if (keys.length)
        found.unfocusable[key] = { found: `本侧给它挂出 ${keys.length} 个键：${keys.join('；')}`, why: '' }
    }

    // 登记表：本次对不上的条目留着已写的理由，其余整份重写
    const registry = reconcileRegistry as Reconcile
    const table: Reconcile = { static: {}, browser: {}, unfocusable: {} }
    for (const section of ['static', 'browser', 'unfocusable'] as const) {
      for (const [key, entry] of Object.entries(sorted(found[section])))
        table[section][key] = { found: entry.found, why: registry[section]?.[key]?.why ?? '' }
    }
    if (UPDATE)
      await commands.writeFile(RECONCILE_FILE, `${JSON.stringify(table, null, 2)}\n`)

    const problems: string[] = []
    for (const section of ['static', 'browser', 'unfocusable'] as const) {
      for (const [key, entry] of Object.entries(table[section])) {
        const have = registry[section]?.[key]
        if (!have)
          problems.push(`[${section}] 对不上、表里没有：${key} —— ${entry.found}`)
        else if (have.found !== entry.found)
          problems.push(`[${section}] 表里的差异过期：${key} —— 表里「${have.found}」，本次「${entry.found}」`)
        else if (!have.why)
          problems.push(`[${section}] ${key} 登了没写理由——补一句两侧为什么对不上`)
      }
      for (const key of Object.keys(registry[section] ?? {})) {
        if (!(key in table[section]))
          problems.push(`[${section}] 表里有、已经对得上了：${key}——登记过期，删掉`)
      }
    }
    expect(problems, `${RECONCILE_FILE} 与本次对账对不上（VITE_FOCUS_RING_UPDATE=1 重跑可重写，新进条目理由留空由人补）：\n${problems.join('\n')}`).toEqual([])
  })

  it('量得准：已知的一对色算出来就是已知的比值', () => {
    // brand-500 的环压在 brand-600 的实心面上，环整根看不出来
    expect(contrast(composite([resolve('var(--xh-color-brand-500)')]), composite([resolve('var(--xh-color-brand-600)')]))).toBeLessThan(2)
    // 同一块面上换成配对的前景色，环立刻读得出来
    expect(contrast(composite([resolve('var(--xh-fg-on-brand)')]), composite([resolve('var(--xh-color-brand-600)')]))).toBeGreaterThanOrEqual(3)
    // 透空的面透出祖先那层底
    const probe = document.createElement('div')
    probe.style.backgroundColor = 'var(--xh-color-neutral-950)'
    probe.innerHTML = '<span></span>'
    document.body.append(probe)
    expect(composite(insideStack(probe.firstElementChild!))).toEqual(composite([resolve('var(--xh-color-neutral-950)')]))
    probe.remove()
  })

  it('两个方向都响：实心面吃默认环量出来不合格，灌成 currentColor 才合格', () => {
    paintPage()
    host = document.createElement('div')
    host.innerHTML = `<div data-scope="button" data-part="root" tabindex="0"
      style="background:var(--xh-color-brand-600);color:var(--xh-fg-on-brand)">文</div>`
    document.body.append(host)
    const el = host.firstElementChild as HTMLElement
    focus(el)
    const stack = insideStack(el)
    const ratio = () => contrast(composite([...stack, getComputedStyle(el).outlineColor]), composite(stack))

    expect(ratio()).toBeLessThan(3)
    el.style.setProperty('--xh-_ring-color', 'currentColor')
    expect(ratio()).toBeGreaterThanOrEqual(3)
  })

  it('反方向也响：透空的面灌成 currentColor，环糊在底上照样判红', () => {
    paintPage()
    host = document.createElement('div')
    host.innerHTML = `<div data-scope="button" data-part="root" tabindex="0"
      style="background:transparent;color:var(--xh-color-neutral-100)">文</div>`
    document.body.append(host)
    const el = host.firstElementChild as HTMLElement
    focus(el)
    const stack = insideStack(el)
    const ratio = () => contrast(composite([...stack, getComputedStyle(el).outlineColor]), composite(stack))

    expect(ratio()).toBeGreaterThanOrEqual(3)
    el.style.setProperty('--xh-_ring-color', 'currentColor')
    expect(ratio()).toBeLessThan(3)
  })

  it('面归使用者的部件不进档位表：裸 <button> 的 UA 底色不是库画的', () => {
    const probe = document.createElement('button')
    probe.dataset.scope = 'menu'
    probe.dataset.part = 'trigger'
    document.body.append(probe)
    expect(consumerOwnsFace(probe)).toBe(true)
    probe.dataset.state = 'open'
    expect(consumerOwnsFace(probe)).toBe(false)
    probe.remove()
  })

  it.each(tiers)('$label', (tier) => {
    document.documentElement.dataset.theme = tier.theme
    paintPage()
    const { target, focusTarget } = mount(tier.recipe, tier.contexts, tier.tone)
    focus(focusTarget)
    // 焦点没进键盘模态时全库都不画环，比值一律算不出来，先钉住这一条
    expect(target.matches(tier.recipe.focusWithin ? ':focus-within' : ':focus-visible'), '焦点没落上去').toBe(true)

    const style = getComputedStyle(target)
    // 皮肤把这一档的环撤了：撤环的那条规则必须登在静态门禁登记表的 ringless 分区里
    if (style.outlineStyle === 'none' || style.outlineWidth === '0px') {
      expect(KNOWN.has(tier.label), `${tier.label} 登记为已知不达标，这一档却已经不画环了——登记过期了`).toBe(false)
      const keys = ringOffKeys(target)
      expect(keys.length, `${tier.label}｜环没了，库的样式表里却找不到一条命中它的撤环规则`).toBeGreaterThan(0)
      expect(keys.some(key => key in ringless), `${tier.label}｜撤环的规则没登在 ringless 分区：${keys.join('；')}`).toBe(true)
      return
    }

    const stack = insideStack(target)
    const face = composite(stack)
    const ring = composite([...stack, style.outlineColor])
    const 说明 = `${tier.label}｜环 ${style.outlineColor}｜面 ${style.backgroundColor}｜环内侧算完是 rgb(${face})｜描边 ${style.borderTopWidth} ${style.borderTopColor}`
    // 失效档豁免比值，但环得画出来：实线、不透明、与面分得开
    if (target.closest('[data-disabled],[aria-disabled="true"]')) {
      expect(style.outlineStyle, `${说明}｜失效档的环不是实线`).toBe('solid')
      expect(alphaOf(style.outlineColor), `${说明}｜失效档的环是透明的`).toBeGreaterThan(0)
      expect(contrast(ring, face), `${说明}｜失效档的环与面同色`).toBeGreaterThan(1)
      return
    }
    const known = KNOWN.get(tier.label)
    if (known) {
      expect(contrast(ring, face), `${说明}｜登记为已知不达标，现在却过了 3:1——登记过期了：${known}`).toBeLessThan(3)
      return
    }
    expect(contrast(ring, face), 说明).toBeGreaterThanOrEqual(3)
  })
})
