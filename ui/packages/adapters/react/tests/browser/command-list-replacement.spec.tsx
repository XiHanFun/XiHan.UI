import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, expect, it } from 'vitest'
import { XhCommandContent, XhCommandEmpty, XhCommandInput, XhCommandItem, XhCommandList, XhCommandRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
let host: HTMLElement | undefined
let root: Root | undefined

async function inAct(action: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(action)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

function part(name: string): HTMLElement {
  const result = document.querySelector<HTMLElement>(`[data-scope='command'][data-part='${name}']`)
  if (!result)
    throw new Error(`缺少命令部件 ${name}`)
  return result
}

function item(value: string): HTMLElement {
  return part('list').querySelector<HTMLElement>(`[data-value='${value}']`)!
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  host?.remove()
  root = undefined
  host = undefined
})

it('保持展开替换 List 后由新节点的隐藏状态驱动 ARIA，旧节点不再被观察', async () => {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  const collection = [{ value: 'first', label: '首项' }, { value: 'second', label: '次项' }]
  const render = (generation: number, firstHidden = false, secondHidden = false): Promise<void> => inAct(async () => {
    root!.render(
      <XhCommandRoot defaultOpen modal={false} collection={collection}>
        <XhCommandContent>
          <XhCommandInput />
          <XhCommandList key={generation}>
            <XhCommandItem value="first" hidden={firstHidden}>首项</XhCommandItem>
            <XhCommandItem value="second" hidden={secondHidden}>次项</XhCommandItem>
          </XhCommandList>
          <XhCommandEmpty>没有显示中的命令</XhCommandEmpty>
        </XhCommandContent>
      </XhCommandRoot>,
    )
    await new Promise(resolve => setTimeout(resolve, 0))
  })
  await render(0)
  const input = part('input')
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(item('first').id)
  const oldList = part('list')
  await render(1)
  expect(part('list')).not.toBe(oldList)
  await render(1, true)
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(item('second').id)
  await render(1, true, true)
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBeNull()
  expect(part('empty').getBoundingClientRect().height).toBeGreaterThan(0)
  await render(1)
  await expect.poll(() => input.getAttribute('aria-activedescendant')).toBe(item('first').id)
  expect(part('empty').getBoundingClientRect().height).toBe(0)
  await inAct(async () => {
    oldList.hidden = true
    await Promise.resolve()
  })
  expect(input.getAttribute('aria-activedescendant')).toBe(item('first').id)
  expect(part('content').getAttribute('data-state')).toBe('open')
})
