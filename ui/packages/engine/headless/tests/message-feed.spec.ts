// @vitest-environment jsdom
import type { Service } from '@xihan-ui/core'
import type { MessageFeedApi, MessageFeedSchema } from '../src/message-feed'
import { createCounterIdGenerator, createRuntimeConfig, createScope, createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectMessageFeed, messageFeedMachine } from '../src/message-feed'

type Props = MessageFeedSchema['props']
type Dict = Record<string, unknown>

/** 视口 100、内容 400，可滚 300px，距底 64px 内算在底。 */
const VIEWPORT = 100
const CONTENT = 400

interface Rig {
  service: Service<MessageFeedSchema>
  viewport: HTMLElement
  api: () => MessageFeedApi
  stop: () => void
}

/** 在节点上桩出 clientHeight / scrollHeight / scrollTop 与 scrollTo，滚动量在两端夹住。 */
function stubBox(el: HTMLElement): void {
  let top = 0
  const maxTop = CONTENT - VIEWPORT
  Object.defineProperties(el, {
    clientHeight: { configurable: true, get: () => VIEWPORT },
    scrollHeight: { configurable: true, get: () => CONTENT },
    scrollTop: {
      configurable: true,
      get: () => top,
      set: (v: number) => {
        top = Math.min(Math.max(v, 0), maxTop)
      },
    },
  })
  el.scrollTo = ((o: { top: number }) => {
    el.scrollTop = o.top
  }) as HTMLElement['scrollTo']
}

const rigs: Rig[] = []

function mount(initial: Props = {}): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial })
  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)
  const service = createService(messageFeedMachine, { props: () => props.get(), runtime, scope })

  const root = document.createElement('div')
  const viewport = document.createElement('div')
  const list = document.createElement('div')
  viewport.appendChild(list)
  root.appendChild(viewport)
  document.body.appendChild(root)
  stubBox(viewport)

  service.refs.set('config', createRuntimeConfig({ scope, idGenerator: idGen }))
  service.refs.set('getRootEl', () => root)
  service.refs.set('getViewportEl', () => viewport)
  service.refs.set('getContentEl', () => list)
  runtime.start()

  const rig: Rig = {
    service,
    viewport,
    api: () => connectMessageFeed(service, normalizeProps),
    stop: () => {
      runtime.stop()
      root.remove()
    },
  }
  rigs.push(rig)
  return rig
}

afterEach(() => {
  while (rigs.length) rigs.pop()!.stop()
  document.body.innerHTML = ''
})

/** 等粘底句柄创建完成，它推迟一拍才建。 */
async function settle(): Promise<void> {
  await new Promise<void>(resolve => queueMicrotask(resolve))
  await new Promise<void>(resolve => queueMicrotask(resolve))
}

describe('粘底', () => {
  it('初值当作在底且粘附：真实几何由句柄的第一次回报补上，不在挂载那一刻读', () => {
    const rig = mount()
    expect(rig.api().atBottom).toBe(true)
    expect(rig.api().sticking).toBe(true)
  })

  it('回到底部按钮只看在不在底，不看粘附意图', () => {
    // 粘着但内容还没追上时按钮不该冒出来
    const rig = mount()
    expect(rig.api().showScrollToEndTrigger).toBe(false)
    rig.service.send({ type: 'STICK.CHANGE', atBottom: false, sticking: true })
    expect(rig.api().showScrollToEndTrigger).toBe(true)
    expect(rig.api().sticking).toBe(true)
    rig.service.send({ type: 'STICK.CHANGE', atBottom: true, sticking: false })
    expect(rig.api().showScrollToEndTrigger).toBe(false)
  })

  it('句柄回报即转发给宿主', () => {
    const onStickChange = vi.fn()
    const rig = mount({ onStickChange })
    rig.service.send({ type: 'STICK.CHANGE', atBottom: false, sticking: false })
    expect(onStickChange).toHaveBeenCalledWith({ atBottom: false, sticking: false })
  })

  it('回到底部把视口滚到底', async () => {
    const rig = mount()
    // 粘底句柄推迟一拍才建，建好之前 scrollToBottom 是空操作
    await settle()
    rig.viewport.scrollTop = 0
    rig.api().scrollToBottom()
    expect(rig.viewport.scrollTop).toBe(CONTENT - VIEWPORT)
  })
})

describe('锚点与 Tab 位', () => {
  it('没有锚点时容器认领唯一那个 Tab 停靠位，有锚点时让位', () => {
    const rig = mount()
    expect((rig.api().getRootProps() as Dict).tabindex).toBe(0)
    rig.service.send({ type: 'ITEM.FOCUS', id: 'm2' })
    expect((rig.api().getRootProps() as Dict).tabindex).toBe(-1)
    expect(rig.api().focusedId).toBe('m2')
  })

  it('焦点离场即清锚点，容器重新认领', () => {
    const onItemFocus = vi.fn()
    const rig = mount({ onItemFocus })
    rig.service.send({ type: 'ITEM.FOCUS', id: 'm2' })
    rig.service.send({ type: 'FEED.BLUR' })
    expect(rig.api().focusedId).toBeNull()
    expect((rig.api().getRootProps() as Dict).tabindex).toBe(0)
    expect(onItemFocus).toHaveBeenLastCalledWith({ id: null })
  })

  it('roving tabindex：只有锚点那一条留在 Tab 序列内', () => {
    const rig = mount()
    rig.service.send({ type: 'ITEM.FOCUS', id: 'm2' })
    const api = rig.api()
    expect((api.getItemProps({ id: 'm1', index: 0 }) as Dict).tabindex).toBe(-1)
    expect((api.getItemProps({ id: 'm2', index: 1 }) as Dict).tabindex).toBe(0)
  })
})

describe('条目语义', () => {
  it('序号从 1 起，总数由 count 声明；不给就报 -1', () => {
    // -1 是 ARIA 规定的「总数未知」：分页或截断历史时 DOM 里的条数不等于会话长度
    expect((mount({ count: 42 }).api().getItemProps({ id: 'm1', index: 0 }) as Dict)['aria-setsize']).toBe(42)
    const props = mount().api().getItemProps({ id: 'm1', index: 6 }) as Dict
    expect(props['aria-posinset']).toBe(7)
    expect(props['aria-setsize']).toBe(-1)
  })

  it('可访问名二选一：渲了作者名就指过去，没渲才用文案', () => {
    // 指向一个没渲出来的 id 会让读屏读空
    const api = mount({ translations: { item: () => '消息' } }).api()
    const labelled = api.getItemProps({ id: 'm1', index: 0, labelled: true }) as Dict
    expect(labelled['aria-labelledby']).toBe((api.getItemLabelProps({ id: 'm1' }) as Dict).id)
    expect(labelled['aria-label']).toBeUndefined()
    const bare = api.getItemProps({ id: 'm1', index: 0 }) as Dict
    expect(bare['aria-labelledby']).toBeUndefined()
    expect(bare['aria-label']).toBe('消息')
  })

  it('root 不发 aria-busy：它会压住同一棵子树内播报区的播报', () => {
    expect((mount({ status: 'streaming' }).api().getRootProps() as Dict)['aria-busy']).toBeUndefined()
  })
})

describe('消息流 · 单条消息的名字', () => {
  it('缺省名字带位次、总数与身份，念不出占位符', () => {
    const props = mount({ count: 5 }).api().getItemProps({ id: 'm1', index: 1, role: 'assistant' }) as Dict
    expect(props['aria-label']).toBe('Message 2 of 5, assistant')
    expect(String(props['aria-label'])).not.toContain('{')
  })

  it('宿主没声明总数就不念总数——aria-setsize 的 -1 是「未知」不是倒数', () => {
    const props = mount().api().getItemProps({ id: 'm1', index: 0 }) as Dict
    expect(props['aria-setsize']).toBe(-1)
    expect(props['aria-label']).toBe('Message 1')
  })

  it('文案给函数就拿得到位次、总数与身份', () => {
    const api = mount({
      count: 3,
      translations: { item: (position, size, role) => `第 ${position}/${size} 条，${role}` },
    }).api()
    expect((api.getItemProps({ id: 'm3', index: 2, role: 'user' }) as Dict)['aria-label']).toBe('第 3/3 条，user')
  })

  it('translations.item 只收函数：给字符串不过类型', () => {
    // @ts-expect-error 固定串会让每条消息念到同一句，位次与身份都丢了
    mount({ translations: { item: '消息' } })
    // 这一行的 @ts-expect-error 是判据本身：形状若又放宽回并集，它会因「没有错可期待」而报错
  })
})
