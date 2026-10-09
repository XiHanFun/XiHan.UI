// 字段标签角色：14 / 400 / --xh-fg-muted，竖排与控件隔 --xh-space-2，禁用不另变色
// （再淡一档的 subtle 与 muted 分不出，fg-disabled 对比不足，禁用由控件自己的禁用面表出）；必填星号排在标签文字之前、取说明字号；
// 表单横排时标签列占一行的 5 / 24、与控件隔 --xh-space-4。
// 判据是级联算出来的颜色与排出来的几何，jsdom 不排版。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardInput,
  XhClipboardLabel,
  XhClipboardRoot,
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhNumberFieldControl,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
  XhPasswordInputControl,
  XhPasswordInputInput,
  XhPasswordInputLabel,
  XhPasswordInputRoot,
  XhTagsInputControl,
  XhTagsInputInput,
  XhTagsInputLabel,
  XhTagsInputRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
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

function part(scope: string, name: string): HTMLElement {
  const el = host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)
  if (!el)
    throw new Error(`挂载树里没有 ${scope} 的 ${name}`)
  return el
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

/** 经 CDP 取节点在无障碍树里算出的名字：生成内容算不算进名字，只有浏览器的计算说了算。 */
async function accessibleName(el: Element): Promise<string | undefined> {
  const marker = `ax-${Math.random().toString(36).slice(2)}`
  el.setAttribute('data-ax-probe', marker)
  const { root } = await cdp().send('DOM.getDocument', { depth: -1, pierce: true }) as { root: DomNode }
  const nodeId = findProbe(root, marker)
  el.removeAttribute('data-ax-probe')
  if (nodeId == null)
    throw new Error('无障碍探针没找到节点')
  const { nodes } = await cdp().send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false }) as { nodes: Array<{ name?: { value?: string } }> }
  return nodes[0]?.name?.value
}

type Case = [scope: string, render: (disabled: boolean) => VNode]

const CASES: Case[] = [
  ['field', disabled => h(XhFieldRoot, { disabled }, () => [h(XhFieldLabel, null, () => '邮箱'), h(XhFieldControl, null, () => h('input'))])],
  ['text-field', disabled => h(XhTextFieldRoot, { disabled }, () => [h(XhTextFieldLabel, null, () => '名称'), h(XhTextFieldControl, null, () => h(XhTextFieldInput))])],
  ['number-field', disabled => h(XhNumberFieldRoot, { disabled }, () => [h(XhNumberFieldLabel, null, () => '数量'), h(XhNumberFieldControl, null, () => h(XhNumberFieldInput))])],
  ['password-input', disabled => h(XhPasswordInputRoot, { disabled }, () => [h(XhPasswordInputLabel, null, () => '密码'), h(XhPasswordInputControl, null, () => h(XhPasswordInputInput))])],
  ['tags-input', disabled => h(XhTagsInputRoot, { disabled }, () => [h(XhTagsInputLabel, null, () => '标签'), h(XhTagsInputControl, null, () => h(XhTagsInputInput))])],
]

describe('字段标签角色', () => {
  it.each(CASES)('%s：标签取 --xh-fg-muted、说明档以上的标签字号，与控件隔 --xh-space-2', async (scope, render) => {
    await mount(() => render(false))
    const label = part(scope, 'label')
    const control = part(scope, 'control')
    const style = getComputedStyle(label)
    expect(style.color).toBe(resolve('var(--xh-fg-muted)'))
    expect(style.fontSize).toBe(resolve('var(--xh-text-label-size)', 'font-size'))
    expect(style.fontWeight).toBe(resolve('var(--xh-text-label-weight)', 'font-weight'))
    expect(Math.round(control.getBoundingClientRect().top - label.getBoundingClientRect().bottom)).toBe(px('--xh-space-2'))
  })

  it('clipboard：带输入框的用法是单行字段，标签同一副字段标签排版，与控件隔 --xh-space-2', async () => {
    await mount(() => h(XhClipboardRoot, { value: 'pnpm add @xihan-ui/vue' }, () => [
      h(XhClipboardLabel, null, () => '安装命令'),
      h(XhClipboardControl, null, () => [h(XhClipboardInput), h(XhClipboardCopyTrigger, null, () => '复制')]),
    ]))
    const label = part('clipboard', 'label')
    const style = getComputedStyle(label)
    expect(style.color).toBe(resolve('var(--xh-fg-muted)'))
    expect(style.fontSize).toBe(resolve('var(--xh-text-label-size)', 'font-size'))
    expect(style.fontWeight).toBe(resolve('var(--xh-text-label-weight)', 'font-weight'))
    expect(Math.round(part('clipboard', 'input').getBoundingClientRect().top - label.getBoundingClientRect().bottom)).toBe(px('--xh-space-2'))
  })

  it.each(CASES)('%s：禁用时标签不另变色，仍是 --xh-fg-muted（对比度照样够）', async (scope, render) => {
    await mount(() => render(true))
    const label = part(scope, 'label')
    expect(label.hasAttribute('data-disabled')).toBe(true)
    expect(getComputedStyle(label).color).toBe(resolve('var(--xh-fg-muted)'))
  })
})

describe('必填星号', () => {
  it('排在标签文字之前：::before 画星号，取说明字号与警示色，与文字隔 --xh-space-1', async () => {
    await mount(() => h(XhFieldRoot, { required: true }, () => [h(XhFieldLabel, null, () => '邮箱'), h(XhFieldControl, null, () => h('input'))]))
    const label = part('field', 'label')
    const star = getComputedStyle(label, '::before')
    // 字形后跟一段空的替代文本：屏上画星号，可及树里不念
    expect(star.content).toBe('"*" / ""')
    expect(star.color).toBe(resolve('var(--xh-fg-danger)'))
    expect(star.fontSize).toBe(resolve('var(--xh-text-caption-size)', 'font-size'))
    expect(star.marginInlineEnd).toBe(`${px('--xh-space-1')}px`)
    expect(getComputedStyle(label, '::after').content).toBe('none')
  })

  it('星号不进控件的可及名：必填由 aria-required 表达，读屏不先念「星号」', async () => {
    await mount(() => h(XhFieldRoot, { required: true }, () => [h(XhFieldLabel, null, () => '邮箱'), h(XhFieldControl, null, () => h('input'))]))
    const input = host!.querySelector<HTMLInputElement>('input')!
    expect(input.getAttribute('aria-required')).toBe('true')
    expect(await accessibleName(input)).toBe('邮箱')
  })
})

describe('表单横排的标签列', () => {
  it('标签列占一行的 5 / 24，与控件隔 --xh-space-4', async () => {
    await mount(() => h(XhFormRoot, { layout: 'horizontal' }, () => h(XhFormFieldGroup, { name: 'email' }, () =>
      h(XhFieldRoot, null, () => [h(XhFieldLabel, null, () => '邮箱'), h(XhFieldControl, null, () => h('input'))]))), 480)
    const root = part('field', 'root')
    const columns = getComputedStyle(root).gridTemplateColumns.split(' ').map(Number.parseFloat)
    expect(columns[0]).toBeCloseTo(root.clientWidth * 5 / 24, 0)
    expect(getComputedStyle(root).columnGap).toBe(`${px('--xh-space-4')}px`)
  })
})
