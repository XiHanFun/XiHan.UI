// @vitest-environment jsdom
//
// 候选是作者自己筛的，机器无从预知何时变，只能由适配器每次提交完 DOM 上报一次 ITEMS.SYNC。
// 空态的显隐与「高亮项被筛掉了」这两件事都挂在这份结算上，而共享一致性套件不动候选的进出，
// 上报断掉照样全绿：空态从此永远不露面，aria-activedescendant 指着一个已经不在的 id。
import type { ReactNode } from 'react'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemText,
  XhComboboxPositioner,
  XhComboboxRoot,
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

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

async function render(tree: ReactNode): Promise<void> {
  await act(async () => {
    root!.render(tree)
  })
  await settle()
}

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await render(tree)
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="combobox"][data-part="${name}"]`)!
}

function items(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="combobox"][data-part="item"]')]
}

/** 作者自己筛过的那一批候选。 */
function Tree({ values }: { values: readonly string[] }): ReactNode {
  return (
    <XhComboboxRoot defaultOpen>
      <XhComboboxControl><XhComboboxInput /></XhComboboxControl>
      <XhComboboxPositioner>
        <XhComboboxContent>
          {values.map(v => (
            <XhComboboxItem key={v} value={v}><XhComboboxItemText>{v}</XhComboboxItemText></XhComboboxItem>
          ))}
        </XhComboboxContent>
        <XhComboboxEmpty>无匹配项</XhComboboxEmpty>
      </XhComboboxPositioner>
    </XhComboboxRoot>
  )
}

/** 作者把候选攥在自己那一层的状态里：它单独重渲时，根部件那一层不跟着渲。 */
let refilter: ((values: readonly string[]) => void) | null = null

function OwnState(): ReactNode {
  const [values, setValues] = useState<readonly string[]>(['apple', 'berry'])
  refilter = setValues
  return (
    <>
      <XhComboboxContent>
        {values.map(v => (
          <XhComboboxItem key={v} value={v}><XhComboboxItemText>{v}</XhComboboxItemText></XhComboboxItem>
        ))}
      </XhComboboxContent>
      <XhComboboxEmpty>无匹配项</XhComboboxEmpty>
    </>
  )
}

describe('combobox 的候选结算', () => {
  it('首帧一条候选都没有：空态当场顶上来，不等第一个候选进出', async () => {
    // 一个候选都不挂，谁都不会上报，这一帧的结算只能由根部件自己发起
    await mount(<Tree values={[]} />)
    expect(part('empty').hasAttribute('hidden')).toBe(false)
  })

  it('候选筛没了：空态顶上来，再筛回来又让位', async () => {
    await mount(<Tree values={['apple', 'berry']} />)
    expect(part('empty').hasAttribute('hidden')).toBe(true)

    await render(<Tree values={[]} />)
    expect(part('empty').hasAttribute('hidden')).toBe(false)

    await render(<Tree values={['apple']} />)
    expect(part('empty').hasAttribute('hidden')).toBe(true)
  })

  it('高亮的那一条被筛掉：高亮摘掉，aria-activedescendant 不再指着它', async () => {
    await mount(<Tree values={['apple', 'berry']} />)
    const second = items()[1]!
    const secondId = second.id

    await act(async () => {
      second.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse' }))
    })
    await settle()
    expect(part('input').getAttribute('aria-activedescendant')).toBe(secondId)

    await render(<Tree values={['apple']} />)

    expect(part('input').getAttribute('aria-activedescendant')).toBeNull()
  })

  it('候选只在作者自己那一层重渲：根部件没跟着渲，结算照样由候选自己报上来', async () => {
    await mount(
      <XhComboboxRoot defaultOpen>
        <XhComboboxControl><XhComboboxInput /></XhComboboxControl>
        <XhComboboxPositioner>
          <OwnState />
        </XhComboboxPositioner>
      </XhComboboxRoot>,
    )
    expect(part('empty').hasAttribute('hidden')).toBe(true)

    await act(async () => {
      refilter!([])
    })
    await settle()

    expect(items()).toHaveLength(0)
    expect(part('empty').hasAttribute('hidden')).toBe(false)
  })
})
