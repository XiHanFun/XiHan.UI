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
