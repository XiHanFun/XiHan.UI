// @vitest-environment jsdom
import type { CascaderSchema } from '@xihan-ui/headless'
import type { XhCascaderElement } from '../src/elements/cascader'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

const paths = [['华东', 'a,b'], ['a', 'b,c'], ['a,b', 'c']]

async function tick() {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
}

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

async function mount(initial: Partial<CascaderSchema['props']> = {}) {
  const ancestor = document.createElement('form')
  ancestor.id = 'ancestor'
  const external = document.createElement('form')
  external.id = 'external'
  const element = document.createElement('xh-cascader') as XhCascaderElement
  Object.assign(element, { name: 'paths', collection: [], ...initial })
  element.innerHTML = `
    <button data-xh-part="trigger">选择</button>
    <button data-xh-part="clear-trigger">清空</button>
    <div data-xh-part="positioner"><div data-xh-part="content"></div></div>`
  ancestor.append(element)
  document.body.append(ancestor, external)
  await tick()
  return {
    element,
    ancestor,
    external,
    values: (form = ancestor) => new FormData(form).getAll('paths'),
    clear: async () => {
      element.querySelector<HTMLElement>('[data-part="clear-trigger"]')!.click()
      await tick()
    },
  }
}

describe('web Components 级联结构化表单', () => {
  it.each([false, true])('multiple=%s：空候选树保留每条已知路径，清空无空字段', async (multiple) => {
    const view = await mount({ multiple, defaultValue: multiple ? paths : paths[0] })
    expect(view.values()).toEqual((multiple ? paths : [paths[0]]).map(path => JSON.stringify(path)))
    await view.clear()
    expect(view.values()).toEqual([])
    expect(view.element.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
  })

  it('只读保留字段，禁用与无 name 排除提交', async () => {
    const view = await mount({ defaultValue: paths[0], readOnly: true })
    expect(view.values()).toEqual([JSON.stringify(paths[0])])
    view.element.disabled = true
    await tick()
    expect(view.values()).toEqual([])
    view.element.disabled = false
    view.element.name = undefined
    await tick()
    expect(view.values()).toEqual([])
  })

  it('外部 form 在零路径后可重置，祖先与取消 reset 不修改值', async () => {
    const view = await mount({ defaultValue: paths[0], form: 'external' })
    await view.clear()
    view.ancestor.reset()
    await tick()
    expect(view.values(view.external)).toEqual([])
    const cancel = (event: Event) => event.preventDefault()
    view.external.addEventListener('reset', cancel)
    view.external.reset()
    await tick()
    expect(view.values(view.external)).toEqual([])
    view.external.removeEventListener('reset', cancel)
    view.external.reset()
    await tick()
    expect(view.values(view.external)).toEqual([JSON.stringify(paths[0])])
    expect(view.values()).toEqual([])
    view.element.form = 'missing'
    await view.clear()
    view.ancestor.reset()
    view.external.reset()
    await tick()
    expect(view.element.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
  })

  it('受控重置只通知默认路径，不暗改业务值', async () => {
    const view = await mount({ value: paths[1] })
    const changed = vi.fn()
    view.element.addEventListener('value-change', changed)
    view.ancestor.reset()
    await tick()
    expect(changed).not.toHaveBeenCalled()
    view.element.defaultValue = paths[0]
    await tick()
    view.ancestor.reset()
    await tick()
    expect(changed).toHaveBeenCalledTimes(1)
    expect((changed.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: [paths[0]] })
    expect(view.values()).toEqual([JSON.stringify(paths[1])])
  })

  it('断连清理自动字段，重连不重复提交路径', async () => {
    const view = await mount({ multiple: true, defaultValue: paths })
    view.element.remove()
    await tick()
    expect(view.element.querySelectorAll('input[type="hidden"]')).toHaveLength(0)
    view.ancestor.append(view.element)
    await tick()
    expect(view.values()).toEqual(paths.map(path => JSON.stringify(path)))
  })
})
