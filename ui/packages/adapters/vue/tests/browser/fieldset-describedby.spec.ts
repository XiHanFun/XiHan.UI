// 字段集的描述链只引用在场的说明与错误文案：没写说明、说明读不出一句话时都不留落空的 id，axe 不报无效引用。
import type { App, VNodeChild } from 'vue'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhFieldsetDescription, XhFieldsetErrorText, XhFieldsetLegend, XhFieldsetRoot } from '../../src'
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

async function settle(): Promise<void> {
  await nextTick()
  for (let i = 0; i < 2; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

async function mount(children: () => VNodeChild[], invalid = false): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhFieldsetRoot, { invalid }, () => [h(XhFieldsetLegend, null, () => '联系人'), h('input', { 'aria-label': '姓名' }), ...children()]),
  })
  app.mount(host)
  await settle()
  return host.querySelector<HTMLElement>('[data-scope="fieldset"][data-part="root"]')!
}

const refs = (el: Element): string[] => (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
const idOf = (part: string): string => host!.querySelector(`[data-scope="fieldset"][data-part="${part}"]`)!.id

async function invalidRefs(): Promise<string[]> {
  const { violations } = await runAxe(host!)
  return violations.filter(v => v.id === 'aria-valid-attr-value').map(v => v.id)
}

describe('字段集只引用在场的部件（Vue）', () => {
  it('没写说明：root 不写 aria-describedby，axe 不报无效引用', async () => {
    const root = await mount(() => [])
    expect(root.hasAttribute('aria-describedby')).toBe(false)
    expect(await invalidRefs()).toEqual([])
  })

  it('写了有文字的说明：描述链引用它', async () => {
    const root = await mount(() => [h(XhFieldsetDescription, null, () => '至少留一种联系方式')])
    expect(refs(root)).toEqual([idOf('description')])
    expect(await invalidRefs()).toEqual([])
  })

  it('说明读不出一句话（只有对读屏隐藏的内容）时按没写处理，补上文字后接上', async () => {
    const text = ref('')
    const root = await mount(() => [h(XhFieldsetDescription, null, () => [h('span', { 'aria-hidden': 'true' }, '*'), text.value])])
    expect(root.hasAttribute('aria-describedby')).toBe(false)
    text.value = '至少留一种联系方式'
    await settle()
    expect(refs(root)).toEqual([idOf('description')])
  })

  it('invalid、没写说明：只引用错误文案', async () => {
    const root = await mount(() => [h(XhFieldsetErrorText, null, () => '请填写联系人')], true)
    expect(refs(root)).toEqual([idOf('error-text')])
    expect(await invalidRefs()).toEqual([])
  })

  it('invalid、两样都写：说明在前、错误在后', async () => {
    const root = await mount(() => [h(XhFieldsetDescription, null, () => '至少留一种联系方式'), h(XhFieldsetErrorText, null, () => '请填写联系人')], true)
    expect(refs(root)).toEqual([idOf('description'), idOf('error-text')])
  })
})
