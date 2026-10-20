// 新手引导在真实 Chromium 与组件皮肤下：第一步居中，往下走时高亮框落在外框的工具栏与面板上；
// 收成标题条的面板走到那一步时被展开；Esc 收起并派发 tour-end（skip）；没有 wc.* 诊断，axe 也没有违规。
// 引导限在外框里：遮罩与居中步只铺外框，高亮框的暗幕裁在外框里，外框外照常能点；同一页只跑一个引导；
// 窄屏时引导打开的抽屉不盖住提示框，换到别的步骤与收起时收回。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerCommand } from '@xihan-ui/designer-kit'
import type { DesignerTourEventMap, XhDesignerFrameElement, XhDesignerTourElement } from '../../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { arrangeMenubar, createCommandMenubar, defineDesignerShell, DESIGNER_COMMANDS_EN_US, designerMenubarLayout, designerMenubarMenus } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let stage: HTMLElement | undefined

afterEach(() => {
  stage?.remove()
  stage = undefined
})

async function frames(count = 2): Promise<void> {
  for (let i = 0; i < count; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
}

/** 等进场动画与定位落定。 */
async function settle(): Promise<void> {
  await frames(3)
  const finite = document.getAnimations().filter(animation => animation.effect?.getComputedTiming().endTime !== Infinity)
  await Promise.all(finite.map(animation => animation.finished.catch(() => {})))
  await frames(2)
}

/** 外框最上一条放一条命令菜单栏：文件（保存、设置）与帮助（关于）两张菜单。 */
function addMenubar(frame: XhDesignerFrameElement): void {
  const command = (id: string, label: string): DesignerCommand<undefined> => ({ id, label, run: () => {} })
  const commands = new Map([command('save', 'Save'), command('settings', 'Settings'), command('about', 'About')].map(item => [item.id, item]))
  const bar = createCommandMenubar<undefined>(document, { platform: 'other' })
  bar.element.slot = 'menubar'
  bar.update(arrangeMenubar(designerMenubarMenus<undefined>({ translations: () => DESIGNER_COMMANDS_EN_US }), commands, designerMenubarLayout(commands)), commands, undefined, { menubar: 'Menu bar', menu: 'Menu' })
  frame.prepend(bar.element)
}

async function mount(style = 'position:fixed;left:0;top:0;width:1000px;height:640px', options: { readonly menubar?: boolean } = {}): Promise<{ frame: XhDesignerFrameElement, tour: XhDesignerTourElement, ends: DesignerTourEventMap['tour-end']['detail'][] }> {
  stage ??= document.createElement('div')
  const frame = document.createElement('xh-designer-frame')
  frame.style.cssText = style
  frame.regions = [
    ...(options.menubar ? [{ name: 'menubar', position: 'menubar' } as const] : []),
    { name: 'toolbar', position: 'top' },
    { name: 'palette', position: 'start', title: '物料' },
    { name: 'canvas', position: 'center' },
    { name: 'properties', position: 'end', title: '属性' },
    { name: 'issues', position: 'bottom', title: '问题' },
  ]
  for (const name of ['toolbar', 'palette', 'properties', 'issues']) {
    const content = document.createElement('div')
    content.slot = name
    content.textContent = name
    content.style.cssText = name === 'toolbar' ? 'height:40px' : 'min-height:0'
    frame.append(content)
  }
  frame.append(document.createElement('div'))
  if (options.menubar)
    addMenubar(frame)
  const tour = document.createElement('xh-designer-tour')
  tour.frame = frame
  stage.append(frame, tour)
  document.body.append(stage)
  await frame.updateComplete
  await tour.updateComplete
  await frames()
  const ends: DesignerTourEventMap['tour-end']['detail'][] = []
  tour.addEventListener('tour-end', event => ends.push((event as DesignerTourEventMap['tour-end']).detail))
  return { frame, tour, ends }
}

function part(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="tour"][data-part="${name}"]`)!
}

/** 两个矩形相同（差一像素以内）。 */
function expectRect(actual: DOMRect, expected: DOMRect): void {
  expect([actual.left, actual.top, actual.width, actual.height].map(Math.round)).toEqual([expected.left, expected.top, expected.width, expected.height].map(Math.round))
}

/** 高亮框 clip-path 裁出的矩形（视口坐标）：inset 的四个值是区域相对高亮框四条边的距离。 */
function clipRect(element: HTMLElement): DOMRect {
  const values = /inset\(([^)]*)\)/.exec(getComputedStyle(element).clipPath)![1]!.split(/\s+/).map(value => Number.parseFloat(value))
  const [top, right = top, bottom = top, left = right] = values as [number, number?, number?, number?]
  const box = element.getBoundingClientRect()
  return new DOMRect(box.left + left, box.top + top, box.width - left - right, box.height - top - bottom)
}

/** 从当前这一步往下走到 id 那一步。 */
async function walkTo(tour: XhDesignerTourElement, id: string): Promise<void> {
  const index = tour.plannedSteps().findIndex(step => step.id === id)
  while (Number(part('content').dataset.step) < index) {
    await userEvent.click(part('next-trigger'))
    await settle()
  }
}

/** 点 (x, y) 落在 element 上（含它的子孙）。 */
function hits(element: Element, x: number, y: number): boolean {
  const top = document.elementFromPoint(x, y)
  return top !== null && element.contains(top)
}

function region(frame: XhDesignerFrameElement, name: string): DOMRect {
  return frame.querySelector<HTMLElement>(`[data-part="region"][data-region="${name}"]`)!.getBoundingClientRect()
}

/** 高亮框盖住了目标（四边各留出 spotlight-padding）。 */
function covers(outer: DOMRect, inner: DOMRect): boolean {
  return outer.left <= inner.left + 1 && outer.top <= inner.top + 1 && outer.right >= inner.right - 1 && outer.bottom >= inner.bottom - 1
}

describe('引导限在外框里', () => {
  it('遮罩与居中步的定位层只铺外框，对话框不标模态；外框外的按钮照样能点，引导不收起', async () => {
    const { frame, tour } = await mount('position:fixed;left:40px;top:40px;width:800px;height:520px')
    const outside = document.createElement('button')
    outside.textContent = '外面'
    outside.style.cssText = 'position:fixed;left:1000px;top:600px;width:120px;height:40px'
    stage!.append(outside)
    let clicks = 0
    outside.addEventListener('click', () => clicks++)
    expect(tour.start()).toBe(true)
    await settle()
    const box = frame.getBoundingClientRect()
    expectRect(part('backdrop').getBoundingClientRect(), box)
    expectRect(part('positioner').getBoundingClientRect(), box)
    expect(part('content').hasAttribute('aria-modal')).toBe(false)
    expect(hits(outside, 1060, 620)).toBe(true)
    await userEvent.click(outside)
    expect(clicks).toBe(1)
    expect(tour.running).toBe(true)
  })

  it('锚定步的高亮框连同暗幕裁在外框里：裁出的矩形等于外框，换步滑过去之后也一样', async () => {
    const { frame, tour } = await mount('position:fixed;left:40px;top:40px;width:800px;height:520px')
    tour.start()
    await settle()
    await walkTo(tour, 'shell.toolbar')
    expect(part('spotlight').hidden).toBe(false)
    expectRect(clipRect(part('spotlight')), frame.getBoundingClientRect())
    await userEvent.click(part('next-trigger'))
    await settle()
    expect(part('title').textContent).toBe('Palette')
    expectRect(clipRect(part('spotlight')), frame.getBoundingClientRect())
  })

  it('同一页只跑一个引导：一个开着时另一个 start() 不开始；force 先收起开着的那个', async () => {
    const first = await mount('position:fixed;left:0;top:0;width:600px;height:400px')
    const second = await mount('position:fixed;left:640px;top:0;width:600px;height:400px')
    expect(first.tour.start()).toBe(true)
    await settle()
    expect(second.tour.start()).toBe(false)
    expect(second.tour.running).toBe(false)
    expect(document.querySelectorAll('[data-scope="tour"][data-part="content"]:not([hidden])')).toHaveLength(1)
    expect(second.tour.start({ force: true })).toBe(true)
    await settle()
    expect([first.tour.running, second.tour.running]).toEqual([false, true])
    expect(first.ends).toEqual([{ reason: 'close', step: 'shell.welcome' }])
    expect(document.querySelectorAll('[data-scope="tour"][data-part="content"]:not([hidden])')).toHaveLength(1)
    expectRect(part('backdrop').getBoundingClientRect(), second.frame.getBoundingClientRect())
  })

  it('窄屏：引导打开的抽屉不盖住提示框；换到不是面板的那一步与收起时把抽屉收回', async () => {
    await page.viewport(375, 700)
    try {
      const { frame, tour } = await mount('position:fixed;inset:0')
      await frames(4)
      expect(frame.narrow).toBe(true)
      tour.start()
      await settle()
      await walkTo(tour, 'shell.palette')
      await frame.updateComplete
      await settle()
      expect(frame.openDrawer).toBe('start')
      const next = part('next-trigger').getBoundingClientRect()
      expect(hits(part('next-trigger'), next.left + next.width / 2, next.top + next.height / 2)).toBe(true)
      await userEvent.click(part('next-trigger'))
      await settle()
      expect(part('title').textContent).toBe('Canvas')
      expect(frame.openDrawer).toBeUndefined()
      await walkTo(tour, 'shell.properties')
      await frame.updateComplete
      expect(frame.openDrawer).toBe('end')
      await userEvent.keyboard('{Escape}')
      await settle()
      expect([tour.running, frame.openDrawer]).toEqual([false, undefined])
    }
    finally {
      await page.viewport(1280, 800)
    }
  })

  it('窄屏：打开抽屉的那一步，高亮框盖住滑进来以后的面板；下一步的面板不在抽屉里时先收回引导打开的抽屉', async () => {
    await page.viewport(375, 700)
    try {
      const { frame, tour } = await mount('position:fixed;inset:0')
      await frames(4)
      tour.start()
      await settle()
      await walkTo(tour, 'shell.palette')
      await frame.updateComplete
      await settle()
      expect(frame.openDrawer).toBe('start')
      expect(covers(part('spotlight').getBoundingClientRect(), region(frame, 'palette'))).toBe(true)
      await walkTo(tour, 'shell.properties')
      await frame.updateComplete
      await settle()
      expect(frame.openDrawer).toBe('end')
      expect(covers(part('spotlight').getBoundingClientRect(), region(frame, 'properties'))).toBe(true)
      await userEvent.click(part('next-trigger'))
      await frame.updateComplete
      await settle()
      expect(part('title').textContent).toBe('Problems')
      expect(frame.openDrawer).toBeUndefined()
      const issues = region(frame, 'issues')
      expect(covers(part('spotlight').getBoundingClientRect(), issues)).toBe(true)
      // 问题面板没被抽屉盖住：中心点上去掉引导自己的几层，最上面的是问题面板
      const under = document.elementsFromPoint(issues.left + issues.width / 2, issues.top + issues.height / 2).find(element => !element.closest('[data-scope="tour"]'))
      expect(frame.querySelector('[data-part="region"][data-region="issues"]')!.contains(under ?? null)).toBe(true)
    }
    finally {
      await page.viewport(1280, 800)
    }
  })

  it('收起时焦点回到开始时持有它的元素；那个元素已不在文档里时退回外框画布区里能聚焦的第一个', async () => {
    const { frame, tour } = await mount()
    const inCanvas = document.createElement('button')
    inCanvas.textContent = '画布'
    frame.querySelector('[data-part="region"][data-region="canvas"] > div:not([data-scope])')!.append(inCanvas)
    const holder = document.createElement('button')
    holder.textContent = '别处'
    stage!.append(holder)
    holder.focus()
    tour.start()
    await settle()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(document.activeElement).toBe(holder)
    holder.focus()
    tour.start()
    await settle()
    holder.remove()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(document.activeElement).toBe(inCanvas)
  })
})

describe('引导里的菜单栏', () => {
  it('宽屏：欢迎之后先高亮整条菜单栏，再到工具栏；收尾的设置一步高亮「文件」菜单的入口', async () => {
    const { frame, tour } = await mount(undefined, { menubar: true })
    tour.start()
    await settle()
    await userEvent.click(part('next-trigger'))
    await settle()
    expect(part('title').textContent).toBe('Menu bar')
    expect(covers(part('spotlight').getBoundingClientRect(), region(frame, 'menubar'))).toBe(true)
    await userEvent.click(part('next-trigger'))
    await settle()
    expect(part('title').textContent).toBe('Toolbar')
    await walkTo(tour, 'shell.settings')
    expect(part('title').textContent).toBe('Settings')
    const file = frame.querySelector<HTMLElement>('[data-scope="menubar"][data-part="trigger"][value="file"]')!
    expect(file.checkVisibility()).toBe(true)
    expect(covers(part('spotlight').getBoundingClientRect(), file.getBoundingClientRect())).toBe(true)
  })

  it('窄屏：菜单栏收成「菜单」钮，菜单栏一步与设置一步都高亮这颗钮', async () => {
    await page.viewport(375, 700)
    try {
      const { frame, tour } = await mount('position:fixed;inset:0', { menubar: true })
      await frames(4)
      expect(frame.narrow).toBe(true)
      const button = frame.querySelector<HTMLElement>('[data-scope="designer-menubar"][data-part="menu-trigger"]')!
      expect(button.checkVisibility()).toBe(true)
      tour.start()
      await settle()
      await walkTo(tour, 'shell.menubar')
      expect(covers(part('spotlight').getBoundingClientRect(), button.getBoundingClientRect())).toBe(true)
      await walkTo(tour, 'shell.settings')
      expect(part('title').textContent).toBe('Settings')
      const spot = part('spotlight').getBoundingClientRect()
      expect(covers(spot, button.getBoundingClientRect())).toBe(true)
      expect(spot.width).toBeLessThan(region(frame, 'menubar').width)
    }
    finally {
      await page.viewport(1280, 800)
    }
  })
})

describe('新手引导', () => {
  it('第一步居中不画高亮框；下一步高亮工具栏，再下一步高亮物料面板', async () => {
    const { frame, tour } = await mount()
    expect(tour.start()).toBe(true)
    await settle()
    expect(part('content').hidden).toBe(false)
    expect(part('title').textContent).toBe('Welcome')
    expect(part('spotlight').hidden).toBe(true)
    await userEvent.click(part('next-trigger'))
    await settle()
    expect(part('title').textContent).toBe('Toolbar')
    expect(covers(part('spotlight').getBoundingClientRect(), region(frame, 'toolbar'))).toBe(true)
    await userEvent.click(part('next-trigger'))
    await settle()
    expect(part('title').textContent).toBe('Palette')
    expect(covers(part('spotlight').getBoundingClientRect(), region(frame, 'palette'))).toBe(true)
  })

  it('收成标题条的面板走到那一步时被展开，高亮框盖住展开后的卡片', async () => {
    const { frame, tour } = await mount()
    frame.setPanelMinimized('properties', true)
    await frame.updateComplete
    await frames()
    tour.start()
    await settle()
    const steps = tour.plannedSteps().map(step => step.id)
    for (let i = 0; i < steps.indexOf('shell.properties'); i++) {
      await userEvent.click(part('next-trigger'))
      await settle()
    }
    expect(part('title').textContent).toBe('Properties')
    expect(frame.resolvedLayout.minimized).toEqual([])
    await frame.updateComplete
    await settle()
    const card = region(frame, 'properties')
    expect(card.height).toBeGreaterThan(100)
    expect(covers(part('spotlight').getBoundingClientRect(), card)).toBe(true)
  })

  it('按 Esc 收起引导，派发 tour-end（skip）；打开时没有 wc.* 诊断，axe 也没有违规', async () => {
    const records: DiagnosticRecord[] = []
    resetDiagnostics()
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    const off = onDiagnostic(record => void records.push(record))
    try {
      const { tour, ends } = await mount()
      tour.start()
      await settle()
      expect(records.filter(record => record.code.startsWith('wc.')).map(record => record.code)).toEqual([])
      await expectNoAxeViolations(part('content'))
      await userEvent.keyboard('{Escape}')
      await settle()
      expect(ends).toEqual([{ reason: 'skip', step: 'shell.welcome' }])
      expect(tour.running).toBe(false)
    }
    finally {
      off()
      resetDiagnostics()
    }
  })
})
