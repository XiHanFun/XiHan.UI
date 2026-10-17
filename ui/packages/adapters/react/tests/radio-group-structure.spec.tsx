// @vitest-environment jsdom
// 不给 children 时照 radioGroupStructure 铺：标题、条目里的表单影子、圆圈、图标、文字与说明，与手写全套部件同一棵树。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhRadioGroupItem, XhRadioGroupItemDescription, XhRadioGroupItemIcon, XhRadioGroupItemText, XhRadioGroupLabel, XhRadioGroupRoot } from '../src'

const COLLECTION = [
  { value: 'free', label: '免费版', icon: '☆' },
  { value: 'standard', label: '标准版', description: '适合小团队' },
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
  return Array.from(host.querySelectorAll('[data-scope="radio-group"][data-part]'), el => `${el.getAttribute('data-part')}|${el.textContent}`)
}

describe('radio-group 的标准结构', () => {
  it('铺开的结构与手写全套部件一致；renderItem 只接管条目文字', async () => {
    const auto = skeleton(await render(<XhRadioGroupRoot collection={COLLECTION} label="套餐" />))
    act(() => root?.unmount())
    document.body.innerHTML = ''
    const manual = skeleton(await render(
      <XhRadioGroupRoot collection={COLLECTION}>
        <XhRadioGroupLabel>套餐</XhRadioGroupLabel>
        <XhRadioGroupItem value="free">
          <XhRadioGroupItemIcon>☆</XhRadioGroupItemIcon>
          <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
        </XhRadioGroupItem>
        <XhRadioGroupItem value="standard">
          <XhRadioGroupItemText>标准版</XhRadioGroupItemText>
          <XhRadioGroupItemDescription>适合小团队</XhRadioGroupItemDescription>
        </XhRadioGroupItem>
      </XhRadioGroupRoot>,
    ))
    expect(auto).toEqual(manual)
    expect(auto.map(row => row.split('|')[0])).toEqual(['root', 'label', 'item', 'hidden-input', 'indicator', 'item-icon', 'item-text', 'item', 'hidden-input', 'indicator', 'item-text', 'item-description'])

    act(() => root?.unmount())
    document.body.innerHTML = ''
    const host = await render(<XhRadioGroupRoot collection={COLLECTION} renderItem={node => <em>{`${node.label}！`}</em>} />)
    expect(Array.from(host.querySelectorAll('[data-part="item-text"]'), el => el.innerHTML)).toEqual(['<em>免费版！</em>', '<em>标准版！</em>'])
  })
})
