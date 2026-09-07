// @vitest-environment jsdom
//
// 评分带的 control 上，connect 派的是不冒泡的 DOM focus：只在容器**自己**被聚焦时才接管，
// 把焦点转投给锚点那颗星。React 的同名合成事件挂的却是冒泡的 focusin——星星得焦也会把它
// 叫起来一次，而那一下的 relatedTarget 在带外，守卫拦不住，焦点当场被抢回锚点。
// 共享套件咬不到这条：它的 focus 步骤只落在 control 自己身上，从不直接聚焦某颗星。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhRatingControl, XhRatingItem, XhRatingRoot } from '../src'

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

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(tree)
  })
  await settle()
}

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

function items(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="rating"][data-part="item"]')]
}

/** 真的把焦点放上去：focus 与随后冒泡的 focusin 两样都会派出来。 */
async function focusNode(el: HTMLElement): Promise<void> {
  await act(async () => {
    el.focus()
  })
  await settle()
}

/** 五颗星，已评 3 分——锚点因此落在第 3 颗上。 */
const TREE = (
  <XhRatingRoot defaultValue={3}>
    <XhRatingControl>
      {[1, 2, 3, 4, 5].map(value => <XhRatingItem key={value} value={value} />)}
    </XhRatingControl>
  </XhRatingRoot>
)

describe('rating 的不冒泡 focus 按 DOM 语义送达', () => {
  it('从带外直接聚焦第 5 颗星：焦点留在它身上，不被转投回锚点', async () => {
    await mount(TREE)
    const stars = items()
    expect(stars[2]!.getAttribute('tabindex')).toBe('0')

    await focusNode(stars[4]!)

    expect(document.activeElement).toBe(stars[4])
  })

  it('直接聚焦某颗星之后，Tab 停靠点改记它', async () => {
    await mount(TREE)
    const stars = items()

    await focusNode(stars[4]!)

    expect(stars[4]!.getAttribute('tabindex')).toBe('0')
    expect(stars[2]!.getAttribute('tabindex')).toBe('-1')
  })
})
