// @vitest-environment jsdom
//
// 卡片的名字链与说明链由两个可选部件的在场与否决定，而 connect 是在渲染期求值的：
// title / description 的 ref 落位排在提交阶段，只落 ref 不重渲的话，属性会永远停在
// 「两个部件都不在场」那一档——名字指回 trigger、说明整条不发。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhHoverCardContent,
  XhHoverCardDescription,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTitle,
  XhHoverCardTrigger,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

/** 挂载一次，不额外催帧：属性必须在首次提交后就是对的。 */
async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(tree)
  })
}

function partId(part: string): string {
  return document.querySelector<HTMLElement>(`[data-part="${part}"]`)!.id
}

function contentAttr(name: string): string | null {
  return document.querySelector<HTMLElement>('[data-part="content"]')!.getAttribute(name)
}

describe('hover-card 的名字链与说明链', () => {
  it('放了 title：卡片的可及名指向 title，而不是 trigger', async () => {
    await mount(
      <XhHoverCardRoot>
        <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
        <XhHoverCardPositioner>
          <XhHoverCardContent>
            <XhHoverCardTitle>西涵 UI</XhHoverCardTitle>
          </XhHoverCardContent>
        </XhHoverCardPositioner>
      </XhHoverCardRoot>,
    )
    expect(contentAttr('aria-labelledby')).toBe(partId('title'))
    expect(contentAttr('aria-labelledby')).not.toBe(partId('trigger'))
  })

  it('没放 title：可及名指回 trigger', async () => {
    await mount(
      <XhHoverCardRoot>
        <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
        <XhHoverCardPositioner>
          <XhHoverCardContent>西涵 UI</XhHoverCardContent>
        </XhHoverCardPositioner>
      </XhHoverCardRoot>,
    )
    expect(contentAttr('aria-labelledby')).toBe(partId('trigger'))
  })

  it('放了 description：发 aria-describedby 指向它', async () => {
    await mount(
      <XhHoverCardRoot>
        <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
        <XhHoverCardPositioner>
          <XhHoverCardContent>
            <XhHoverCardDescription>一套跨框架的设计系统运行时。</XhHoverCardDescription>
          </XhHoverCardContent>
        </XhHoverCardPositioner>
      </XhHoverCardRoot>,
    )
    expect(contentAttr('aria-describedby')).toBe(partId('description'))
  })

  it('没放 description：一条空指也不发', async () => {
    await mount(
      <XhHoverCardRoot>
        <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
        <XhHoverCardPositioner>
          <XhHoverCardContent>西涵 UI</XhHoverCardContent>
        </XhHoverCardPositioner>
      </XhHoverCardRoot>,
    )
    expect(contentAttr('aria-describedby')).toBeNull()
  })
})
