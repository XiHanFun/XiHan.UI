// @vitest-environment jsdom
import type { CommandSchema, CommandSelectDetails } from '../src/command'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, expect, it } from 'vitest'
import { commandMachine, connectCommand } from '../src/command'

const cleanups: (() => void)[] = []

async function fixture(options: { hiddenGroup?: boolean, missingFirst?: boolean } = {}) {
  const runtime = createVanillaRuntime()
  const selected: CommandSelectDetails[] = []
  const props = runtime.signal<CommandSchema['props']>({
    collection: [{ value: 'first', label: '首项' }, { value: 'second', label: '次项' }],
    defaultOpen: true,
    closeOnSelect: false,
    onSelect: details => selected.push(details),
  })
  const list = document.createElement('div')
  list.dataset.scope = 'command'
  list.dataset.part = 'list'
  list.innerHTML = `${options.missingFirst ? '' : `<div data-part="group" ${options.hiddenGroup ? 'hidden' : ''}><div data-scope="command" data-part="item" data-value="first">首项</div></div>`}<div data-scope="command" data-part="item" data-value="second">次项</div>`
  document.body.append(list)
  const service = createService(commandMachine, { props: () => props.get(), runtime })
  service.refs.set('getListEl', () => list)
  runtime.start()
  cleanups.push(() => {
    runtime.stop()
    list.remove()
  })
  const api = () => connectCommand(service, normalizeProps)
  const press = (key: string) => {
    const handler = api().getInputProps().onKeyDown as (event: KeyboardEvent) => void
    handler(new KeyboardEvent('keydown', { key, cancelable: true }))
  }
  await new Promise(resolve => setTimeout(resolve, 0))
  return { api, list, selected, press, service, setProps: (next: Partial<CommandSchema['props']>) => props.set({ ...props.get(), ...next }) }
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup()
})

it('作者隐藏分组中的首项不被 Home 或 Enter 采用，ARIA 指向可见次项', async () => {
  const f = await fixture({ hiddenGroup: true })
  f.press('Home')
  expect(f.api().highlightedValue).toBe('second')
  expect(f.api().getInputProps()['aria-activedescendant']).toBe(f.api().getItemProps({ value: 'second' }).id)
  f.press('Enter')
  expect(f.selected.map(one => one.value)).toEqual(['second'])
})

it('已高亮的项被同步隐藏后，Enter 当次不执行；全部隐藏后 ARIA 清空', async () => {
  const f = await fixture()
  for (const item of f.list.querySelectorAll<HTMLElement>('[data-part="item"]')) item.hidden = true
  f.press('Enter')
  expect(f.selected).toEqual([])
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(f.api().getInputProps()['aria-activedescendant']).toBeUndefined()
  expect(f.api().highlightedValue).toBeNull()
  expect(f.api().empty).toBe(true)
  expect(f.api().getEmptyProps().hidden).toBeUndefined()
})

it('未挂载的首项仍按明确 collection 导航，不能被当成作者隐藏', async () => {
  const f = await fixture({ missingFirst: true })
  f.list.querySelector<HTMLElement>('[data-value="second"]')!.hidden = true
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(f.api().empty).toBe(false)
  f.press('Home')
  expect(f.api().highlightedValue).toBe('first')
  f.press('Enter')
  expect(f.selected.map(one => one.value)).toEqual(['first'])
})

it('隐藏条目恢复或移出 DOM 后撤销隐藏镜像，数据候选重新参与导航', async () => {
  const f = await fixture({ hiddenGroup: true })
  const group = f.list.querySelector<HTMLElement>('[data-part="group"]')!
  expect(f.api().highlightedValue).toBe('second')
  group.hidden = false
  await new Promise(resolve => setTimeout(resolve, 0))
  f.press('Home')
  expect(f.api().highlightedValue).toBe('first')
  group.hidden = true
  await new Promise(resolve => setTimeout(resolve, 0))
  group.remove()
  await new Promise(resolve => setTimeout(resolve, 0))
  f.press('Home')
  expect(f.api().highlightedValue).toBe('first')
})

it('关闭后撤掉可见性观察，不继续改写隐藏镜像', async () => {
  const f = await fixture()
  f.api().setOpen(false)
  f.list.hidden = true
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(f.service.context.get('hiddenValues')).toEqual([])
})

it('嵌套另一张命令列表的隐藏条目不污染本层同值候选', async () => {
  const f = await fixture()
  f.list.insertAdjacentHTML('beforeend', '<div data-scope="command" data-part="list"><div data-scope="command" data-part="item" data-value="first" hidden>内层首项</div></div>')
  await new Promise(resolve => setTimeout(resolve, 0))
  f.press('Home')
  expect(f.api().highlightedValue).toBe('first')
})

it('发布新 List 引用后观察新节点，旧节点和关闭后的迟到通知均不再改状态', async () => {
  const f = await fixture()
  const nextList = f.list.cloneNode(true) as HTMLElement
  f.list.replaceWith(nextList)
  cleanups.push(() => nextList.remove())
  f.service.refs.set('getListEl', () => nextList)
  const notify = f.service.refs.get('syncListVisibility')!
  notify()
  nextList.hidden = true
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(f.api().highlightedValue).toBeNull()
  nextList.hidden = false
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(f.api().highlightedValue).toBe('first')
  f.list.hidden = true
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(f.api().highlightedValue).toBe('first')
  expect(f.api().empty).toBe(false)
  f.api().setOpen(false)
  expect(f.service.refs.get('syncListVisibility')).toBeNull()
  nextList.hidden = true
  notify()
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(f.service.context.get('hiddenValues')).toEqual([])
})

it('暂时移除 List 时清掉旧隐藏镜像，未挂载候选恢复纯数据导航', async () => {
  const f = await fixture({ hiddenGroup: true })
  expect(f.api().highlightedValue).toBe('second')
  f.list.remove()
  f.service.refs.set('getListEl', () => null)
  f.service.refs.get('syncListVisibility')!()
  f.press('Home')
  expect(f.api().highlightedValue).toBe('first')
})
