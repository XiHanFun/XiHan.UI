import type { XhFieldArrayElement } from '../src/elements/field-array'
import type { XhFormElement } from '../src/elements/form'
// @vitest-environment jsdom
import { createFormPathRecord, getFormPathValue } from '@xihan-ui/headless'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

async function tick(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
}

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

describe('fieldArray 接入 FormPath', () => {
  it('只接到最近 xh-form，换序由 Headless 迁移 Form 值与子字段路径', async () => {
    const users = ['users'] as const
    const middleEmail = ['users', 1, 'email'] as const
    const form = document.createElement('xh-form') as XhFormElement
    const array = document.createElement('xh-field-array') as XhFieldArrayElement
    const onValuesChange = vi.fn()
    form.defaultValues = createFormPathRecord([
      [users, [{ id: 'a' }, { id: 'b' }]],
      [['users', 0, 'email'], 'a@example.com'],
      [middleEmail, 'b@example.com'],
    ])
    form.addEventListener('values-change', event => onValuesChange((event as CustomEvent).detail))
    array.name = users
    array.movable = true
    array.innerHTML = `
      <div data-xh-part="root">
        <div data-xh-part="item" index="0"><button data-xh-part="move-up-trigger">上移</button></div>
        <div data-xh-part="item" index="1"><button data-xh-part="move-up-trigger">上移</button></div>
      </div>`
    form.innerHTML = '<form data-xh-part="root"></form>'
    form.querySelector('form')!.append(array)
    document.body.append(form)
    await tick()

    array.querySelector<HTMLButtonElement>('[data-part="move-up-trigger"][data-index="1"]')!.click()
    await tick()
    const values = onValuesChange.mock.calls.at(-1)?.[0].values
    expect(getFormPathValue(values, users)).toEqual([{ id: 'b' }, { id: 'a' }])
    expect(getFormPathValue(values, ['users', 0, 'email'])).toBe('b@example.com')
    expect(getFormPathValue(values, middleEmail)).toBe('a@example.com')
  })
})
