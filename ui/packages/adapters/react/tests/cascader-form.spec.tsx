// @vitest-environment jsdom
import type { CascaderSchema } from '@xihan-ui/headless'
import type { Root } from 'react-dom/client'
import type { CascaderRootSlotProps } from '../src/components/cascader/cascader'
import { act, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { XhCascaderRoot } from '../src'

const paths = [['华东', 'a,b'], ['a', 'b,c'], ['a,b', 'c']]
let root: Root | undefined
let host: HTMLElement | undefined

function mount(initial: Partial<CascaderSchema['props']> = {}) {
  let props = { name: 'paths', collection: [], ...initial }
  let current: CascaderRootSlotProps
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  const render = () => act(() => root!.render(
    <StrictMode>
      <form id="ancestor">
        <XhCascaderRoot {...props}>
          {(api) => {
            current = api
            return null
          }}
        </XhCascaderRoot>
      </form>
      <form id="external" />
    </StrictMode>,
  ))
  render()
  const form = (id = 'ancestor') => host!.querySelector<HTMLFormElement>(`#${id}`)!
  return {
    api: () => current!,
    form,
    values: (id = 'ancestor') => new FormData(form(id)).getAll('paths'),
    update: (next: Partial<CascaderSchema['props']>) => {
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

describe('react 级联结构化表单', () => {
  it.each([false, true])('multiple=%s：严格模式按路径提交，不按空候选树清值', (multiple) => {
    const view = mount({ multiple, defaultValue: multiple ? paths : paths[0] })
    expect(view.values()).toEqual((multiple ? paths : [paths[0]]).map(path => JSON.stringify(path)))
    act(() => view.api().clear())
    expect(view.values()).toEqual([])
    expect(host!.querySelectorAll('[data-part="hidden-input"]')).toHaveLength(0)
  })

  it('只读保留字段，整体禁用和无 name 排除提交', () => {
    const view = mount({ defaultValue: paths[0], readOnly: true })
    expect(view.values()).toEqual([JSON.stringify(paths[0])])
    view.update({ disabled: true })
    expect(view.values()).toEqual([])
    view.update({ disabled: false, name: undefined })
    expect(view.values()).toEqual([])
  })

  it('外部 form 在空值后重置，祖先和取消 reset 不干扰', () => {
    const view = mount({ defaultValue: paths[0], form: 'external' })
    act(() => view.api().clear())
    act(() => view.form().reset())
    expect(view.values('external')).toEqual([])
    const cancel = (event: Event) => event.preventDefault()
    view.form('external').addEventListener('reset', cancel)
    act(() => view.form('external').reset())
    expect(view.values('external')).toEqual([])
    view.form('external').removeEventListener('reset', cancel)
    act(() => view.form('external').reset())
    expect(view.values('external')).toEqual([JSON.stringify(paths[0])])
    expect(view.values()).toEqual([])
    view.update({ form: 'missing' })
    act(() => view.api().clear())
    act(() => {
      view.form().reset()
      view.form('external').reset()
    })
    expect(view.api().value).toEqual([])
  })

  it('受控无默认值不通知，声明默认路径只通知一次', () => {
    const changed = vi.fn()
    const view = mount({ value: paths[1], onValueChange: changed })
    act(() => view.form().reset())
    expect(changed).not.toHaveBeenCalled()
    view.update({ defaultValue: paths[0] })
    act(() => view.form().reset())
    expect(changed).toHaveBeenCalledExactlyOnceWith({ value: [paths[0]] })
    expect(view.values()).toEqual([JSON.stringify(paths[1])])
  })

  it('sSR 原生字段保持 JSON 结构并正确转义', () => {
    const value = [['<"&', 'a,b'], ['']]
    const html = renderToString(<XhCascaderRoot name="paths" multiple defaultValue={value} />)
    const template = document.createElement('template')
    template.innerHTML = html
    expect([...template.content.querySelectorAll<HTMLInputElement>('input')].map(input => JSON.parse(input.value))).toEqual(value)
  })
})
