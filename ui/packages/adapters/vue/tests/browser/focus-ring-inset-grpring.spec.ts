// 聚焦环画在元素自己那一圈：聚焦前后元素占的地方一样大，环仍然看得见。
//
// 三件事各查一遍：
//   一、绘制外沿：聚焦前后的布局盒与绘制外沿逐档相等（环往内收一个环宽，正好落在元素身上）。
//   二、库里只有一种偏移：随库发出去的样式表里，每一条 outline-offset 要么是 --xh-ring-offset，
//       要么在高对比档 / 打印档那两个媒体块里（那两档画的是状态与形状，不是聚焦环）。
//   三、环看得见：面是实心的那几档，环压在面上，环色与面的对比不低于 3:1。
//
// 判据只看级联算出来的取值，所以直接摆带 data-scope / data-part 的裸节点：皮肤是纯 CSS，
// 认的就是这两个属性。焦点用真实的 Tab 键送过去——:focus-visible 只在键盘模态下匹配。
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
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
const ctx = canvas.getContext('2d')!
/** 任意 CSS 颜色串 → sRGB 三分量：画进 1×1 画布再读回来，oklch 这类新语法也落得了地。 */
function rgb(value: string): [number, number, number] {
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, 1, 1)
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0]!, d[1]!, d[2]!]
}
function luminance(value: string) {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const channels = rgb(value)
  const r = channels[0]!
  const g = channels[1]!
  const b = channels[2]!
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
function contrast(a: string, b: string) {
  const sorted = [luminance(a), luminance(b)].sort((x, y) => y - x)
  const hi = sorted[0]!
  const lo = sorted[1]!
  return (hi + 0.05) / (lo + 0.05)
}

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

describe('实心面上的环看得见', () => {
  // 面是实心的那几档，环压在面上，环色得与面分得开。逐条与 focus.css 里那张名单对拍。
  const solid: [scope: string, part: string, attrs: Record<string, string>][] = [
    ['approval', 'approve-trigger', {}],
    ['button', 'root', { 'data-variant': 'solid' }],
    ['calendar', 'cell-trigger', { 'data-selected': '' }],
    ['carousel', 'indicator', {}],
    ['carousel', 'indicator', { 'data-current': '' }],
    ['checkbox', 'root', { 'data-state': 'checked' }],
    ['checkbox', 'root', { 'data-state': 'indeterminate' }],
    ['color-picker', 'eye-dropper-trigger', { 'data-state': 'picking' }],
    ['date-picker', 'confirm-trigger', {}],
    ['date-picker', 'trigger', { 'data-state': 'open' }],
    ['download-trigger', 'root', { 'data-variant': 'solid' }],
    ['drawer', 'trigger', { 'data-state': 'open' }],
    ['editable', 'submit-trigger', {}],
    ['floating-panel', 'window-state-trigger', { 'data-state': 'on' }],
    ['form', 'submit-trigger', {}],
    ['image-cropper', 'crop-handle', { 'data-resizing': '' }],
    ['image-viewer', 'close-trigger', {}],
    ['image-viewer', 'next-trigger', {}],
    ['image-viewer', 'prev-trigger', {}],
    ['pagination', 'item', { 'data-current': '' }],
    ['popconfirm', 'confirm-trigger', {}],
    ['prompt-input', 'submit-trigger', {}],
    ['question-flow', 'submit-trigger', {}],
    ['resizable', 'handle', { 'data-resizing': '' }],
    ['slider', 'thumb', {}],
    ['slider', 'thumb', { 'data-invalid': '' }],
    ['splitter', 'resize-trigger', {}],
    ['splitter', 'resize-trigger', { 'data-dragging': '' }],
    ['switch', 'root', {}],
    ['switch', 'root', { 'data-state': 'checked' }],
    ['table', 'column-visibility-trigger', { 'data-state': 'checked' }],
    ['table', 'row', { 'data-selected': '' }],
    ['table', 'select-all-trigger', { 'data-state': 'checked' }],
    ['table', 'select-all-trigger', { 'data-state': 'indeterminate' }],
    ['tag', 'root', { 'data-variant': 'solid' }],
    ['tag-group', 'item', { 'data-variant': 'solid' }],
    ['time-picker', 'item', { 'data-state': 'checked' }],
    ['time-picker', 'preset', { 'data-state': 'checked' }],
    ['toggle', 'root', { 'data-state': 'on' }],
    ['toggle-group', 'item', { 'data-state': 'on' }],
    ['tour', 'next-trigger', {}],
    ['transfer', 'item-checkbox', { 'data-state': 'checked' }],
    ['tree', 'branch-checkbox', { 'data-selected': '' }],
    ['tree', 'item-checkbox', { 'data-selected': '' }],
  ]

  it.each(solid)('%s/%s %j 的环压在自己的面上，仍有 3:1', async (scope, part, attrs) => {
    const el = mount(scope, part, attrs)
    await tabTo(el)
    const s = getComputedStyle(el)
    expect(s.outlineStyle).toBe('solid')
    const ratio = contrast(s.outlineColor, s.backgroundColor)
    expect(ratio).toBeGreaterThanOrEqual(3)
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
