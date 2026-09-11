import type { ComponentType } from 'react'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { XhComboboxHiddenInput, XhComboboxRoot, XhTreeSelectHiddenInput, XhTreeSelectRoot } from '../src'

const cases = [
  { name: '组合框', Root: XhComboboxRoot, Hidden: XhComboboxHiddenInput },
  { name: '树选择', Root: XhTreeSelectRoot, Hidden: XhTreeSelectHiddenInput },
]
let root: ReturnType<typeof createRoot> | null = null
let host: HTMLDivElement | null = null

beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true))

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
  vi.unstubAllGlobals()
})

describe.each(cases)('$name 重复同名字段', ({ Root, Hidden }) => {
  function mount(initial: Record<string, unknown>) {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    let props = { name: 'pick', ...initial }
    let clear = (): void => {}
    const render = (): void => {
      act(() => root!.render(
        <>
          <form id="outside" />
          <form id="inside">
            <fieldset>
              {createElement(Root as ComponentType<Record<string, unknown>>, {
                ...props,
                children: (api: { clear: () => void }) => {
                  clear = api.clear
                  return <Hidden />
                },
              })}
            </fieldset>
          </form>
        </>,
      ))
    }
    render()
    return {
      inside: host.querySelector<HTMLFormElement>('#inside')!,
      outside: host.querySelector<HTMLFormElement>('#outside')!,
      set: (next: Record<string, unknown>) => {
        props = { ...props, ...next }
        render()
      },
      clear: () => act(() => clear()),
    }
  }

  it('含逗号值逐个提交，受控替换不碰撞，清空不生成空字符串字段', () => {
    const state = mount({ multiple: true, value: ['a,b', 'c'] })
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b', 'c'])
    state.set({ value: ['a', 'b,c'] })
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a', 'b,c'])
    state.set({ value: [] })
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
  })

  it('单选不拆分逗号，disabled 与 fieldset 禁用不提交，readonly 仍提交', () => {
    const state = mount({ defaultValue: 'a,b', readOnly: true })
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b'])
    state.set({ disabled: true })
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    state.set({ disabled: false })
    state.inside.querySelector('fieldset')!.disabled = true
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    state.inside.querySelector('fieldset')!.disabled = false
    state.set({ name: undefined })
    expect([...new FormData(state.inside)]).toEqual([])
  })

  it.each([undefined, 'outside'])('form=%s：清空后原生 reset 恢复每个默认值', (form) => {
    const state = mount({ multiple: true, defaultValue: ['a,b', 'c'], form })
    const owner = form ? state.outside : state.inside
    expect(new FormData(owner).getAll('pick')).toEqual(['a,b', 'c'])
    if (form)
      expect(new FormData(state.inside).getAll('pick')).toEqual([])
    state.clear()
    expect(new FormData(owner).getAll('pick')).toEqual([])
    act(() => owner.reset())
    expect(new FormData(owner).getAll('pick')).toEqual(['a,b', 'c'])
  })

  it('受控值在 reset 后保持；显式不存在的表单不回退祖先', () => {
    const state = mount({ multiple: true, value: ['a,b'], defaultValue: ['c'] })
    act(() => state.inside.reset())
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b'])
    state.set({ form: 'missing' })
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    expect(new FormData(state.outside).getAll('pick')).toEqual([])
  })
})
