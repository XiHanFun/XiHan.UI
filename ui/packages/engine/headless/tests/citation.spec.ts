/** @vitest-environment jsdom */

import type { CitationSchema } from '../src/citation'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { citationMachine, connectCitation } from '../src/citation'

type Props = CitationSchema['props']

const sources: NonNullable<Props['sources']> = [
  {
    type: 'source-url',
    sourceId: 'web',
    title: 'Web source',
    url: 'https://example.com/article',
    anchors: [{ sourceId: 'web', quote: 'Quoted sentence.' }],
  },
  { type: 'source-document', sourceId: 'doc', title: 'Document', mediaType: 'application/pdf' },
]

function setup(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(citationMachine, { props: () => props.get(), runtime })
  runtime.start()
  return { service, props, api: () => connectCitation(service, normalizeProps) }
}

describe('citation 来源关系', () => {
  it('行内引用展开对应预览，并建立 aria-controls / aria-labelledby', () => {
    const { api } = setup({ sources })
    const trigger = api().getTriggerProps({ sourceId: 'web', citationId: 'first', anchorIndex: 0 }) as Record<string, unknown>
    ;(trigger.onClick as () => void)()
    const next = api()
    const openTrigger = next.getTriggerProps({ sourceId: 'web', citationId: 'first', anchorIndex: 0 }) as Record<string, unknown>
    const preview = next.getPreviewProps({ sourceId: 'web' }) as Record<string, unknown>
    expect(openTrigger['aria-expanded']).toBe('true')
    expect(openTrigger['aria-controls']).toBe(preview.id)
    expect(preview['aria-labelledby']).toBe(openTrigger.id)
    expect(preview.hidden).toBeUndefined()
  })

  it('来源列表激活会切换当前来源并展开其预览', () => {
    const { api } = setup({ sources })
    const link = api().getSourceLinkProps({ sourceId: 'doc' }) as Record<string, unknown>
    ;(link.onClick as () => void)()
    expect(api().activeSourceId).toBe('doc')
    expect(api().open).toBe(true)
    expect((api().getPreviewProps({ sourceId: 'web' }) as Record<string, unknown>).hidden).toBe(true)
    expect((api().getPreviewProps({ sourceId: 'doc' }) as Record<string, unknown>).hidden).toBeUndefined()
  })

  it('受控 activeSourceId / open 只发意图，宿主写回后才改变', async () => {
    const onActiveSourceChange = vi.fn()
    const onOpenChange = vi.fn()
    const { api, props } = setup({ sources, activeSourceId: 'web', open: false, onActiveSourceChange, onOpenChange })
    ;((api().getSourceLinkProps({ sourceId: 'doc' }) as Record<string, unknown>).onClick as () => void)()
    expect(api().activeSourceId).toBe('web')
    expect(api().open).toBe(false)
    expect(onActiveSourceChange).toHaveBeenCalledWith({ sourceId: 'doc' })
    expect(onOpenChange).toHaveBeenCalledWith({ open: true })
    props.set({ sources, activeSourceId: 'doc', open: true, onActiveSourceChange, onOpenChange })
    await Promise.resolve()
    expect(api().activeSourceId).toBe('doc')
    expect(api().open).toBe(true)
  })

  it('打开原始来源时带回 SourcePart 与当前锚点', () => {
    const onSourceOpen = vi.fn()
    const { api } = setup({ sources, onSourceOpen })
    const link = api().getPreviewLinkProps({ sourceId: 'web', anchorIndex: 0 }) as Record<string, unknown>
    ;(link.onClick as () => void)()
    expect(onSourceOpen).toHaveBeenCalledWith({
      sourceId: 'web',
      source: sources[0],
      anchor: sources[0]!.anchors![0],
    })
  })
})

describe('citation 预览的披露', () => {
  type Dict = Record<string, unknown>
  const preview = (api: ReturnType<typeof setup>['api'], sourceId: string): Dict => api().getPreviewProps({ sourceId }) as Dict
  const settle = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0))

  /** 按 connect 给的 id 挂一份预览：内容区量得出高度，身上有一段在播的收起动画，finish() 模拟它播完。 */
  function stubPreview(api: ReturnType<typeof setup>['api'], sourceId: string, content: number): { finish: () => void } {
    const node = document.createElement('section')
    node.id = String(preview(api, sourceId).id)
    // jsdom 不给没写样式的节点算内缩：写成与浏览器首帧一致的 0
    node.style.padding = '0px'
    Object.defineProperty(node, 'scrollHeight', { configurable: true, value: content })
    node.getClientRects = () => [{}] as unknown as DOMRectList
    let finish!: () => void
    const finished = new Promise<Animation>((resolve) => {
      finish = () => resolve({} as Animation)
    })
    Object.defineProperty(node, 'getAnimations', {
      configurable: true,
      value: () => [{ playState: 'running', effect: { getComputedTiming: () => ({ endTime: 120 }) }, finished }],
    })
    document.body.append(node)
    return { finish }
  }

  it('首帧就开着的预览投影 data-instant，直接呈现；露面的预览换过之后才播', () => {
    const { api } = setup({ sources, defaultOpen: true })
    expect(preview(api, 'web')['data-instant']).toBe('')
    ;((api().getSourceLinkProps({ sourceId: 'doc' }) as Dict).onClick as () => void)()
    expect(preview(api, 'doc')['data-instant']).toBeUndefined()
  })

  it('收起时先量下内容区高度，退场播完才写 hidden；途中不接交互', async () => {
    const { api } = setup({ sources, defaultOpen: true })
    const exit = stubPreview(api, 'web', 80)
    api().setOpen(false)

    const leaving = preview(api, 'web')
    expect(leaving['data-state']).toBe('closed')
    expect(leaving.hidden).toBeUndefined()
    expect(leaving.inert).toBe(true)
    expect((leaving.style as Dict)['--xh-_citation-preview-block-size']).toBe('80px')

    await settle()
    expect(preview(api, 'web').hidden).toBeUndefined()
    exit.finish()
    await settle()
    const gone = preview(api, 'web')
    expect(gone.hidden).toBe(true)
    expect(gone.inert).toBeUndefined()
    expect((gone.style as Dict)['--xh-_citation-preview-block-size']).toBe('')
  })

  it('展开的预览在宿主提交之后量下内容区高度，展开长到它', async () => {
    const { api } = setup({ sources })
    stubPreview(api, 'doc', 64)
    ;((api().getSourceLinkProps({ sourceId: 'doc' }) as Dict).onClick as () => void)()
    await settle()
    expect((preview(api, 'doc').style as Dict)['--xh-_citation-preview-block-size']).toBe('64px')
  })

  it('换来源：旧的一份退场、新的一份展开，同时进行；退场途中重新露面即当场展开', async () => {
    const { api } = setup({ sources, defaultOpen: true })
    stubPreview(api, 'web', 80)
    ;((api().getSourceLinkProps({ sourceId: 'doc' }) as Dict).onClick as () => void)()
    expect(preview(api, 'web')['data-state']).toBe('closed')
    expect(preview(api, 'web').hidden).toBeUndefined()
    expect(preview(api, 'doc')['data-state']).toBe('open')

    ;((api().getSourceLinkProps({ sourceId: 'web' }) as Dict).onClick as () => void)()
    expect(preview(api, 'web')['data-state']).toBe('open')
    expect(preview(api, 'web').inert).toBeUndefined()
  })
})

describe('citation 悬停预览', () => {
  type Dict = Record<string, unknown>
  const mouse = { pointerType: 'mouse' } as PointerEvent
  const touch = { pointerType: 'touch' } as PointerEvent
  const trigger = (api: ReturnType<typeof setup>['api'], sourceId: string, citationId = sourceId): Dict =>
    api().getTriggerProps({ sourceId, citationId }) as Dict
  const enter = (props: Dict, event = mouse): void => (props.onPointerEnter as (e: PointerEvent) => void)(event)
  const leave = (props: Dict, event = mouse): void => (props.onPointerLeave as (e: PointerEvent) => void)(event)

  afterEach(() => {
    vi.useRealTimers()
  })

  it('inline 档不接悬停：引用编号上没有指针与焦点处理器，定位壳不参与排版', () => {
    const { api } = setup({ sources })
    expect(trigger(api, 'web').onPointerEnter).toBeUndefined()
    const positioner = api().getPositionerProps() as Dict
    expect(positioner['data-preview-mode']).toBe('inline')
    expect(positioner['data-positioned']).toBe('')
    expect(positioner.hidden).toBeUndefined()
    expect(positioner.style).toEqual({})
  })

  it('指针停够 openDelay 才打开；没停够就离开则不打开', () => {
    vi.useFakeTimers()
    const { api } = setup({ sources, previewMode: 'hover' })
    enter(trigger(api, 'web'))
    vi.advanceTimersByTime(699)
    expect(api().open).toBe(false)
    leave(trigger(api, 'web'))
    vi.advanceTimersByTime(10)
    expect(api().open).toBe(false)

    enter(trigger(api, 'web'))
    vi.advanceTimersByTime(700)
    expect(api().open).toBe(true)
    expect(api().activeSourceId).toBe('web')
    expect(trigger(api, 'web')['aria-expanded']).toBe('true')
  })

  it('离开后等 closeDelay 才收起；其间指针进卡片即撤销', () => {
    vi.useFakeTimers()
    const { api } = setup({ sources, previewMode: 'hover', openDelay: 0 })
    enter(trigger(api, 'web'))
    vi.advanceTimersByTime(0)
    expect(api().open).toBe(true)
    leave(trigger(api, 'web'))
    vi.advanceTimersByTime(200)
    ;((api().getPositionerProps() as Dict).onPointerEnter as (e: PointerEvent) => void)(mouse)
    vi.advanceTimersByTime(500)
    expect(api().open).toBe(true)
    ;((api().getPositionerProps() as Dict).onPointerLeave as (e: PointerEvent) => void)(mouse)
    vi.advanceTimersByTime(300)
    expect(api().open).toBe(false)
  })

  it('卡片开着时指向另一处引用直接切过去；刚收起不久指向另一处也直接接替', () => {
    vi.useFakeTimers()
    const { api } = setup({ sources, previewMode: 'hover' })
    enter(trigger(api, 'web'))
    vi.advanceTimersByTime(700)
    enter(trigger(api, 'doc'))
    expect(api().activeSourceId).toBe('doc')
    expect(api().open).toBe(true)

    leave(trigger(api, 'doc'))
    vi.advanceTimersByTime(300)
    expect(api().open).toBe(false)
    vi.advanceTimersByTime(100)
    enter(trigger(api, 'web'))
    expect(api().open).toBe(true)
    expect(api().activeSourceId).toBe('web')
  })

  it('接替窗口过了就重新等 openDelay；skipDelayDuration 为 0 不接替', () => {
    vi.useFakeTimers()
    const { api } = setup({ sources, previewMode: 'hover', skipDelayDuration: 0 })
    enter(trigger(api, 'web'))
    vi.advanceTimersByTime(700)
    leave(trigger(api, 'web'))
    vi.advanceTimersByTime(300)
    enter(trigger(api, 'doc'))
    expect(api().open).toBe(false)
    vi.advanceTimersByTime(700)
    expect(api().open).toBe(true)
  })

  it('聚焦当场打开；焦点挪进卡片或另一处引用不收起，离开两者才收起', () => {
    const { api, service } = setup({ sources, previewMode: 'hover' })
    const card = document.createElement('div')
    const inside = document.createElement('button')
    card.append(inside)
    const other = document.createElement('button')
    other.setAttribute('data-scope', 'citation')
    other.setAttribute('data-part', 'trigger')
    document.body.append(card, other)
    service.refs.set('getFloatingEl', () => card)

    ;(trigger(api, 'web').onFocus as () => void)()
    expect(api().open).toBe(true)
    const blur = (relatedTarget: Element | null): void =>
      (trigger(api, 'web').onBlur as (e: FocusEvent) => void)({ relatedTarget } as unknown as FocusEvent)
    blur(inside)
    expect(api().open).toBe(true)
    blur(other)
    expect(api().open).toBe(true)
    blur(null)
    expect(api().open).toBe(false)
    card.remove()
    other.remove()
  })

  it('触屏的指针进出不走悬停，交给点按', () => {
    vi.useFakeTimers()
    const { api } = setup({ sources, previewMode: 'hover', openDelay: 0 })
    enter(trigger(api, 'web'), touch)
    vi.advanceTimersByTime(10)
    expect(api().open).toBe(false)
    ;(trigger(api, 'web').onClick as () => void)()
    expect(api().open).toBe(true)
    leave(trigger(api, 'web'), touch)
    vi.advanceTimersByTime(500)
    expect(api().open).toBe(true)
  })

  it('hover 档：卡片收着时定位壳带 hidden，开着时是 fixed 定位层；预览画 frosted 面', () => {
    const { api } = setup({ sources, previewMode: 'hover' })
    expect((api().getPositionerProps() as Dict).hidden).toBe(true)
    ;(trigger(api, 'web').onClick as () => void)()
    const positioner = api().getPositionerProps() as Dict
    expect(positioner.hidden).toBeUndefined()
    expect(positioner['data-state']).toBe('open')
    expect((positioner.style as Dict).position).toBe('fixed')
    // 引擎量完之前不算落位，皮肤据此藏着
    expect(positioner['data-positioned']).toBeUndefined()
    expect((api().getPreviewProps({ sourceId: 'web' }) as Dict)['data-xh-material']).toBe('frosted')
  })
})

describe('citation 一处多源', () => {
  type Dict = Record<string, unknown>
  const multi = { sourceIds: ['web', 'doc'], citationId: 'claim' }

  it('打开后在几个来源之间轮换，位置与翻页钮随之变', () => {
    const { api } = setup({ sources })
    ;((api().getTriggerProps(multi) as Dict).onClick as () => void)()
    expect(api().activeSourceId).toBe('web')
    expect(api().activeGroup).toEqual(['web', 'doc'])
    expect(api().getPreviewPosition({ sourceId: 'web' })).toEqual({ index: 1, total: 2 })
    expect((api().getNextTriggerProps({ sourceId: 'web' }) as Dict).hidden).toBeUndefined()

    ;((api().getNextTriggerProps({ sourceId: 'web' }) as Dict).onClick as () => void)()
    expect(api().activeSourceId).toBe('doc')
    // 缺省回绕
    ;((api().getNextTriggerProps({ sourceId: 'doc' }) as Dict).onClick as () => void)()
    expect(api().activeSourceId).toBe('web')
  })

  it('loop 为 false 时停在两端，尽头那颗钮禁用', () => {
    const { api } = setup({ sources, loop: false })
    ;((api().getTriggerProps(multi) as Dict).onClick as () => void)()
    expect((api().getPrevTriggerProps({ sourceId: 'web' }) as Dict).disabled).toBe(true)
    ;((api().getPrevTriggerProps({ sourceId: 'web' }) as Dict).onClick as () => void)()
    expect(api().activeSourceId).toBe('web')
  })

  it('只有一个来源、或从来源列表打开时不显示翻页', () => {
    const { api } = setup({ sources })
    ;((api().getTriggerProps({ sourceId: 'web' }) as Dict).onClick as () => void)()
    expect(api().activeGroup).toBeNull()
    expect((api().getPrevTriggerProps({ sourceId: 'web' }) as Dict).hidden).toBe(true)
    expect((api().getPreviewIndexProps({ sourceId: 'web' }) as Dict).hidden).toBe(true)
  })

  it('一处多源的可及名列出各来源的序号', () => {
    const { api } = setup({ sources })
    expect((api().getTriggerProps(multi) as Dict)['aria-label']).toBe('Sources 1, 2')
  })

  it('sourceId 与 sourceIds 同时写、或一个都不写，立即报错', () => {
    const { api } = setup({ sources })
    expect(() => api().getTriggerProps({ sourceId: 'web', sourceIds: ['doc'] })).toThrow(/只能写一个/)
    expect(() => api().getTriggerProps({})).toThrow(/至少要引一个来源/)
  })
})

describe('citation 来源副文字与预览链接字走语言包', () => {
  const plain = { type: 'source-document' as const, sourceId: 'plain', title: '无媒体类型的文档' }

  it('网页写域名、文档写媒体类型；文档没有媒体类型时取 translations.document，缺省英文语言包', () => {
    const { api } = setup({ sources: [...sources, plain] })
    expect(api().sourceMetaText(sources[0])).toBe('example.com')
    expect(api().sourceMetaText(sources[1])).toBe('application/pdf')
    expect(api().sourceMetaText(plain)).toBe('Document')
    expect(api().previewLinkText({ sourceId: 'web' })).toBe('Open source')
    expect(api().previewLinkText({ sourceId: 'doc' })).toBe('Open document')
  })

  it('换成别的说法时三句一起跟着换', () => {
    const { api } = setup({ sources: [...sources, plain], translations: { document: '文档', previewLinkSource: '打开来源', previewLinkDocument: '打开文档' } })
    expect(api().sourceMetaText(plain)).toBe('文档')
    expect(api().previewLinkText({ sourceId: 'web' })).toBe('打开来源')
    expect(api().previewLinkText({ sourceId: 'doc' })).toBe('打开文档')
  })
})
