// @vitest-environment jsdom
//
// 属性表按宿主标签分档、提及整条删除的判据归 connect 与机器，在 headless 的 mention.spec.ts；
// 这里只管适配器自己那一半：as="textarea" 渲染出 textarea，换标签之后插入与整条删除照样跑得通。
import type { ReactNode } from 'react'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhMentionContent,
  XhMentionInput,
  XhMentionItem,
  XhMentionItemText,
  XhMentionPositioner,
  XhMentionRoot,
} from '../src'

const PEOPLE = [
  { value: 'lilei', label: '李雷' },
  { value: 'hanmeimei', label: '韩梅梅' },
]

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null
let latest = ''

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
  }
}

function Demo({ as }: { as?: 'input' | 'textarea' }): ReactNode {
  const [text, setText] = useState('')
  latest = text
  return (
    <XhMentionRoot collection={PEOPLE} value={text} onValueChange={details => setText(details.value)}>
      <XhMentionInput as={as} aria-label="正文" />
      <XhMentionPositioner>
        <XhMentionContent>
          {PEOPLE.map(node => (
            <XhMentionItem key={node.value} value={node.value}>
              <XhMentionItemText>{node.label}</XhMentionItemText>
            </XhMentionItem>
          ))}
        </XhMentionContent>
      </XhMentionPositioner>
    </XhMentionRoot>
  )
}

async function mount(as?: 'input' | 'textarea'): Promise<HTMLInputElement | HTMLTextAreaElement> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(<Demo as={as} />)
  })
  await settle()
  return document.querySelector<HTMLInputElement | HTMLTextAreaElement>('[data-scope="mention"][data-part="input"]')!
}

function key(el: HTMLElement, name: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

/** 打字：React 盯的是原生 value 的 setter，得绕过实例上被它接管的那一层写值，再派 input 事件。 */
async function typeInto(el: HTMLInputElement | HTMLTextAreaElement, value: string): Promise<void> {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  el.focus()
  Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value)
  el.setSelectionRange(value.length, value.length)
  await act(async () => {
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await settle()
}

describe('mention 的输入宿主可换', () => {
  it('不写 as 时渲染成 input，照旧是组合框', async () => {
    const el = await mount()
    expect(el.tagName).toBe('INPUT')
    expect(el.getAttribute('role')).toBe('combobox')
  })

  it('as="textarea" 渲染成 textarea：撤掉 type、组合框角色与 aria-expanded，换多行布局', async () => {
    const el = await mount('textarea')
    expect(el.tagName).toBe('TEXTAREA')
    expect(el.hasAttribute('type')).toBe(false)
    expect(el.hasAttribute('role')).toBe(false)
    expect(el.hasAttribute('aria-expanded')).toBe(false)
    expect(el.getAttribute('data-xh-field-layout')).toBe('textarea')
  })

  it('as="textarea"：换行之后照样触发、插入；光标紧贴提及按 Backspace 整条删掉', async () => {
    const el = await mount('textarea')
    await typeInto(el, '第一行\n@li')
    expect(key(el, 'Enter').defaultPrevented).toBe(true)
    await settle()
    expect(latest).toBe('第一行\n@李雷 ')

    el.setSelectionRange(7, 7)
    expect(key(el, 'Backspace').defaultPrevented).toBe(true)
    await settle()
    expect(latest).toBe('第一行\n ')
  })
})
