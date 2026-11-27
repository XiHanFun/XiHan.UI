// 选择器的 unmountOnExit 要在真浏览器里验：退场动画得真播完才撤条目；Enter 再展开那一帧条目才铺回来，焦点照样落到选中项；
// 条目撤走之后在触发器上连打照样按 collection 选中。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import type { XhSelectRootProps } from '../../src'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhSelectContent, XhSelectControl, XhSelectItem, XhSelectItemText, XhSelectList, XhSelectPositioner, XhSelectRoot, XhSelectTrigger, XhSelectValueText } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

let root: Root | null = null
let host: HTMLElement | null = null
let setOpen: ((open: boolean) => void) | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
  setOpen = null
})

const COLLECTION = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
]

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='select'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='select'][data-part='item']`)]

/** 受控的 open 交给测试从外面拨，键盘开合照样经 onOpenChange 写回。 */
function Harness({ props, handWritten }: { props: XhSelectRootProps, handWritten: boolean }): ReactNode {
  const [open, setState] = useState(false)
  setOpen = setState
  if (!handWritten)
    return <XhSelectRoot {...props} open={open} onOpenChange={details => setState(details.open)} label="水果" collection={COLLECTION} />
  return (
    <XhSelectRoot {...props} open={open} onOpenChange={details => setState(details.open)}>
      <XhSelectControl><XhSelectTrigger aria-label="水果"><XhSelectValueText /></XhSelectTrigger></XhSelectControl>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectList>
            {COLLECTION.map(node => <XhSelectItem key={node.value} value={node.value}><XhSelectItemText>{node.label}</XhSelectItemText></XhSelectItem>)}
          </XhSelectList>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>
  )
}

async function render(props: XhSelectRootProps, handWritten = false): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(<Harness props={props} handWritten={handWritten} />))
}

const toggle = (open: boolean): Promise<void> => inAct(() => setOpen!(open))

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写条目', handWritten: true },
])('选择器 unmountOnExit（$name）', ({ handWritten }) => {
  it('退场播完才撤条目；Enter 再展开重新铺上，焦点落在选中项', async () => {
    await render({ unmountOnExit: true, defaultValue: 'banana' }, handWritten)
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    await toggle(true)
    await expect.poll(() => items().length).toBe(2)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    await toggle(false)
    // 退场正在播：条目还在
    expect(items()[0]).toBe(first)
    await expect.poll(() => items().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    part('trigger')!.focus()
    await userEvent.keyboard('{Enter}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('banana')
    expect(items()).toHaveLength(2)
    expect(items()[0]).not.toBe(first)
  })
})

describe('选择器 unmountOnExit 收起之后的连打', () => {
  it('条目撤走之后在触发器上打字，按 collection 选中', async () => {
    await render({ unmountOnExit: true })
    await toggle(true)
    await expect.poll(() => items().length).toBe(2)
    await toggle(false)
    await expect.poll(() => items().length).toBe(0)

    part('trigger')!.focus()
    await userEvent.keyboard('b')
    await expect.poll(() => part('value-text')!.textContent).toBe('Banana')
    expect(items()).toHaveLength(0)
  })
})
