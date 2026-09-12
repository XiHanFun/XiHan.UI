// @vitest-environment jsdom
import type { TransferSchema } from '@xihan-ui/headless'
import type { XhTransferElement } from '../src/elements/transfer'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

const collection = ['a,b', 'a', 'b', 'locked'].map(value => ({ value, label: value, disabled: value === 'locked' }))

async function tick() {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
}

beforeAll(() => defineXhElements())
afterEach(() => {
  document.body.innerHTML = ''
})

async function mount(initial: Partial<TransferSchema['props']> = {}) {
  const ancestor = document.createElement('form')
  ancestor.id = 'ancestor'
  const external = document.createElement('form')
  external.id = 'external'
  const element = document.createElement('xh-transfer') as XhTransferElement
  Object.assign(element, { name: 'members', collection, ...initial })
  element.innerHTML = `
    <div data-xh-part="source-panel"><div data-xh-part="list">
      ${collection.map(item => `<div data-xh-part="item" value="${item.value}">${item.label}</div>`).join('')}
    </div></div>
    <button data-xh-part="to-target-trigger"></button>
    <button data-xh-part="to-source-trigger"></button>
    <div data-xh-part="target-panel"><div data-xh-part="list">
      ${collection.map(item => `<div data-xh-part="item" value="${item.value}">${item.label}</div>`).join('')}
    </div></div>`
  ancestor.append(element)
  document.body.append(ancestor, external)
  await tick()
  return {
    element,
    ancestor,
    external,
    values: (form = ancestor) => new FormData(form).getAll('members'),
    move: async (values: string[], to: 'source' | 'target') => {
      const from = to === 'source' ? 'target' : 'source'
      for (const value of values) {
        element.querySelector<HTMLElement>(`[data-part='item'][data-side='${from}'][data-value='${value}']`)!.click()
        await tick()
      }
      element.querySelector<HTMLElement>(`[data-part='to-${to}-trigger']`)!.click()
      await tick()
    },
  }
}

describe('web Components 穿梭框原生表单', () => {
  it('自动装配重复字段，仅目标值提交，逗号不碰撞且清空无空字段', async () => {
    const view = await mount({ defaultValue: ['a,b', 'a'] })
    expect(view.values()).toEqual(['a,b', 'a'])
    await view.move(['b'], 'target')
    expect(view.values()).toEqual(['a,b', 'a', 'b'])
    await view.move(['a,b', 'a', 'b'], 'source')
    expect(view.values()).toEqual([])
    expect(view.element.querySelectorAll('input')).toHaveLength(0)
  })

  it('只读和禁用条目保留目标值，整体禁用与未命名不提交', async () => {
    const view = await mount({ defaultValue: ['locked'], readOnly: true })
    expect(view.values()).toEqual(['locked'])
    view.element.disabled = true
    await tick()
    expect(view.values()).toEqual([])
    view.element.disabled = false
    view.element.name = undefined
    await tick()
    expect(view.values()).toEqual([])
    view.element.name = 'members'
    await tick()
    expect(view.values()).toEqual(['locked'])
  })

  it('重置恢复默认目标，取消 reset 保留当前值', async () => {
    const view = await mount({ defaultValue: ['a,b'] })
    await view.move(['a,b'], 'source')
    const cancel = (event: Event) => event.preventDefault()
    view.ancestor.addEventListener('reset', cancel)
    view.ancestor.reset()
    await tick()
    expect(view.values()).toEqual([])
    view.ancestor.removeEventListener('reset', cancel)
    view.ancestor.reset()
    await tick()
    expect(view.values()).toEqual(['a,b'])
  })

  it('外部 form 覆盖祖先，零值仍可恢复，失效关联不回退', async () => {
    const view = await mount({ defaultValue: ['a,b'], form: 'external' })
    expect(view.values()).toEqual([])
    expect(view.values(view.external)).toEqual(['a,b'])
    await view.move(['a,b'], 'source')
    view.ancestor.reset()
    await tick()
    expect(view.values(view.external)).toEqual([])
    view.external.reset()
    await tick()
    expect(view.values(view.external)).toEqual(['a,b'])
    view.element.form = 'missing'
    await view.move(['a,b'], 'source')
    view.ancestor.reset()
    view.external.reset()
    await tick()
    expect(view.element.querySelectorAll('input')).toHaveLength(0)
  })

  it('受控重置只通知声明默认值，不暗改业务数据', async () => {
    const view = await mount({ value: ['a'] })
    const changed = vi.fn()
    view.element.addEventListener('value-change', changed)
    view.ancestor.reset()
    await tick()
    expect(changed).not.toHaveBeenCalled()
    view.element.defaultValue = ['a,b']
    await tick()
    view.ancestor.reset()
    await tick()
    expect(changed).toHaveBeenCalledTimes(1)
    expect((changed.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: ['a,b'] })
    expect(view.values()).toEqual(['a'])
  })

  it('断连移除宿主管理字段，重连仅恢复一份默认值', async () => {
    const view = await mount({ defaultValue: ['a,b', 'a'] })
    view.element.remove()
    await tick()
    expect(view.element.querySelectorAll('input')).toHaveLength(0)
    view.ancestor.append(view.element)
    await tick()
    expect(view.values()).toEqual(['a,b', 'a'])
    expect(view.element.querySelectorAll('input')).toHaveLength(2)
  })
})
