// 聚焦环画在元素自己那一圈：聚焦前后元素占的地方一样大，环仍然看得见。
//
// 三件事各查一遍：
//   一、绘制外沿：聚焦前后的布局盒与绘制外沿逐档相等（环往内收一个环宽，正好落在元素身上）。
//   二、库里只有一种偏移：随库发出去的样式表里，每一条 outline-offset 要么是 --xh-ring-offset，
//       要么在高对比档 / 打印档那两个媒体块里（那两档画的是状态与形状，不是聚焦环）。
//   三、环看得见：皮肤里每一条把环色灌成 currentColor 的 :focus-visible 规则，挂出来落焦，
//       环压在环内侧那块面上，对比不低于 3:1。名单从随包发出去的样式表里读，不手写；
//       静态门禁 check-focus-ring-surface 算不出面、登在登记表 declared 分区里的那几条不在这里量
//       （各有专门的判据接），但登记的每条规则皮肤里都得还在，对不上判红。
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
}

/**
 * 皮肤里把环色灌成 currentColor 的每一条 :focus-visible 分支：
 * 写在 --xh-_ring-color 槽里的，与整条 outline 写成 currentColor 的都算。
 */
function currentColorRules(): RingRule[] {
  const out: RingRule[] = []
  const seen = new Set<string>()
  for (const rule of unconditionalRules()) {
    const slot = rule.style.getPropertyValue('--xh-_ring-color').trim()
    // 简写里带 var() 时 CSSOM 不拆长手，outline 与 outline-color 两处都看
    const whole = /currentcolor/i.test(rule.style.getPropertyValue('outline') + rule.style.getPropertyValue('outline-color'))
    if (slot !== 'currentColor' && !whole)
      continue
    for (const raw of splitTop(rule.selectorText, ch => ch === ',')) {
      if (!/:focus-visible/.test(raw))
        continue
      const key = staticKey(raw) ?? raw
      for (const branch of expandGroups(raw.replace(/\s+/g, ' '))) {
        const id = `${key}|${branch}`
        if (!seen.has(id)) {
          seen.add(id)
          out.push({ key, branch })
        }
      }
    }
  }
  return out
}

/** 按分支摆一棵裸节点树，返回末尾那个节点；定位层打上落位标记，不打整棵浮层都是隐形的。 */
function mountBranch(branch: string): HTMLElement {
  host?.remove()
  host = document.createElement('div')
  document.body.append(host)
  let parent: HTMLElement = host
  let scope = ''
  let target: HTMLElement = host
  for (const text of splitCompounds(branch)) {
    const bare = text.replace(/:[a-z-]+\([^()]*\)/g, '')
    const el = document.createElement('div')
    for (const m of bare.matchAll(/\[([a-z-]+)(?:=["']?([^"'\]]*)["']?)?\]/g)) {
      el.setAttribute(m[1]!, m[2] ?? '')
      if (m[1] === 'data-scope')
        scope = m[2] ?? ''
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

describe('实心面上的环看得见', () => {
  const rules = currentColorRules()
  const declared = (surfaceRegistry as { declared?: Record<string, string> }).declared ?? {}
  const keys = new Set(rules.map(r => r.key))

  it('名单从样式表里读出来，读空了等于整份判据失效', () => {
    expect(rules.length).toBeGreaterThan(0)
  })

  it('静态门禁登在 declared 里的每条规则，皮肤里都还在', () => {
    const stale = Object.keys(declared).filter(key => !keys.has(key))
    expect(stale, '登记过期：皮肤里已经没有这几条 currentColor 规则，或者本份读出来的键与静态门禁对不上').toEqual([])
  })

  it.each(rules.filter(r => !(r.key in declared)))('$branch 的环压在环内侧那块面上，仍有 3:1', async ({ branch }) => {
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
