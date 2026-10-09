// NumberField 的 Field Chrome、内嵌增减钮、前后缀与触摸命中区依赖真实布局、媒体条件和伪类，只在 Chromium 验证。
// 可悬停的精细指针：两颗钮上下叠在盒的逻辑末端，平时收起、悬停或聚焦字段时显出；粗指针：两颗正方钮横排在末端、常显。
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

const SIZES = ['sm', 'md', 'lg'] as const

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

/** 把一个值放进探针的某个属性，读回这台浏览器上的计算值，用来与各态对账。 */
function resolve(value: string, property = 'color', within: HTMLElement = host ?? document.body): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  within.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

function px(token: string, within?: HTMLElement): number {
  return Number.parseFloat(resolve(`var(${token})`, 'inline-size', within))
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

describe('精细指针：增减钮上下叠在盒的末端', () => {
  it.each(SIZES)('%s：两颗钮宽取指示符大档、各占盒内高的一半（四周内收），右缘对齐、上下相接', async (size) => {
    expect(matchMedia('(hover: hover) and (pointer: fine)').matches).toBe(true)
    mountField({ size })
    await settle()
    const control = part('control')
    const box = control.getBoundingClientRect()
    const increment = part('increment-trigger').getBoundingClientRect()
    const decrement = part('decrement-trigger').getBoundingClientRect()
    const inset = size === 'sm' ? px('--xh-space-0_5', control) : px('--xh-space-1', control)
    const border = Number.parseFloat(getComputedStyle(control).borderTopWidth)

    expect(box.height).toBe(px(`--xh-control-h-${size}`, control))
    expect(increment.width).toBe(px('--xh-control-indicator-lg', control))
    expect(decrement.width).toBe(increment.width)
    expect(increment.right).toBeCloseTo(box.right - border - inset, 1)
    expect(decrement.right).toBeCloseTo(increment.right, 1)
    expect(increment.top).toBeCloseTo(box.top + border + inset, 1)
    expect(decrement.bottom).toBeCloseTo(box.bottom - border - inset, 1)
    expect(decrement.top).toBeCloseTo(increment.bottom, 1)
    expect(increment.height).toBeCloseTo((box.height - 2 * border) / 2 - inset, 1)
    // 输入框排在钮让出来的那一截之前，数字不会落到钮底下
    expect(part('input').getBoundingClientRect().right).toBeLessThanOrEqual(increment.left)
  })

  it('平时收起，指针落到盒上或盒里有焦点时显出', async () => {
    mountField()
    await settle()
    const increment = part('increment-trigger')
    expect(getComputedStyle(increment).visibility).toBe('hidden')

    await userEvent.hover(part('control'))
    await expect.poll(() => getComputedStyle(increment).visibility).toBe('visible')
    await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
    await expect.poll(() => getComputedStyle(increment).visibility).toBe('hidden')

    part('input').focus()
    await expect.poll(() => getComputedStyle(increment).visibility).toBe('visible')
  })

  it('显出时铺淡底，悬停升 --xh-bg-subtle-hover；字形是上下箭头、取指示符小档，字取次要前景', async () => {
    mountField()
    await settle()
    const increment = part('increment-trigger')
    const decrement = part('decrement-trigger')
    await userEvent.hover(part('control'))
    await expect.poll(() => getComputedStyle(increment).backgroundColor).toBe(resolve('var(--xh-bg-subtle)', 'background-color'))
    expect(getComputedStyle(increment).color).toBe(resolve('var(--xh-fg-muted)'))
    expect(getComputedStyle(increment, '::before').maskImage).toBe(resolve('var(--xh-glyph-mark-chevron-up)', 'mask-image'))
    expect(getComputedStyle(decrement, '::before').maskImage).toBe(resolve('var(--xh-glyph-mark-chevron-down)', 'mask-image'))
    expect(getComputedStyle(increment, '::before').inlineSize).toBe(`${px('--xh-control-indicator-sm')}px`)

    await userEvent.hover(increment)
    await expect.poll(() => getComputedStyle(increment).backgroundColor).toBe(resolve('var(--xh-bg-subtle-hover)', 'background-color'))
  })

  it('数字从起始缘排起，盒内不再画分隔线', async () => {
    mountField()
    await settle()
    expect(getComputedStyle(part('input')).textAlign).toBe('start')
    expect(getComputedStyle(part('decrement-trigger')).backgroundSize).not.toBe('1px 50%')
  })

  it('rtl：两颗钮叠在逻辑末端（左侧），前后缀照常镜像', async () => {
    document.documentElement.dir = 'rtl'
    mountField({}, { affixes: true })
    await settle()
    const box = part('control').getBoundingClientRect()
    const increment = part('increment-trigger').getBoundingClientRect()
    const prefix = part('prefix').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()
    const suffix = part('suffix').getBoundingClientRect()
    expect(increment.left - box.left).toBeLessThan(box.right - increment.right)
    expect(prefix.left).toBeGreaterThanOrEqual(input.right)
    expect(input.left).toBeGreaterThanOrEqual(suffix.right)
    expect(suffix.left).toBeGreaterThanOrEqual(increment.right)
  })
})

describe('数字输入的前后缀、边界与焦点', () => {
  it('前缀、数值与后缀在同一中线，间距互不挤压且数字使用等宽字形；后缀不落到钮底下', async () => {
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
    expect(suffix.getBoundingClientRect().right).toBeLessThanOrEqual(part('increment-trigger').getBoundingClientRect().left)
    expect(getComputedStyle(input).fontVariantNumeric).toContain('tabular-nums')
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

  it('tab 只停在输入框，聚焦由 control 换聚焦描边标出、不画环，两颗动作退出 Tab 序列', async () => {
    mountField()
    await settle()
    await userEvent.tab()
    const input = part('input')
    const control = part('control')

    expect(document.activeElement).toBe(input)
    await expect.poll(() => getComputedStyle(control).borderTopColor).toBe(resolve('var(--xh-border-control-focus)'))
    expect(getComputedStyle(input).outlineStyle).toBe('none')
    expect(part('decrement-trigger').tabIndex).toBe(-1)
    expect(part('increment-trigger').tabIndex).toBe(-1)
  })
})

describe('数字输入的粗指针目标', () => {
  it.each(['comfortable', 'compact'] as const)('%s：两颗 field-inset 正方钮横排在末端、常显，视觉盒不放大，各自由家族伪元素外扩到 44px 命中区', async (density) => {
    await emulatePointer('coarse')
    expect(matchMedia('(pointer: coarse)').matches).toBe(true)
    mountField({}, { density, width: 160 })
    await settle()
    const controlEl = part('control')
    const control = controlEl.getBoundingClientRect()
    const decrement = part('decrement-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()
    const increment = part('increment-trigger').getBoundingClientRect()
    const trigger = px('--xh-control-h-sm', controlEl)

    expect(control.height).toBe(px('--xh-control-h-md', controlEl))
    expect(decrement.width).toBe(trigger)
    expect(increment.width).toBe(trigger)
    expect(decrement.height).toBe(trigger)
    expect(getComputedStyle(part('increment-trigger')).visibility).toBe('visible')
    expect(centerY(part('increment-trigger'))).toBeCloseTo(centerY(controlEl), 1)
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
    expect(getComputedStyle(controlEl).overflow).toBe('visible')
  })
})
