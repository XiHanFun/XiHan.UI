// 退场动画只能在真实浏览器里验：jsdom 不把样式表里的 animation 简写算进
// getComputedStyle（animationName 恒为空串），退场探测那条路在 jsdom 里天然走不到。
//
// 两族分开核：浮层族（dialog / drawer / popover / select / date-picker / floating-panel）走
// use-overlay，折叠族（tool-call / reasoning）走 use-overlay-exit，两条闸门各有各的接线。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { getLayerRegistry } from '@xihan-ui/core'
import { act, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhDatePickerCalendar,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerPositioner,
  XhDatePickerRoot,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogRoot,
  XhDialogTitle,
  XhDrawerContent,
  XhDrawerRoot,
  XhDrawerTitle,
  XhFloatingPanelContent,
  XhFloatingPanelPositioner,
  XhFloatingPanelRoot,
  XhFloatingPanelTitle,
  XhImageViewerContent,
  XhImageViewerRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
  XhReasoningContent,
  XhReasoningRoot,
  XhReasoningTrigger,
  XhSelectContent,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhToolCallContent,
  XhToolCallRoot,
  XhToolCallTrigger,
  XhTourBackdrop,
  XhTourContent,
  XhTourPositioner,
  XhTourRoot,
  XhTourSpotlight,
  XhTourTitle,
} from '../../src'
// 皮肤要一起加载：这里查的就是皮肤给出的 animationName 与 display
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let root: Root | null = null
let host: HTMLElement | null = null

function installLongExit(scope: string): void {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes test-exit-fade { from { opacity: 1 } to { opacity: 0 } }
    @keyframes test-exit-move { from { translate: 0 0 } to { translate: 0 8px } }
    @keyframes test-exit-shine { from { outline-color: transparent } to { outline-color: transparent } }
    [data-scope='${scope}'][data-part='content'][data-state='closed'] {
      animation: test-exit-fade 60s linear forwards, test-exit-move 60s linear forwards, test-exit-shine 60s linear infinite;
    }
    [data-scope='${scope}'][data-part='backdrop'][data-state='closed'] { animation: test-exit-fade 60s linear forwards }
  `
  document.body.append(style)
}

function finiteAnimations(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

describe.each(['dialog', 'drawer'] as const)('%s 的行为资源退出合同', (scope) => {
  it('等完内容全部有限动画和遮罩，退出期间内容与背景保持失活', async () => {
    installLongExit(scope)
    const outside = document.createElement('button')
    document.body.append(outside)
    const completed: number[] = []
    const onExitComplete = () => completed.push(getLayerRegistry(document).list().length)
    const setOpen = await mount(open => scope === 'dialog'
      ? (
          <XhDialogRoot open={open} onExitComplete={onExitComplete}>
            <XhDialogContent>
              <XhDialogTitle>标题</XhDialogTitle>
              <button type="button">内部</button>
            </XhDialogContent>
          </XhDialogRoot>
        )
      : (
          <XhDrawerRoot open={open} onExitComplete={onExitComplete}>
            <XhDrawerContent>
              <XhDrawerTitle>标题</XhDrawerTitle>
              <button type="button">内部</button>
            </XhDrawerContent>
          </XhDrawerRoot>
        ))
    await setOpen(false)
    await new Promise(resolve => requestAnimationFrame(resolve))
    const content = part(scope, 'content')
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    const action = content.querySelector('button')!
    // 先释放进入时已有的焦点，再验证失活节点不能重新取得焦点。
    action.blur()
    action.focus()
    expect(document.activeElement).not.toBe(action)
    expect(outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')
    const animations = finiteAnimations(content)
    expect(animations).toHaveLength(2)
    animations[0]!.finish()
    await settle()
    expect(completed).toEqual([])
    animations[1]!.finish()
    await settle()
    expect(completed).toEqual([])
    for (const animation of finiteAnimations(part(scope, 'backdrop'))) animation.finish()
    await settle()
    expect(completed).toEqual([0])
    expect(outside.inert).toBe(false)
    expect(query(scope, 'content')).toBeNull()
  })

  it('strictMode 重开撤销旧退出，卸载立即释放且不误发完成', async () => {
    installLongExit(scope)
    const completed: number[] = []
    const onExitComplete = () => completed.push(getLayerRegistry(document).list().length)
    const setOpen = await mount(open => (
      <StrictMode>
        {scope === 'dialog'
          ? <XhDialogRoot open={open} onExitComplete={onExitComplete}><XhDialogContent><XhDialogTitle>标题</XhDialogTitle></XhDialogContent></XhDialogRoot>
          : <XhDrawerRoot open={open} onExitComplete={onExitComplete}><XhDrawerContent><XhDrawerTitle>标题</XhDrawerTitle></XhDrawerContent></XhDrawerRoot>}
      </StrictMode>
    ))
    await setOpen(false)
    const old = finiteAnimations(part(scope, 'content'))
    await setOpen(true)
    for (const animation of old) animation.cancel()
    await settle()
    expect(part(scope, 'content').inert).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    expect(completed).toEqual([])
    await setOpen(false)
    await inAct(() => root!.unmount())
    root = null
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(completed).toEqual([])
  })
})

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

/** 只在这一段里开 act 环境标记：退场动画结束派的状态更新在 act 之外，不受它管。 */
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
  if (root) {
    const current = root
    await inAct(() => {
      current.unmount()
    })
  }
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 6; i++) {
    await inAct(async () => {
      await Promise.resolve()
    })
  }
}

/** 挂一棵受控展开的树，返回改展开态的动作。首帧即展开。 */
async function mount(render: (open: boolean) => ReactNode): Promise<(open: boolean) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  const created = createRoot(host)
  root = created
  const setOpen = async (open: boolean): Promise<void> => {
    await inAct(() => {
      created.render(render(open))
    })
    await settle()
  }
  await setOpen(true)
  return setOpen
}

function query(scope: string, name: string): HTMLElement | null {
  return document.querySelector(`[data-scope='${scope}'][data-part='${name}']`)
}

function part(scope: string, name: string): HTMLElement {
  const el = query(scope, name)
  if (!el)
    throw new Error(`没有 ${scope} 的 ${name} 节点`)
  return el
}

/** 点一下：走 React 的事件处理器，机器的提交在这一路上是同步冲刷的。 */
async function click(el: HTMLElement): Promise<void> {
  await inAct(() => {
    el.click()
  })
  await settle()
}

/**
 * 断言这一刻节点身上真的在播这支动画。
 *
 * 只查 animationName 是不够的：祖先一旦 display: none，节点不生成盒子、动画从没启动过，
 * 而 animationName 照常算得出。两条一起查才分得清「皮肤上写着」和「真的在播」。
 */
function expectPlaying(el: HTMLElement, name: string, hint = '这一刻该在播这支动画'): void {
  expect(getComputedStyle(el).animationName, `${hint}：皮肤该给出这支动画`).toBe(name)
  const playing = el.getAnimations().map(a => (a as CSSAnimation).animationName)
  expect(playing, `${hint}：动画得真的启动了，不只是皮肤上写着`).toContain(name)
}

/** 等一次自己的 animationend，超时即放弃（返回 false）。 */
function animationEnd(el: HTMLElement, timeout = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeout, false)
    el.addEventListener('animationend', (e) => {
      if (e.target !== el)
        return
      clearTimeout(timer)
      resolve(true)
    }, { once: true })
  })
}

describe('dialog 退场', () => {
  const tree = (open: boolean): ReactNode => (
    <XhDialogRoot open={open}>
      <XhDialogContent>
        <XhDialogTitle>标题</XhDialogTitle>
      </XhDialogContent>
    </XhDialogRoot>
  )

  it('收起后 content 留在 DOM 里，并且真的在播退场动画', async () => {
    const setOpen = await mount(tree)
    expect(query('dialog', 'content'), '展开时 content 应在 DOM 里').not.toBeNull()

    await setOpen(false)

    const closing = query('dialog', 'content')
    expect(closing, '退场动画播完之前 content 不能被卸载').not.toBeNull()
    // 皮肤若给 content 补了 [hidden]{display:none}，元素不生成盒子、动画不启动，
    // 退场探测直接放弃租约，动画一帧都播不出来
    expect(getComputedStyle(closing!).display, 'content 收起态不能是 display:none').not.toBe('none')
    expectPlaying(closing!, 'xh-dialog-out')
  })

  it('遮罩同时在播淡出', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const backdrop = query('dialog', 'backdrop')
    expect(backdrop).not.toBeNull()
    expectPlaying(backdrop!, 'xh-fade-out')
  })

  it('动画结束后才卸载', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('dialog', 'content')
    expect(await animationEnd(closing), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(query('dialog', 'content'), '动画结束后应当卸载').toBeNull()
  })

  it('退场中途重新展开不留残骸，下一次收起还能再播一次退场', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)
    await setOpen(true)

    expect(document.querySelectorAll('[data-scope=\'dialog\'][data-part=\'content\']')).toHaveLength(1)
    expectPlaying(part('dialog', 'content'), 'xh-dialog-in')

    // 被打断的那张退场租约要在重新展开时归还：没归还的话它会一直占着，
    // 下一次收起等不到「所有租约归还」，弹窗就永远卸不掉
    await setOpen(false)
    const closing = part('dialog', 'content')
    expectPlaying(closing, 'xh-dialog-out', '第二次收起也要播退场')
    expect(await animationEnd(closing)).toBe(true)
    await settle()
    expect(query('dialog', 'content'), '第二次退场结束后同样应当卸载').toBeNull()
  })

  it('非受控时从关闭钮收起，同样播完退场才卸载', async () => {
    // 这一路的收起发生在 React 的事件处理器里、机器的提交是同步冲刷的，
    // 与父层重渲改 prop 那条路不是同一条：退场探测要在这一路上也读得到已落定的 data-state
    await mount(() => (
      <XhDialogRoot defaultOpen>
        <XhDialogContent>
          <XhDialogTitle>标题</XhDialogTitle>
          <XhDialogCloseTrigger>关闭</XhDialogCloseTrigger>
        </XhDialogContent>
      </XhDialogRoot>
    ))

    await click(part('dialog', 'close-trigger'))

    const closing = part('dialog', 'content')
    expect(getComputedStyle(closing).display, 'content 收起态不能是 display:none').not.toBe('none')
    expectPlaying(closing, 'xh-dialog-out')

    expect(await animationEnd(closing), '退场动画应当真的结束一次').toBe(true)
    await settle()
    expect(query('dialog', 'content'), '动画结束后应当卸载').toBeNull()
  })
})

describe('drawer 退场', () => {
  const tree = (open: boolean): ReactNode => (
    <XhDrawerRoot open={open}>
      <XhDrawerContent>
        <XhDrawerTitle>标题</XhDrawerTitle>
      </XhDrawerContent>
    </XhDrawerRoot>
  )

  it('收起后 content 留在 DOM 里，并且真的在播滑出', async () => {
    const setOpen = await mount(tree)
    expect(query('drawer', 'content'), '展开时 content 应在 DOM 里').not.toBeNull()

    await setOpen(false)

    const closing = query('drawer', 'content')
    expect(closing, '退场动画播完之前 content 不能被卸载').not.toBeNull()
    expect(getComputedStyle(closing!).display, 'content 收起态不能是 display:none').not.toBe('none')
    // side 缺省是 right，滑出按边配对
    expectPlaying(closing!, 'xh-drawer-out-right')
  })

  it('遮罩同时在播淡出', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const backdrop = query('drawer', 'backdrop')
    expect(backdrop).not.toBeNull()
    expectPlaying(backdrop!, 'xh-fade-out')
  })

  it('动画结束后才卸载', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('drawer', 'content')
    expect(await animationEnd(closing), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(query('drawer', 'content'), '动画结束后应当卸载').toBeNull()
  })
})

describe('image-viewer 退场', () => {
  const tree = (open: boolean): ReactNode => (
    <XhImageViewerRoot open={open} collection={[{ src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' }]}>
      <XhImageViewerContent />
    </XhImageViewerRoot>
  )

  it('收起后 content 留在 DOM 里并在播淡出', async () => {
    const setOpen = await mount(tree)
    expect(query('image-viewer', 'content'), '展开时 content 应在 DOM 里').not.toBeNull()

    await setOpen(false)

    const closing = query('image-viewer', 'content')
    expect(closing, '退场动画播完之前 content 不能被卸载').not.toBeNull()
    expect(getComputedStyle(closing!).display, 'content 收起态不能是 display:none').not.toBe('none')
    expectPlaying(closing!, 'xh-fade-out')
  })

  it('遮罩同时在播淡出', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    // 淡出挂在遮罩自己身上：它一旦带上 hidden，皮肤又没给它声明 display，
    // UA 的 [hidden]{display:none} 就压下来了，淡出一帧都播不出来
    const backdrop = part('image-viewer', 'backdrop')
    expect(backdrop.hasAttribute('hidden'), '退场窗口内遮罩不能带 hidden').toBe(false)
    expect(getComputedStyle(backdrop).display, '遮罩收起态不能是 display:none').not.toBe('none')
    expectPlaying(backdrop, 'xh-fade-out')
  })

  it('定位层收起态不能塌掉：整棵内容都在它底下', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    // 定位层带上 hidden 就会吃到皮肤那条 [hidden]{display:none}，底下的 content 跟着
    // 不生成盒子，退场探测读得到 animationName 却等不到 animationend，
    // 浮层要卡到兜底票过期才收
    const positioner = part('image-viewer', 'positioner')
    expect(positioner.hasAttribute('hidden'), '退场窗口内定位层不能带 hidden').toBe(false)
    expect(getComputedStyle(positioner).display, 'positioner 收起态不能是 display:none').not.toBe('none')
    expect(part('image-viewer', 'content').getBoundingClientRect().width, 'content 得真的生成盒子').toBeGreaterThan(0)
  })

  it('动画结束后才卸载', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('image-viewer', 'content')
    expect(await animationEnd(closing), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(query('image-viewer', 'content'), '动画结束后应当卸载').toBeNull()
  })

  it('内容和遮罩的全部退出租约完成前保留模态资源，完成后才通知', async () => {
    installLongExit('image-viewer')
    const outside = document.createElement('button')
    document.body.append(outside)
    const setOpen = await mount(open => (
      <XhImageViewerRoot
        open={open}
        collection={[{ src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=' }]}
      >
        <XhImageViewerContent><button type="button">内部</button></XhImageViewerContent>
      </XhImageViewerRoot>
    ))

    await setOpen(false)
    await new Promise(resolve => requestAnimationFrame(resolve))
    const content = part('image-viewer', 'content')
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(outside.inert).toBe(true)
    expect(document.body.style.overflow).toBe('hidden')

    const contentAnimations = finiteAnimations(content)
    expect(contentAnimations).toHaveLength(2)
    contentAnimations[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    contentAnimations[1]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    for (const animation of finiteAnimations(part('image-viewer', 'backdrop'))) animation.finish()
    await settle()

    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(outside.inert).toBe(false)
    expect(query('image-viewer', 'content')).toBeNull()
  })
})

describe('tour 退出资源', () => {
  it('气泡、遮罩与聚光灯全部完成前保留 Layer，但不接入 Tour 没有的背景资源', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-tour-exit { from { opacity: 1 } to { opacity: 0 } }
      @keyframes test-tour-move { from { translate: 0 0 } to { translate: 0 8px } }
      [data-scope='tour'][data-part='content'][data-state='closed'] {
        animation: test-tour-exit 60s linear forwards, test-tour-move 60s linear forwards;
      }
      [data-scope='tour'][data-part='backdrop'][data-state='closed'],
      [data-scope='tour'][data-part='spotlight'][data-state='closed'] {
        animation: test-tour-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const target = document.createElement('button')
    target.id = 'tour-exit-target'
    document.body.append(target)
    const setOpen = await mount(open => (
      <XhTourRoot open={open} steps={[{ id: 'one', target: '#tour-exit-target', title: '第一步' }]}>
        <XhTourBackdrop />
        <XhTourSpotlight />
        <XhTourPositioner><XhTourContent><XhTourTitle /></XhTourContent></XhTourPositioner>
      </XhTourRoot>
    ))

    await setOpen(false)
    await new Promise(resolve => requestAnimationFrame(resolve))
    const content = part('tour', 'content')
    const backdrop = part('tour', 'backdrop')
    const spotlight = part('tour', 'spotlight')
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(target.inert).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')

    const contentAnimations = finiteAnimations(content)
    expect(contentAnimations).toHaveLength(2)
    contentAnimations[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    contentAnimations[1]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    for (const animation of finiteAnimations(backdrop)) animation.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    for (const animation of finiteAnimations(spotlight)) animation.finish()
    await settle()
    await new Promise(resolve => requestAnimationFrame(resolve))
    await settle()

    expect(getLayerRegistry(document).list()).toHaveLength(0)
    expect(content.style.display).toBe('none')
  })
})

describe('popover 退场', () => {
  const tree = (open: boolean): ReactNode => (
    <XhPopoverRoot open={open}>
      <XhPopoverTrigger>打开</XhPopoverTrigger>
      <XhPopoverPositioner>
        <XhPopoverContent>正文</XhPopoverContent>
      </XhPopoverPositioner>
    </XhPopoverRoot>
  )

  it('收起后 content 仍在布局里，并且真的在播退场动画', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('popover', 'content')
    expect(getComputedStyle(closing).display, 'content 收起态不能是 display:none').not.toBe('none')
    expectPlaying(closing, 'xh-pop-out')
  })

  it('动画结束后才落成内联收起', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('popover', 'content')
    expect(await animationEnd(closing), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(closing.style.display, '动画结束后应当由宿主写内联 display:none').toBe('none')
  })

  it('退场中途重新展开不留残骸，下一次收起还能再播一次退场', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)
    await setOpen(true)

    const content = part('popover', 'content')
    expect(content.style.display).not.toBe('none')
    expectPlaying(content, 'xh-overlay-pop-in')

    // 被打断的那张退场租约要在重新展开时归还：没归还的话下一次收起等不到
    // 「所有租约归还」，面板就永远停在退场态、内联收起再也落不下来
    await setOpen(false)
    expectPlaying(content, 'xh-pop-out', '第二次收起也要播退场')
    expect(await animationEnd(content)).toBe(true)
    await settle()
    expect(content.style.display, '第二次退场结束后同样应当收起').toBe('none')
  })
})

describe('select 退场', () => {
  const tree = (open: boolean): ReactNode => (
    <XhSelectRoot open={open}>
      <XhSelectTrigger>选一个</XhSelectTrigger>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectList>
            <XhSelectItem value="a"><XhSelectItemText>甲</XhSelectItemText></XhSelectItem>
          </XhSelectList>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>
  )

  it('收起后 content 仍在布局里，并且真的在播退场动画', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('select', 'content')
    expect(getComputedStyle(closing).display, 'content 收起态不能是 display:none').not.toBe('none')
    expectPlaying(closing, 'xh-overlay-slide-out')
  })

  it('动画结束后才落成内联收起', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('select', 'content')
    expect(await animationEnd(closing), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(closing.style.display, '动画结束后应当由宿主写内联 display:none').toBe('none')
  })

  it('内容全部有限退场完成前保留 Layer，逻辑关闭立即退出交互树', async () => {
    installLongExit('select')
    const setOpen = await mount(tree)
    await setOpen(false)
    await new Promise(resolve => requestAnimationFrame(resolve))

    const content = part('select', 'content')
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    const animations = finiteAnimations(content)
    expect(animations).toHaveLength(2)
    animations[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    animations[1]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})

describe('date-picker 退场', () => {
  /** 两张日历并排的面板：content 靠 :has 认出第二张才横排。 */
  const tree = (open: boolean): ReactNode => (
    <XhDatePickerRoot open={open}>
      <XhDatePickerControl />
      <XhDatePickerPositioner>
        <XhDatePickerContent>
          <XhDatePickerCalendar index={0} />
          <XhDatePickerCalendar index={1} />
        </XhDatePickerContent>
      </XhDatePickerPositioner>
    </XhDatePickerRoot>
  )

  it('展开时两张日历横排', async () => {
    await mount(tree)
    expect(getComputedStyle(part('date-picker', 'content')).display).toBe('flex')
  })

  it('退场那一帧仍横排：收起会给 content 打 hidden，横排规则不能跟着失配', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('date-picker', 'content')
    expect(getComputedStyle(closing).display, '退场帧若退回 block，两张日历会竖着堆起来闪一下').toBe('flex')
    expectPlaying(closing, 'xh-overlay-slide-out')
  })

  it('动画结束后才落成内联收起', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('date-picker', 'content')
    expect(await animationEnd(closing), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(closing.style.display, '动画结束后应当由宿主写内联 display:none').toBe('none')
  })
})

describe('floating-panel 退场', () => {
  /** 面板：作者的节点始终留在原地，收起落在 positioner 的内联 display 上。 */
  const tree = (open: boolean): ReactNode => (
    <XhFloatingPanelRoot open={open}>
      <XhFloatingPanelPositioner>
        <XhFloatingPanelContent>
          <XhFloatingPanelTitle>面板</XhFloatingPanelTitle>
        </XhFloatingPanelContent>
      </XhFloatingPanelPositioner>
    </XhFloatingPanelRoot>
  )

  it('收起后 positioner 留在布局里，并且真的在播退场动画', async () => {
    const setOpen = await mount(tree)
    expect(query('floating-panel', 'positioner'), '展开时 positioner 应在 DOM 里').not.toBeNull()

    await setOpen(false)

    // 面板整棵子树都在 positioner 底下：它一收就不生成盒子，退场动画一帧都播不出来
    const positioner = part('floating-panel', 'positioner')
    expect(getComputedStyle(positioner).display, 'positioner 收起态不能是 display:none').not.toBe('none')
    expectPlaying(positioner, 'xh-pop-out')
  })

  it('动画结束后才真的收起', async () => {
    const setOpen = await mount(tree)
    const positioner = part('floating-panel', 'positioner')

    await setOpen(false)
    expect(await animationEnd(positioner), '退场动画应当真的结束一次').toBe(true)
    await settle()

    expect(getComputedStyle(positioner).display, '动画结束后应当收起').toBe('none')
  })

  it('退场中途重新展开不留残骸，下一次收起还能再播一次退场', async () => {
    const setOpen = await mount(tree)
    const positioner = part('floating-panel', 'positioner')

    await setOpen(false)
    await setOpen(true)

    expect(getComputedStyle(positioner).display).not.toBe('none')
    expectPlaying(positioner, 'xh-pop-in')

    // 被打断的那张退场租约要在重新展开时归还：没归还的话下一次收起等不到
    // 「所有租约归还」，面板就永远停在退场态、内联收起再也落不下来
    await setOpen(false)
    expectPlaying(positioner, 'xh-pop-out', '第二次收起也要播退场')
    expect(await animationEnd(positioner)).toBe(true)
    await settle()
    expect(getComputedStyle(positioner).display, '第二次退场结束后同样应当收起').toBe('none')
  })
})

describe('tool-call 收起', () => {
  const tree = (open: boolean): ReactNode => (
    <XhToolCallRoot open={open}>
      <XhToolCallTrigger>查天气</XhToolCallTrigger>
      <XhToolCallContent>正文</XhToolCallContent>
    </XhToolCallRoot>
  )

  it('严格模式重建后仍能结清退出租约，再次展开和关闭也正常', async () => {
    const setOpen = await mount(open => <StrictMode>{tree(open)}</StrictMode>)
    for (let round = 0; round < 2; round++) {
      await setOpen(false)
      const content = part('tool-call', 'content')
      for (const animation of content.getAnimations()) animation.finish()
      await settle()
      expect(content.style.display).toBe('none')
      await setOpen(true)
      expect(content.style.display).not.toBe('none')
    }
  })

  it('收起后 content 仍在布局里，并且真的在播收拢动画', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('tool-call', 'content')
    expect(getComputedStyle(closing).display, 'content 收起态不能是 display:none').not.toBe('none')
    expectPlaying(closing, 'xh-tool-call-collapse')
  })

  it('动画结束后才落成内联收起', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('tool-call', 'content')
    expect(await animationEnd(closing), '收拢动画应当真的结束一次').toBe(true)
    await settle()

    expect(closing.style.display, '动画结束后应当由宿主写内联 display:none').toBe('none')
  })

  it('收拢中途重新展开不留残骸，下一次收起还能再播一次收拢', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)
    await setOpen(true)

    const content = part('tool-call', 'content')
    expect(content.style.display).not.toBe('none')
    expectPlaying(content, 'xh-tool-call-expand')

    // 被打断的那张退场租约要在重新展开时归还：没归还的话下一次收起等不到
    // 「所有租约归还」，详情区就永远停在退场态、内联收起再也落不下来
    await setOpen(false)
    expectPlaying(content, 'xh-tool-call-collapse', '第二次收起也要播收拢')
    expect(await animationEnd(content)).toBe(true)
    await settle()
    expect(content.style.display, '第二次收拢结束后同样应当收起').toBe('none')
  })
})

describe('reasoning 收起', () => {
  const tree = (open: boolean): ReactNode => (
    <XhReasoningRoot open={open}>
      <XhReasoningTrigger>想了想</XhReasoningTrigger>
      <XhReasoningContent>正文</XhReasoningContent>
    </XhReasoningRoot>
  )

  it('收起后 content 仍在布局里，并且真的在播收拢动画', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('reasoning', 'content')
    expect(getComputedStyle(closing).display, 'content 收起态不能是 display:none').not.toBe('none')
    expectPlaying(closing, 'xh-reasoning-collapse')
  })

  it('动画结束后才落成内联收起', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)

    const closing = part('reasoning', 'content')
    expect(await animationEnd(closing), '收拢动画应当真的结束一次').toBe(true)
    await settle()

    expect(closing.style.display, '动画结束后应当由宿主写内联 display:none').toBe('none')
  })

  it('收拢中途重新展开不留残骸，下一次收起还能再播一次收拢', async () => {
    const setOpen = await mount(tree)
    await setOpen(false)
    await setOpen(true)

    const content = part('reasoning', 'content')
    expect(content.style.display).not.toBe('none')
    expectPlaying(content, 'xh-reasoning-expand')

    // 被打断的那张退场租约要在重新展开时归还：没归还的话下一次收起等不到
    // 「所有租约归还」，思考正文就永远停在退场态、内联收起再也落不下来
    await setOpen(false)
    expectPlaying(content, 'xh-reasoning-collapse', '第二次收起也要播收拢')
    expect(await animationEnd(content)).toBe(true)
    await settle()
    expect(content.style.display, '第二次收拢结束后同样应当收起').toBe('none')
  })
})
