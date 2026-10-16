// 字段集的描述链只引用在场的说明与错误文案：没写说明、说明读不出一句话时都不留落空的 id，axe 不报无效引用。
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function mount(inner: string, attrs = ''): Promise<HTMLElement> {
  host = document.createElement('div')
  host.innerHTML = `
    <xh-fieldset ${attrs}>
      <fieldset data-xh-part="root"><legend data-xh-part="legend">联系人</legend><input aria-label="姓名">${inner}</fieldset>
    </xh-fieldset>`
  document.body.append(host)
  await Promise.resolve()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  return host.querySelector<HTMLElement>('[data-scope="fieldset"][data-part="root"]')!
}

const refs = (el: Element): string[] => (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
const idOf = (part: string): string => host!.querySelector(`[data-scope="fieldset"][data-part="${part}"]`)!.id

async function invalidRefs(): Promise<string[]> {
  const { violations } = await runAxe(host!)
  return violations.filter(v => v.id === 'aria-valid-attr-value').map(v => v.id)
}

describe('字段集只引用在场的部件（Web Components）', () => {
  it('没写说明：root 不写 aria-describedby，axe 不报无效引用', async () => {
    const root = await mount('')
    expect(root.hasAttribute('aria-describedby')).toBe(false)
    expect(await invalidRefs()).toEqual([])
  })

  it('写了有文字的说明：描述链引用它', async () => {
    const root = await mount('<p data-xh-part="description">至少留一种联系方式</p>')
    expect(refs(root)).toEqual([idOf('description')])
    expect(await invalidRefs()).toEqual([])
  })

  it('说明读不出一句话（空着或只有对读屏隐藏的内容）时按没写处理，补上文字后接上', async () => {
    const root = await mount('<p data-xh-part="description"><span aria-hidden="true">*</span></p>')
    expect(root.hasAttribute('aria-describedby')).toBe(false)
    host!.querySelector('[data-xh-part="description"]')!.append('至少留一种联系方式')
    await vi.waitFor(() => expect(refs(root)).toEqual([idOf('description')]))
  })

  it('invalid、没写说明：只引用错误文案', async () => {
    const root = await mount('<p data-xh-part="error-text">请填写联系人</p>', 'invalid')
    expect(refs(root)).toEqual([idOf('error-text')])
    for (const id of refs(root))
      expect(document.getElementById(id), id).not.toBeNull()
    expect(await invalidRefs()).toEqual([])
  })

  it('invalid、两样都写：说明在前、错误在后', async () => {
    const root = await mount('<p data-xh-part="description">至少留一种联系方式</p><p data-xh-part="error-text">请填写联系人</p>', 'invalid')
    expect(refs(root)).toEqual([idOf('description'), idOf('error-text')])
  })
})
