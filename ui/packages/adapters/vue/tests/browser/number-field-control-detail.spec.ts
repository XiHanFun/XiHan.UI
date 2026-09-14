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

const SIZE_CASES = [
  { density: 'comfortable', size: 'sm', control: 32, trigger: 32 },
  { density: 'comfortable', size: 'md', control: 36, trigger: 36 },
  { density: 'comfortable', size: 'lg', control: 40, trigger: 40 },
  { density: 'compact', size: 'sm', control: 28, trigger: 28 },
  { density: 'compact', size: 'md', control: 32, trigger: 32 },
  { density: 'compact', size: 'lg', control: 36, trigger: 36 },
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
  it.each(SIZE_CASES)('$density / $size：右侧动作占完整分栏宽度与控件高度', async (item) => {
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
    expect(input.right).toBeLessThanOrEqual(decrement.left)
    expect(decrement.right).toBeLessThanOrEqual(increment.left)
    expect(input.width).toBeGreaterThan(0)
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
  it('主面保留层级投影，subtle 次级填充面保持扁平', async () => {
    mountField()
    await settle()
    expect(getComputedStyle(part('control')).boxShadow).not.toBe('none')
    teardown()

    mountField({ variant: 'subtle' })
    await settle()
    expect(getComputedStyle(part('control')).boxShadow).toBe('none')
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

  it('悬停由整体输入壳反馈，单个动作保持透明；分隔线不随禁用消失', async () => {
    mountField({ min: 5 })
    await settle()
    const decrement = part('decrement-trigger')
    const increment = part('increment-trigger')
    const control = part('control')
    const decrementRest = getComputedStyle(decrement).backgroundColor
    const incrementRest = getComputedStyle(increment).backgroundColor
    const controlRest = getComputedStyle(control).backgroundColor

    await userEvent.hover(decrement)
    expect(getComputedStyle(decrement).backgroundColor).toBe(decrementRest)
    await userEvent.hover(increment)
    expect(getComputedStyle(increment).backgroundColor).toBe(incrementRest)
    expect(getComputedStyle(control).backgroundColor).not.toBe(controlRest)
    expect(getComputedStyle(decrement, '::after').content).toBe('""')
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
    { density: 'comfortable', target: 48 },
    { density: 'compact', target: 44 },
  ] as const)('$density：两颗真实按钮采用 $target px 命中盒，且不覆盖输入区', async ({ density, target }) => {
    await emulatePointer('coarse')
    expect(matchMedia('(pointer: coarse)').matches).toBe(true)
    mountField({}, { density, width: 160 })
    await settle()
    const control = part('control').getBoundingClientRect()
    const decrement = part('decrement-trigger').getBoundingClientRect()
    const input = part('input').getBoundingClientRect()
    const increment = part('increment-trigger').getBoundingClientRect()

    expect(decrement.width).toBe(target)
    expect(decrement.height).toBe(target)
    expect(increment.width).toBe(target)
    expect(increment.height).toBe(target)
    expect(control.height).toBe(target)
    expect(input.width).toBeGreaterThan(0)
    expect(input.right).toBeLessThanOrEqual(decrement.left)
    expect(decrement.right).toBeLessThanOrEqual(increment.left)
  })
})
