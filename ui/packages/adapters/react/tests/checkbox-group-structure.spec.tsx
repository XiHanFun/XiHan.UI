// @vitest-environment jsdom
// 不给 children 时照 checkboxGroupStructure 铺：标题、条目里的表单影子、方框、文字与说明，与手写全套部件同一棵树。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhCheckboxGroupIndicator, XhCheckboxGroupItem, XhCheckboxGroupItemDescription, XhCheckboxGroupItemText, XhCheckboxGroupLabel, XhCheckboxGroupRoot } from '../src'

const COLLECTION = [
  { value: 'read', label: '读' },
  { value: 'write', label: '写', description: '包含新建与修改' },
]

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  document.body.innerHTML = ''
})

async function render(node: React.ReactNode): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
  return host
}

function skeleton(host: Element): string[] {
  return Array.from(host.querySelectorAll('[data-scope="checkbox-group"][data-part]'), el => `${el.getAttribute('data-part')}|${el.textContent}`)
}

describe('checkbox-group 的标准结构', () => {
  it('铺开的结构与手写全套部件一致；renderItem 只接管条目文字', async () => {
    const auto = skeleton(await render(<XhCheckboxGroupRoot collection={COLLECTION} label="权限" />))
    act(() => root?.unmount())
    document.body.innerHTML = ''
    const manual = skeleton(await render(
      <XhCheckboxGroupRoot collection={COLLECTION}>
        <XhCheckboxGroupLabel>权限</XhCheckboxGroupLabel>
        <XhCheckboxGroupItem value="read">
          <XhCheckboxGroupIndicator />
          <XhCheckboxGroupItemText>读</XhCheckboxGroupItemText>
        </XhCheckboxGroupItem>
        <XhCheckboxGroupItem value="write">
          <XhCheckboxGroupIndicator />
          <XhCheckboxGroupItemText>写</XhCheckboxGroupItemText>
          <XhCheckboxGroupItemDescription>包含新建与修改</XhCheckboxGroupItemDescription>
        </XhCheckboxGroupItem>
      </XhCheckboxGroupRoot>,
    ))
    expect(auto).toEqual(manual)
    expect(auto.map(row => row.split('|')[0])).toEqual(['root', 'label', 'item', 'hidden-input', 'indicator', 'item-text', 'item', 'hidden-input', 'indicator', 'item-text', 'item-description'])

    act(() => root?.unmount())
    document.body.innerHTML = ''
    const host = await render(<XhCheckboxGroupRoot collection={COLLECTION} renderItem={node => <em>{`${node.label}！`}</em>} />)
    expect(Array.from(host.querySelectorAll('[data-part="item-text"]'), el => el.innerHTML)).toEqual(['<em>读！</em>', '<em>写！</em>'])
  })
})
