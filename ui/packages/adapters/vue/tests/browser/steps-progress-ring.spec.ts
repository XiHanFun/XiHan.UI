// 步骤条当前步的完成比例：序号圆点外一道缝、一道粗描边宽画一圈进度环，从 12 点顺时针走（不随书写方向镜像），
// 已完成那段取强调色、其余取连接线的底色；环落在触发器的内衬里，不挤版面。比例变化时弧沿数值角色的时长走，
// 首帧直接落位。读屏：可操作时比例是触发器的描述，只读展示下圆点是一个进度条。
// 几何、计算样式、过渡与无障碍树只有真实 Chromium 给得出，jsdom 不算数。
import type { App, Ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick, ref } from 'vue'
import {
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface MountOptions {
  percent?: number
  readOnly?: boolean
  dir?: 'ltr' | 'rtl'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.density
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

async function frames(count = 1): Promise<void> {
  await nextTick()
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(options: MountOptions = {}): Promise<{ percent: Ref<number | undefined>, value: Ref<number>, indicators: HTMLElement[], triggers: HTMLElement[] }> {
  const percent = ref<number | undefined>(options.percent ?? 40)
  const value = ref(1)
  host = document.createElement('div')
  host.dir = options.dir ?? 'ltr'
  host.style.inlineSize = '640px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhStepsRoot, {
      'count': 3,
      'size': options.size,
      'readOnly': options.readOnly,
      'disabled': options.disabled,
      'percent': percent.value,
      'value': value.value,
      'onUpdate:value': (next: number) => { value.value = next },
    }, () => h(XhStepsList, null, () => [0, 1, 2].map(index => h(XhStepsItem, { key: index, value: index }, () => [
      h(XhStepsTrigger, null, () => [
        h(XhStepsIndicator, null, () => (value.value > index ? '' : String(index + 1))),
        h(XhStepsTitle, null, () => `步骤 ${index + 1}`),
      ]),
      h(XhStepsSeparator),
    ])))),
  })
  app.mount(host)
  await frames(1)
  const all = (part: string): HTMLElement[] => [...host!.querySelectorAll<HTMLElement>(`[data-scope="steps"][data-part="${part}"]`)]
  return { percent, value, indicators: all('indicator'), triggers: all('trigger') }
}

function tokenPx(name: string): number {
  const probe = document.createElement('span')
  probe.style.cssText = `display: block; inline-size: var(${name})`
  host!.append(probe)
  const width = probe.getBoundingClientRect().width
  probe.remove()
  return width
}

function token(name: string): string {
  const probe = document.createElement('span')
  probe.style.cssText = `color: var(${name})`
  host!.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** 伪元素上正在跑的 CSS 过渡属性名。 */
function transitions(el: Element, pseudo: string): string[] {
  return el.getAnimations({ subtree: true })
    .filter(a => a instanceof CSSTransition && (a.effect as KeyframeEffect).target === el && (a.effect as KeyframeEffect).pseudoElement === pseudo)
    .map(a => (a as CSSTransition).transitionProperty)
}

interface DomNode { nodeId: number, attributes?: string[], children?: DomNode[], contentDocument?: DomNode }

/** 用例跑在测试页的 iframe 里：穿透文档树，找到带探针属性的那个节点。 */
function findProbe(node: DomNode, marker: string): number | null {
  const attrs = node.attributes ?? []
  for (let i = 0; i < attrs.length; i += 2) {
    if (attrs[i] === 'data-ax-probe' && attrs[i + 1] === marker)
      return node.nodeId
  }
  for (const child of [...(node.children ?? []), ...(node.contentDocument ? [node.contentDocument] : [])]) {
    const hit = findProbe(child, marker)
    if (hit != null)
      return hit
  }
  return null
}

/** 经 CDP 取某节点在无障碍树里的角色、名字、描述与取值。 */
async function axNode(el: Element): Promise<{ role?: string, name?: string, description?: string, value?: unknown, max?: unknown }> {
  const marker = `a11y-${Math.random().toString(36).slice(2)}`
  el.setAttribute('data-ax-probe', marker)
  const { root } = await cdp().send('DOM.getDocument', { depth: -1, pierce: true }) as { root: DomNode }
  const nodeId = findProbe(root, marker)
  if (nodeId == null)
    throw new Error('无障碍探针没找到节点')
  const { nodes } = await cdp().send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false }) as { nodes: Array<{ role?: { value?: string }, name?: { value?: string }, description?: { value?: string }, value?: { value?: unknown }, properties?: Array<{ name: string, value: { value?: unknown } }> }> }
  el.removeAttribute('data-ax-probe')
  const node = nodes[0]!
  const max = node.properties?.find(p => p.name === 'valuemax')?.value.value
  return { role: node.role?.value, name: node.name?.value, description: node.description?.value, value: node.value?.value, max }
}

describe('当前步的进度环', () => {
  it('只画在当前步上：离圆点边一道缝、一道粗描边宽，落在触发器的内衬里', async () => {
    const { indicators, triggers } = await mount()
    const gap = tokenPx('--xh-space-0_5')
    const thick = tokenPx('--xh-stroke-thick')
    const current = indicators[1]!
    const ring = getComputedStyle(current, '::after')
    const dot = current.getBoundingClientRect()

    expect(ring.opacity).toBe('1')
    expect(Number.parseFloat(ring.width)).toBe(dot.width + 2 * (gap + thick))
    expect(Number.parseFloat(ring.height)).toBe(dot.height + 2 * (gap + thick))
    // 圆点仍是 marker-size 档的实心品牌圆
    expect(dot.width).toBe(tokenPx('--xh-marker-size-md'))
    expect(getComputedStyle(current).backgroundColor).toBe(token('--xh-bg-brand'))

    const box = triggers[1]!.getBoundingClientRect()
    const reach = gap + thick
    expect(dot.top - reach).toBeGreaterThanOrEqual(box.top)
    expect(dot.bottom + reach).toBeLessThanOrEqual(box.bottom)
    expect(dot.left - reach).toBeGreaterThanOrEqual(box.left)

    expect(getComputedStyle(indicators[0]!, '::after').opacity).toBe('0')
    expect(getComputedStyle(indicators[2]!, '::after').opacity).toBe('0')
  })

  it('弧按比例从 12 点顺时针走：强调色走到比例处，其余取连接线的底色；rtl 下不镜像', async () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const { indicators } = await mount({ percent: 40, dir })
      const image = getComputedStyle(indicators[1]!, '::after').backgroundImage
      // 没写 from 即从 12 点起、顺时针；两段在比例处硬切
      expect(image, dir).toBe(`conic-gradient(${token('--xh-bg-brand')} 40%, ${token('--xh-border-default')} 0%)`)
      app!.unmount()
      app = null
      host!.remove()
    }
  })

  it('三个尺寸档与两档密度下环都落在触发器的内衬里', async () => {
    for (const density of ['comfortable', 'compact'] as const) {
      for (const size of ['sm', 'md', 'lg'] as const) {
        document.documentElement.dataset.density = density
        const { indicators, triggers } = await mount({ size })
        const reach = tokenPx('--xh-space-0_5') + tokenPx('--xh-stroke-thick')
        const dot = indicators[1]!.getBoundingClientRect()
        const box = triggers[1]!.getBoundingClientRect()
        expect(dot.width, `${density} ${size}`).toBe(tokenPx(`--xh-marker-size-${size}`))
        expect(dot.top - reach, `${density} ${size}`).toBeGreaterThanOrEqual(box.top)
        expect(dot.bottom + reach, `${density} ${size}`).toBeLessThanOrEqual(box.bottom)
        app!.unmount()
        app = null
        host!.remove()
      }
    }
  })

  it('比例变化时弧走数值角色的过渡，首帧直接落位', async () => {
    const { percent, indicators } = await mount({ percent: 40 })
    expect(transitions(indicators[1]!, '::after')).toEqual([])
    percent.value = 70
    await frames(1)
    expect(transitions(indicators[1]!, '::after')).toContain('--xh-_steps-progress')
  })

  it('不给比例时不画环，当前步回到序号圆点的原样', async () => {
    const { percent, indicators } = await mount({ percent: 40 })
    percent.value = undefined
    await frames(1)
    expect(indicators[1]!.hasAttribute('data-progress')).toBe(false)
    expect(getComputedStyle(indicators[1]!).getPropertyValue('--xh-_steps-progress').trim()).toBe('0')
  })

  it('强制色下环改用系统色：已完成那段与轨道仍分得开', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    const { indicators } = await mount({ percent: 40 })
    const ring = getComputedStyle(indicators[1]!, '::after')
    expect(ring.opacity).toBe('1')
    expect(ring.backgroundImage).toMatch(/^conic-gradient\(/)
    const stops = ring.backgroundImage.match(/rgba?\([^)]*\)/g) ?? []
    expect(new Set(stops).size).toBeGreaterThanOrEqual(2)
  })

  it('强制色下整组禁用：弧退到 GrayText、轨道退到底色，比例照样读得出', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    const { indicators } = await mount({ percent: 40, disabled: true })
    const stops = getComputedStyle(indicators[1]!, '::after').backgroundImage.match(/rgba?\([^)]*\)/g) ?? []
    expect(stops).toHaveLength(2)
    expect(stops[0]).not.toBe(stops[1])
  })
})

describe('当前步进度的读屏', () => {
  it('可操作时比例是当前步触发器的描述，圆点自己不进无障碍树', async () => {
    const { indicators, triggers } = await mount({ percent: 40 })
    const tab = await axNode(triggers[1]!)
    expect(tab.role).toBe('tab')
    expect(tab.description).toBe('40% complete')
    expect(tab.name).toBe('步骤 2')
    expect(indicators[1]!.getAttribute('aria-hidden')).toBe('true')
    expect((await axNode(triggers[0]!)).description ?? '').toBe('')
  })

  it('只读展示下圆点是一个进度条：名字、取值与读法都在', async () => {
    const { indicators } = await mount({ percent: 40, readOnly: true })
    const bar = await axNode(indicators[1]!)
    expect(bar.role).toBe('progressbar')
    expect(bar.name).toBe('Step progress')
    expect(bar.value).toBe(40)
    expect(bar.max).toBe(100)
    // 读法由 aria-valuetext 给：Chromium 的无障碍树协议不回填这一项，直接看属性
    expect(indicators[1]!.getAttribute('aria-valuetext')).toBe('40% complete')
    expect(indicators[1]!.hasAttribute('aria-hidden')).toBe(false)
  })
})
