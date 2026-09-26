// @vitest-environment jsdom
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it } from 'vitest'
import { connectTagsInput, tagsInputMachine } from '../src/tags-input'

type Dict = Record<string, unknown>

let stops: Array<() => void> = []

afterEach(() => {
  stops.forEach(stop => stop())
  stops = []
  document.body.innerHTML = ''
})

function tag(value: string): HTMLElement {
  const el = document.createElement('div')
  el.dataset.scope = 'tags-input'
  el.dataset.part = 'item'
  el.setAttribute('value', value)
  return el
}

/** 挂一个标签容器，里面摆好初始标签；getControlEl 可以不给，模拟没有 DOM 的宿主。 */
function mount(values: string[], withControl = true) {
  const control = document.createElement('div')
  control.dataset.scope = 'tags-input'
  control.dataset.part = 'control'
  for (const value of values)
    control.append(tag(value))
  document.body.append(control)
  const runtime = createVanillaRuntime()
  const service = createService(tagsInputMachine, { props: () => ({ defaultValue: values }), runtime })
  if (withControl)
    service.refs.set('getControlEl', () => control)
  runtime.start()
  stops.push(() => runtime.stop())
  return { control, api: () => connectTagsInput(service, normalizeProps) }
}

/** 等宿主提交与其后的那个微任务。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++)
    await new Promise<void>(resolve => queueMicrotask(resolve))
}

describe('标签的列表动效', () => {
  it('接上之前 control 带 data-instant；接上后首帧的标签各自带上，control 撤掉', async () => {
    const { control, api } = mount(['Vue', 'React'])
    expect((api().getControlProps() as Dict)['data-instant']).toBe('')
    await settle()
    expect((api().getControlProps() as Dict)['data-instant']).toBeUndefined()
    for (const el of control.children)
      expect(el.hasAttribute('data-instant')).toBe(true)
  })

  it('之后新落下的标签按到达顺序排号', async () => {
    const { control } = mount(['Vue'])
    await settle()
    const a = tag('Svelte')
    const b = tag('Solid')
    control.append(a, b)
    await settle()
    expect(a.hasAttribute('data-instant')).toBe(false)
    expect(a.style.getPropertyValue('--xh-_stagger-index')).toBe('0')
    expect(b.style.getPropertyValue('--xh-_stagger-index')).toBe('1')
  })

  it('Web Components 里作者刚插进来、还没接线的标签同样认得出', async () => {
    const { control } = mount([])
    await settle()
    const authored = document.createElement('div')
    authored.setAttribute('data-xh-part', 'item')
    control.append(authored)
    await settle()
    expect(authored.style.getPropertyValue('--xh-_stagger-index')).toBe('0')
  })

  it('宿主没交出容器时不接，control 一直带 data-instant', async () => {
    const { api } = mount(['Vue'], false)
    await settle()
    expect((api().getControlProps() as Dict)['data-instant']).toBe('')
  })
})
