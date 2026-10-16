// 名字链与描述链只引用在场的部件：字段没写说明、控件没写自己的 label 时，引用的每个 id 都查得回节点，axe 不报无效引用。
// React 的 label 部件在 effect 里登记：首帧（含服务端直出）还没登记，不写这条引用，挂载后的下一帧补上。
import type { ReactNode } from 'react'
import { runAxe } from '@xihan-ui/testing/a11y'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

async function mount(node: ReactNode): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(node)
  })
  unmount = () => act(() => root.unmount())
  for (let i = 0; i < 3; i++)
    await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
  return host
}

/** 容器里每条 aria-labelledby / aria-describedby 引用的 id 都要能在文档里找到。 */
function danglingRefs(root: HTMLElement): string[] {
  const out: string[] = []
  for (const el of root.querySelectorAll('[aria-labelledby], [aria-describedby]')) {
    for (const attr of ['aria-labelledby', 'aria-describedby']) {
      for (const id of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id))
          out.push(`${el.localName}[${attr}] → ${id}`)
      }
    }
  }
  return out
}

async function refViolations(root: HTMLElement): Promise<string[]> {
  const { violations } = await runAxe(root)
  return violations.filter(v => ['aria-valid-attr-value', 'aria-input-field-name', 'button-name', 'label'].includes(v.id)).map(v => v.id)
}

describe('只引用在场的部件', () => {
  it('字段没写说明、invalid：下拉触发钮只引用字段标签与错误文案', async () => {
    const root = await mount(
      <XhFieldRoot invalid>
        <XhFieldLabel>部门</XhFieldLabel>
        <XhFieldControl>
          <XhSelectRoot><XhSelectTrigger><XhSelectValueText /></XhSelectTrigger></XhSelectRoot>
        </XhFieldControl>
        <XhFieldErrorText>必填</XhFieldErrorText>
      </XhFieldRoot>,
    )
    expect(danglingRefs(root)).toEqual([])
    expect(await refViolations(root)).toEqual([])
  })

  it('字段没写说明：没写自己 label 的文本框，名字链只有字段标签', async () => {
    const root = await mount(
      <XhFieldRoot>
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl asChild={false}>
          <XhTextFieldRoot><XhTextFieldInput /></XhTextFieldRoot>
        </XhFieldControl>
      </XhFieldRoot>,
    )
    const input = root.querySelector('input')!
    expect(input.getAttribute('aria-labelledby')).toBe(root.querySelector('[data-scope="field"][data-part="label"]')!.id)
    expect(input.hasAttribute('aria-describedby')).toBe(false)
    expect(danglingRefs(root)).toEqual([])
    expect(await refViolations(root)).toEqual([])
  })

  it('字段外没写自己 label 的文本框：不写 aria-labelledby，作者写的 aria-label 生效', async () => {
    const root = await mount(<XhTextFieldRoot><XhTextFieldInput aria-label="搜索" /></XhTextFieldRoot>)
    expect(root.querySelector('input')!.hasAttribute('aria-labelledby')).toBe(false)
    expect(danglingRefs(root)).toEqual([])
    expect(await refViolations(root)).toEqual([])
  })

  it('写了自己 label 的文本框挂载后引用它', async () => {
    const root = await mount(
      <XhTextFieldRoot>
        <XhTextFieldLabel>昵称</XhTextFieldLabel>
        <XhTextFieldInput />
      </XhTextFieldRoot>,
    )
    expect(root.querySelector('input')!.getAttribute('aria-labelledby')).toBe(root.querySelector('[data-scope="text-field"][data-part="label"]')!.id)
    expect(danglingRefs(root)).toEqual([])
  })
})
