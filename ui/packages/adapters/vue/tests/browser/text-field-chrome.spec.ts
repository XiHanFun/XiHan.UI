import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhTextFieldClearTrigger,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldPrefix,
  XhTextFieldRoot,
  XhTextFieldSuffix,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function mount(render: () => VNode, density: 'comfortable' | 'compact' = 'comfortable'): void {
  document.documentElement.dataset.density = density
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
}

function field(props: Record<string, unknown> = {}, textarea = false): VNode {
  return h(XhTextFieldRoot, { defaultValue: 'XiHan', clearable: true, ...props }, () => [
    h(XhTextFieldControl, null, () => [
      h(XhTextFieldPrefix, null, () => 'P'),
      h(XhTextFieldInput, { as: textarea ? 'textarea' : 'input', placeholder: '占位' }),
      h(XhTextFieldSuffix, null, () => 'S'),
      h(XhTextFieldClearTrigger),
    ]),
  ])
}

afterEach(async () => {
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.density
  delete document.documentElement.dataset.motion
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('field Chrome 尺寸与布局', () => {
  it.each([
    { density: 'comfortable' as const, heights: [28, 32, 40] },
    { density: 'compact' as const, heights: [24, 28, 36] },
  ])('$density：TextField 三尺寸只跟语义密度令牌变化', ({ density, heights }) => {
    mount(() => h('div', null, ['sm', 'md', 'lg'].map(size => field({ size }))), density)
    const controls = [...host!.querySelectorAll<HTMLElement>('[data-xh-field-chrome]')]
    expect(controls).toHaveLength(3)
    controls.forEach((control, index) => {
      expect(control.dataset.xhFieldSize).toBe(['sm', 'md', 'lg'][index])
      expect(control.getBoundingClientRect().height).toBe(heights[index])
    })
  })

  it('单行与 textarea 共享外壳，textarea 由 Headless 布局事实解除定高', () => {
    mount(() => h('div', null, [field(), field({}, true)]))
    const [single, textarea] = [...host!.querySelectorAll<HTMLElement>('[data-xh-field-chrome]')]
    const inputs = [...host!.querySelectorAll<HTMLElement>('[data-xh-field-input]')]
    expect(inputs[0]!.dataset.xhFieldLayout).toBe('single-line')
    expect(inputs[1]!.dataset.xhFieldLayout).toBe('textarea')
    expect(single!.getBoundingClientRect().height).toBe(32)
    expect(textarea!.getBoundingClientRect().height).toBeGreaterThanOrEqual(32)
    expect(getComputedStyle(inputs[1]!).resize).toBe('vertical')
  })

  it('multi-tag 为家族级可换行高度，不要求消费组件复制布局', () => {
    mount(() => h('div'))
    const control = document.createElement('div')
    control.setAttribute('data-xh-field-chrome', '')
    control.setAttribute('data-xh-field-size', 'md')
    control.setAttribute('data-xh-field-layout', 'multi-tag')
    control.append(document.createTextNode('Alpha Beta Gamma'))
    host!.append(control)
    expect(getComputedStyle(control).flexWrap).toBe('wrap')
    expect(control.getBoundingClientRect().height).toBeGreaterThanOrEqual(32)
  })

  it('ime 组合事件保持原生输入路径，不改变 Field Chrome 几何', async () => {
    mount(() => field({ defaultValue: '' }))
    const control = host!.querySelector<HTMLElement>('[data-xh-field-chrome]')!
    const input = host!.querySelector<HTMLInputElement>('[data-xh-field-input]')!
    const before = control.getBoundingClientRect()
    expect(input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: '拼' }))).toBe(true)
    input.value = '拼音'
    expect(input.dispatchEvent(new InputEvent('input', { bubbles: true, data: '拼音', inputType: 'insertCompositionText', isComposing: true }))).toBe(true)
    expect(input.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '拼音' }))).toBe(true)
    await nextTick()
    expect(input.value).toBe('拼音')
    expect(control.getBoundingClientRect().height).toBe(before.height)
  })
})

describe('field Chrome 状态与字段内动作', () => {
  it('hover/focus/invalid/readOnly/disabled 状态互不覆盖语义', async () => {
    mount(() => h('div', null, [
      field({ 'data-test': 'ready' }),
      field({ 'invalid': true, 'data-test': 'invalid' }),
      field({ 'readOnly': true, 'data-test': 'readonly' }),
      field({ 'disabled': true, 'data-test': 'disabled' }),
    ]))
    const controls = [...host!.querySelectorAll<HTMLElement>('[data-xh-field-chrome]')]
    const ready = controls[0]!
    const restBorder = getComputedStyle(ready).borderTopColor
    await userEvent.hover(ready)
    expect(getComputedStyle(ready).borderTopColor).not.toBe(restBorder)
    await userEvent.click(ready.querySelector('input')!)
    expect(getComputedStyle(ready).outlineStyle).toBe('solid')
    expect(getComputedStyle(controls[1]!).borderTopColor).not.toBe(restBorder)
    expect(getComputedStyle(controls[2]!).cursor).toBe('default')
    expect(getComputedStyle(controls[3]!).cursor).toBe('not-allowed')
  })

  it('prefix/suffix 固定槽、clear 复用 field-inset 且粗指针下保持可发现的 44px 命中区', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    mount(() => field())
    await nextTick()
    const affixes = [...host!.querySelectorAll<HTMLElement>('[data-xh-field-affix]')]
    const clear = host!.querySelector<HTMLButtonElement>('[data-xh-action-profile=\'field-inset\']')!
    expect(affixes.map(element => element.dataset.xhFieldAffix)).toEqual(['prefix', 'suffix'])
    expect(affixes.every(element => getComputedStyle(element).flexGrow === '0')).toBe(true)
    expect(clear.dataset.xhActionProfile).toBe('field-inset')
    expect(clear.dataset.xhActionDisplay).toBe('has-value')
    expect(clear.hidden).toBe(false)
    const target = getComputedStyle(clear, '::after')
    expect(Number.parseFloat(target.minInlineSize)).toBeGreaterThanOrEqual(44)
    expect(Number.parseFloat(target.minBlockSize)).toBeGreaterThanOrEqual(44)
  })

  it('loading 与局部 reduced-motion 由 Field Chrome 自己解析', () => {
    mount(() => h('div'))
    document.documentElement.dataset.motion = 'reduce'
    const loading = document.createElement('div')
    loading.setAttribute('data-xh-field-chrome', '')
    loading.setAttribute('data-xh-field-size', 'md')
    loading.setAttribute('data-loading', '')
    host!.append(loading)
    const style = getComputedStyle(loading)
    expect(style.cursor).toBe('progress')
    expect(style.opacity).toBe('1')
    expect(style.transitionDuration).toBe('0s')
  })

  it('系统 reduced-motion 与 forced-colors 都保留状态几何通道', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    })
    mount(() => h('div', null, [field({ invalid: true }), field({ disabled: true })]))
    const [invalid, disabled] = [...host!.querySelectorAll<HTMLElement>('[data-xh-field-chrome]')]
    expect(matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true)
    expect(getComputedStyle(invalid!).transitionDuration).toBe('0s')

    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    expect(matchMedia('(forced-colors: active)').matches).toBe(true)
    expect(getComputedStyle(invalid!).borderTopStyle).toBe('solid')
    expect(getComputedStyle(disabled!).borderTopStyle).toBe('solid')
    expect(getComputedStyle(invalid!).borderTopColor).not.toBe(getComputedStyle(disabled!).borderTopColor)
  })

  it('未命名空间的业务 data-field-chrome 不会取得家族视觉盒', () => {
    mount(() => h('div'))
    const business = document.createElement('div')
    business.dataset.fieldChrome = 'business'
    host!.append(business)
    expect(getComputedStyle(business).display).not.toBe('inline-flex')
    expect(getComputedStyle(business).borderTopStyle).toBe('none')
  })
})
