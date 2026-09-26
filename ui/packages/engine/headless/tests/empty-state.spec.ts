// @vitest-environment jsdom
import type { EmptyStateApi, EmptyStateProps } from '../src/empty-state'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectEmptyState, emptyStateAnatomy, emptyStateMachine, emptyStateMeta } from '../src/empty-state'

type Props = Record<string, unknown>

let stops: Array<() => void> = []

afterEach(() => {
  stops.forEach(stop => stop())
  stops = []
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

interface MountOptions {
  /** 交给机器的根节点；不给就是没有 DOM 的宿主。 */
  root?: HTMLElement
  adopted?: boolean
}

/** 起一台空状态机器；返回的 api 每次现取。 */
function mount(props: EmptyStateProps = {}, options: MountOptions = {}): () => EmptyStateApi {
  const runtime = createVanillaRuntime()
  const service = createService(emptyStateMachine, { props: () => props, runtime })
  service.refs.set('getRootEl', () => options.root ?? null)
  service.refs.set('adopted', options.adopted ?? false)
  runtime.start()
  stops.push(() => runtime.stop())
  return () => connectEmptyState(service, normalizeProps)
}

function api(props: EmptyStateProps = {}): EmptyStateApi {
  return mount(props)()
}

/** 出现追踪接在提交后的微任务里。 */
async function settle(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

// jsdom 不排版：根节点生成不生成盒、页面加载完没有都由桩给出
function layout({ visible, loaded }: { visible: boolean, loaded: boolean }): HTMLElement {
  const root = document.createElement('div')
  document.body.append(root)
  vi.spyOn(root, 'getClientRects').mockReturnValue((visible ? [new DOMRect(0, 0, 10, 10)] : []) as unknown as DOMRectList)
  vi.spyOn(document, 'readyState', 'get').mockReturnValue(loaded ? 'complete' : 'interactive')
  vi.stubGlobal('ResizeObserver', class {
    observe(): void {}
    disconnect(): void {}
  })
  return root
}

const ANIMATED = ['getMediaProps', 'getIndicatorProps', 'getTitleProps', 'getDescriptionProps', 'getActionProps'] as const

function instantOf(current: EmptyStateApi): unknown[] {
  return ANIMATED.map(getter => (current[getter]() as Props)['data-instant'])
}

describe('connectEmptyState', () => {
  it('root 缺省是 role=status 活区：筛选后换出来的空态没有焦点变化，只能靠活区播报', () => {
    const root = api().getRootProps() as Props
    expect(root['data-scope']).toBe('empty-state')
    expect(root['data-part']).toBe('root')
    expect(root.role).toBe('status')
    expect(api().live).toBe('polite')
  })

  it('live=off 的静态占位不当活区：root 不写 role', () => {
    const root = api({ live: 'off' }).getRootProps() as Props
    expect(root.role).toBeUndefined()
    expect(api({ live: 'off' }).live).toBe('off')
  })

  it('size 只落到 data-size，不给就不写，免得皮肤把缺省档当成显式档', () => {
    expect((api().getRootProps() as Props)['data-size']).toBeUndefined()
    expect((api({ size: 'lg' }).getRootProps() as Props)['data-size']).toBe('lg')
  })

  it('图标是装饰：内容标题里已经写过，念一遍只会重复', () => {
    expect((api().getIndicatorProps() as Props)['aria-hidden']).toBe(true)
  })

  it('标题、说明、操作不补 role 与标题层级：活区会把整段读完', () => {
    for (const getter of ['getTitleProps', 'getDescriptionProps', 'getActionProps'] as const) {
      const props = api()[getter]() as Props
      expect(props.role).toBeUndefined()
      expect(props['aria-level']).toBeUndefined()
    }
  })

  it('meta 的必备 part 都在 anatomy 里', () => {
    const declared = new Set<string>(emptyStateAnatomy.parts)
    expect(emptyStateMeta.requiredParts.filter(p => !declared.has(p))).toEqual([])
  })
})

describe('空状态的开幕', () => {
  it('首帧五个开幕部件都投影 data-instant，根节点不带：服务端与水合两侧一致', () => {
    const current = api()
    expect(instantOf(current)).toEqual(['', '', '', '', ''])
    expect((current.getRootProps() as Props)['data-instant']).toBeUndefined()
  })

  it('没有根节点的宿主不追踪，保持首帧呈现', async () => {
    const current = mount()
    await settle()
    expect(instantOf(current())).toEqual(['', '', '', '', ''])
  })

  it('页面加载完成之前挂上、此刻可见：随页面首屏就在，不播开幕', async () => {
    const current = mount({}, { root: layout({ visible: true, loaded: false }) })
    await settle()
    expect(instantOf(current())).toEqual(['', '', '', '', ''])
  })

  it('页面加载完成之后挂上：是筛选、删除或新数据带来的，撤掉 data-instant 播开幕', async () => {
    const current = mount({}, { root: layout({ visible: true, loaded: true }) })
    await settle()
    expect(instantOf(current())).toEqual([undefined, undefined, undefined, undefined, undefined])
  })

  it('水合来的根节点即使在加载完成之后挂上也属于首屏', async () => {
    const current = mount({}, { root: layout({ visible: true, loaded: true }), adopted: true })
    await settle()
    expect(instantOf(current())).toEqual(['', '', '', '', ''])
  })

  it('挂上时收着（hidden 常挂）：下一次显出就播开幕', async () => {
    const current = mount({}, { root: layout({ visible: false, loaded: false }), adopted: true })
    await settle()
    expect(instantOf(current())).toEqual([undefined, undefined, undefined, undefined, undefined])
  })
})
