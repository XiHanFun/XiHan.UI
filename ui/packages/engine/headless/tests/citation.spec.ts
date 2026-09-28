/** @vitest-environment jsdom */

import type { CitationSchema } from '../src/citation'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
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
