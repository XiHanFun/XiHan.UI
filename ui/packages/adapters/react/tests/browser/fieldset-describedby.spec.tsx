// 字段集的描述链只引用在场的说明与错误文案：没写说明、说明读不出一句话时都不留落空的 id，axe 不报无效引用。
import type { ReactNode } from 'react'
import { runAxe } from '@xihan-ui/testing/a11y'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhFieldsetDescription, XhFieldsetErrorText, XhFieldsetLegend, XhFieldsetRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let unmount: (() => void) | null = null
let host: HTMLElement | null = null
let rerender: ((node: ReactNode) => Promise<void>) | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

function view(children: ReactNode, invalid = false): ReactNode {
  return (
    <XhFieldsetRoot invalid={invalid}>
      <XhFieldsetLegend>联系人</XhFieldsetLegend>
      <input aria-label="姓名" />
      {children}
    </XhFieldsetRoot>
  )
}

async function mount(node: ReactNode): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  rerender = async (next) => {
    await act(async () => root.render(next))
    await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
  }
  await rerender(node)
  unmount = () => act(() => root.unmount())
  return host.querySelector<HTMLElement>('[data-scope="fieldset"][data-part="root"]')!
}

const refs = (el: Element): string[] => (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
const idOf = (part: string): string => host!.querySelector(`[data-scope="fieldset"][data-part="${part}"]`)!.id

async function invalidRefs(): Promise<string[]> {
  const { violations } = await runAxe(host!)
  return violations.filter(v => v.id === 'aria-valid-attr-value').map(v => v.id)
}

describe('字段集只引用在场的部件（React）', () => {
  it('没写说明：root 不写 aria-describedby，axe 不报无效引用', async () => {
    const root = await mount(view(null))
    expect(root.hasAttribute('aria-describedby')).toBe(false)
    expect(await invalidRefs()).toEqual([])
  })

  it('写了有文字的说明：描述链引用它', async () => {
    const root = await mount(view(<XhFieldsetDescription>至少留一种联系方式</XhFieldsetDescription>))
    expect(refs(root)).toEqual([idOf('description')])
    expect(await invalidRefs()).toEqual([])
  })

  it('说明读不出一句话（只有对读屏隐藏的内容）时按没写处理，补上文字后接上', async () => {
    const description = (text: string) => (
      <XhFieldsetDescription>
        <span aria-hidden="true">*</span>
        {text}
      </XhFieldsetDescription>
    )
    const root = await mount(view(description('')))
    expect(root.hasAttribute('aria-describedby')).toBe(false)
    await rerender!(view(description('至少留一种联系方式')))
    expect(refs(root)).toEqual([idOf('description')])
  })

  it('invalid、没写说明：只引用错误文案', async () => {
    const root = await mount(view(<XhFieldsetErrorText>请填写联系人</XhFieldsetErrorText>, true))
    expect(refs(root)).toEqual([idOf('error-text')])
    expect(await invalidRefs()).toEqual([])
  })

  it('invalid、两样都写：说明在前、错误在后', async () => {
    const root = await mount(view(
      <>
        <XhFieldsetDescription>至少留一种联系方式</XhFieldsetDescription>
        <XhFieldsetErrorText>请填写联系人</XhFieldsetErrorText>
      </>,
      true,
    ))
    expect(refs(root)).toEqual([idOf('description'), idOf('error-text')])
  })
})
