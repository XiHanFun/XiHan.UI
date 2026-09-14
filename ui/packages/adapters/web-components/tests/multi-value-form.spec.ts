// @vitest-environment jsdom
import type { XhComboboxElement } from '../src/elements/combobox'
import type { XhTreeSelectElement } from '../src/elements/tree-select'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe.each(['combobox', 'tree-select'])('%s 重复同名字段', (scope) => {
  async function mount(initial: Record<string, unknown>) {
    document.body.innerHTML = '<form id="outside"></form><form id="inside"><fieldset></fieldset></form>'
    const inside = document.querySelector<HTMLFormElement>('#inside')!
    const outside = document.querySelector<HTMLFormElement>('#outside')!
    const element = document.createElement(`xh-${scope}`) as XhComboboxElement | XhTreeSelectElement
    Object.assign(element, { name: 'pick', ...initial })
    element.innerHTML = scope === 'combobox'
      ? '<div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input"><button data-xh-part="clear-trigger">清空</button></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div><input data-xh-part="hidden-input"></div>'
      : '<div data-xh-part="root"><button data-xh-part="trigger">选择</button><button data-xh-part="clear-trigger">清空</button><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree"></div></div></div><input data-xh-part="hidden-input"></div>'
    inside.querySelector('fieldset')!.append(element)
    await settle()
    return {
      element,
      inside,
      outside,
      set: async (props: Record<string, unknown>) => {
        Object.assign(element, props)
        await settle()
      },
      clear: async () => {
        element.querySelector<HTMLElement>('[data-xh-part="clear-trigger"]')!.click()
        await settle()
      },
    }
  }

  it('含逗号值逐个提交，受控替换不碰撞，清空不提交空字符串', async () => {
    const state = await mount({ multiple: true, value: ['a,b', 'c'] })
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b', 'c'])
    await state.set({ value: ['a', 'b,c'] })
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a', 'b,c'])
    await state.set({ value: [] })
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    expect(state.element.querySelectorAll('[data-xh-part="hidden-input"]')).toHaveLength(1)
  })

  it('单选不拆分逗号，disabled 与 fieldset 禁用不提交，readonly 仍提交', async () => {
    const state = await mount({ defaultValue: 'a,b', readOnly: true })
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b'])
    await state.set({ disabled: true })
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    await state.set({ disabled: false })
    state.inside.querySelector('fieldset')!.disabled = true
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    state.inside.querySelector('fieldset')!.disabled = false
    await state.set({ name: undefined })
    expect([...new FormData(state.inside)]).toEqual([])
  })

  it.each([undefined, 'outside'])('form=%s：清空后原生 reset 恢复每个默认值', async (form) => {
    const state = await mount({ multiple: true, defaultValue: ['a,b', 'c'], form })
    const owner = form ? state.outside : state.inside
    expect(new FormData(owner).getAll('pick')).toEqual(['a,b', 'c'])
    if (form)
      expect(new FormData(state.inside).getAll('pick')).toEqual([])
    await state.clear()
    expect(new FormData(owner).getAll('pick')).toEqual([])
    owner.reset()
    await settle()
    expect(new FormData(owner).getAll('pick')).toEqual(['a,b', 'c'])
  })

  it('受控值在 reset 后保持；显式不存在的表单不回退祖先', async () => {
    const state = await mount({ multiple: true, value: ['a,b'], defaultValue: ['c'] })
    state.inside.reset()
    await settle()
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b'])
    await state.set({ form: 'missing' })
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    expect(new FormData(state.outside).getAll('pick')).toEqual([])
  })

  it('移除或替换作者出口时清理生成字段，断连后不遗留重复项', async () => {
    const state = await mount({ multiple: true, value: ['a,b', 'c'] })
    const anchor = state.element.querySelector<HTMLInputElement>('[data-xh-part="hidden-input"]')!
    anchor.remove()
    await settle()
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    const replacement = document.createElement('input')
    replacement.dataset.xhPart = 'hidden-input'
    state.element.querySelector('[data-xh-part="root"]')!.append(replacement)
    await settle()
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b', 'c'])
    state.element.remove()
    await settle()
    expect(state.element.querySelectorAll('[data-part="hidden-input"]')).toHaveLength(0)
    state.inside.querySelector('fieldset')!.append(state.element)
    await settle()
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b', 'c'])
  })
})
