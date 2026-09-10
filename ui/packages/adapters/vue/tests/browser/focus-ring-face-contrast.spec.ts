// 聚焦环压着的那块面，得看得见环。
//
// 环往内收一个环宽，外沿与元素边框外沿重合，环内侧紧挨着的就是元素自己那块面。
// 这一份把每一档挂进页面，用键盘落焦，读算完的 outline-color 与环内侧那块色，
// 按 WCAG 2.2 SC 1.4.11 的非文本对比算比值，低于 3:1 判红。
// 实心面吃默认环与透空的面灌了 currentColor，两个方向都由这一个比值判。
//
// 档位从皮肤自己推，不写名单：
//   · 配方 —— 样式表里给某个部件画面（background 或使用者面槽）或改环色的每一条规则
//   · 上下文 —— 形态、语气这类写在祖先上、只灌槽位的规则，与配方逐对组合，
//     组合把面或前景改掉了才另算一档
//   · 语气 —— 面或前景随 data-tone 变的档，六族各算一档
//   · 主题 —— 浅深各跑一遍
// 挂完用原选择器核对确实命中这一档；核不上、焦点落不上去的逐类记数，由头一条用例报出来。
import { userEvent } from '@vitest/browser/context'
import { allSuites } from '@xihan-ui/testing'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { renderFixtureNode, resolveRoot } from '../fixture-vnode'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

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

// ── 从皮肤推档位 ──

interface Compound {
  scope?: string
  part?: string
  attrs: [string, string][]
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

/** 写在祖先上的档：形态、语气、尺寸这类只灌槽位、面由后代读槽画出来的规则。 */
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

function parseCompound(text: string): Compound {
  // 功能性伪类里的条件（:not(...) 这类）不照搬到节点上，挂完用原选择器核对
  const bare = text.replace(/:[a-z-]+\([^()]*\)/g, '')
  const attrs: [string, string][] = []
  for (const m of bare.matchAll(/\[([a-z-]+)(?:=["']?([^"'\]]*)["']?)?\]/g))
    attrs.push([m[1]!, m[2] ?? ''])
  const scope = attrs.find(a => a[0] === 'data-scope')?.[1]
  const part = attrs.find(a => a[0] === 'data-part')?.[1]
  return { scope, part, attrs: attrs.filter(a => a[0] !== 'data-scope' && a[0] !== 'data-part') }
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

/** 一条分支拆成配方：挂不出来的写法与没点名部件的分支各自记账。 */
function toRecipe(branch: string, tally: Record<string, number>): Recipe | null {
  if (!branch.includes('data-part'))
    return null
  if (UNMOUNTABLE.test(branch)) {
    tally.写法挂不出来 = (tally.写法挂不出来 ?? 0) + 1
    return null
  }
  const compounds = splitCompounds(branch)
  const chain = compounds.map(parseCompound)
  const target = chain[chain.length - 1]!
  const scope = target.scope ?? chain.find(c => c.scope)?.scope
  if (!target.part || !scope) {
    tally.分支没点名部件 = (tally.分支没点名部件 ?? 0) + 1
    return null
  }
  const focusWithin = /:focus-within/.test(compounds[compounds.length - 1]!)
  const signature = JSON.stringify([chain.map(c => [c.scope, c.part, [...c.attrs].sort()]), focusWithin])
  return { scope, part: target.part, chain, focusWithin, branch, signature }
}

/** 这条规则画不画面、改不改环色：面槽（--xh-…-bg…）也算画面，面由别的规则读槽画出来。 */
function paintsFaceOrRing(style: CSSStyleDeclaration): boolean {
  if (style.getPropertyValue('background') || style.getPropertyValue('background-color'))
    return true
  for (const prop of Array.from(style)) {
    if (prop === '--xh-_ring-color')
      return true
    if (prop.startsWith('--') && /-bg(?:-|$)/.test(prop))
      return true
  }
  return false
}

/** 只灌槽位的规则：面由后代读槽画出来，所以它是「档」而不是「面」。 */
function declaresSlots(style: CSSStyleDeclaration): boolean {
  return Array.from(style).some(prop => prop.startsWith('--'))
}

/** 环色随前景走的部件：皮肤给它灌过 --xh-_ring-color，前景一变环就跟着变。 */
const ringFollowsColor = new Set<string>()

/** 推导时漏在门外的分支，逐类记数。 */
const dropped: Record<string, number> = {}
function bump(key: string) {
  dropped[key] = (dropped[key] ?? 0) + 1
}

function recipes(): Recipe[] {
  const bySignature = new Map<string, Recipe>()
  for (const rule of unconditionalRules()) {
    if (!paintsFaceOrRing(rule.style))
      continue
    for (const raw of rule.selectorText.split(',')) {
      for (const branch of expandGroups(raw.trim().replace(/\s+/g, ' '))) {
        const recipe = toRecipe(branch, dropped)
        if (recipe && !bySignature.has(recipe.signature))
          bySignature.set(recipe.signature, recipe)
      }
    }
  }
  return [...bySignature.values()]
}

function contexts(): Context[] {
  const bySignature = new Map<string, Context>()
  for (const rule of unconditionalRules()) {
    if (!declaresSlots(rule.style))
      continue
    for (const raw of rule.selectorText.split(',')) {
      for (const branch of expandGroups(raw.trim().replace(/\s+/g, ' '))) {
        const recipe = toRecipe(branch, {})
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

/** 链子不是从本 scope 的 root 起头时补一层：私有槽多半声明在 root 上。 */
function withRoot(chain: Compound[], scope: string): Compound[] {
  const outer = chain[0]!
  return outer.scope === scope && outer.part === 'root' ? chain : [{ scope, part: 'root', attrs: [] }, ...chain]
}

/**
 * 上下文的链子与配方的链子接成一棵树：同一个节点（同 scope 同 part）合并，不摆两遍。
 * 摆两遍时里面那层会把祖先灌的槽用缺省档盖回去，形态档当场失效。
 */
function assemble(recipe: Recipe, context: Context | null): Compound[] {
  const rec = withRoot(recipe.chain, recipe.scope)
  if (!context)
    return rec
  const out = [...withRoot(context.chain, context.scope)]
  let i = 0
  for (; i < rec.length; i++) {
    const head = rec[i]!
    const at = out.findIndex(c => (c.scope ?? recipe.scope) === (head.scope ?? recipe.scope) && c.part === head.part)
    if (at === -1)
      break
    out[at] = { ...out[at]!, attrs: [...out[at]!.attrs, ...head.attrs] }
  }
  return [...out, ...rec.slice(i)]
}

/** 按配方摆一棵裸节点树：皮肤是纯 CSS，认的就是 data-scope / data-part 与那几个状态属性。 */
function mount(recipe: Recipe, context: Context | null, tone: string | null): { target: HTMLElement, focusTarget: HTMLElement } {
  host?.remove()
  host = document.createElement('div')
  document.body.append(host)

  const chain = assemble(recipe, context)

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
    for (const [name, value] of compound.attrs)
      el.setAttribute(name, value)
    parent.append(el)
    parent = el
    if (last)
      target = el
  })
  if (tone)
    (host.firstElementChild as HTMLElement).setAttribute('data-tone', tone)

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

/**
 * 这一档量出来的面色，用来判断上下文或语气改没改动它。
 * 环取 currentColor 的那些部件，前景也一并计入——它们的环随前景走。
 */
function paintOf(recipe: Recipe, context: Context | null, tone: string | null): string {
  const { target } = mount(recipe, context, tone)
  const face = insideStack(target).join()
  return ringFollowsColor.has(`${recipe.scope}/${recipe.part}`)
    ? `${face}|${getComputedStyle(target).color}`
    : face
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
    for (const branch of rule.selectorText.split(',')) {
      const compounds = splitCompounds(branch.trim().replace(/\s+/g, ' '))
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
  context: Context | null
  tone: string | null
  theme: 'light' | 'dark'
}

/** 这个上下文套不套得住这一档：外层那一节要真的在真实组件里出现在它外面。 */
function wraps(context: Context, recipe: Recipe): boolean {
  const anchor = context.chain[context.chain.length - 1]!
  const outer = `${anchor.scope ?? context.scope}/${anchor.part}`
  const inner = `${recipe.scope}/${recipe.part}`
  if (outer === inner)
    return false
  const observed = ancestors.get(inner)
  // 真实组件里没渲染到的部件（要交互才出现的那些），只认本 scope 的 root 当外层
  return observed ? observed.has(outer) : outer === `${recipe.scope}/root`
}

function describeAttrs(recipe: Recipe): string {
  const bits = recipe.chain.flatMap(c => c.attrs.map(([k, v]) => (v ? `${k.replace('data-', '')}=${v}` : k.replace('data-', ''))))
  return bits.length ? bits.join(' ') : '基础档'
}

function buildTiers(): Tier[] {
  const out: Tier[] = []
  const allContexts = contexts()
  for (const recipe of recipes()) {
    if (!takesFocus(recipe.scope, recipe.part)) {
      bump('部件不接焦点')
      continue
    }
    const { target, focusTarget } = mount(recipe, null, null)
    if (!reproduces(recipe, target)) {
      bump('挂出来对不上')
      continue
    }
    // 焦点落不上去的档（藏起来的、被压成不可聚焦的）没有环可量
    focusTarget.focus()
    if (document.activeElement !== focusTarget) {
      bump('焦点落不上去')
      continue
    }
    const base = paintOf(recipe, null, null)
    // 上下文写在祖先上：只有把这个部件的面（或环随前景走时的前景）改掉了的那些才另算一档；
    // 改出同一个取值的上下文只留头一个，同一份量法不重复报
    const seen = new Map<string, Context>()
    for (const context of allContexts) {
      if (!wraps(context, recipe))
        continue
      const paint = paintOf(recipe, context, null)
      if (paint === base || seen.has(paint))
        continue
      // 套上这层上下文之后焦点还落不落得上去（藏起来的浮层壳会把整棵子树按下去）
      const { focusTarget: inner } = mount(recipe, context, null)
      inner.focus()
      if (document.activeElement !== inner) {
        bump('焦点落不上去')
        continue
      }
      seen.set(paint, context)
    }
    const applicable = [...seen.values()]
    for (const context of [null, ...applicable]) {
      const plain = paintOf(recipe, context, null)
      // 面或前景随语气走的档，六族各算一档；不随的只算一档
      const tones: (string | null)[] = paintOf(recipe, context, 'danger') === plain ? [null] : [...TONES]
      for (const tone of tones) {
        for (const theme of THEMES) {
          out.push({
            label: `${recipe.scope}/${recipe.part} · ${describeAttrs(recipe)}${context ? ` · 上下文 ${context.label}` : ''} · ${tone ?? '无语气'} · ${theme}`,
            recipe,
            context,
            tone,
            theme,
          })
        }
      }
    }
  }
  host?.remove()
  host = null
  return out
}

paintPage()
const tiers = buildTiers()

afterEach(() => {
  host?.remove()
  host = null
  delete document.documentElement.dataset.theme
})

/** 先按一次真实按键把浏览器切进键盘模态，:focus-visible 才认后面的程序化聚焦。 */
let keyboardModality = false
async function focus(el: HTMLElement): Promise<void> {
  if (!keyboardModality) {
    await userEvent.tab()
    keyboardModality = true
  }
  el.focus()
  settle()
}

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

/**
 * 明知不达标、且那块面不由皮肤画的档。键是档位标签，值写一句这块面从哪来。
 * 两侧反查：登记的档必须仍挂得出来、仍在画环、也仍然不达标，三条有一条不成立即判登记过期。
 */
const KNOWN = new Map<string, string>([
  [
    'menu/trigger · 基础档 · 无语气 · dark',
    'menu.css 写明「触发器的长相归作者」，只画展开档；基础档露出来的是原生 button 的 UA buttonface（深色 Chromium 下 rgb(107,107,107)，环压上去 1.97）。作者给触发器上了色这一档就换了面，而让库自己接管这块面要么动 reset 清掉 UA 的面、要么皮肤替作者画一档，两条都越过这份皮肤自己立的契约',
  ],
])

describe('聚焦环压着的那块面', () => {
  it('已知不达标的登记表不过期', () => {
    const labels = new Set(tiers.map(t => t.label))
    for (const key of KNOWN.keys())
      expect(labels.has(key), `${key} 登记在表里，档位表里却挂不出这一档`).toBe(true)
  })

  it('档位是从皮肤推出来的，推空了等于整份判据失效', () => {
    const 说明 = `推出 ${tiers.length} 档 / ${new Set(tiers.map(t => t.recipe.signature)).size} 份配方，漏在门外 ${JSON.stringify(dropped)}`
    expect(tiers.length, 说明).toBeGreaterThan(200)
    expect(new Set(tiers.map(t => `${t.recipe.scope}/${t.recipe.part}`)).size, 说明).toBeGreaterThan(80)
    // 环取 currentColor 的那几档必须都在场：它们是这条定案本身
    const 灌过的 = [...ringFollowsColor].filter(key => tiers.some(t => `${t.recipe.scope}/${t.recipe.part}` === key))
    expect(灌过的.length, `皮肤给 ${ringFollowsColor.size} 个部件灌过环色，档位表里只挂得出 ${灌过的.length} 个`)
      .toBe(ringFollowsColor.size)
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

  it('两个方向都响：实心面吃默认环量出来不合格，灌成 currentColor 才合格', async () => {
    paintPage()
    host = document.createElement('div')
    host.innerHTML = `<div data-scope="button" data-part="root" tabindex="0"
      style="background:var(--xh-color-brand-600);color:var(--xh-fg-on-brand)">文</div>`
    document.body.append(host)
    const el = host.firstElementChild as HTMLElement
    await focus(el)
    const stack = insideStack(el)
    const ratio = () => contrast(composite([...stack, getComputedStyle(el).outlineColor]), composite(stack))

    expect(ratio()).toBeLessThan(3)
    el.style.setProperty('--xh-_ring-color', 'currentColor')
    expect(ratio()).toBeGreaterThanOrEqual(3)
  })

  it('反方向也响：透空的面灌成 currentColor，环糊在底上照样判红', async () => {
    paintPage()
    host = document.createElement('div')
    host.innerHTML = `<div data-scope="button" data-part="root" tabindex="0"
      style="background:transparent;color:var(--xh-color-neutral-100)">文</div>`
    document.body.append(host)
    const el = host.firstElementChild as HTMLElement
    await focus(el)
    const stack = insideStack(el)
    const ratio = () => contrast(composite([...stack, getComputedStyle(el).outlineColor]), composite(stack))

    expect(ratio()).toBeGreaterThanOrEqual(3)
    el.style.setProperty('--xh-_ring-color', 'currentColor')
    expect(ratio()).toBeLessThan(3)
  })

  it.each(tiers)('$label', async (tier) => {
    document.documentElement.dataset.theme = tier.theme
    paintPage()
    const { target, focusTarget } = mount(tier.recipe, tier.context, tier.tone)
    await focus(focusTarget)
    // 焦点没进键盘模态时全库都不画环，比值一律算不出来，先钉住这一条
    expect(target.matches(tier.recipe.focusWithin ? ':focus-within' : ':focus-visible'), '焦点没落上去').toBe(true)

    const style = getComputedStyle(target)
    // 皮肤把这一档的环显式撤了，没有可见性可言
    if (style.outlineStyle === 'none' || style.outlineWidth === '0px') {
      expect(KNOWN.has(tier.label), `${tier.label} 登记为已知不达标，这一档却已经不画环了——登记过期了`).toBe(false)
      return
    }

    const stack = insideStack(target)
    const face = composite(stack)
    const ring = composite([...stack, style.outlineColor])
    const 说明 = `${tier.label}｜环 ${style.outlineColor}｜面 ${style.backgroundColor}｜环内侧算完是 rgb(${face})｜描边 ${style.borderTopWidth} ${style.borderTopColor}`
    const known = KNOWN.get(tier.label)
    if (known) {
      expect(contrast(ring, face), `${说明}｜登记为已知不达标，现在却过了 3:1——登记过期了：${known}`).toBeLessThan(3)
      return
    }
    expect(contrast(ring, face), 说明).toBeGreaterThanOrEqual(3)
  })
})
