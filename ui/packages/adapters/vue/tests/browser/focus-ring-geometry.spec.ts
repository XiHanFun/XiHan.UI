import { afterEach, describe, expect, it } from 'vitest'
// 聚焦环画在元素自己的盒内（设计真源 §7.2 第 5 条）：2px、偏移负一个环宽，外沿与边框外沿重合。
// 环不出盒，元素多大、放进什么裁切容器里，环都完整，应用侧不必给它留位。
//
// 六件事各查一遍：
//   一、几何：落焦前后布局盒不变，环的外沿正好落在边框外沿上（绘制外沿多出 0），outline 不占布局。
//   二、字段外壳：框自己不接焦点，焦点落在框里的部件上；框由 :focus-within 换聚焦描边、描边内侧补一道 inset 线，
//       合起来一个环宽，不画 outline。
//   三、库里没有画到盒外的环：随库发出去的样式表里，每一条 outline-offset 要么是 --xh-ring-offset，
//       要么是拇指那一档「收进 2px 描边以内」，要么在高对比档 / 打印档那两个媒体块里。
//   四、环看得见：环外侧贴着承载面，库环对页面底、画布、承载面与淡底承载阶梯每一档都不低于 3:1（WCAG 1.4.11）；
//       实心面上环内侧衬的间隔线与库环之间同样不低于 3:1，环两侧都是底色，压在什么面上都读得出来。浅深两主题都核。
//   五、实心面落焦时衬着间隔线：实心按钮、勾中的方框、选中的开关轨道、日历选中格、实心标签……逐一核。
//   六、引导气泡接焦点；高对比档环不消失。
//
// 判据只看级联算出来的取值，所以直接摆带 data-scope / data-part 的裸节点：皮肤是纯 CSS，
// 认的就是这两个属性。焦点用真实的 Tab 键送过去——:focus-visible 只在键盘模态下匹配。
import { cdp, userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(async () => {
  host?.remove()
  host = null
  delete document.documentElement.dataset.theme
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

/** 摆一棵裸节点树：私有槽多半声明在 root 上，非 root 的部件套一层同 scope 的 root 才读得到。 */
function mount(scope: string, part: string, attrs: Record<string, string> = {}, tag = 'div'): HTMLElement {
  host?.remove()
  host = document.createElement('div')
  const el = document.createElement(tag)
  el.dataset.scope = scope
  el.classList.add(`xh-scope-${scope}`)
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
    root.classList.add(`xh-scope-${scope}`)
    root.dataset.part = 'root'
    root.append(el)
    host.append(root)
  }
  document.body.append(host)
  return el
}

/** 元素的布局盒与环的外沿越出边框外沿的量（负数是收在盒内）。 */
function box(el: Element) {
  const s = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  const grow = s.outlineStyle === 'none' || s.outlineWidth === '0px'
    ? 0
    : Number.parseFloat(s.outlineOffset) + Number.parseFloat(s.outlineWidth)
  return { layout: `${r.width.toFixed(1)}×${r.height.toFixed(1)}`, grow }
}

/** 用 Tab 把焦点送到这个节点上。 */
async function tabTo(el: HTMLElement) {
  await userEvent.tab()
  if (document.activeElement !== el)
    throw new Error(`Tab 没落到探针上，落在了 ${document.activeElement?.nodeName}`)
}

/** 令牌写进某个属性后算出来的值，与 getComputedStyle 读回的同一格式。 */
function resolved(property: string, value: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  document.body.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d', { willReadFrequently: true })!

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

describe('聚焦环画在元素自己的盒内', () => {
  const cases: [name: string, scope: string, part: string, attrs: Record<string, string>][] = [
    ['button 实心', 'button', 'root', { 'data-variant': 'solid' }],
    ['button 幽灵', 'button', 'root', { 'data-variant': 'ghost' }],
    ['button 图标钮 sm', 'button', 'root', { 'data-variant': 'ghost', 'data-size': 'sm', 'data-icon-only': '' }],
    ['checkbox', 'checkbox', 'root', {}],
    ['number-field 加钮', 'number-field', 'increment-trigger', {}],
  ]

  it.each(cases)('%s：落焦前后布局盒不变，环的外沿落在边框外沿上', async (_name, scope, part, attrs) => {
    const el = mount(scope, part, attrs)
    const before = box(el)
    await tabTo(el)
    const after = box(el)
    const s = getComputedStyle(el)
    expect(s.outlineStyle).toBe('solid')
    expect(s.outlineWidth).toBe('2px')
    expect(s.outlineOffset).toBe('-2px')
    expect(after.grow).toBe(0)
    expect(after.layout).toBe(before.layout)
  })

  // 输入类的框自己不接焦点，焦点落在框里那个部件上：框由 :focus-within 换聚焦描边、内侧补 inset 线，不画 outline；
  // 框与输入框与连接层投影一致带上 Field Chrome 家族标记，focus-within 与关环那两条规则认的是家族角色
  const wrapped: [name: string, scope: string, inner: string, tag: string][] = [
    ['text-field', 'text-field', 'input', 'input'],
    ['number-field', 'number-field', 'input', 'input'],
    ['password-input', 'password-input', 'input', 'input'],
    ['select', 'select', 'trigger', 'button'],
  ]

  it.each(wrapped)('%s 的框由 focus-within 换聚焦描边、内侧补一道 inset 线，不画 outline、不变大', async (_name, scope, inner, tag) => {
    host?.remove()
    host = document.createElement('div')
    host.innerHTML = `
      <div data-scope="${scope}" class="xh-scope-${scope}" data-part="root">
        <div data-scope="${scope}" class="xh-scope-${scope}" data-part="control" data-xh-field-chrome data-xh-field-size="md">
          <${tag} data-scope="${scope}" class="xh-scope-${scope}" data-part="${inner}"${tag === 'input' ? ' data-xh-field-input' : ''}></${tag}>
        </div>
      </div>`
    document.body.append(host)
    const control = host.querySelector<HTMLElement>('[data-part="control"]')!
    const focusTarget = host.querySelector<HTMLElement>(`[data-part="${inner}"]`)!
    const before = box(control)
    await tabTo(focusTarget)
    const after = box(control)
    const s = getComputedStyle(control)
    expect(s.outlineStyle).toBe('none')
    // 描边宽加 inset 线宽正好一个环宽
    expect(Number.parseFloat(s.borderTopWidth) + Number.parseFloat(s.boxShadow.match(/(\d+(?:\.\d+)?)px inset/)![1]!))
      .toBe(Number.parseFloat(resolved('outline-width', 'var(--xh-ring-width)')))
    expect(s.boxShadow).toContain('inset')
    expect(getComputedStyle(focusTarget).outlineStyle).toBe('none')
    expect(after.grow).toBe(0)
    expect(after.layout).toBe(before.layout)
  })
})

describe('库里没有画到盒外的聚焦环', () => {
  it('随库发出去的样式表里，聚焦环的偏移只走 --xh-ring-offset 与拇指的「收进描边以内」一档', () => {
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

    const INSIDE_BORDER = 'calc(var(--xh-ring-offset) - var(--xh-stroke-thick))'
    expect(found.length).toBeGreaterThan(20)
    // 高对比与打印那两档画的是状态与形状，不是聚焦环，不受这条判据管
    const offenders = found
      .filter(f => !/forced-colors|print/.test(f.media))
      .filter(f => f.value !== 'var(--xh-ring-offset)' && f.value !== INSIDE_BORDER)
      .map(f => f.value)
    expect(offenders).toEqual([])
    expect(found.some(f => f.value === INSIDE_BORDER), '拇指收进描边以内的那一档没扫到').toBe(true)
  })
})

describe('环看得见', () => {
  const SURFACES = ['--xh-bg-page', '--xh-bg-canvas', '--xh-bg-surface', '--xh-bg-surface-raised', '--xh-bg-subtle', '--xh-bg-subtle-hover', '--xh-bg-subtle-active']

  it.each(['light', 'dark'] as const)('%s：库环对页面底、画布、承载面与淡底承载阶梯都不低于 3:1', (theme) => {
    document.documentElement.dataset.theme = theme
    const ring = resolved('color', 'var(--xh-ring-focus)')
    const page = resolved('background-color', 'var(--xh-bg-page)')
    for (const surface of SURFACES) {
      const face = resolved('background-color', `var(${surface})`)
      const under = composite([page, face])
      expect(contrast(composite([page, face, ring]), under), `${theme} ${surface}`).toBeGreaterThanOrEqual(3)
    }
  })

  it.each(['light', 'dark'] as const)('%s：实心面上的间隔线与库环之间不低于 3:1', (theme) => {
    document.documentElement.dataset.theme = theme
    const page = resolved('background-color', 'var(--xh-bg-page)')
    const ring = composite([page, resolved('color', 'var(--xh-ring-focus)')])
    const gap = composite([page, resolved('color', 'var(--xh-ring-gap)')])
    expect(contrast(ring, gap)).toBeGreaterThanOrEqual(3)
  })
})

describe('实心面落焦时环内侧衬着间隔线', () => {
  /** [名称, 标记, 落焦的节点]：照连接层投影摆，只留皮肤认的属性。 */
  const SOLID: [name: string, html: string, target: string][] = [
    ['实心按钮', `<button type="button" data-scope="button" data-part="root" class="xh-scope-button" data-variant="solid"
      data-xh-action-control data-xh-action-profile="text" data-xh-action-size="md" data-xh-action-variant="solid" data-xh-ink-surface>发布</button>`, 'button'],
    ['勾中的方框', `<button type="button" data-scope="checkbox" data-part="root" class="xh-scope-checkbox" data-state="checked"
      data-xh-action-control data-xh-action-profile="icon" data-xh-action-size="md"></button>`, 'button'],
    ['选中的开关轨道', `<button type="button" data-scope="switch" data-part="root" class="xh-scope-switch" data-state="checked"
      data-xh-action-control data-xh-action-profile="icon" data-xh-action-size="md"></button>`, 'button'],
    ['日历选中格', `<div data-scope="calendar-picker" data-part="root" class="xh-scope-calendar-picker">
      <button type="button" data-scope="calendar-picker" data-part="cell-trigger" class="xh-scope-calendar-picker" data-selected
        data-xh-action-control data-xh-action-profile="text" data-xh-action-size="md">8</button></div>`, 'button'],
    ['实心标签', `<span data-scope="tag" data-part="root" class="xh-scope-tag" data-variant="solid" data-xh-ink-surface tabindex="0">标签</span>`, '[tabindex]'],
    ['轮播当前页', `<div data-scope="carousel" data-part="root" class="xh-scope-carousel">
      <button type="button" data-scope="carousel" data-part="indicator" class="xh-scope-carousel" data-current></button></div>`, 'button'],
    ['热力图格', `<div data-scope="heatmap" data-part="root" class="xh-scope-heatmap">
      <div data-scope="heatmap" data-part="cell" class="xh-scope-heatmap" tabindex="0"></div></div>`, '[tabindex]'],
  ]

  it.each(SOLID)('%s', async (_name, html, target) => {
    host?.remove()
    host = document.createElement('div')
    host.innerHTML = html
    document.body.append(host)
    const el = host.querySelector<HTMLElement>(target)!
    await tabTo(el)
    const s = getComputedStyle(el)
    expect(s.outlineStyle).toBe('solid')
    const gap = resolved('color', 'var(--xh-ring-gap)')
    // 间隔线是最前面那一层 inset 投影，颜色就是库里那一支
    expect(s.boxShadow.startsWith(gap), s.boxShadow).toBe(true)
    expect(s.boxShadow.split(/,(?![^(]*\))/)[0]).toContain('inset')
  })
})

describe('引导气泡接焦点', () => {
  /**
   * 照连接层给的形态摆：content 带 tabindex=-1，由机器程序化落焦；Enter / Space 落在它身上推进下一步，
   * 它是可操作目标，必须有可见焦点。先按一次真实的 Tab 把浏览器切进键盘模态，程序化落焦才匹配 :focus-visible。
   */
  it('tour 的 content 落焦时画环，环是库环', async () => {
    host?.remove()
    host = document.createElement('div')
    host.innerHTML = `
      <div data-scope="tour" class="xh-scope-tour" data-part="root">
        <div data-scope="tour" class="xh-scope-tour" data-part="positioner" data-positioned data-position="center">
          <div data-scope="tour" class="xh-scope-tour" data-part="content" role="dialog" tabindex="-1">文</div>
        </div>
      </div>`
    document.body.append(host)
    const content = host.querySelector<HTMLElement>('[data-part="content"]')!
    await userEvent.tab()
    content.focus()
    expect(document.activeElement, '程序化落焦没落到气泡上').toBe(content)
    expect(content.matches(':focus-visible'), '焦点没进键盘模态').toBe(true)
    const s = getComputedStyle(content)
    expect(s.outlineStyle, '气泡落焦没有环').toBe('solid')
    expect(s.outlineColor).toBe(resolved('color', 'var(--xh-ring-focus)'))
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
    expect(s.outlineColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('字段外壳：系统去掉 inset 线后补一道同宽的系统色环，仍在盒内', async () => {
    host?.remove()
    host = document.createElement('div')
    host.innerHTML = `
      <div data-scope="text-field" class="xh-scope-text-field" data-part="control" data-xh-field-chrome data-xh-field-size="md">
        <input data-scope="text-field" class="xh-scope-text-field" data-part="input" data-xh-field-input>
      </div>`
    document.body.append(host)
    const control = host.querySelector<HTMLElement>('[data-part="control"]')!
    await tabTo(host.querySelector<HTMLElement>('input')!)
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    const s = getComputedStyle(control)
    expect(s.outlineStyle).toBe('solid')
    expect(s.outlineWidth).toBe('2px')
    expect(s.outlineOffset).toBe('-2px')
  })
})
