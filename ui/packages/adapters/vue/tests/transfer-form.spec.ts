// @vitest-environment jsdom
import type { TransferSchema } from '@xihan-ui/headless'
import type { App } from 'vue'
import type { TransferRootSlotProps } from '../src/components/transfer/transfer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { XhTransferRoot } from '../src'

const collection = ['a,b', 'a', 'b', 'locked'].map(value => ({ value, label: value, disabled: value === 'locked' }))
let app: App | undefined
let host: HTMLElement | undefined

async function tick() {
  await nextTick()
  await nextTick()
}

async function mount(initial: Partial<TransferSchema['props']> = {}) {
  const props = ref({ name: 'members', collection, ...initial })
  let current: TransferRootSlotProps
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h('div', [
    h('form', { id: 'ancestor' }, [h(XhTransferRoot, props.value, {
      default: (api: TransferRootSlotProps) => {
        current = api
        return []
      },
    })]),
    h('form', { id: 'external' }),
  ]) })
  app.mount(host)
  await tick()
  const form = (id = 'ancestor') => host!.querySelector<HTMLFormElement>(`#${id}`)!
  return {
    api: () => current!,
    form,
    props,
    values: (id = 'ancestor') => new FormData(form(id)).getAll('members'),
    update: async (next: Partial<TransferSchema['props']>) => {
      props.value = { ...props.value, ...next }
      await tick()
    },
  }
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = undefined
  host = undefined
})

describe('vue 穿梭框原生表单', () => {
  it('服务端直接渲染重复字段并保留转义值', async () => {
    const html = await renderToString(createApp({ render: () => h(XhTransferRoot, {
      name: 'members',
      form: 'external',
      defaultValue: ['a,b', '<&'],
    }) }))
    const template = document.createElement('template')
    template.innerHTML = html
    const inputs = [...template.content.querySelectorAll<HTMLInputElement>('input')]
    expect(inputs.map(input => input.value)).toEqual(['a,b', '<&'])
    expect(inputs.every(input => input.type === 'hidden' && input.name === 'members' && input.getAttribute('form') === 'external')).toBe(true)
  })

  it('目标每值一个重复字段，逗号值不碰撞，源侧勾选不提交', async () => {
    const view = await mount({ defaultValue: ['a,b', 'a'], defaultSelection: ['b'] })
    expect(view.values()).toEqual(['a,b', 'a'])
    view.api().move('target')
    await tick()
    expect(view.values()).toEqual(['a,b', 'a', 'b'])
    view.api().setValue([])
    await tick()
    expect(view.values()).toEqual([])
    expect(host!.querySelectorAll('[data-part="hidden-input"]')).toHaveLength(0)
  })

  it('只读与禁用条目保留目标值，整体 disabled 和无 name 不提交', async () => {
    const view = await mount({ defaultValue: ['locked'], readOnly: true })
    expect(view.values()).toEqual(['locked'])
    await view.update({ disabled: true })
    expect(view.values()).toEqual([])
    await view.update({ disabled: false, name: undefined })
    expect(view.values()).toEqual([])
    await view.update({ name: 'members' })
    expect(view.values()).toEqual(['locked'])
  })

  it('原生重置恢复默认目标和勾选，被取消时保持当前值', async () => {
    const view = await mount({ defaultValue: ['a,b'], defaultSelection: ['b'] })
    view.api().setValue(['a'])
    view.api().setSelection(['a'])
    await tick()
    const cancel = (event: Event) => event.preventDefault()
    view.form().addEventListener('reset', cancel)
    view.form().reset()
    await tick()
    expect(view.values()).toEqual(['a'])
    view.form().removeEventListener('reset', cancel)
    view.form().reset()
    await tick()
    expect(view.values()).toEqual(['a,b'])
    expect(view.api().selection).toEqual(['b'])
  })

  it('显式外部 form 接收字段与重置，空目标仍可恢复，失效 ID 不回退', async () => {
    const view = await mount({ defaultValue: ['a,b'], form: 'external' })
    expect(view.values()).toEqual([])
    expect(view.values('external')).toEqual(['a,b'])
    view.api().setValue([])
    await tick()
    view.form().reset()
    await tick()
    expect(view.values('external')).toEqual([])
    view.form('external').reset()
    await tick()
    expect(view.values('external')).toEqual(['a,b'])
    await view.update({ form: 'missing' })
    view.api().setValue(['a'])
    await tick()
    view.form().reset()
    view.form('external').reset()
    await tick()
    expect(view.api().value).toEqual(['a'])
    expect(view.values()).toEqual([])
    expect(view.values('external')).toEqual([])
  })

  it('受控重置仅按声明默认值通知，业务未回写时提交值不变', async () => {
    const changed = vi.fn()
    const view = await mount({ value: ['a'], onValueChange: changed })
    view.form().reset()
    await tick()
    expect(changed).not.toHaveBeenCalled()
    await view.update({ defaultValue: ['a,b'] })
    view.form().reset()
    await tick()
    expect(changed).toHaveBeenLastCalledWith({ value: ['a,b'] })
    expect(view.values()).toEqual(['a'])
  })
})
