// NumberField 的 Field Chrome、内嵌动作、前后缀与触摸命中区依赖真实布局和伪类，只在 Chromium 验证。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhNumberFieldControl,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldPrefix,
  XhNumberFieldRoot,
  XhNumberFieldSuffix,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/** 钮走 field-inset 档：sm 固定 24px，md / lg 取小一档的控件高；控件高随语义密度令牌变化。 */
const SIZE_CASES = [
  { density: 'comfortable', size: 'sm', control: 32, trigger: 24 },
  { density: 'comfortable', size: 'md', control: 36, trigger: 32 },
  { density: 'comfortable', size: 'lg', control: 40, trigger: 36 },
  { density: 'compact', size: 'sm', control: 28, trigger: 24 },
  { density: 'compact', size: 'md', control: 32, trigger: 28 },
  { density: 'compact', size: 'lg', control: 36, trigger: 32 },
] as const

let app: App | null = null
let host: HTMLElement | null = null

function mountField(
  props: Record<string, unknown> = {},
  options: { density?: 'comfortable' | 'compact', affixes?: boolean, width?: number } = {},
): void {
  host = document.createElement('div')
  host.style.inlineSize = `${options.width ?? 320}px`
  if (options.density === 'compact')
    host.dataset.density = 'compact'
  document.body.append(host)
  app = createApp({
    render: () => h(XhNumberFieldRoot, { defaultValue: '5', ...props }, () => [
      h(XhNumberFieldControl, null, () => [
        h(XhNumberFieldDecrementTrigger),
        ...(options.affixes ? [h(XhNumberFieldPrefix, null, () => '¥')] : []),
        h(XhNumberFieldInput),
        ...(options.affixes ? [h(XhNumberFieldSuffix, null, () => 'kg')] : []),
        h(XhNumberFieldIncrementTrigger),
      ]),
    ]),
  })
  app.mount(host)
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='number-field'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 number-field/${name}`)
  return element
}

function centerY(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  return rect.top + rect.height / 2
}

async function emulatePointer(value?: 'coarse'): Promise<void> {
  await cdp().send('Emulation.setTouchEmulationEnabled', {
    enabled: value === 'coarse',
    maxTouchPoints: value === 'coarse' ? 5 : 1,
  })
}

/** 把令牌解析成这台浏览器上的最终颜色，用来与各态底色对账。 */
function tokenColor(token: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${token})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function teardown(): void {
  app?.unmount()
  host?.remove()
  app = null
  host = null
}

afterEach(async () => {
  teardown()
  document.documentElement.removeAttribute('dir')
  await emulatePointer()
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('数字输入的尺寸与内部节奏', () => {
  it.each(SIZE_CASES)('$density / $size：右侧动作是 field-inset 档的正方盒，在控件里垂直居中', async (item) => {
    mountField({ size: item.size }, { density: item.density })
    await settle()
    const control = part('control').getBoundingClientRect()
    const decrement = part('decrement-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()
    const increment = part('increment-trigger').getBoundingClientRect()

    expect(control.height).toBe(item.control)
    expect(decrement.width).toBe(item.trigger)
    expect(decrement.height).toBe(item.trigger)
    expect(increment.width).toBe(item.trigger)
    expect(increment.height).toBe(item.trigger)
    expect(centerY(part('decrement-trigger'))).toBeCloseTo(centerY(part('control')), 1)
    expect(centerY(part('increment-trigger'))).toBeCloseTo(centerY(part('control')), 1)
    expect(input.right).toBeLessThanOrEqual(decrement.left)
    expect(decrement.right).toBeLessThanOrEqual(increment.left)
    expect(input.width).toBeGreaterThan(0)
    // 钮的圆角是 inset 档，不再与控件同角
    expect(getComputedStyle(part('increment-trigger')).borderRadius).toBe('4px')
  })

  it('前缀、数值与后缀在同一中线，间距互不挤压且数字使用等宽字形', async () => {
    mountField({}, { affixes: true })
    await settle()
    const control = part('control')
    const prefix = part('prefix')
    const input = part('input')
    const suffix = part('suffix')

    expect(centerY(prefix)).toBeCloseTo(centerY(control), 1)
    expect(centerY(input)).toBeCloseTo(centerY(control), 1)
    expect(centerY(suffix)).toBeCloseTo(centerY(control), 1)
    expect(prefix.getBoundingClientRect().right).toBeLessThanOrEqual(input.getBoundingClientRect().left)
    expect(input.getBoundingClientRect().right).toBeLessThanOrEqual(suffix.getBoundingClientRect().left)
    expect(getComputedStyle(input).fontVariantNumeric).toContain('tabular-nums')
  })

  it('rtl 只镜像物理顺序，不改变前后缀中线或让动作命中盒重叠', async () => {
    document.documentElement.dir = 'rtl'
    mountField({}, { affixes: true })
    await settle()
    const decrement = part('decrement-trigger').getBoundingClientRect()
    const prefix = part('prefix').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()
    const suffix = part('suffix').getBoundingClientRect()
    const increment = part('increment-trigger').getBoundingClientRect()

    expect(prefix.left).toBeGreaterThanOrEqual(input.right)
    expect(input.left).toBeGreaterThanOrEqual(suffix.right)
    expect(suffix.left).toBeGreaterThanOrEqual(decrement.right)
    expect(decrement.left).toBeGreaterThanOrEqual(increment.right)
    expect(centerY(part('prefix'))).toBeCloseTo(centerY(part('suffix')), 1)
  })
})

describe('数字输入的边界、只读与焦点', () => {
  it('边界只由描边承担：outline 静息不填底 + 控件描边、无影；subtle 淡底、描边透明、同样无影', async () => {
    mountField()
    await settle()
    const control = part('control')
    expect(control.dataset.xhFieldChrome).toBe('')
    expect(control.dataset.variant).toBe('outline')
    expect(getComputedStyle(control).boxShadow).toBe('none')
    expect(getComputedStyle(control).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(control).borderTopColor).toBe(tokenColor('--xh-border-control'))
    teardown()

    mountField({ variant: 'subtle' })
    await settle()
    expect(getComputedStyle(part('control')).boxShadow).toBe('none')
    expect(getComputedStyle(part('control')).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(part('control')).borderTopColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('到达 min/max 只禁用对应动作；整控件禁用与只读才同时禁用两侧', async () => {
    mountField({ min: 5, max: 10 })
    await settle()
    expect((part('decrement-trigger') as HTMLButtonElement).disabled).toBe(true)
    expect((part('increment-trigger') as HTMLButtonElement).disabled).toBe(false)
    teardown()

    mountField({ defaultValue: '10', min: 5, max: 10 })
    await settle()
    expect((part('decrement-trigger') as HTMLButtonElement).disabled).toBe(false)
    expect((part('increment-trigger') as HTMLButtonElement).disabled).toBe(true)
    teardown()

    mountField({ disabled: true })
    await settle()
    expect((part('input') as HTMLInputElement).disabled).toBe(true)
    expect((part('decrement-trigger') as HTMLButtonElement).disabled).toBe(true)
    expect((part('increment-trigger') as HTMLButtonElement).disabled).toBe(true)
    teardown()

    mountField({ readOnly: true })
    await settle()
    expect((part('input') as HTMLInputElement).readOnly).toBe(true)
    expect((part('input') as HTMLInputElement).disabled).toBe(false)
    expect((part('decrement-trigger') as HTMLButtonElement).disabled).toBe(true)
    expect((part('increment-trigger') as HTMLButtonElement).disabled).toBe(true)
  })

  it('动作静息透明，悬停浮出 canvas 承载面的 100 档底并带按压缩放过渡；输入壳同时给悬停回执', async () => {
    mountField()
    await settle()
    const increment = part('increment-trigger')
    const control = part('control')
    const controlRest = getComputedStyle(control).backgroundColor
    expect(getComputedStyle(increment).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(increment).transitionProperty).toContain('scale')

    await userEvent.hover(increment)
    // 底色带 120ms 过渡，等过渡走完再对账
    await expect.poll(() => getComputedStyle(increment).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(control).backgroundColor).not.toBe(controlRest)
  })

  it('贴住 min 的钮禁用后不再响应悬停，分隔线仍在', async () => {
    mountField({ min: 5 })
    await settle()
    const decrement = part('decrement-trigger')
    const rest = getComputedStyle(decrement).backgroundColor
    await userEvent.hover(decrement)
    await new Promise<void>(resolve => setTimeout(resolve, 200))
    expect(getComputedStyle(decrement).backgroundColor).toBe(rest)
    expect(getComputedStyle(decrement).backgroundSize).toBe('1px 50%')
  })

  it('tab 只停在输入框，control 画唯一焦点环，两颗动作仍退出 Tab 序列', async () => {
    mountField()
    await settle()
    await userEvent.tab()
    const input = part('input')
    const control = part('control')

    expect(document.activeElement).toBe(input)
    expect(getComputedStyle(control).outlineStyle).toBe('solid')
    expect(getComputedStyle(input).outlineStyle).toBe('none')
    expect(part('decrement-trigger').tabIndex).toBe(-1)
    expect(part('increment-trigger').tabIndex).toBe(-1)
  })
})

describe('数字输入的粗指针目标', () => {
  it.each([
    { density: 'comfortable', control: 36, trigger: 32 },
    { density: 'compact', control: 32, trigger: 28 },
  ] as const)('$density：视觉盒不放大，两颗钮各自由家族伪元素外扩到 44px 命中区', async ({ density, control: controlH, trigger }) => {
    await emulatePointer('coarse')
    expect(matchMedia('(pointer: coarse)').matches).toBe(true)
    mountField({}, { density, width: 160 })
    await settle()
    const control = part('control').getBoundingClientRect()
    const decrement = part('decrement-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()
    const increment = part('increment-trigger').getBoundingClientRect()

    expect(control.height).toBe(controlH)
    expect(decrement.width).toBe(trigger)
    expect(increment.width).toBe(trigger)
    expect(input.width).toBeGreaterThan(0)
    expect(input.right).toBeLessThanOrEqual(decrement.left)
    expect(decrement.right).toBeLessThanOrEqual(increment.left)
    for (const name of ['decrement-trigger', 'increment-trigger']) {
      const target = getComputedStyle(part(name), '::after')
      expect(target.content).toBe('""')
      expect(Number.parseFloat(target.minInlineSize)).toBeGreaterThanOrEqual(44)
      expect(Number.parseFloat(target.minBlockSize)).toBeGreaterThanOrEqual(44)
    }
    // 热区伪元素不能被视觉盒裁掉，否则外扩只是纸面上的
    expect(getComputedStyle(part('control')).overflow).toBe('visible')
  })
})
