// @vitest-environment jsdom
// 不给 children 时照 fieldsetStructure 铺：组标题恒在，其余给了哪段内容才铺哪一段，与手写全套部件同一棵树。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhFieldsetActions, XhFieldsetDescription, XhFieldsetErrorText, XhFieldsetFieldGroup, XhFieldsetLegend, XhFieldsetRoot } from '../src'

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
  act(() => root?.unmount())
  document.body.innerHTML = ''
  const host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(node)
  })
  return host
}

function skeleton(host: Element): string[] {
  return Array.from(host.querySelectorAll('[data-scope="fieldset"][data-part]'), el => `${el.localName}|${el.getAttribute('data-part')}|${el.textContent}`)
}

describe('fieldset 的标准结构', () => {
  it('legend、description、fieldGroup、errorText、actions 铺出各段，与手写全套部件一致', async () => {
    const auto = skeleton(await render(
      <XhFieldsetRoot legend="联系方式" description="至少填写一种" fieldGroup="字段" errorText="请至少填写一种联系方式" actions="保存" />,
    ))
    const manual = skeleton(await render(
      <XhFieldsetRoot>
        <XhFieldsetLegend>联系方式</XhFieldsetLegend>
        <XhFieldsetDescription>至少填写一种</XhFieldsetDescription>
        <XhFieldsetFieldGroup>字段</XhFieldsetFieldGroup>
        <XhFieldsetErrorText>请至少填写一种联系方式</XhFieldsetErrorText>
        <XhFieldsetActions>保存</XhFieldsetActions>
      </XhFieldsetRoot>,
    ))
    expect(auto).toEqual(manual)
    expect(auto.map(row => row.split('|')[1])).toEqual(['root', 'legend', 'description', 'field-group', 'error-text', 'actions'])
  })

  it('什么都不给也铺组标题；legend 给节点时由节点接管', async () => {
    expect(skeleton(await render(<XhFieldsetRoot />)).map(row => row.split('|')[1])).toEqual(['root', 'legend'])
    const host = await render(<XhFieldsetRoot legend={<b>收货信息</b>} />)
    expect(host.querySelector('[data-part="legend"] > b')!.textContent).toBe('收货信息')
  })
})
