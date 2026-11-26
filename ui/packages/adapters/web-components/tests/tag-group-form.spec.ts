// @vitest-environment jsdom
// TagGroup 的表单出口在 Web Components 上的接线：选中值按逗号拼成一串随表单提交。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Host extends HTMLElement {
  updateComplete: Promise<unknown>
  [key: string]: unknown
}

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: Host): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

async function mountInForm(tag: string, props: Record<string, unknown>): Promise<{ form: HTMLFormElement, el: Host }> {
  const form = document.createElement('form')
  const el = document.createElement(tag) as Host
  Object.assign(el, props)
  form.append(el)
  document.body.append(form)
  await settle(el)
  return { form, el }
}

describe('tag-group name', () => {
  it('选中值按逗号拼成一串随表单提交', async () => {
    const { form } = await mountInForm('xh-tag-group', {
      name: 'stack',
      selectionMode: 'multiple',
      defaultValue: ['vue', 'svelte'],
      collection: [{ value: 'vue' }, { value: 'react' }, { value: 'svelte' }],
    })
    expect([...new FormData(form).entries()]).toEqual([['stack', 'vue,svelte']])
  })
})
