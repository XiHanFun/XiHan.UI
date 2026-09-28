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
    form.defaultValues = createFormPathRecord<unknown>([
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

describe('fieldArray 命令式方法', () => {
  it('insert 插在指定位置、move 一步挪到任意位置，都经 value-change 报出', async () => {
    const array = document.createElement('xh-field-array') as XhFieldArrayElement
    const onValueChange = vi.fn()
    array.movable = true
    array.defaultValue = ['甲', '丙']
    array.createItem = () => '空'
    array.addEventListener('value-change', event => onValueChange((event as CustomEvent).detail))
    array.innerHTML = '<div data-xh-part="root"></div>'
    document.body.append(array)
    await tick()

    array.insert(1, '乙')
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['甲', '乙', '丙'] })
    array.insert(0)
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['空', '甲', '乙', '丙'] })
    array.move(3, 0)
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['丙', '空', '甲', '乙'] })
    array.removeItem(1)
    array.moveDown(0)
    expect(onValueChange).toHaveBeenLastCalledWith({ value: ['甲', '丙', '乙'] })
  })

  it('还没进文档时命令式接口明确报错', () => {
    const array = document.createElement('xh-field-array') as XhFieldArrayElement
    expect(() => array.insert(0)).toThrow('还没进文档')
  })
})
