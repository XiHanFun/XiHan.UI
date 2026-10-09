import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhInputGroupItem,
  XhInputGroupRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

function isTransparentColor(value: string): boolean {
  return value === 'transparent' || /(?:,\s*0|\/\s*0)\)$/.test(value)
}

/** 把颜色值放在探针的某个颜色属性上读回计算值，与组壳的计算值同一种写法比对。 */
function resolve(value: string, property: 'color' | 'background-color' = 'color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, value)
  host!.append(probe)
  const out = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return out
}

function token(name: string, property: 'color' | 'background-color' = 'color'): string {
  return resolve(`var(${name})`, property)
}

function field(label: string, props: Record<string, unknown> = {}): VNode {
  return h(XhTextFieldRoot, { placeholder: label, ...props }, () => [
    h(XhTextFieldControl, null, () => [
      h(XhTextFieldInput, { 'aria-label': label }),
    ]),
  ])
}

function group(id: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-testid='${id}'][data-scope='input-group'][data-part='root']`)!
}

function control(id: string): HTMLElement {
  return group(id).querySelector<HTMLElement>('[data-xh-field-chrome]')!
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h('div', { style: 'display:flex;flex-wrap:wrap;gap:16px' }, [
      h(XhInputGroupRoot, { 'data-testid': 'outline' }, () => [
        h(XhInputGroupItem, null, () => '@'),
        field('主要表面'),
      ]),
      h(XhInputGroupRoot, { 'data-testid': 'subtle', 'variant': 'subtle' }, () => [
        h(XhInputGroupItem, null, () => '@'),
        field('次级表面'),
      ]),
      h(XhInputGroupRoot, { 'data-testid': 'invalid' }, () => [
        h(XhInputGroupItem, null, () => '@'),
        field('校验失败', { invalid: true }),
      ]),
      h(XhInputGroupRoot, { 'data-testid': 'disabled' }, () => [
        h(XhInputGroupItem, null, () => '@'),
        field('禁用', { disabled: true }),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
}

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('input-group 单一输入表面', () => {
  it('outline 组壳与字段外壳同形：字段淡底 + 控件描边、无影；subtle 淡底透明边；子控件不重复绘制表面', async () => {
    await mount()

    const outline = getComputedStyle(group('outline'))
    const subtle = getComputedStyle(group('subtle'))
    const outlineControl = getComputedStyle(control('outline'))

    // 边界只由描边承担：组壳静息无影，底取字段淡底，外轮廓取字段描边色 --xh-border-control
    expect(outline.boxShadow).toBe('none')
    expect(subtle.boxShadow).toBe('none')
    expect(outline.backgroundColor).toBe(token('--xh-bg-field', 'background-color'))
    expect(subtle.backgroundColor).toBe(token('--xh-bg-subtle', 'background-color'))
    expect(group('subtle').getAttribute('data-variant')).toBe('subtle')
    const outlineEdge = getComputedStyle(group('outline'), '::before')
    expect(outlineEdge.borderTopWidth).not.toBe('0px')
    expect(outlineEdge.borderTopColor).toBe(token('--xh-border-control'))
    expect(isTransparentColor(getComputedStyle(group('subtle'), '::before').borderTopColor)).toBe(true)
    expect(outlineControl.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(outlineControl.boxShadow).toBe('none')
  })

  it('悬停底不变、描边升 border-strong；键盘聚焦换承载面与聚焦描边、不画环，控件几何不变', async () => {
    await mount()
    const root = group('outline')
    const input = root.querySelector<HTMLInputElement>('input')!
    const before = root.getBoundingClientRect()
    const restBackground = getComputedStyle(root).backgroundColor

    await userEvent.hover(root)
    await expect.poll(() => getComputedStyle(root, '::before').borderTopColor).toBe(token('--xh-border-strong'))
    expect(getComputedStyle(root).backgroundColor).toBe(restBackground)

    await userEvent.keyboard('{Tab}')
    input.focus()
    expect(root.matches(':focus-within')).toBe(true)
    expect(getComputedStyle(root).outlineStyle).toBe('none')
    await expect.poll(() => getComputedStyle(root).backgroundColor).toBe(token('--xh-bg-surface', 'background-color'))
    await expect.poll(() => getComputedStyle(root, '::before').borderTopColor).toBe(token('--xh-border-control-focus'))
    const nestedControl = getComputedStyle(control('outline'))
    expect(nestedControl.outlineStyle).toBe('none')
    expect(isTransparentColor(nestedControl.borderTopColor)).toBe(true)
    expect(isTransparentColor(nestedControl.backgroundColor)).toBe(true)
    expect(getComputedStyle(input).outlineStyle).toBe('none')
    expect(nestedControl.transitionDuration.split(', ').every(value => value === '0s')).toBe(true)

    input.blur()
    expect(isTransparentColor(getComputedStyle(control('outline')).borderTopColor)).toBe(true)
    await new Promise(resolve => setTimeout(resolve, 150))
    expect(isTransparentColor(getComputedStyle(control('outline')).borderTopColor)).toBe(true)

    const after = root.getBoundingClientRect()
    expect(after.width).toBe(before.width)
    expect(after.height).toBe(before.height)
  })

  it('组里的字段校验失败：组壳换失效描边并铺失效色淡底，聚焦时让位给聚焦态', async () => {
    await mount()
    const root = group('invalid')
    expect(getComputedStyle(root, '::before').borderTopColor).toBe(token('--xh-border-invalid'))
    expect(getComputedStyle(root).backgroundColor).toBe(
      resolve('color-mix(in oklab, var(--xh-border-invalid) 4%, transparent)', 'background-color'),
    )
    root.querySelector<HTMLInputElement>('input')!.focus()
    await expect.poll(() => getComputedStyle(root, '::before').borderTopColor).toBe(token('--xh-border-control-focus'))
    await expect.poll(() => getComputedStyle(root).backgroundColor).toBe(token('--xh-bg-surface', 'background-color'))
    expect(getComputedStyle(root).outlineStyle).toBe('none')
  })

  it('组里的字段禁用：组壳换禁用面（淡底 + 缺省描边），悬停不升描边', async () => {
    await mount()
    // 描边换色带 micro 过渡：时长归零，悬停后当场读到的就是终值，悬停抑制回退了这条负断言才会红
    host!.style.setProperty('--xh-motion-duration-micro', '0ms')
    const root = group('disabled')
    expect(getComputedStyle(root).backgroundColor).toBe(token('--xh-bg-subtle', 'background-color'))
    expect(getComputedStyle(root, '::before').borderTopColor).toBe(token('--xh-border-default'))
    // 对照：可悬停的组同样当场读得到升档描边，说明下面那一读不是落在过渡途中
    await userEvent.hover(group('outline'))
    expect(getComputedStyle(group('outline'), '::before').borderTopColor).toBe(token('--xh-border-strong'))
    await userEvent.hover(root)
    expect(getComputedStyle(root, '::before').borderTopColor).toBe(token('--xh-border-default'))
  })

  it('强制色：聚焦时组壳补一圈 Highlight 环，描边换 Highlight', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    await mount()
    const root = group('outline')
    root.querySelector<HTMLInputElement>('input')!.focus()
    const style = getComputedStyle(root)
    expect(style.outlineStyle).toBe('solid')
    expect(style.outlineColor).toBe(resolve('Highlight'))
    // 描边换色照常按 micro 淡变（从 ButtonText 走到 Highlight），环即时出现
    await expect.poll(() => getComputedStyle(root, '::before').borderTopColor).toBe(resolve('Highlight'))
  })

  it('前后缀块铺淡底、取正文色，两侧内距不归零，与字段之间一道满高的缺省描边', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h(XhInputGroupRoot, { 'data-testid': 'addon' }, () => [
        h(XhInputGroupItem, null, () => 'https://'),
        field('域名'),
        h(XhInputGroupItem, null, () => '.com'),
      ]),
    })
    app.mount(host)
    await nextTick()
    const root = group('addon')
    const [before, after] = [...root.querySelectorAll<HTMLElement>(`[data-scope='input-group'][data-part='item']`)]
    for (const item of [before!, after!]) {
      const style = getComputedStyle(item)
      expect(style.backgroundColor).toBe(token('--xh-bg-subtle', 'background-color'))
      expect(style.color).toBe(token('--xh-fg-default'))
      expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0)
      expect(style.paddingInlineEnd).toBe(style.paddingInlineStart)
      expect(item.getBoundingClientRect().height).toBe(root.getBoundingClientRect().height)
    }
    // 分隔线只画在朝字段的那一侧：前缀画在行内末端、后缀画在行内起始端，外侧交给组壳的外轮廓
    expect(getComputedStyle(before!).borderInlineEndWidth).toBe('1px')
    expect(getComputedStyle(before!).borderInlineEndColor).toBe(token('--xh-border-default'))
    expect(getComputedStyle(before!).borderInlineStartWidth).toBe('0px')
    expect(getComputedStyle(after!).borderInlineStartWidth).toBe('1px')
    expect(getComputedStyle(after!).borderInlineStartColor).toBe(token('--xh-border-default'))
    expect(getComputedStyle(after!).borderInlineEndWidth).toBe('0px')
  })

  it('强制色：前后缀块的分隔线换系统色，仍看得见', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [{ name: 'forced-colors', value: 'active' }] })
    await mount()
    const item = group('outline').querySelector<HTMLElement>(`[data-scope='input-group'][data-part='item']`)!
    expect(getComputedStyle(item).borderInlineEndWidth).toBe('1px')
    expect(getComputedStyle(item).borderInlineEndColor).toBe(resolve('ButtonText'))
  })

  it('不传尺寸时整组与单个字段同宽：前缀按内容宽，字段占满剩余，不再是字段缺省宽再加前缀', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      render: () => h('div', null, [
        h(XhInputGroupRoot, { 'data-testid': 'width' }, () => [
          h(XhInputGroupItem, null, () => '@'),
          field('邮箱'),
        ]),
        h('div', { 'data-testid': 'lone' }, [field('单个字段')]),
      ]),
    })
    app.mount(host)
    await nextTick()
    const root = group('width')
    const lone = host.querySelector<HTMLElement>(`[data-testid='lone'] [data-scope='text-field'][data-part='root']`)!
    expect(root.getBoundingClientRect().width).toBeCloseTo(lone.getBoundingClientRect().width, 0)
    const item = root.querySelector<HTMLElement>(`[data-scope='input-group'][data-part='item']`)!
    const inner = root.querySelector<HTMLElement>(`[data-scope='text-field'][data-part='root']`)!
    expect(item.getBoundingClientRect().width + inner.getBoundingClientRect().width).toBeCloseTo(root.getBoundingClientRect().width, 0)
  })
})
