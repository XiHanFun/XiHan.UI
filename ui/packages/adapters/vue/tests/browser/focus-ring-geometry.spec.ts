import { afterEach, describe, expect, it } from 'vitest'
// 聚焦环画在元素外侧（设计真源 §7.2 第 5 条）：内圈 1px、偏移 0，贴着边框外沿；光环从边框外沿铺开。
//
// 五件事各查一遍：
//   一、几何：落焦前后布局盒不变，内圈画在边框外面（绘制外沿各边多出一个环宽），光环是 box-shadow，也不占布局。
//   二、字段外壳：框自己不接焦点，焦点落在框里的部件上；框由 :focus-within 换聚焦描边（就是内圈）并画光环，不画 outline。
//   三、库里只有两种偏移：随库发出去的样式表里，每一条 outline-offset 要么是 --xh-ring-offset（画在外侧），
//       要么是 --xh-ring-offset-inset（首尾相接的行与格，往里收），要么在高对比档 / 打印档那两个媒体块里。
//   四、环看得见：内圈压在承载面上，库环对页面底、画布、承载面与淡底承载阶梯每一档都不低于 3:1（WCAG 1.4.11），
//       浅深两主题都核；光环只是观感，不参与这一条。
//   五、引导气泡接焦点；高对比档环不消失。
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

/** 元素的布局盒与内圈往外长出的量。 */
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

describe('聚焦环画在元素外侧', () => {
  const cases: [name: string, scope: string, part: string, attrs: Record<string, string>][] = [
    ['button 实心', 'button', 'root', { 'data-variant': 'solid' }],
    ['button 幽灵', 'button', 'root', { 'data-variant': 'ghost' }],
    ['button 图标钮 sm', 'button', 'root', { 'data-variant': 'ghost', 'data-size': 'sm', 'data-icon-only': '' }],
    ['checkbox', 'checkbox', 'root', {}],
    ['number-field 加钮', 'number-field', 'increment-trigger', {}],
  ]

  it.each(cases)('%s：落焦前后布局盒不变，内圈画在边框外面一个环宽', async (_name, scope, part, attrs) => {
    const el = mount(scope, part, attrs)
    const before = box(el)
    await tabTo(el)
    const after = box(el)
    const s = getComputedStyle(el)
    expect(s.outlineStyle).toBe('solid')
    expect(s.outlineWidth).toBe('1px')
    expect(s.outlineOffset).toBe('0px')
    expect(after.grow).toBe(1)
    expect(after.layout).toBe(before.layout)
  })

  // 输入类的框自己不接焦点，焦点落在框里那个部件上：框由 :focus-within 换聚焦描边并画光环、不画 outline；
  // 框与输入框与连接层投影一致带上 Field Chrome 家族标记，focus-within 与关环那两条规则认的是家族角色
  const wrapped: [name: string, scope: string, inner: string, tag: string][] = [
    ['text-field', 'text-field', 'input', 'input'],
    ['number-field', 'number-field', 'input', 'input'],
    ['password-input', 'password-input', 'input', 'input'],
    ['select', 'select', 'trigger', 'button'],
  ]

  it.each(wrapped)('%s 的框由 focus-within 换聚焦描边并画光环，不画 outline、不变大', async (_name, scope, inner, tag) => {
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
    expect(s.boxShadow).toBe(resolved('box-shadow', '0 0 0 var(--xh-ring-halo-width) var(--xh-ring-halo)'))
    expect(getComputedStyle(focusTarget).outlineStyle).toBe('none')
    expect(after.grow).toBe(0)
    expect(after.layout).toBe(before.layout)
  })
})

describe('库里只有两种聚焦环偏移', () => {
  it('随库发出去的样式表里，聚焦环的偏移只走 --xh-ring-offset 与 --xh-ring-offset-inset', () => {
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
      .filter(f => f.value !== 'var(--xh-ring-offset)' && f.value !== 'var(--xh-ring-offset-inset)')
      .map(f => f.value)
    expect(offenders).toEqual([])
    expect(found.some(f => f.value === 'var(--xh-ring-offset-inset)'), '首尾相接的行与格往里收的那一档没扫到').toBe(true)
  })
})

describe('内圈压在承载面上看得见', () => {
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
})
