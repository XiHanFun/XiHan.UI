// @vitest-environment jsdom
//
// 全局配置要到得了机器。
//
// React 的 props 只有作者真写了的那几个键，与 Vue 那种「声明了就一定在」不同。
// withXhConfig 拿 Proxy 接管 translations / locale / size 三个键，而 useMachine 那一处会
// 展开 props（{ ...props }）——展开只带走自有键，作者没写的那几个于是原地蒸发，
// 组件回落到内建英文。这一档没有任何门禁看得见：check-config-wiring 只核「有没有调 withXhConfig」。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { XhConfigProvider, XhDialogCloseTrigger, XhDialogContent, XhDialogRoot, XhSelectRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

function mount(node: React.ReactNode): void {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

function closeLabel(): string | null {
  return document.querySelector('[data-part="close-trigger"]')?.getAttribute('aria-label') ?? null
}

describe('全局配置到达机器', () => {
  it('作者没写 translations 时，按组件名分桶的那份文案照样到得了', () => {
    mount(
      <XhConfigProvider config={{ translations: { dialog: { close: '关掉它' } } }}>
        <XhDialogRoot defaultOpen>
          <XhDialogContent><XhDialogCloseTrigger /></XhDialogContent>
        </XhDialogRoot>
      </XhConfigProvider>,
    )
    expect(closeLabel()).toBe('关掉它')
  })

  it('作者写了就以作者的为准', () => {
    mount(
      <XhConfigProvider config={{ translations: { dialog: { close: '关掉它' } } }}>
        <XhDialogRoot defaultOpen translations={{ close: '实例说了算' }}>
          <XhDialogContent><XhDialogCloseTrigger /></XhDialogContent>
        </XhDialogRoot>
      </XhConfigProvider>,
    )
    expect(closeLabel()).toBe('实例说了算')
  })

  it('没套 Provider 时回落内建文案', () => {
    mount(
      <XhDialogRoot defaultOpen>
        <XhDialogContent><XhDialogCloseTrigger /></XhDialogContent>
      </XhDialogRoot>,
    )
    expect(closeLabel()).toBe('Close')
  })

  it('size 回落全局：作者没写时用配置里那一档', () => {
    mount(
      <XhConfigProvider config={{ size: 'lg' }}>
        <XhSelectRoot collection={[{ value: 'a', label: 'A' }]} />
      </XhConfigProvider>,
    )
    expect(document.querySelector('[data-scope="select"][data-part="root"]')?.getAttribute('data-size')).toBe('lg')
  })
})
