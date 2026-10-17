// @vitest-environment jsdom

import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface TagsInputHost extends HTMLElement {
  updateComplete: Promise<unknown>
  label?: string
  defaultValue?: string[]
  editable?: boolean
}

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
  document.body.replaceChildren()
})

async function settle(el: TagsInputHost): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(props: Partial<TagsInputHost>, inner = ''): TagsInputHost {
  const el = document.createElement('xh-tags-input') as TagsInputHost
  Object.assign(el, props)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(el: Element, name: string): HTMLElement | null {
  return el.querySelector<HTMLElement>(`[data-scope="tags-input"][data-part="${name}"]`)
}

/** 盒里的标签值与它们的文本，按文档序。 */
function tags(el: Element): string[][] {
  return [...el.querySelectorAll('[data-scope="tags-input"][data-part="item"]')]
    .map(item => [item.getAttribute('value') ?? '', item.querySelector('[data-xh-part="item-text"]')?.textContent ?? ''])
}

describe('xh-tags-input 生成结构', () => {
  it('什么都不写：按当前值铺标签，回车加一个、删除钮删一个，标签跟着值走', async () => {
    const records: DiagnosticRecord[] = []
    stops.push(onDiagnostic(record => records.push(record)))
    const el = mount({ label: '技术栈', defaultValue: ['vue'] })
    await settle(el)
    expect(tags(el)).toEqual([['vue', 'vue']])
    expect(part(el, 'label')!.getAttribute('for')).toBe(part(el, 'input')!.id)

    const input = part(el, 'input') as HTMLInputElement
    input.focus()
    input.value = 'react'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await settle(el)
    expect(tags(el)).toEqual([['vue', 'vue'], ['react', 'react']])

    el.querySelector<HTMLButtonElement>('[data-scope="tags-input"][data-part="item"][data-value="vue"] [data-scope="tag"][data-part="close-trigger"]')!.click()
    await settle(el)
    expect(tags(el)).toEqual([['react', 'react']])
    expect(records.filter(record => record.code.startsWith('wc.'))).toEqual([])
  })

  it('开了 editable：每个标签带一个编辑框', async () => {
    const el = mount({ defaultValue: ['vue', 'react'], editable: true })
    await settle(el)

    expect(el.querySelectorAll('[data-scope="tags-input"][data-part="item-input"]')).toHaveLength(2)
  })

  it('slot="item:<值>" 接管那个标签的文本', async () => {
    const el = mount({ defaultValue: ['vue', 'react'] }, '<b slot="item:vue">Vue 3</b>')
    await settle(el)

    expect(tags(el)).toEqual([['vue', 'Vue 3'], ['react', 'react']])
  })
})
