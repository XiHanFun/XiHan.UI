// @vitest-environment jsdom
// 不给 children 时照 alertStructure 铺：文本列恒铺，标题与说明是字符串时作文字，写了 closable 才铺关闭钮。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhAlertCloseTrigger, XhAlertContent, XhAlertDescription, XhAlertRoot, XhAlertTitle } from '../src'

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
  return Array.from(host.querySelectorAll('[data-scope="alert"][data-part]'), el => `${el.localName}|${el.getAttribute('data-part')}|${el.textContent}`)
}

describe('alert 的标准结构', () => {
  it('title、description、closable 铺出的树与手写全套部件一致，标题与说明接上 root 的名字与描述', async () => {
    const autoHost = await render(<XhAlertRoot title="部署已排队" description="构建完成后会自动发布。" closable />)
    const auto = skeleton(autoHost)
    const rootEl = autoHost.querySelector<HTMLElement>('[data-part="root"]')!
    expect(rootEl.getAttribute('aria-labelledby')).toBe(autoHost.querySelector('[data-part="title"]')!.id)
    expect(rootEl.getAttribute('aria-describedby')).toBe(autoHost.querySelector('[data-part="description"]')!.id)
    const manual = skeleton(await render(
      <XhAlertRoot closable>
        <XhAlertContent>
          <XhAlertTitle>部署已排队</XhAlertTitle>
          <XhAlertDescription>构建完成后会自动发布。</XhAlertDescription>
        </XhAlertContent>
        <XhAlertCloseTrigger />
      </XhAlertRoot>,
    ))
    expect(auto).toEqual(manual)
    expect(auto.map(row => row.split('|')[1])).toEqual(['root', 'content', 'title', 'description', 'close-trigger'])
  })

  it('不写 closable 不替作者添关闭钮；title 是节点时由标题部件装着', async () => {
    const host = await render(<XhAlertRoot title={<em>连接已断开</em>} action={<button type="button">重试</button>} />)
    expect(skeleton(host).map(row => row.split('|')[1])).toEqual(['root', 'content', 'title', 'action'])
    expect(host.querySelector('[data-part="title"] > em')).not.toBeNull()
  })
})
