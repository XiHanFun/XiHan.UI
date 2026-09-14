// @vitest-environment jsdom
import type { CascaderSchema } from '@xihan-ui/headless'
import type { App } from 'vue'
import type { CascaderRootSlotProps } from '../src/components/cascader/cascader'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { XhCascaderRoot } from '../src'

const paths = [['华东', 'a,b'], ['a', 'b,c'], ['a,b', 'c']]
let app: App | undefined
let host: HTMLElement | undefined

async function tick() {
  await nextTick()
  await nextTick()
}

async function mount(initial: Partial<CascaderSchema['props']> = {}) {
  const props = ref({ name: 'paths', collection: [], ...initial })
  let current: CascaderRootSlotProps
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h('div', [
    h('form', { id: 'ancestor' }, [h(XhCascaderRoot, props.value, {
      default: (api: CascaderRootSlotProps) => {
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
    values: (id = 'ancestor') => new FormData(form(id)).getAll('paths'),
    update: async (next: Partial<CascaderSchema['props']>) => {
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

describe('vue 级联结构化表单', () => {
  it.each([false, true])('multiple=%s：每条路径一个 JSON 字段，异步空树不丢选值', async (multiple) => {
    const view = await mount({ multiple, defaultValue: multiple ? paths : paths[0] })
    expect(view.values()).toEqual((multiple ? paths : [paths[0]]).map(path => JSON.stringify(path)))
    view.api().clear()
    await tick()
    expect(view.values()).toEqual([])
    expect(host!.querySelectorAll('[data-part="hidden-input"]')).toHaveLength(0)
  })

  it('只读可提交，整体禁用与无 name 不提交', async () => {
    const view = await mount({ defaultValue: paths[0], readOnly: true })
    expect(view.values()).toEqual([JSON.stringify(paths[0])])
    await view.update({ disabled: true })
    expect(view.values()).toEqual([])
    await view.update({ disabled: false, name: undefined })
    expect(view.values()).toEqual([])
  })

  it('外部 form 在清空后可重置，祖先和被取消的 reset 不修改值', async () => {
    const view = await mount({ defaultValue: paths[0], form: 'external' })
    view.api().clear()
    await tick()
    view.form().reset()
    await tick()
    expect(view.values('external')).toEqual([])
    const cancel = (event: Event) => event.preventDefault()
    view.form('external').addEventListener('reset', cancel)
    view.form('external').reset()
    await tick()
    expect(view.values('external')).toEqual([])
    view.form('external').removeEventListener('reset', cancel)
    view.form('external').reset()
    await tick()
    expect(view.values('external')).toEqual([JSON.stringify(paths[0])])
    expect(view.values()).toEqual([])
    await view.update({ form: '' })
    view.api().clear()
    await tick()
    view.form().reset()
    view.form('external').reset()
    await tick()
    expect(view.api().value).toEqual([])
  })

  it('受控重置不抹业务值，声明默认路径时只发意图', async () => {
    const changed = vi.fn()
    const view = await mount({ value: paths[1], onValueChange: changed })
    view.form().reset()
    await tick()
    expect(changed).not.toHaveBeenCalled()
    await view.update({ defaultValue: paths[0] })
    view.form().reset()
    await tick()
    expect(changed).toHaveBeenLastCalledWith({ value: [paths[0]] })
    expect(view.values()).toEqual([JSON.stringify(paths[1])])
  })

  it('sSR 输出完整路径 JSON，转义字符往返不丢失', async () => {
    const value = [['<"&', 'a,b'], ['']]
    const html = await renderToString(createApp({ render: () => h(XhCascaderRoot, { name: 'paths', multiple: true, defaultValue: value }) }))
    const template = document.createElement('template')
    template.innerHTML = html
    expect([...template.content.querySelectorAll<HTMLInputElement>('input')].map(input => JSON.parse(input.value))).toEqual(value)
  })
})
