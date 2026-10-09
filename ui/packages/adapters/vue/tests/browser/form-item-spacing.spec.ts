// 字段辅助行与表单项距：说明 12 / --xh-fg-subtle、错误文案 12 / --xh-fg-danger，紧贴控件、最小高 --xh-space-5；
// 表单项距 --xh-space-5，字段带辅助行时那一行就是项距（不再另留）；一行流列距 --xh-space-6、行距 --xh-space-2；
// 出错的字段不再在起始缘画色带。判据是排出来的几何与级联算出的颜色，jsdom 不排版。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFieldsetDescription,
  XhFieldsetLegend,
  XhFieldsetRoot,
  XhFormFieldGroup,
  XhFormRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(render: () => VNode, width = 480): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = `inline-size: ${width}px`
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function resolve(value: string, property = 'color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

function px(token: string): number {
  return Number.parseFloat(resolve(`var(${token})`, 'inline-size'))
}

function all(scope: string, part: string): HTMLElement[] {
  return [...host!.querySelectorAll<HTMLElement>(`[data-scope='${scope}'][data-part='${part}']`)]
}

function field(name: string, parts: { description?: string, error?: boolean, invalid?: boolean, disabled?: boolean } = {}): VNode {
  return h(XhFormFieldGroup, { name }, () => h(XhFieldRoot, { invalid: parts.invalid, disabled: parts.disabled }, () => [
    h(XhFieldLabel, null, () => name),
    h(XhFieldControl, null, () => h('input')),
    ...(parts.description ? [h(XhFieldDescription, null, () => parts.description)] : []),
    ...(parts.error ? [h(XhFieldErrorText, null, () => '格式不对')] : []),
  ]))
}

/** 上一项控件底缘到下一项标签顶缘的距离。 */
function between(index: number): number {
  const controls = all('field', 'control')
  const labels = all('field', 'label')
  return Math.round(labels[index + 1]!.getBoundingClientRect().top - controls[index]!.getBoundingClientRect().bottom)
}

describe('字段的辅助行', () => {
  it('说明紧贴控件，取说明字号与 --xh-fg-subtle，最小高 --xh-space-5', async () => {
    await mount(() => h(XhFormRoot, null, () => [field('邮箱', { description: '工作邮箱' })]))
    const control = all('field', 'control')[0]!
    const description = all('field', 'description')[0]!
    const style = getComputedStyle(description)
    expect(Math.round(description.getBoundingClientRect().top - control.getBoundingClientRect().bottom)).toBe(0)
    expect(style.fontSize).toBe(resolve('var(--xh-text-caption-size)', 'font-size'))
    expect(style.color).toBe(resolve('var(--xh-fg-subtle)'))
    expect(description.getBoundingClientRect().height).toBeGreaterThanOrEqual(px('--xh-space-5'))
  })

  it('错误文案紧贴控件，取说明字号与 --xh-fg-danger，与说明同一行高', async () => {
    await mount(() => h(XhFormRoot, null, () => [field('邮箱', { error: true, invalid: true })]))
    const control = all('field', 'control')[0]!
    const error = all('field', 'error-text')[0]!
    const style = getComputedStyle(error)
    expect(Math.round(error.getBoundingClientRect().top - control.getBoundingClientRect().bottom)).toBe(0)
    expect(style.fontSize).toBe(resolve('var(--xh-text-caption-size)', 'font-size'))
    expect(style.color).toBe(resolve('var(--xh-fg-danger)'))
    expect(error.getBoundingClientRect().height).toBe(px('--xh-space-5'))
  })

  it('禁用时说明不另变色，仍是 --xh-fg-subtle（对比度照样够）', async () => {
    await mount(() => h(XhFormRoot, null, () => [field('邮箱', { description: '工作邮箱', disabled: true })]))
    const description = all('field', 'description')[0]!
    expect(getComputedStyle(description).color).toBe(resolve('var(--xh-fg-subtle)'))
  })

  it('字段集的说明与字段的说明同一副排版，组内项距 --xh-space-5', async () => {
    await mount(() => h(XhFieldsetRoot, null, () => [
      h(XhFieldsetLegend, null, () => '账号'),
      h('div', { 'data-testid': 'a' }, 'A'),
      h('div', { 'data-testid': 'b' }, 'B'),
      h(XhFieldsetDescription, null, () => '这组信息用于登录'),
    ]))
    const description = all('fieldset', 'description')[0]!
    expect(getComputedStyle(description).fontSize).toBe(resolve('var(--xh-text-caption-size)', 'font-size'))
    expect(getComputedStyle(description).color).toBe(resolve('var(--xh-fg-subtle)'))
    expect(getComputedStyle(all('fieldset', 'root')[0]!).rowGap).toBe(`${px('--xh-space-5')}px`)
  })
})

describe('字段集的组标题', () => {
  it('取区块标题 heading-3 与正文色，与组内首项隔 --xh-space-4', async () => {
    await mount(() => h(XhFieldsetRoot, null, () => [
      h(XhFieldsetLegend, null, () => '账号'),
      h('div', { 'data-testid': 'first' }, '第一项'),
    ]))
    const legend = all('fieldset', 'legend')[0]!
    const first = host!.querySelector<HTMLElement>(`[data-testid='first']`)!
    const style = getComputedStyle(legend)
    expect(style.fontSize).toBe(resolve('var(--xh-text-heading-3-size)', 'font-size'))
    expect(style.fontWeight).toBe(resolve('var(--xh-text-heading-3-weight)', 'font-weight'))
    expect(style.color).toBe(resolve('var(--xh-fg-default)'))
    expect(Math.round(first.getBoundingClientRect().top - legend.getBoundingClientRect().bottom)).toBe(px('--xh-space-4'))
  })
})

describe('表单项距', () => {
  it('没有辅助行的字段之间隔 --xh-space-5', async () => {
    await mount(() => h(XhFormRoot, null, () => [field('甲'), field('乙')]))
    expect(between(0)).toBe(px('--xh-space-5'))
  })

  it('带辅助行的字段：辅助行就是项距，下一项紧接在它之后', async () => {
    await mount(() => h(XhFormRoot, null, () => [field('甲', { error: true }), field('乙', { error: true }), field('丙', { description: '一行说明' }), field('丁')]))
    expect(between(0)).toBe(px('--xh-space-5'))
    expect(between(1)).toBe(px('--xh-space-5'))
    expect(between(2)).toBe(px('--xh-space-5'))
  })

  it('最后一项下方不留项距', async () => {
    await mount(() => h(XhFormRoot, null, () => [field('甲'), field('乙')]))
    const form = all('form', 'root')[0]!
    const last = all('form', 'field-group').at(-1)!
    expect(Math.round(form.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom)).toBe(0)
  })

  it('一行流：列距 --xh-space-6，折行后行距 --xh-space-2', async () => {
    await mount(() => h(XhFormRoot, { layout: 'inline' }, () => [field('甲'), field('乙'), field('丙')]), 600)
    const groups = all('form', 'field-group')
    const [a, b, c] = groups.map(g => g.getBoundingClientRect())
    expect(Math.round(b!.left - a!.right)).toBe(px('--xh-space-6'))
    // 三项在 600px 里排不下一行：第三项折到下一行
    expect(c!.top).toBeGreaterThan(a!.bottom)
    expect(Math.round(c!.top - a!.bottom)).toBe(px('--xh-space-2'))
  })

  it('出错的字段不在起始缘画色带', async () => {
    await mount(() => h(XhFormRoot, null, () => [field('甲', { error: true, invalid: true })]))
    const group = all('form', 'field-group')[0]!
    // 字段容器的出错态由表单校验投影；这里直接打上那一位，只看皮肤
    group.setAttribute('data-invalid', '')
    const style = getComputedStyle(group)
    expect(style.borderInlineStartWidth).toBe('0px')
    expect(style.paddingInlineStart).toBe('0px')
  })
})
