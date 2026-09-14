// 聚焦环画在元素自己那一圈：聚焦前后元素占的地方一样大，环仍然看得见。
//
// 三件事各查一遍：
//   一、绘制外沿：聚焦前后的布局盒与绘制外沿逐档相等（环往内收一个环宽，正好落在元素身上）。
//   二、库里只有一种偏移：随库发出去的样式表里，每一条 outline-offset 要么是 --xh-ring-offset，
//       要么在高对比档 / 打印档那两个媒体块里（那两档画的是状态与形状，不是聚焦环）。
//   三、环看得见：皮肤里每一条灌了环色的规则，挂出来落焦，环压在环内侧那块面上，对比不低于 3:1。
//       「灌」按求值判，不按字面量判：给 --xh-_ring-color 或 outline-color 赋值、或在键盘聚焦规则
//       （:focus-visible / [data-focus] / 裸 :focus）里写 outline 简写，把这条声明原样套在按选择器摆出来的
//       裸节点上，在浅深两主题 × 七档语气下各算一遍 outline-color，任一档与库自己的两支环
//       （--xh-ring-focus、--xh-ring-invalid）都不等就是灌。
//       名单从随包发出去的样式表里读，不手写；@supports 块里的规则按块内条件成立处理，照收；
//       @media 块按本页当下的媒体环境现问（matchMedia）：成立的照收，不成立的不收；@container 块静态判不出，照收。
//       静态门禁 check-focus-ring-surface 算不出面、登在登记表 declared 分区里的那几条不在这里量
//       （各有专门的判据接），但登记的每条规则皮肤里都得还在，对不上判红。
//   四、引导气泡接焦点：tour 的 content 是可操作目标（Enter / Space 落在它身上推进下一步），
//       程序化落焦之后要画环，环压在气泡的面上不低于 3:1。
//
// 判据只看级联算出来的取值，所以直接摆带 data-scope / data-part 的裸节点：皮肤是纯 CSS，
// 认的就是这两个属性。焦点用真实的 Tab 键送过去——:focus-visible 只在键盘模态下匹配。
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import surfaceRegistry from '../../../../../tooling/scripts/focus-ring-surface-registry.json'
import { splitTop, staticKey } from './focus-ring-surface-key'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(async () => {
  host?.remove()
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

/** 摆一棵裸节点树：私有槽多半声明在 root 上，非 root 的部件套一层同 scope 的 root 才读得到。 */
function mount(scope: string, part: string, attrs: Record<string, string> = {}, tag = 'div'): HTMLElement {
  host?.remove()
  host = document.createElement('div')
  const el = document.createElement(tag)
  el.dataset.scope = scope
  el.dataset.part = part
  for (const [k, v] of Object.entries(attrs))
    el.setAttribute(k, v)
  el.tabIndex = 0
  el.textContent = '文'
  if (part === 'root') {
    host.append(el)
  }
  else {
    const root = document.createElement('div')
    root.dataset.scope = scope
    root.dataset.part = 'root'
    root.append(el)
    host.append(root)
  }
  document.body.append(host)
  return el
}

/** 元素的布局盒，与算上 outline 之后的绘制外沿。 */
function box(el: Element) {
  const s = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  const grow = s.outlineStyle === 'none' || s.outlineWidth === '0px'
    ? 0
    : Number.parseFloat(s.outlineOffset) + Number.parseFloat(s.outlineWidth)
  return {
    layout: `${r.width.toFixed(1)}×${r.height.toFixed(1)}`,
    ink: `${(r.width + grow * 2).toFixed(1)}×${(r.height + grow * 2).toFixed(1)}`,
    grow,
  }
}

/** 用 Tab 把焦点送到这个节点上。 */
async function tabTo(el: HTMLElement) {
  await userEvent.tab()
  if (document.activeElement !== el)
    throw new Error(`Tab 没落到探针上，落在了 ${document.activeElement?.nodeName}`)
}

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

describe('聚焦环画在元素自己那一圈', () => {
  // 输入类的框由 :focus-within 起环，焦点落在框里的 input 上；其余部件自己接焦点
  const cases: [name: string, scope: string, part: string, attrs: Record<string, string>, inner?: boolean][] = [
    ['button 实心', 'button', 'root', { 'data-variant': 'solid' }],
    ['button 幽灵', 'button', 'root', { 'data-variant': 'ghost' }],
    ['button 图标钮 sm', 'button', 'root', { 'data-variant': 'ghost', 'data-size': 'sm', 'data-icon-only': '' }],
    ['checkbox', 'checkbox', 'root', {}],
    ['number-field 加钮', 'number-field', 'increment-trigger', {}],
    ['password-input 可见钮', 'password-input', 'visibility-trigger', {}],
  ]

  it.each(cases)('%s：聚焦前后布局盒与绘制外沿都不变', async (_name, scope, part, attrs) => {
    const el = mount(scope, part, attrs)
    const before = box(el)
    await tabTo(el)
    const after = box(el)

    expect(getComputedStyle(el).outlineStyle).toBe('solid')
    expect(after.grow).toBe(0)
    expect(after.layout).toBe(before.layout)
    expect(after.ink).toBe(before.ink)
  })

  it('偏移是负的一个环宽，环的外沿与元素边框外沿重合', async () => {
    const el = mount('button', 'root', {})
    await tabTo(el)
    const s = getComputedStyle(el)
    expect(s.outlineWidth).toBe('2px')
    expect(s.outlineOffset).toBe('-2px')
    expect(Number.parseFloat(s.outlineOffset) + Number.parseFloat(s.outlineWidth)).toBe(0)
  })

  // 输入类的框自己不接焦点，环由 :focus-within 画在框上，焦点落在框里那个部件上
  const wrapped: [name: string, scope: string, inner: string, tag: string][] = [
    ['text-field', 'text-field', 'input', 'input'],
    ['number-field', 'number-field', 'input', 'input'],
    ['password-input', 'password-input', 'input', 'input'],
    ['select', 'select', 'trigger', 'button'],
  ]

  it.each(wrapped)('%s 的框由 focus-within 起环，同样不变大', async (_name, scope, inner, tag) => {
    host?.remove()
    host = document.createElement('div')
    host.innerHTML = `
      <div data-scope="${scope}" data-part="root">
        <div data-scope="${scope}" data-part="control">
          <${tag} data-scope="${scope}" data-part="${inner}"></${tag}>
        </div>
      </div>`
    document.body.append(host)
    const control = host.querySelector<HTMLElement>('[data-part="control"]')!
    const focusTarget = host.querySelector<HTMLElement>(`[data-part="${inner}"]`)!
    const before = box(control)
    await tabTo(focusTarget)
    const after = box(control)

    expect(getComputedStyle(control).outlineStyle).toBe('solid')
    expect(after.grow).toBe(0)
    expect(after.layout).toBe(before.layout)
    expect(after.ink).toBe(before.ink)
  })
})

describe('库里只有一种聚焦环偏移', () => {
  it('随库发出去的样式表里，聚焦环的偏移一律走 --xh-ring-offset', () => {
    /** 收集 outline-offset 声明：记下取值，以及它外面套着的媒体条件。 */
    const found: { value: string, media: string }[] = []
    const walk = (list: CSSRuleList, media: string) => {
      for (const rule of Array.from(list)) {
        if (rule instanceof CSSStyleRule) {
          const v = rule.style.getPropertyValue('outline-offset')
          if (v)
            found.push({ value: v.trim(), media })
        }
        else if ('cssRules' in rule) {
          const cond = rule instanceof CSSMediaRule ? `${media} ${rule.conditionText}` : media
          walk((rule as CSSGroupingRule).cssRules, cond)
        }
      }
    }
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        walk(sheet.cssRules, '')
      }
      catch {}
    }

    expect(found.length).toBeGreaterThan(20)
    // 高对比与打印那两档画的是状态与形状，不是聚焦环，不受这条判据管
    const offenders = found
      .filter(f => !/forced-colors|print/.test(f.media))
      .filter(f => f.value !== 'var(--xh-ring-offset)')
      .map(f => f.value)
    expect(offenders).toEqual([])
  })
})

/** 把一串颜色按从下到上的顺序叠在白底上，返回叠完的 sRGB 三分量。 */
function composite(layers: readonly string[]): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 1, 1)
  for (const layer of layers) {
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

/** 环内侧那一摞色：从最外层祖先到元素自己的底色，透的那几层由下面一层透上来。 */
function insideStack(el: Element): string[] {
  const stack: string[] = []
  for (let node: Element | null = el; node; node = node.parentElement)
    stack.push(getComputedStyle(node).backgroundColor)
  return stack.reverse()
}

/**
 * 库随包发出去的样式表里，在本页当下成立的全部规则。
 * @supports 块按块内条件成立处理；@media 块问 matchMedia，本页当下不成立的（print、高对比、断点之上）不收；
 * @container 块静态判不出它什么时候不成立，照收。
 */
function unconditionalRules(): CSSStyleRule[] {
  const out: CSSStyleRule[] = []
  const walk = (list: CSSRuleList, conditional: boolean) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) {
        if (!conditional)
          out.push(rule)
      }
      else if ('cssRules' in rule) {
        const off = rule instanceof CSSMediaRule && !matchMedia(rule.conditionText).matches
        walk((rule as CSSGroupingRule).cssRules, conditional || off)
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

/** 这条分支里挂不出来的那个写法；:not() 排掉的条件不算，裸节点天然满足。 */
function unmountableIn(branch: string): string | null {
  return UNMOUNTABLE.exec(branch.replace(/:not\([^()]*\)/g, ''))?.[0] ?? null
}

interface RingRule {
  /** 静态门禁登记表里的键。 */
  key: string
  /** 展开 :is() 之后的一条分支。 */
  branch: string
  /** 改环色的那条声明。 */
  prop: 'outline' | 'outline-color' | '--xh-_ring-color'
  value: string
}

/**
 * 按分支摆一棵裸节点树，返回末尾那个节点；定位层打上落位标记，不打整棵浮层都是隐形的。
 * 链子里出现的每个 scope 都得有自己的 root，没有的补一层在最外面：私有槽（各家的环色槽）声明在 root 上，
 * 不补那层槽就取不到。
 */
function mountBranch(branch: string): HTMLElement {
  host?.remove()
  host = document.createElement('div')
  document.body.append(host)
  const compounds = splitCompounds(branch).map((text) => {
    const bare = text.replace(/:[a-z-]+\([^()]*\)/g, '')
    const attrs: [string, string][] = []
    for (const m of bare.matchAll(/\[([a-z-]+)(?:=["']?([^"'\]]*)["']?)?\]/g))
      attrs.push([m[1]!, m[2] ?? ''])
    return attrs
  })
  let scope = ''
  const scopes: string[] = []
  const roots = new Set<string>()
  for (const attrs of compounds) {
    scope = attrs.find(a => a[0] === 'data-scope')?.[1] ?? scope
    if (scope && !scopes.includes(scope))
      scopes.push(scope)
    if (attrs.some(a => a[0] === 'data-part' && a[1] === 'root'))
      roots.add(scope)
  }
  let parent: HTMLElement = host
  for (const at of scopes.filter(s => !roots.has(s))) {
    const root = document.createElement('div')
    root.dataset.scope = at
    root.dataset.part = 'root'
    parent.append(root)
    parent = root
  }
  scope = ''
  let target: HTMLElement = host
  for (const attrs of compounds) {
    const el = document.createElement('div')
    for (const [name, value] of attrs) {
      el.setAttribute(name, value)
      if (name === 'data-scope')
        scope = value
    }
    if (!el.hasAttribute('data-scope') && scope)
      el.dataset.scope = scope
    if (el.dataset.part === 'positioner')
      el.dataset.positioned = ''
    parent.append(el)
    parent = el
    target = el
  }
  target.tabIndex = 0
  target.textContent = '文'
  return target
}

/** 库自己的两支环：默认环与校验失败环。环色求值后落在这两支之外才算灌。 */
const LIBRARY_RINGS = ['--xh-ring-focus', '--xh-ring-invalid']
const TONES = [null, 'brand', 'neutral', 'danger', 'success', 'warning', 'info'] as const
const THEMES = ['light', 'dark'] as const

/** 这条 outline 简写把环关了：none，或哪一节是零宽。 */
function turnsRingOff(value: string): boolean {
  return splitTop(value, ch => ch === ' ').some(tok => /^none$/i.test(tok) || /^0[a-z%]*$/i.test(tok))
}

/** 一条规则里改环色的声明：环色槽、outline-color 长手，以及简写。简写里带 var() 时 CSSOM 不拆长手，两处都看。 */
function ringAssignmentsOf(style: CSSStyleDeclaration): { prop: RingRule['prop'], value: string }[] {
  const out: { prop: RingRule['prop'], value: string }[] = []
  const slot = style.getPropertyValue('--xh-_ring-color').trim()
  if (slot)
    out.push({ prop: '--xh-_ring-color', value: slot })
  const whole = style.getPropertyValue('outline').trim()
  const color = style.getPropertyValue('outline-color').trim()
  // 简写把环关了（none / 零宽）的规则不改环色
  if (whole) {
    if (!turnsRingOff(whole))
      out.push({ prop: 'outline', value: whole })
  }
  else if (color) {
    out.push({ prop: 'outline-color', value: color })
  }
  return out
}

/**
 * 这条声明套在按分支摆出来的裸节点上，在每个 (主题, 语气) 下算出来的 outline-color
 * 是否有一档落在库环之外。在裸节点上算而不是在探针上算：私有槽声明在同 scope 的 root 上，
 * 语气槽由外层的 data-tone 灌，只有挂在那棵树上才取得到。
 */
function pours(branch: string, prop: RingRule['prop'], value: string): boolean {
  const prev = document.documentElement.dataset.theme
  try {
    for (const theme of THEMES) {
      for (const tone of TONES) {
        const el = mountBranch(branch)
        document.documentElement.dataset.theme = theme
        if (tone)
          host!.dataset.tone = tone
        const read = (p: RingRule['prop'], v: string) => {
          el.style.outline = ''
          el.style.outlineColor = ''
          if (p === 'outline')
            el.style.outline = v
          else
            el.style.outlineColor = v
          return getComputedStyle(el).outlineColor
        }
        const got = read(prop, value)
        const rings = LIBRARY_RINGS.map(name => read('outline-color', `var(${name})`))
        if (!rings.includes(got))
          return true
      }
    }
    return false
  }
  finally {
    host?.remove()
    host = null
    if (prev === undefined)
      delete document.documentElement.dataset.theme
    else
      document.documentElement.dataset.theme = prev
  }
}

/**
 * 键盘聚焦规则：:focus-visible、[data-focus]、裸 :focus（它包含键盘落焦）。
 * `:focus:not(:focus-visible)` 关的是指针落焦那一路，不算。
 */
function isKeyboardFocus(selector: string): boolean {
  return /:focus(?:-visible)?(?![\w-])|\[data-focus\]/.test(selector) && !/:not\(\s*:focus-visible\s*\)/.test(selector)
}

/**
 * 皮肤里灌了环色的每一条分支：--xh-_ring-color 与 outline-color 写在哪条规则里都算，
 * outline 简写只认键盘聚焦规则里的那些。
 * 同一条分支被多条规则改环色时只量一次（量的是级联之后的取值），名单上记排在后面的那条。
 */
function pouredRingRules(): RingRule[] {
  const found = new Map<string, RingRule>()
  for (const rule of unconditionalRules()) {
    const assignments = ringAssignmentsOf(rule.style)
    if (!assignments.length)
      continue
    for (const raw of splitTop(rule.selectorText, ch => ch === ',')) {
      const keyboardFocus = isKeyboardFocus(raw)
      const key = staticKey(raw) ?? raw
      for (const branch of expandGroups(raw.replace(/\s+/g, ' '))) {
        for (const { prop, value } of assignments) {
          if (prop === 'outline' && !keyboardFocus)
            continue
          if (pours(branch, prop, value))
            found.set(`${key}|${branch}`, { key, branch, prop, value })
        }
      }
    }
  }
  return [...found.values()]
}

describe('实心面上的环看得见', () => {
  const rules = pouredRingRules()
  const declared = (surfaceRegistry as { declared?: Record<string, string> }).declared ?? {}
  const keys = new Set(rules.map(r => r.key))

  it('名单从样式表里读出来，读空了等于整份判据失效', () => {
    expect(rules.length).toBeGreaterThan(0)
  })

  it('静态门禁登在 declared 里的每条规则，皮肤里都还在', () => {
    const stale = Object.keys(declared).filter(key => !keys.has(key))
    expect(stale, '登记过期：皮肤里已经没有这几条灌环色的规则（或者它们的环色求值回了库环），或者本份读出来的键与静态门禁对不上').toEqual([])
  })

  it('求值判得出灌与不灌：写回库环的不算，别名成字色的与直接写 outline-color 的都算', () => {
    const branch = `[data-scope='button'][data-part='root'][data-variant='solid']:focus-visible`
    expect(pours(branch, '--xh-_ring-color', 'var(--xh-ring-focus)')).toBe(false)
    expect(pours(branch, '--xh-_ring-color', 'var(--xh-ring-invalid)')).toBe(false)
    expect(pours(branch, 'outline', 'var(--xh-ring-width) solid var(--xh-ring-focus)')).toBe(false)
    expect(pours(branch, '--xh-_ring-color', 'currentColor')).toBe(true)
    expect(pours(branch, '--xh-_ring-color', 'var(--xh-fg-default)')).toBe(true)
    expect(pours(branch, 'outline-color', 'var(--xh-fg-default)')).toBe(true)
    // 简写不写颜色，等于把颜色重置成 currentColor
    expect(pours(branch, 'outline', 'var(--xh-ring-width) solid')).toBe(true)
    // 只在深色主题下才与库环分开的色，同样算灌
    expect(pours(branch, '--xh-_ring-color', 'var(--xh-color-brand-500)')).toBe(true)
    // 没兜底的使用者令牌：值由使用者定，同样算灌
    expect(pours(branch, '--xh-_ring-color', 'var(--xh-tag-fg)')).toBe(true)
  })

  it('键盘聚焦规则认 :focus-visible、[data-focus] 与裸 :focus，:focus:not(:focus-visible) 与 :focus-within 不算', () => {
    expect(isKeyboardFocus(`[data-scope='button'][data-part='root']:focus-visible`)).toBe(true)
    expect(isKeyboardFocus(`[data-scope='date-field'][data-part='segment'][data-focus]`)).toBe(true)
    expect(isKeyboardFocus(`[data-scope='toggle-group'][data-part='item']:focus`)).toBe(true)
    expect(isKeyboardFocus(`[data-scope='menu'][data-part='item']:focus:not(:focus-visible)`)).toBe(false)
    expect(isKeyboardFocus(`[data-scope='text-field'][data-part='control']:focus-within`)).toBe(false)
  })

  it('@media 块按本页当下的媒体环境收：screen 成立、print 不成立；@container 照收', () => {
    const style = document.createElement('style')
    style.textContent = `
      @media screen { [data-scope='probe'][data-part='root']:focus-visible { --xh-_ring-color: currentColor; } }
      @media print { [data-scope='probe'][data-part='paper']:focus-visible { outline-color: red; } }
      @container not style(--xh-_nope: 1) { [data-scope='probe'][data-part='box']:focus-visible { outline-color: blue; } }
    `
    document.head.append(style)
    try {
      const probes = pouredRingRules().filter(r => /\[data-scope=["']probe["']\]/.test(r.branch))
      expect(probes.map(r => `${r.prop}=${r.value}`).sort()).toEqual(['--xh-_ring-color=currentColor', 'outline-color=blue'])
    }
    finally {
      style.remove()
    }
  })

  it.each(rules.filter(r => !(r.key in declared)))('$branch 把 $prop 灌成 $value，环压在环内侧那块面上仍有 3:1', async ({ branch }) => {
    expect(unmountableIn(branch), '这条分支挂不出来，静态门禁也没把它登在 declared 里').toBeNull()
    const el = mountBranch(branch)
    await tabTo(el)
    expect(el.matches(branch.replace(/:focus-visible/g, '')), '挂出来的节点没命中这条规则').toBe(true)
    const s = getComputedStyle(el)
    expect(s.outlineStyle).toBe('solid')
    const stack = insideStack(el)
    const face = composite(stack)
    const ring = composite([...stack, s.outlineColor])
    const ratio = contrast(ring, face)
    expect(ratio, `环 ${s.outlineColor}｜面 ${s.backgroundColor}｜环内侧算完是 rgb(${face})`).toBeGreaterThanOrEqual(3)
  })
})

describe('引导气泡接焦点', () => {
  /**
   * 照连接层给的形态摆：content 带 tabindex=-1，由机器程序化落焦；Enter / Space 落在它身上推进下一步，
   * 它是可操作目标，必须有可见焦点。先按一次真实的 Tab 把浏览器切进键盘模态，程序化落焦才匹配 :focus-visible。
   */
  it.each(['light', 'dark'] as const)('%s：tour 的 content 落焦时画环，环压在气泡的面上不低于 3:1', async (theme) => {
    host?.remove()
    host = document.createElement('div')
    host.innerHTML = `
      <div data-scope="tour" data-part="root">
        <div data-scope="tour" data-part="positioner" data-positioned data-position="center">
          <div data-scope="tour" data-part="content" role="dialog" tabindex="-1">文</div>
        </div>
      </div>`
    document.body.append(host)
    document.documentElement.dataset.theme = theme
    try {
      const content = host.querySelector<HTMLElement>('[data-part="content"]')!
      await userEvent.tab()
      content.focus()
      expect(document.activeElement, '程序化落焦没落到气泡上').toBe(content)
      expect(content.matches(':focus-visible'), '焦点没进键盘模态').toBe(true)
      const s = getComputedStyle(content)
      expect(s.outlineStyle, '气泡落焦没有环').toBe('solid')
      expect(Number.parseFloat(s.outlineWidth)).toBeGreaterThan(0)
      const stack = insideStack(content)
      const face = composite(stack)
      const ring = composite([...stack, s.outlineColor])
      expect(contrast(ring, face), `环 ${s.outlineColor}｜面 ${s.backgroundColor}｜环内侧算完是 rgb(${face})`).toBeGreaterThanOrEqual(3)
    }
    finally {
      delete document.documentElement.dataset.theme
    }
  })
})

describe('高对比档', () => {
  it('环不消失：系统接管配色后，键盘焦点仍画着一圈实线', async () => {
    const el = mount('button', 'root', { 'data-variant': 'solid' })
    await tabTo(el)
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    const s = getComputedStyle(el)
    expect(s.outlineStyle).toBe('solid')
    expect(Number.parseFloat(s.outlineWidth)).toBeGreaterThan(0)
    // 这一档里作者写的颜色被换成系统调色板，环色不再是品牌色
    expect(s.outlineColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})
