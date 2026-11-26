// @vitest-environment jsdom
// Select / Combobox 的 onLoadMore：浮层里的滚动面跨进末端那一下请求下一页。
// jsdom 不排版，滚动面的量写死在节点上，滚动事件手工派发（scroll 不冒泡，组件在外壳的捕获阶段接）。
import type { ComboboxSchema } from '../src/combobox'
import type { SelectSchema } from '../src/select'
import { createService } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { comboboxMachine } from '../src/combobox'
import { selectMachine } from '../src/select'

const COLLECTION = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
]

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => setTimeout(resolve, 0))
}

/** 一块能滚的盒子：内容高 400、可视 100，最多滚到 300。 */
function scroller(parent: HTMLElement, contentHeight = 400): HTMLElement {
  const el = document.createElement('div')
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => contentHeight })
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => 100 })
  parent.append(el)
  return el
}

function scrollTo(el: HTMLElement, top: number): void {
  el.scrollTop = top
  el.dispatchEvent(new Event('scroll'))
}

function mountSelect(initial: SelectSchema['props']) {
  const floating = document.createElement('div')
  document.body.append(floating)
  const runtime = createVanillaRuntime()
  const props = runtime.signal<SelectSchema['props']>(initial)
  const service = createService(selectMachine, { props: () => props.get(), runtime })
  service.refs.set('getFloatingEl', () => floating)
  runtime.start()
  return {
    service,
    floating,
    setProps: (next: SelectSchema['props']) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

function mountCombobox(initial: ComboboxSchema['props']) {
  const floating = document.createElement('div')
  document.body.append(floating)
  const runtime = createVanillaRuntime()
  const props = runtime.signal<ComboboxSchema['props']>(initial)
  const service = createService(comboboxMachine, { props: () => props.get(), runtime })
  service.refs.set('getFloatingEl', () => floating)
  runtime.start()
  return {
    service,
    floating,
    setProps: (next: ComboboxSchema['props']) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

describe('select onLoadMore', () => {
  it('跨进末端那一下请求一次，停在末端来回微滚不重复；离开再回来又请求', async () => {
    const onLoadMore = vi.fn()
    const t = mountSelect({ collection: COLLECTION, defaultOpen: true, onLoadMore })
    await settle()
    const list = scroller(t.floating)
    scrollTo(list, 120)
    expect(onLoadMore).not.toHaveBeenCalled()
    scrollTo(list, 300)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    scrollTo(list, 299.5)
    scrollTo(list, 300)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    scrollTo(list, 200)
    scrollTo(list, 300)
    expect(onLoadMore).toHaveBeenCalledTimes(2)
    t.stop()
  })

  it('新一页接上、内容变长之后一下跳到新的末端（End 键、命令式滚动）也照样请求', async () => {
    const onLoadMore = vi.fn()
    const t = mountSelect({ collection: COLLECTION, defaultOpen: true, onLoadMore })
    await settle()
    let height = 400
    const list = document.createElement('div')
    Object.defineProperty(list, 'scrollHeight', { configurable: true, get: () => height })
    Object.defineProperty(list, 'clientHeight', { configurable: true, get: () => 100 })
    t.floating.append(list)
    scrollTo(list, 300)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    height = 700
    scrollTo(list, 600)
    expect(onLoadMore).toHaveBeenCalledTimes(2)
    t.stop()
  })

  it('滚的是虚拟滚动视口（列表外面再套一层）也接得住', async () => {
    const onLoadMore = vi.fn()
    const t = mountSelect({ collection: COLLECTION, defaultOpen: true, onLoadMore })
    await settle()
    const content = document.createElement('div')
    t.floating.append(content)
    const viewport = scroller(content)
    viewport.append(document.createElement('div'))
    scrollTo(viewport, 300)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    t.stop()
  })

  it('在途、取数失败时不请求；跨进末端那一刻不请求的，撤掉 loading 后要再滚到底', async () => {
    const onLoadMore = vi.fn()
    const t = mountSelect({ collection: COLLECTION, defaultOpen: true, loading: true, onLoadMore })
    await settle()
    const list = scroller(t.floating)
    scrollTo(list, 300)
    expect(onLoadMore).not.toHaveBeenCalled()
    t.setProps({ loading: false, error: true })
    scrollTo(list, 100)
    scrollTo(list, 300)
    expect(onLoadMore).not.toHaveBeenCalled()
    t.setProps({ error: false })
    scrollTo(list, 100)
    scrollTo(list, 300)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    t.stop()
  })

  it('内容不溢出、滚不动时不请求', async () => {
    const onLoadMore = vi.fn()
    const t = mountSelect({ collection: COLLECTION, defaultOpen: true, onLoadMore })
    await settle()
    const list = scroller(t.floating, 100)
    scrollTo(list, 0)
    expect(onLoadMore).not.toHaveBeenCalled()
    t.stop()
  })

  it('收起之后不再接滚动', async () => {
    const onLoadMore = vi.fn()
    const t = mountSelect({ collection: COLLECTION, defaultOpen: true, onLoadMore })
    await settle()
    const list = scroller(t.floating)
    t.service.send({ type: 'CLOSE' })
    await settle()
    scrollTo(list, 300)
    expect(onLoadMore).not.toHaveBeenCalled()
    t.stop()
  })
})

describe('combobox onLoadMore', () => {
  it('跨进末端请求下一页，在途时不请求', async () => {
    const onLoadMore = vi.fn()
    const t = mountCombobox({ collection: COLLECTION, defaultOpen: true, onLoadMore })
    await settle()
    const content = scroller(t.floating)
    scrollTo(content, 300)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    t.setProps({ loading: true })
    scrollTo(content, 100)
    scrollTo(content, 300)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
    t.stop()
  })
})
