// @vitest-environment jsdom
import type { TransferSchema } from '@xihan-ui/headless'
import type { Root } from 'react-dom/client'
import type { TransferRootSlotProps } from '../src/components/transfer/transfer'
import { act, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhTransferRoot } from '../src'

const collection = ['a,b', 'a', 'b', 'locked'].map(value => ({ value, label: value, disabled: value === 'locked' }))
let root: Root | undefined
let host: HTMLElement | undefined

function mount(initial: Partial<TransferSchema['props']> = {}) {
  let props = { name: 'members', collection, ...initial }
  let current: TransferRootSlotProps
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  const render = () => act(() => root!.render(
    <StrictMode>
      <form id="ancestor">
        <XhTransferRoot {...props}>
          {(api) => {
            current = api
            return null
          }}
        </XhTransferRoot>
      </form>
      <form id="external" />
    </StrictMode>,
  ))
  render()
  const form = (id = 'ancestor') => host!.querySelector<HTMLFormElement>(`#${id}`)!
  return {
    api: () => current!,
    form,
    values: (id = 'ancestor') => new FormData(form(id)).getAll('members'),
    update: (next: Partial<TransferSchema['props']>) => {
      props = { ...props, ...next }
      render()
    },
  }
}

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = undefined
  host = undefined
})

describe('react 穿梭框原生表单', () => {
  it('strictMode 下只提交目标重复字段，逗号值不碰撞，清空无空字段', () => {
    const view = mount({ defaultValue: ['a,b', 'a'], defaultSelection: ['b'] })
    expect(view.values()).toEqual(['a,b', 'a'])
    act(() => view.api().move('target'))
    expect(view.values()).toEqual(['a,b', 'a', 'b'])
    act(() => view.api().setValue([]))
    expect(view.values()).toEqual([])
    expect(host!.querySelectorAll('[data-part="hidden-input"]')).toHaveLength(0)
  })

  it('只读和禁用条目照常提交，组件禁用与未命名不提交', () => {
    const view = mount({ defaultValue: ['locked'], readOnly: true })
    expect(view.values()).toEqual(['locked'])
    view.update({ disabled: true })
    expect(view.values()).toEqual([])
    view.update({ disabled: false, name: undefined })
    expect(view.values()).toEqual([])
    view.update({ name: 'members' })
    expect(view.values()).toEqual(['locked'])
  })

  it('重置恢复默认目标和勾选，取消 reset 时不改值', () => {
    const view = mount({ defaultValue: ['a,b'], defaultSelection: ['b'] })
    act(() => {
      view.api().setValue(['a'])
      view.api().setSelection(['a'])
    })
    const cancel = (event: Event) => event.preventDefault()
    view.form().addEventListener('reset', cancel)
    act(() => view.form().reset())
    expect(view.values()).toEqual(['a'])
    view.form().removeEventListener('reset', cancel)
    act(() => view.form().reset())
    expect(view.values()).toEqual(['a,b'])
    expect(view.api().selection).toEqual(['b'])
  })

  it('外部 form 优先，零值可重置，动态失效关联不回退祖先', () => {
    const view = mount({ defaultValue: ['a,b'], form: 'external' })
    expect(view.values()).toEqual([])
    expect(view.values('external')).toEqual(['a,b'])
    act(() => view.api().setValue([]))
    act(() => view.form().reset())
    expect(view.values('external')).toEqual([])
    act(() => view.form('external').reset())
    expect(view.values('external')).toEqual(['a,b'])
    view.update({ form: 'missing' })
    act(() => view.api().setValue(['a']))
    act(() => {
      view.form().reset()
      view.form('external').reset()
    })
    expect(view.api().value).toEqual(['a'])
    expect(view.values()).toEqual([])
    expect(view.values('external')).toEqual([])
  })

  it('受控重置只发声明默认意图，不重复发回调或抹业务值', () => {
    const changed = vi.fn()
    const view = mount({ value: ['a'], onValueChange: changed })
    act(() => view.form().reset())
    expect(changed).not.toHaveBeenCalled()
    view.update({ defaultValue: ['a,b'] })
    act(() => view.form().reset())
    expect(changed).toHaveBeenCalledExactlyOnceWith({ value: ['a,b'] })
    expect(view.values()).toEqual(['a'])
  })

  it('服务端渲染直接包含重复字段且正确转义原值', () => {
    const html = renderToString(<XhTransferRoot name="members" form="external" defaultValue={['a,b', '<&']} />)
    const template = document.createElement('template')
    template.innerHTML = html
    const inputs = [...template.content.querySelectorAll<HTMLInputElement>('input')]
    expect(inputs.map(input => input.value)).toEqual(['a,b', '<&'])
    expect(inputs.every(input => input.type === 'hidden' && input.name === 'members' && input.getAttribute('form') === 'external')).toBe(true)
  })
})
