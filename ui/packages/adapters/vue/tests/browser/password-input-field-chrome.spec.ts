import type { Size } from '@xihan-ui/core'
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhPasswordInputCapsLockIndicator,
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputRoot,
  XhPasswordInputVisibilityTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

interface FieldOptions {
  density?: 'comfortable' | 'compact'
  disabled?: boolean
  readOnly?: boolean
  size?: Size
  theme?: 'light' | 'dark'
  variant?: 'outline' | 'subtle' | 'ghost'
}

function fieldNode(id: string, options: FieldOptions = {}): VNode {
  return h('div', {
    'data-density': options.density ?? 'comfortable',
    'data-testid': id,
    'data-theme': options.theme ?? 'light',
  }, [
    h(XhPasswordInputRoot, {
      defaultValue: 'Secret42',
      disabled: options.disabled,
      readOnly: options.readOnly,
      size: options.size ?? 'md',
      variant: options.variant,
    }, () => [
      h(XhPasswordInputControl, null, () => [
        h('span', { 'data-testid': 'prefix' }, '前'),
        h(XhPasswordInputInput),
        h('span', { 'data-testid': 'suffix' }, '后'),
        h(XhPasswordInputCapsLockIndicator),
        h(XhPasswordInputVisibilityTrigger),
      ]),
    ]),
  ])
}

async function mount(nodes: VNode[]): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h('div', { style: 'display:flex;flex-wrap:wrap;gap:24px' }, nodes) })
  app.mount(host)
  await nextTick()
}

function field(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

function part(id: string, name: string): HTMLElement {
  const element = field(id).querySelector<HTMLElement>(`[data-scope='password-input'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 ${id}/${name}`)
  return element
}

function distance(first: DOMRect, second: DOMRect): number {
  return second.left - first.right
}

function resolveColor(element: Element, property: string): string {
  const probe = document.createElement('span')
  probe.style.setProperty('--value', getComputedStyle(element).getPropertyValue(property))
  probe.style.color = 'var(--value)'
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

describe('password-input Field Chrome 细节', () => {
  it('三尺寸与 compact 同步缩放高度、间距、动作盒和半高分隔', async () => {
    const cases = [
      ['comfortable-sm', 'comfortable', 'sm', 28, 4, 24],
      ['comfortable-md', 'comfortable', 'md', 32, 8, 24],
      ['comfortable-lg', 'comfortable', 'lg', 40, 12, 24],
      ['compact-sm', 'compact', 'sm', 24, 4, 20],
      ['compact-md', 'compact', 'md', 28, 6, 20],
      ['compact-lg', 'compact', 'lg', 36, 8, 20],
    ] as const
    await mount(cases.map(([id, density, size]) => fieldNode(id, { density, size })))

    for (const [id, , , height, gap, action] of cases) {
      const control = part(id, 'control')
      const input = part(id, 'input')
      const trigger = part(id, 'visibility-trigger')
      const caps = part(id, 'caps-lock-indicator')
      const prefix = field(id).querySelector<HTMLElement>(`[data-testid='prefix']`)!
      const suffix = field(id).querySelector<HTMLElement>(`[data-testid='suffix']`)!
      const separator = getComputedStyle(trigger, '::after')

      expect(control.getBoundingClientRect().height).toBe(height)
      expect(trigger.getBoundingClientRect().width).toBe(action)
      expect(trigger.getBoundingClientRect().height).toBe(action)
      expect(Number.parseFloat(getComputedStyle(control).columnGap)).toBe(gap)
      expect(distance(prefix.getBoundingClientRect(), input.getBoundingClientRect())).toBeCloseTo(gap, 1)
      expect(distance(input.getBoundingClientRect(), suffix.getBoundingClientRect())).toBeCloseTo(gap, 1)
      expect(distance(caps.getBoundingClientRect(), trigger.getBoundingClientRect())).toBeCloseTo(gap, 1)
      expect(Number.parseFloat(separator.blockSize)).toBeCloseTo(height / 2, 1)
      expect(separator.borderInlineStartWidth).toBe('1px')
      expect(Number.parseFloat(separator.insetInlineStart)).toBeCloseTo(-(gap + 1) / 2, 1)
    }
  })

  it('只读仍可揭示并保留双焦点位置；禁用态统一输入、按钮与 Caps Lock 墨色', async () => {
    await mount([
      fieldNode('readonly', { readOnly: true, theme: 'dark' }),
      fieldNode('disabled', { disabled: true, theme: 'dark' }),
    ])
    const readonlyControl = part('readonly', 'control')
    const readonlyInput = part('readonly', 'input') as HTMLInputElement
    const readonlyTrigger = part('readonly', 'visibility-trigger') as HTMLButtonElement
    expect(readonlyInput.readOnly).toBe(true)
    expect(readonlyTrigger.disabled).toBe(false)

    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(readonlyInput)
    expect(getComputedStyle(readonlyControl).outlineStyle).toBe('solid')
    expect(getComputedStyle(readonlyInput).outlineStyle).toBe('none')
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(readonlyTrigger)
    expect(getComputedStyle(readonlyTrigger).outlineStyle).toBe('solid')
    expect(getComputedStyle(readonlyTrigger).outlineOffset).toBe('-2px')

    const disabledInput = part('disabled', 'input') as HTMLInputElement
    const disabledTrigger = part('disabled', 'visibility-trigger') as HTMLButtonElement
    const disabledCaps = part('disabled', 'caps-lock-indicator')
    expect(disabledInput.disabled).toBe(true)
    expect(disabledTrigger.disabled).toBe(true)
    expect(getComputedStyle(disabledTrigger).cursor).toBe('not-allowed')
    expect(getComputedStyle(disabledCaps).color).toBe(getComputedStyle(disabledTrigger).color)
  })

  it('自动填充派生色跟随实体形态和状态，ghost 明确使用可覆盖平台底的 canvas', async () => {
    await mount([
      fieldNode('subtle', { variant: 'subtle' }),
      fieldNode('readonly-fill', { readOnly: true }),
      fieldNode('disabled-fill', { disabled: true }),
      fieldNode('ghost', { variant: 'ghost' }),
    ])

    for (const id of ['subtle', 'readonly-fill', 'disabled-fill']) {
      const input = part(id, 'input')
      expect(resolveColor(input, '--xh-_password-input-autofill-bg'))
        .toBe(getComputedStyle(part(id, 'control')).backgroundColor)
    }
    const disabledInput = part('disabled-fill', 'input')
    expect(resolveColor(disabledInput, '--xh-_password-input-autofill-fg'))
      .toBe(getComputedStyle(disabledInput).color)
    expect(resolveColor(part('ghost', 'input'), '--xh-_password-input-autofill-bg')).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('forced-colors 保留动作分隔，禁用分隔改用系统禁用色', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mount([fieldNode('enabled'), fieldNode('forced-disabled', { disabled: true })])
    const enabled = getComputedStyle(part('enabled', 'visibility-trigger'), '::after')
    const disabled = getComputedStyle(part('forced-disabled', 'visibility-trigger'), '::after')
    expect(enabled.borderInlineStartWidth).toBe('1px')
    expect(disabled.borderInlineStartWidth).toBe('1px')
    expect(enabled.borderInlineStartColor).not.toBe(disabled.borderInlineStartColor)
  })
})
