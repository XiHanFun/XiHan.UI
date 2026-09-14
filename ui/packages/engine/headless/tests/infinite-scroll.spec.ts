// @vitest-environment jsdom
import type { InfiniteScrollSchema } from '../src/infinite-scroll'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectInfiniteScroll, infiniteScrollMachine } from '../src/infinite-scroll'

type Props = InfiniteScrollSchema['props']
type Attrs = Record<string, unknown>

/** 起一台机器并接线，返回取当下 api 的函数与那份 onLoad 探针。 */
function mount(props: Props = {}) {
  const onLoad = vi.fn()
  const runtime = createVanillaRuntime()
  const service = createService(infiniteScrollMachine, {
    props: () => ({ ...props, onLoad }),
    runtime,
  })
  runtime.start()
  return { onLoad, api: () => connectInfiniteScroll(service, normalizeProps) }
}

function click(attrs: Attrs): void {
  ;(attrs.onClick as () => void)()
}

describe('取下一页的按钮', () => {
  it('等着触发的那一段：点它就报「该取下一页了」，与哨兵进可视区同一条通路', () => {
    const { api, onLoad } = mount()
    const trigger = api().getLoadMoreTriggerProps() as Attrs
    expect(trigger['data-part']).toBe('load-more-trigger')
    expect(trigger.type).toBe('button')
    expect(trigger.disabled).toBeUndefined()

    click(trigger)
    expect(onLoad).toHaveBeenCalledTimes(1)
  })

  it('取数中：按钮停用，事件送到也不再报第二次', () => {
    const { api, onLoad } = mount({ loading: true })
    const trigger = api().getLoadMoreTriggerProps() as Attrs
    expect(trigger.disabled).toBe(true)
    expect(trigger['data-loading']).toBe('')

    click(trigger)
    expect(onLoad).not.toHaveBeenCalled()
  })

  it('关掉：按钮停用，事件送到也不再报', () => {
    const { api, onLoad } = mount({ disabled: true })
    const trigger = api().getLoadMoreTriggerProps() as Attrs
    expect(trigger.disabled).toBe(true)
    expect(trigger['data-disabled']).toBe('')

    click(trigger)
    expect(onLoad).not.toHaveBeenCalled()
  })

  it('文案由作者写在按钮里：组件不代填可及名字', () => {
    const trigger = mount().api().getLoadMoreTriggerProps() as Attrs
    expect(trigger['aria-label']).toBeUndefined()
  })
})
