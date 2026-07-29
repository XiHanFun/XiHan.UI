// @vitest-environment jsdom
import type { Service } from '@xihan-ui/machine'
import type { ThreadApi, ThreadSchema, ThreadStatus } from '../src/thread'
import { createCounterIdGenerator, createRuntimeConfig, createScope, normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
// 直接指向组件目录：包主入口的导出由接线一并补，测试不等它
import { connectThread, threadAnatomy, threadMachine, threadMeta } from '../src/thread'

type Props = ThreadSchema['props']
type Dict = Record<string, unknown>

/** 视口 100、内容 400：可滚 300px，距底 64px 内算在底。 */
const VIEWPORT = 100
const CONTENT = 400

interface Rig {
  service: Service<ThreadSchema>
  viewport: HTMLElement
  content: HTMLElement
  /** 记下每一次程序化归位，验"按钮真的打到了句柄上"。 */
  scrollTo: ReturnType<typeof vi.fn>
  api: () => ThreadApi
  root: () => Dict
  viewportProps: () => Dict
  button: () => Dict
  liveRegion: () => Dict
  stop: () => void
}

/**
 * jsdom 不做布局，scrollHeight/clientHeight 恒是 0——粘底句柄会一直算出"在底"，
 * 按钮永远不显形，这条线一个用例都验不到。这里把三个尺寸桩在真实节点上，
 * 滚动量做成可读可写并在两端夹住，scrollTo 也照浏览器那样真把位置挪过去
 * （只当 spy 不挪位的话，归位之后的"重新在底"就验不出来了）。
 */
function stubBox(el: HTMLElement, scrollTo: (top: number) => void): void {
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
  el.scrollTo = ((o: { top: number }) => scrollTo(o.top)) as HTMLElement['scrollTo']
}

function mount(initial: Props = {}, options: { config?: boolean } = {}): Rig {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial })
  const idGen = createCounterIdGenerator()
  const scope = createScope(null, idGen)
  const service = createService(threadMachine, { props: () => props.get(), runtime, scope })

  const root = document.createElement('div')
  const viewport = document.createElement('div')
  const content = document.createElement('div')
  viewport.appendChild(content)
  root.appendChild(viewport)
  document.body.appendChild(root)

  const scrollTo = vi.fn((top: number) => {
    viewport.scrollTop = top
  })
  stubBox(viewport, scrollTo)

  if (options.config !== false) {
    // reducedMotion 必须显式给：默认实现要读 matchMedia，jsdom 没实现，一调就抛
    service.refs.set('config', createRuntimeConfig({ scope, idGenerator: idGen, reducedMotion: () => false }))
  }
  service.refs.set('getViewportEl', () => viewport)
  service.refs.set('getContentEl', () => content)

  runtime.start()

  const api = (): ThreadApi => connectThread(service, normalizeProps)
  return {
    service,
    viewport,
    content,
    scrollTo,
    api,
    root: () => api().getRootProps() as Dict,
    viewportProps: () => api().getViewportProps() as Dict,
    button: () => api().getScrollButtonProps() as Dict,
    liveRegion: () => api().getLiveRegionProps() as Dict,
    stop: () => {
      runtime.stop()
      root.remove()
    },
  }
}

/** 粘底句柄推迟一拍才建（挂载这一刻内容还在渲，量到的高度全是 0），等它落地再断言。 */
async function settle(): Promise<void> {
  await new Promise<void>(resolve => queueMicrotask(resolve))
  await new Promise<void>(resolve => queueMicrotask(resolve))
}

const rigs: Rig[] = []
function rig(initial?: Props, options?: { config?: boolean }): Rig {
  const created = mount(initial, options)
  rigs.push(created)
  return created
}

/** 原生滚动：改滚动量再派事件，与浏览器同序。 */
function scrollViewport(r: Rig, top: number): void {
  r.viewport.scrollTop = top
  r.viewport.dispatchEvent(new Event('scroll'))
}

afterEach(() => {
  while (rigs.length) rigs.pop()!.stop()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

const ALL_STATUS: ThreadStatus[] = ['idle', 'submitted', 'streaming', 'error']

describe('播报接线', () => {
  it('viewport 恒 role=log 且 aria-live=off，任何运行态都不例外', () => {
    // role=log 隐含 polite：逐 token 追加时读屏会把每一小段各念一遍，整段话被念成碎片。
    // 所以显式关掉，播报改由 live-region 在流结束时一次性完成
    for (const status of ALL_STATUS) {
      const props = rig({ status }).viewportProps()
      expect(props.role).toBe('log')
      expect(props['aria-live']).toBe('off')
    }
  })

  it('live-region 恒 polite，且整块重念', () => {
    for (const status of ALL_STATUS) {
      const props = rig({ status }).liveRegion()
      expect(props.role).toBe('status')
      expect(props['aria-live']).toBe('polite')
      // 宿主只在一轮流结束时写一次；aria-atomic 下中途写就等于把同一段话越念越长
      expect(props['aria-atomic']).toBe('true')
    }
  })

  it('viewport 占一个 Tab 位：消息区里常常一个可聚焦元素都没有，键盘用户落不进来就按不动翻页键', () => {
    expect(rig().viewportProps().tabindex).toBe(0)
  })

  it('viewport 上一个事件处理器都不挂：方向键与 PageUp/PageDown 全归浏览器', () => {
    const handlers = Object.keys(rig().viewportProps()).filter(key => /^on[A-Z]/.test(key))
    expect(handlers).toEqual([])
  })

  it('运行态透到 root 与 viewport 上，没给就算 idle', () => {
    const bare = rig()
    expect(bare.api().status).toBe('idle')
    expect(bare.root()['data-status']).toBe('idle')

    const streaming = rig({ status: 'streaming' })
    expect(streaming.root()['data-status']).toBe('streaming')
    expect(streaming.viewportProps()['data-status']).toBe('streaming')
  })

  it('文案默认英文，给了就用给的', () => {
    const bare = rig()
    expect(bare.viewportProps()['aria-label']).toBe('Conversation')
    expect(bare.button()['aria-label']).toBe('Scroll to bottom')

    const zh = rig({ translations: { scrollToBottom: '回到底部' } })
    expect(zh.button()['aria-label']).toBe('回到底部')
    // 只覆盖一条时其余仍回落英文
    expect(zh.viewportProps()['aria-label']).toBe('Conversation')
  })
})

describe('回到底部按钮', () => {
  it('初始在底：按钮收起', () => {
    const r = rig()
    expect(r.api().showScrollButton).toBe(false)
    expect(r.button()['data-state']).toBe('hidden')
    expect(r.button().hidden).toBe(true)
    expect(r.button().type).toBe('button')
  })

  it('showScrollButton 随 STICK.CHANGE 翻转，hidden 跟着同步', () => {
    const r = rig()
    r.service.send({ type: 'STICK.CHANGE', atBottom: false, sticking: false })
    expect(r.api().showScrollButton).toBe(true)
    expect(r.button()['data-state']).toBe('visible')
    // 收起时只隐藏不卸载：作者可能在按钮里放了自己的图标与过渡
    expect(r.button().hidden).toBeUndefined()

    r.service.send({ type: 'STICK.CHANGE', atBottom: true, sticking: true })
    expect(r.api().showScrollButton).toBe(false)
    expect(r.button().hidden).toBe(true)
  })

  it('判据只看几何、不看粘附意图：粘着但内容还没追上时按钮不该冒出来', () => {
    const r = rig()
    r.service.send({ type: 'STICK.CHANGE', atBottom: true, sticking: false })
    expect(r.api().atBottom).toBe(true)
    expect(r.api().sticking).toBe(false)
    expect(r.api().showScrollButton).toBe(false)
  })

  it('粘底跃迁原样转发给宿主，机器不再去重', () => {
    // 句柄只在值真变时才回报，机器里再判一次只会让两处判等逻辑各自漂移
    const onStickChange = vi.fn()
    const r = rig({ onStickChange })
    r.service.send({ type: 'STICK.CHANGE', atBottom: false, sticking: false })
    expect(onStickChange).toHaveBeenCalledWith({ atBottom: false, sticking: false })
  })
})

describe('粘底句柄', () => {
  it('推迟一拍后句柄落到 refs 上，原生滚动经它回灌 context', async () => {
    const r = rig()
    await settle()
    expect(r.service.refs.get('stick')).not.toBeNull()

    scrollViewport(r, 0)
    expect(r.api().atBottom).toBe(false)
    expect(r.api().showScrollButton).toBe(true)
  })

  it('点按钮打到句柄上：归位到底并重新粘附，按钮随之收起', async () => {
    const r = rig()
    await settle()
    scrollViewport(r, 0)
    // 向上滚轮脱锚，模拟用户翻看历史
    r.viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -50 }))
    expect(r.api().sticking).toBe(false)

    const onClick = r.button().onClick as () => void
    onClick()
    expect(r.scrollTo).toHaveBeenCalledWith(CONTENT)
    expect(r.api().atBottom).toBe(true)
    expect(r.api().sticking).toBe(true)
    expect(r.button().hidden).toBe(true)
  })

  it('api.scrollToBottom 与按钮走同一条路', async () => {
    const r = rig()
    await settle()
    r.api().scrollToBottom()
    expect(r.scrollTo).toHaveBeenCalledTimes(1)
  })

  it('卸载后句柄摘干净、ref 清空：留着的话归位会打到一个已解绑的句柄上', async () => {
    const r = rig()
    await settle()
    const remove = vi.spyOn(r.viewport, 'removeEventListener')
    r.stop()
    rigs.pop()
    expect(r.service.refs.get('stick')).toBeNull()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('wheel', expect.any(Function))
  })

  it('还没建起来就被卸载：那一拍到点时不再补建句柄', async () => {
    const r = rig()
    r.stop()
    rigs.pop()
    await settle()
    // 否则句柄会挂到一台已经停掉的机器上，再没人去 dispose 它
    expect(r.service.refs.get('stick')).toBeNull()
    expect(r.scrollTo).not.toHaveBeenCalled()
  })
})

describe('没有 DOM 环境', () => {
  it('config 缺席时整套效应不挂，也不抛', async () => {
    const r = rig({}, { config: false })
    await settle()
    expect(r.service.refs.get('stick')).toBeNull()
    // 半挂一个量不到东西的句柄比不挂更糟：状态在跑、监听却没挂
    scrollViewport(r, 0)
    expect(r.api().atBottom).toBe(true)
  })

  it('句柄缺席时归位静默不动：滚动本就归浏览器，没有句柄也不该报错', async () => {
    const r = rig({}, { config: false })
    await settle()
    expect(() => r.api().scrollToBottom()).not.toThrow()
    expect(() => (r.button().onClick as () => void)()).not.toThrow()
    expect(r.scrollTo).not.toHaveBeenCalled()
  })
})

describe('结构', () => {
  it('五个 part 都带 anatomy 标记', () => {
    const r = rig()
    const pairs: Array<[Dict, string]> = [
      [r.root(), 'root'],
      [r.viewportProps(), 'viewport'],
      [r.api().getContentProps() as Dict, 'content'],
      [r.button(), 'scroll-button'],
      [r.liveRegion(), 'live-region'],
    ]
    for (const [props, part] of pairs) {
      expect(props['data-scope']).toBe('thread')
      expect(props['data-part']).toBe(part)
    }
  })
})

describe('threadMeta', () => {
  it('必备 part 都在 anatomy 里', () => {
    const declared = new Set<string>(threadAnatomy.parts)
    expect(threadMeta.requiredParts.filter(p => !declared.has(p))).toEqual([])
  })
})
