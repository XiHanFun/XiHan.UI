// Select 的 trigger 保持实体，popup 使用 M2；作者内容布局、选中面与四向动效依赖真实 CSS 级联。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSelectContent,
  XhSelectControl,
  XhSelectEmpty,
  XhSelectFooter,
  XhSelectGroup,
  XhSelectGroupLabel,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectList,
  XhSelectLoading,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const OPTIONS = [
  { value: 'alpha', label: '一段需要在弹性正文区域中截断的很长选项文字', group: 'primary' },
  { value: 'beta', label: '第二项', group: 'primary' },
  { value: 'gamma', label: '第三项', group: 'secondary' },
]

let app: App | null = null
let host: HTMLElement | null = null

function part(name: string, index = 0): HTMLElement {
  const elements = document.querySelectorAll<HTMLElement>(`[data-scope='select'][data-part='${name}']`)
  const element = elements[index]
  if (!element)
    throw new Error(`找不到第 ${index} 个 select/${name}`)
  return element
}

function byTestId(id: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-testid='${id}']`)
  if (!element)
    throw new Error(`找不到 ${id}`)
  return element
}

async function mountSelect(multiple = true): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhSelectRoot, {
      collection: OPTIONS,
      multiple,
      open: true,
      value: ['alpha'],
      placement: 'bottom-start',
    }, () => [
      h(XhSelectControl, null, () => [
        h(XhSelectTrigger, null, () => [h(XhSelectValueText), h(XhSelectIndicator)]),
      ]),
      h(XhSelectPositioner, null, () => [
        h(XhSelectContent, { style: { inlineSize: '240px' } }, () => [
          h(XhSelectList, null, () => [
            h(XhSelectGroup, { 'value': 'primary', 'data-testid': 'group-primary' }, () => [
              h(XhSelectGroupLabel, null, () => h('span', { 'data-testid': 'label-primary' }, '主要选项')),
              h(XhSelectItem, { 'value': 'alpha', 'data-testid': 'selected' }, () => [
                h(XhSelectItemText, { 'data-testid': 'long-text' }, () => OPTIONS[0]!.label),
                h(XhSelectItemIndicator),
              ]),
              h(XhSelectItem, { 'value': 'beta', 'data-testid': 'plain' }, () => [
                h(XhSelectItemText, null, () => '第二项'),
                h(XhSelectItemIndicator),
              ]),
            ]),
            h(XhSelectGroup, { 'value': 'secondary', 'data-testid': 'group-secondary' }, () => [
              h(XhSelectGroupLabel, null, () => '次要选项'),
              h(XhSelectItem, { 'value': 'gamma', 'disabled': true, 'data-testid': 'disabled' }, () => [
                h(XhSelectItemText, null, () => '第三项'),
                h(XhSelectItemIndicator),
              ]),
            ]),
          ]),
          h(XhSelectEmpty, { 'data-testid': 'empty' }, () => '没有可选项'),
          h(XhSelectLoading, { 'data-testid': 'loading' }, () => '载入中'),
          h(XhSelectFooter, { 'data-testid': 'footer' }, () => '附加操作'),
        ]),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function backdrop(style: CSSStyleDeclaration): string {
  return style.getPropertyValue('backdrop-filter') || style.getPropertyValue('-webkit-backdrop-filter')
}

function colorAlpha(color: string): number {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  const context = canvas.getContext('2d')!
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  return context.getImageData(0, 0, 1, 1).data[3]!
}

function directions(positioner: HTMLElement): readonly string[] {
  const style = getComputedStyle(positioner)
  return ['up', 'down', 'left', 'right'].map(side => style.getPropertyValue(`--xh-_overlay-enter-${side}`).trim())
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('选择器实体触发与 M2 浮层', () => {
  it('control 保持不透明实体，content 才使用磨砂、浮层海拔与顶光', async () => {
    await mountSelect()
    const control = getComputedStyle(part('control'))
    const content = getComputedStyle(part('content'))

    expect(backdrop(control)).toBe('none')
    expect(colorAlpha(control.backgroundColor)).toBe(255)
    expect(backdrop(content)).toContain('blur(16px)')
    expect(colorAlpha(content.backgroundColor)).toBeLessThan(255)
    expect(content.boxShadow).not.toBe('none')
    expect(getComputedStyle(part('content'), '::before').backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })
})

describe('选择器分组与选项反馈', () => {
  it('正文弹性收缩、勾选固定末端，长文字截断且后继分组有实体分隔', async () => {
    await mountSelect()
    const selected = byTestId('selected')
    const plain = byTestId('plain')
    const longText = byTestId('long-text')
    const indicators = [selected, plain].map(item => item.querySelector<HTMLElement>(`[data-part='item-indicator']`)!)

    expect(indicators[0]!.getBoundingClientRect().right).toBeCloseTo(indicators[1]!.getBoundingClientRect().right, 0)
    expect(longText.scrollWidth).toBeGreaterThan(longText.clientWidth)
    expect(getComputedStyle(longText).textOverflow).toBe('ellipsis')
    expect(byTestId('label-primary').getBoundingClientRect().left)
      .toBeCloseTo(longText.getBoundingClientRect().left, 0)

    const secondGroup = getComputedStyle(byTestId('group-secondary'))
    expect(secondGroup.borderBlockStartStyle).toBe('solid')
    expect(Number.parseFloat(secondGroup.borderBlockStartWidth)).toBeGreaterThan(0)
    expect(secondGroup.borderBlockStartColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(secondGroup.paddingBlockStart)).toBeGreaterThan(0)
  })

  it('键盘聚焦铺中性实体面，焦点环与勾选标记同时保留', async () => {
    await mountSelect()
    const selected = byTestId('selected')
    await userEvent.tab()
    selected.focus()
    const style = getComputedStyle(selected)
    const indicator = selected.querySelector<HTMLElement>(`[data-part='item-indicator']`)!

    expect(selected.matches(':focus-visible')).toBe(true)
    expect(colorAlpha(style.backgroundColor)).toBe(255)
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(style.outlineStyle).toBe('solid')
    expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThan(0)
    expect(getComputedStyle(indicator).visibility).toBe('visible')
  })

  it.each([false, true])('multiple=%s：选中只显示对号，移走高亮后不留蓝底或强调文字', async (multiple) => {
    await mountSelect(multiple)
    const selected = byTestId('selected')
    const plain = byTestId('plain')
    selected.style.transition = 'none'
    plain.style.transition = 'none'
    const indicator = selected.querySelector<HTMLElement>(`[data-part='item-indicator']`)!
    const plainIndicator = plain.querySelector<HTMLElement>(`[data-part='item-indicator']`)!
    await userEvent.hover(plain)
    plain.focus()
    await nextTick()
    expect(selected.getAttribute('data-state')).toBe('checked')
    expect(colorAlpha(getComputedStyle(selected).backgroundColor)).toBe(0)
    expect(getComputedStyle(selected).color).toBe(getComputedStyle(plain).color)
    expect(getComputedStyle(selected).fontWeight).toBe(getComputedStyle(plain).fontWeight)
    expect(getComputedStyle(indicator).visibility).toBe('visible')
    expect(getComputedStyle(plainIndicator).visibility).toBe('hidden')
    const highlighted = getComputedStyle(plain).backgroundColor
    await userEvent.hover(selected)
    await nextTick()
    expect(getComputedStyle(selected).backgroundColor).toBe(highlighted)
    expect(getComputedStyle(indicator).visibility).toBe('visible')
  })

  it('未选中行的 hover 与 pressed 分档，disabled 行及勾选位统一失效', async () => {
    await mountSelect()
    const plain = byTestId('plain')
    const rest = getComputedStyle(plain).backgroundColor
    await userEvent.hover(plain)
    const hovered = getComputedStyle(plain).backgroundColor
    expect(hovered).not.toBe(rest)

    plain.style.transition = 'none'
    let pressed = ''
    plain.addEventListener('pointerdown', () => {
      pressed = getComputedStyle(plain).backgroundColor
    }, { once: true })
    await userEvent.click(plain)
    expect(pressed).not.toBe(hovered)

    const disabled = byTestId('disabled')
    const disabledIndicator = disabled.querySelector<HTMLElement>(`[data-part='item-indicator']`)!
    expect(getComputedStyle(disabled).cursor).toBe('not-allowed')
    expect(getComputedStyle(disabledIndicator).color).toBe(getComputedStyle(disabled).color)
  })

  it('空态、加载态与 footer 使用同一浮层次要前景和分隔节奏', async () => {
    await mountSelect()
    const empty = byTestId('empty')
    const loading = byTestId('loading')
    empty.hidden = false
    loading.hidden = false
    const groupLabel = part('group-label')

    expect(getComputedStyle(empty).color).toBe(getComputedStyle(groupLabel).color)
    expect(getComputedStyle(loading).color).toBe(getComputedStyle(groupLabel).color)
    expect(getComputedStyle(byTestId('footer')).color).toBe(getComputedStyle(groupLabel).color)
    expect(getComputedStyle(byTestId('footer')).borderBlockStartStyle).toBe('solid')
  })
})

describe('选择器四向短位移', () => {
  it('共享 slide 动画不含 scale，placement 每次只激活一个物理方向', async () => {
    await mountSelect()
    const positioner = part('positioner')
    const content = part('content')
    const cases = [
      { placement: 'top-start', expected: ['0', '1', '0', '0'] },
      { placement: 'bottom-end', expected: ['1', '0', '0', '0'] },
      { placement: 'left-start', expected: ['0', '0', '0', '1'] },
      { placement: 'right-end', expected: ['0', '0', '1', '0'] },
    ] as const

    for (const item of cases) {
      positioner.dataset.placement = item.placement
      expect(directions(positioner), item.placement).toEqual(item.expected)
    }
    content.dataset.state = 'open'
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-in')
    expect(getComputedStyle(content).willChange).toContain('translate')
    expect(getComputedStyle(content).scale).toBe('none')
    content.dataset.state = 'closed'
    expect(getComputedStyle(content).animationName).toBe('xh-overlay-slide-out')
    expect(getComputedStyle(content).scale).toBe('none')
  })

  it('嵌套 positioner 清掉父层方向后，只按自己的 placement 位移', async () => {
    await mountSelect()
    const outer = part('positioner')
    outer.dataset.placement = 'bottom-start'
    const inner = document.createElement('div')
    inner.dataset.scope = 'select'
    inner.dataset.part = 'positioner'
    inner.dataset.placement = 'right-start'
    outer.append(inner)

    expect(directions(outer)).toEqual(['1', '0', '0', '0'])
    expect(directions(inner)).toEqual(['0', '0', '1', '0'])
  })
})
