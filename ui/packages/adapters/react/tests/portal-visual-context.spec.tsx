// @vitest-environment jsdom

import type { ReactNode } from 'react'
import { act, StrictMode, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  XhButton,
  XhButtonGroup,
  XhConfigProvider,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhPortal,
  XhSelectContent,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhToolbarItem,
  XhToolbarRoot,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

function mount(node: ReactNode, parent: HTMLElement = document.body): void {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  host = document.createElement('div')
  parent.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

function shellOf(testId: string): HTMLElement {
  const shell = document.querySelector<HTMLElement>(`[data-testid='${testId}']`)?.parentElement
  if (!shell?.hasAttribute('data-xh-portal-shell'))
    throw new Error(`${testId} 不在 Portal 实例壳里`)
  return shell
}

async function settleMutations(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  document.body.innerHTML = ''
  document.querySelectorAll('[data-testid="portal-target"]').forEach(node => node.remove())
  host = null
  root = null
  vi.restoreAllMocks()
})

describe('react Portal 的局部视觉环境', () => {
  it('provider 的单一七轴设置经来源 scope 桥接到实例壳', async () => {
    const scope = document.createElement('section')
    scope.style.setProperty('--business-color', 'rebeccapurple')
    document.body.append(scope)
    mount(
      <XhConfigProvider
        config={{
          visualEnvironment: {
            root: scope,
            initial: {
              mode: 'dark',
              brand: 'acme' as never,
              density: 'compact',
              contrast: 'more',
              motion: 'reduce',
              transparency: 'reduce',
              dir: 'rtl',
            },
          },
        }}
      >
        <XhPortal><span data-testid="first">内容</span></XhPortal>
      </XhConfigProvider>,
      scope,
    )
    await settleMutations()
    const shell = shellOf('first')
    expect(shell.getAttribute('data-theme')).toBe('dark')
    expect(shell.getAttribute('data-brand')).toBe('acme')
    expect(shell.getAttribute('data-density')).toBe('compact')
    expect(shell.getAttribute('data-contrast')).toBe('more')
    expect(shell.getAttribute('data-motion')).toBe('reduce')
    expect(shell.getAttribute('data-transparency')).toBe('reduce')
    expect(shell.getAttribute('dir')).toBe('rtl')
    expect(shell.style.getPropertyValue('--business-color')).toBe('rebeccapurple')
  })

  it('两个局部主题在同一个 body 落点各有自己的实例壳', () => {
    mount(
      <>
        <section data-theme="dark"><XhPortal><span data-testid="first">甲</span></XhPortal></section>
        <section data-theme="light"><XhPortal><span data-testid="second">乙</span></XhPortal></section>
      </>,
    )
    expect(shellOf('first')).not.toBe(shellOf('second'))
    expect(shellOf('first').getAttribute('data-theme')).toBe('dark')
    expect(shellOf('second').getAttribute('data-theme')).toBe('light')
  })

  it('来源祖先运行期换轴与移除声明后异步同步', async () => {
    mount(<section data-testid="source" data-theme="dark"><XhPortal><span data-testid="first">内容</span></XhPortal></section>)
    const source = host!.querySelector<HTMLElement>('[data-testid="source"]')!
    source.setAttribute('data-theme', 'light')
    source.setAttribute('data-density', 'compact')
    await settleMutations()
    expect(shellOf('first').getAttribute('data-theme')).toBe('light')
    expect(shellOf('first').getAttribute('data-density')).toBe('compact')

    source.removeAttribute('data-theme')
    await settleMutations()
    expect(shellOf('first').hasAttribute('data-theme')).toBe(false)
  })

  it('同一 source ref 换成另一枚宿主节点时在该次提交重绑', () => {
    let swap!: () => void
    function Probe(): ReactNode {
      const [second, setSecond] = useState(false)
      const source = useRef<HTMLElement | null>(null)
      swap = () => setSecond(value => !value)
      return (
        <>
          <section data-theme={second ? 'light' : 'dark'}>
            <span key={second ? 'second' : 'first'} ref={source} />
          </section>
          <XhPortal source={source}><span data-testid="first">内容</span></XhPortal>
        </>
      )
    }
    mount(<Probe />)
    expect(shellOf('first').getAttribute('data-theme')).toBe('dark')
    act(() => swap())
    expect(shellOf('first').getAttribute('data-theme')).toBe('light')
  })

  it('显式来源是祖先 host ref 时让完整提交先附着它，再在绘制前建桥', () => {
    function Probe(): ReactNode {
      const source = useRef<HTMLElement | null>(null)
      return (
        <section ref={source} data-theme="dark">
          <XhPortal source={source}><span data-testid="first">内容</span></XhPortal>
        </section>
      )
    }

    mount(<StrictMode><Probe /></StrictMode>)
    expect(shellOf('first').getAttribute('data-theme')).toBe('dark')
    expect(host!.querySelector('template[data-xh-portal-source]')).toBeNull()
  })

  it('显式来源在一次完整提交后仍为空会明确失败，不改走来源标记', () => {
    const missing = { current: null }
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => mount(
      <XhPortal source={missing}><span data-testid="first">内容</span></XhPortal>,
    )).toThrow(/来源标记或实例壳未挂载/)
    expect(host!.querySelector('template[data-xh-portal-source]')).toBeNull()
  })

  it('select 使用先提交的真实 trigger 作为来源，首帧挂载不再撞空 root ref', () => {
    mount(
      <XhSelectRoot data-theme="light" open collection={[{ value: 'a', label: '甲' }]}>
        <XhSelectTrigger data-theme="dark">选择</XhSelectTrigger>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectList>
              <XhSelectItem value="a"><XhSelectItemText>甲</XhSelectItemText></XhSelectItem>
            </XhSelectList>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>,
    )

    const content = document.querySelector<HTMLElement>('[data-scope="select"][data-part="content"]')!
    const shell = content.parentElement?.parentElement
    expect(shell?.hasAttribute('data-xh-portal-shell')).toBe(true)
    expect(shell?.getAttribute('data-theme')).toBe('dark')
    expect(host!.querySelector('template[data-xh-portal-source]')).toBeNull()
  })

  it('来源没声明的轴留给业务显式 portalContainer 继承', () => {
    const target = document.createElement('aside')
    target.dataset.testid = 'portal-target'
    target.setAttribute('data-theme', 'dark')
    document.body.append(target)
    mount(<XhPortal container={() => target}><span data-testid="first">内容</span></XhPortal>)
    const shell = shellOf('first')
    expect(shell.parentElement).toBe(target)
    expect(shell.hasAttribute('data-theme')).toBe(false)
  })

  it('已有锚点的 Popover/Tooltip 不生成 marker，不改变 ButtonGroup 与 Toolbar 的直接子项', () => {
    mount(
      <>
        <XhButtonGroup>
          <XhButton>前一项</XhButton>
          <XhPopoverRoot open>
            <XhPopoverTrigger asChild><XhButton>末项</XhButton></XhPopoverTrigger>
            <XhPopoverPositioner><XhPopoverContent>气泡</XhPopoverContent></XhPopoverPositioner>
          </XhPopoverRoot>
        </XhButtonGroup>
        <XhToolbarRoot>
          <XhTooltipRoot open>
            <XhTooltipTrigger asChild><XhToolbarItem value="tip">提示项</XhToolbarItem></XhTooltipTrigger>
            <XhTooltipPositioner><XhTooltipContent>提示</XhTooltipContent></XhTooltipPositioner>
          </XhTooltipRoot>
          <XhToolbarItem value="plain">普通项</XhToolbarItem>
        </XhToolbarRoot>
      </>,
    )

    const group = document.querySelector<HTMLElement>('[data-scope="button-group"][data-part="root"]')!
    expect([...group.children].map(node => node.getAttribute('data-scope'))).toEqual(['button', 'button'])
    expect(group.lastElementChild?.textContent).toBe('末项')
    const toolbar = document.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="root"]')!
    expect(toolbar.querySelector(':scope > template[data-xh-portal-source]')).toBeNull()
    expect(toolbar.querySelectorAll(':scope > [data-scope="toolbar"][data-part="item"]')).toHaveLength(2)
  })
})
