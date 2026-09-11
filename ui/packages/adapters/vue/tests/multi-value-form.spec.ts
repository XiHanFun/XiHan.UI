// @vitest-environment jsdom
import type { App, Component } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import { XhComboboxHiddenInput, XhComboboxRoot, XhTreeSelectHiddenInput, XhTreeSelectRoot } from '../src'

const cases: { name: string, root: Component, hidden: Component }[] = [
  { name: '组合框', root: XhComboboxRoot, hidden: XhComboboxHiddenInput },
  { name: '树选择', root: XhTreeSelectRoot, hidden: XhTreeSelectHiddenInput },
]
let app: App | null = null
let container: HTMLDivElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  container?.remove()
  app = null
  container = null
})

describe.each(cases)('$name 重复同名字段', ({ root, hidden }) => {
  async function mount(initial: Record<string, unknown>) {
    container = document.createElement('div')
    document.body.append(container)
    const props = reactive({ name: 'pick', ...initial })
    let clear = (): void => {}
    app = createApp({ render: () => [
      h('form', { id: 'outside' }),
      h('form', { id: 'inside' }, [h('fieldset', null, [
        h(root, props, { default: (api: { clear: () => void }) => {
          clear = api.clear
          return h(hidden)
        } }),
      ])]),
    ] })
    app.mount(container)
    await settle()
    const inside = container.querySelector<HTMLFormElement>('#inside')!
    const outside = container.querySelector<HTMLFormElement>('#outside')!
    return { props, inside, outside, clear: () => clear() }
  }

  it('含逗号值逐个提交，受控替换不碰撞，清空不生成空字符串字段', async () => {
    const state = await mount({ multiple: true, value: ['a,b', 'c'] })
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b', 'c'])
    Object.assign(state.props, { value: ['a', 'b,c'] })
    await settle()
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a', 'b,c'])
    Object.assign(state.props, { value: [] })
    await settle()
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
  })

  it('单选不拆分逗号，disabled 与 fieldset 禁用不提交，readonly 仍提交', async () => {
    const state = await mount({ defaultValue: 'a,b', readOnly: true })
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b'])
    Object.assign(state.props, { disabled: true })
    await settle()
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    Object.assign(state.props, { disabled: false })
    await settle()
    state.inside.querySelector('fieldset')!.disabled = true
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    state.inside.querySelector('fieldset')!.disabled = false
    Object.assign(state.props, { name: undefined })
    await settle()
    expect([...new FormData(state.inside)]).toEqual([])
  })

  it.each([undefined, 'outside'])('form=%s：清空后原生 reset 恢复每个默认值', async (form) => {
    const state = await mount({ multiple: true, defaultValue: ['a,b', 'c'], form })
    const owner = form ? state.outside : state.inside
    expect(new FormData(owner).getAll('pick')).toEqual(['a,b', 'c'])
    if (form)
      expect(new FormData(state.inside).getAll('pick')).toEqual([])
    state.clear()
    await settle()
    expect(new FormData(owner).getAll('pick')).toEqual([])
    owner.reset()
    await settle()
    expect(new FormData(owner).getAll('pick')).toEqual(['a,b', 'c'])
  })

  it('受控值由业务决定，reset 请求不擅自改提交值；显式不存在的表单不回退祖先', async () => {
    const state = await mount({ multiple: true, value: ['a,b'], defaultValue: ['c'] })
    state.inside.reset()
    await settle()
    expect(new FormData(state.inside).getAll('pick')).toEqual(['a,b'])
    Object.assign(state.props, { form: 'missing' })
    await settle()
    expect(new FormData(state.inside).getAll('pick')).toEqual([])
    expect(new FormData(state.outside).getAll('pick')).toEqual([])
  })
})
