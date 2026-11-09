// 指示条的出没与引导换步：锚点与导航菜单的指示条没有可指的项时先在原处淡出、播完才藏起，之前落过位、又有了可指的项时原地淡入；
// 漫游引导展开着换步时，气泡里的标题原地淡入。宿主带着 [hidden]{display:none!important}（Tailwind preflight 同款）。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
  XhNavigationMenuContent,
  XhNavigationMenuIndicator,
  XhNavigationMenuItem,
  XhNavigationMenuLink,
  XhNavigationMenuList,
  XhNavigationMenuRoot,
  XhNavigationMenuTrigger,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourTitle,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import './hidden-important-host'

let root: Root | null = null
let host: HTMLElement | null = null
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

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

async function settle(count = 4): Promise<void> {
  for (let index = 0; index < count; index++) {
    await inAct(async () => {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    })
  }
}

async function mount(node: ReactNode): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  for (const name of ['enter', 'exit'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(node))
  await settle()
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

function scripted(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

let setAnchor: (value: string | null) => void = () => {}
let setMenu: (value: string | null) => void = () => {}
let setStep: (step: number) => void = () => {}

function Anchor(): ReactNode {
  const [value, set] = useState<string | null>('a')
  setAnchor = set
  return (
    <XhAnchorRoot value={value} smooth={false} onValueChange={() => {}}>
      <XhAnchorList>
        <XhAnchorItem><XhAnchorLink value="a">概览</XhAnchorLink></XhAnchorItem>
        <XhAnchorItem><XhAnchorLink value="b">安装</XhAnchorLink></XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>
  )
}

function Menu(): ReactNode {
  const [value, set] = useState<string | null>('docs')
  setMenu = set
  return (
    <XhNavigationMenuRoot value={value}>
      <XhNavigationMenuList>
        <XhNavigationMenuItem>
          <XhNavigationMenuTrigger value="docs">文档</XhNavigationMenuTrigger>
          <XhNavigationMenuContent value="docs"><XhNavigationMenuLink href="#a">快速上手</XhNavigationMenuLink></XhNavigationMenuContent>
        </XhNavigationMenuItem>
        <XhNavigationMenuIndicator />
      </XhNavigationMenuList>
    </XhNavigationMenuRoot>
  )
}

function Tour(): ReactNode {
  const [step, set] = useState(0)
  setStep = set
  return (
    <XhTourRoot
      open
      value={step}
      onValueChange={details => set(details.value)}
      steps={[{ id: 'a', target: '#tour-fade-a', title: '第一站' }, { id: 'b', target: '#tour-fade-b', title: '第二站' }]}
    >
      <XhTourPositioner><XhTourContent><XhTourTitle /></XhTourContent></XhTourPositioner>
    </XhTourRoot>
  )
}

describe('react 指示条的出没与引导换步', () => {
  it('锚点指示条没有可指的项时原地淡出、播完才藏起；再有了可指的项时原地淡入', async () => {
    await mount(<Anchor />)
    const indicator = host!.querySelector<HTMLElement>(`[data-scope='anchor'][data-part='indicator']`)!
    expect(indicator.hidden).toBe(false)
    expect(scripted(indicator)).toBeUndefined()
    await inAct(() => setAnchor(null))
    await settle(1)
    const leaving = scripted(indicator)!
    expect(leaving).toBeDefined()
    expect(indicator.hidden).toBe(false)
    leaving.finish()
    await expect.poll(() => indicator.hidden).toBe(true)
    await inAct(() => setAnchor('b'))
    await settle(2)
    expect(indicator.hidden).toBe(false)
    expect(scripted(indicator)).toBeDefined()
  })

  it('导航菜单收起面板时指示条原地淡出、播完才藏起', async () => {
    await mount(<Menu />)
    const indicator = document.querySelector<HTMLElement>(`[data-scope='navigation-menu'][data-part='indicator']`)!
    expect(indicator.hidden).toBe(false)
    await inAct(() => setMenu(null))
    await settle(1)
    const leaving = scripted(indicator)!
    expect(leaving).toBeDefined()
    leaving.finish()
    await expect.poll(() => indicator.hidden).toBe(true)
  })

  it('漫游引导展开着换到下一步：气泡里的标题原地淡入', async () => {
    const targets = document.createElement('div')
    targets.innerHTML = `
      <button id="tour-fade-a" style="position: fixed; left: 40px; top: 60px; inline-size: 120px; block-size: 32px">一</button>
      <button id="tour-fade-b" style="position: fixed; left: 360px; top: 240px; inline-size: 80px; block-size: 48px">二</button>`
    document.body.append(targets)
    await mount(<Tour />)
    const title = document.querySelector<HTMLElement>(`[data-scope='tour'][data-part='title']`)!
    for (const animation of document.getAnimations())
      animation.finish()
    expect(scripted(title)).toBeUndefined()
    await inAct(() => setStep(1))
    await settle(1)
    expect(title.textContent).toContain('第二站')
    expect(scripted(title)).toBeDefined()
  })
})
