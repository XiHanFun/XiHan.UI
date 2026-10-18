// 外框在窄屏（视口窄于 --xh-breakpoint-md）下：中间一列占满整行，左右两侧的区收进从两边滑出的抽屉，缺省收着；
// togglePanel（「面板」菜单）开关抽屉、同时只开一侧，不改 panels；面板头的「×」与 Esc 收起抽屉；视口变宽回到三栏。
import type { DesignerFrameEventMap, XhDesignerFrameElement } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let frame: XhDesignerFrameElement

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

async function until(check: () => boolean): Promise<void> {
  const start = performance.now()
  while (!check()) {
    if (performance.now() - start > 2000)
      throw new Error('等了 2 秒仍没到期望的状态')
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

function region(name: string): HTMLElement {
  return frame.querySelector<HTMLElement>(`[data-part="region"][data-region="${name}"]`)!
}

/** 区在页面上看得见：有尺寸、没被藏起。 */
function visible(name: string): boolean {
  const element = region(name)
  const rect = element.getBoundingClientRect()
  return element.isConnected && rect.width > 0 && rect.height > 0 && element.checkVisibility()
}

/** 区已经滑到位：看得见，并且整个落在中间这一行里（抽屉进场途中会在行外）。 */
function inPlace(name: string): boolean {
  const body = frame.querySelector('[data-part="body"]')!.getBoundingClientRect()
  const rect = region(name).getBoundingClientRect()
  return visible(name) && rect.left >= body.left - 1 && rect.right <= body.right + 1
}

beforeEach(async () => {
  await page.viewport(375, 700)
  frame = document.createElement('xh-designer-frame')
  frame.style.cssText = 'position:fixed;inset:0'
  frame.regions = [
    { name: 'toolbar', position: 'top' },
    { name: 'palette', position: 'start', title: '物料' },
    { name: 'canvas', position: 'center' },
    { name: 'properties', position: 'end', title: '属性' },
    { name: 'issues', position: 'bottom', title: '问题' },
  ]
  for (const name of ['toolbar', 'palette', 'properties', 'issues']) {
    const content = document.createElement('div')
    content.setAttribute('slot', name)
    content.textContent = name
    content.style.cssText = name === 'toolbar' ? 'height:40px' : 'min-height:0'
    frame.append(content)
  }
  frame.append(document.createElement('div'))
  document.body.prepend(frame)
  await settle()
})

afterEach(async () => {
  frame.remove()
  await page.viewport(1280, 800)
})

describe('<xh-designer-frame> 窄屏（Chromium）', () => {
  it('中间一列占满整行，左右两侧缺省收着；问题区照旧在中间一列下方', async () => {
    expect([frame.narrow, frame.hasAttribute('data-narrow')]).toEqual([true, true])
    const body = frame.querySelector('[data-part="body"]')!.getBoundingClientRect()
    const canvas = region('canvas').getBoundingClientRect()
    expect(Math.abs(canvas.width - body.width)).toBeLessThanOrEqual(1)
    expect([visible('palette'), visible('properties'), visible('issues')]).toEqual([false, false, true])
    expect(frame.panelEntries().map(entry => [entry.name, entry.shown])).toEqual([['palette', false], ['properties', false], ['issues', true]])
  })

  it('togglePanel 打开那一侧的抽屉，同时只开一侧，不改 panels、不派发 panels-change；抽屉压在画布上，不挤窄画布', async () => {
    const changes: string[] = []
    frame.addEventListener('panels-change', event => changes.push((event as DesignerFrameEventMap['panels-change']).detail.panels))
    const canvasWidth = region('canvas').getBoundingClientRect().width
    frame.togglePanel('palette')
    await until(() => inPlace('palette'))
    const body = frame.querySelector('[data-part="body"]')!.getBoundingClientRect()
    const palette = region('palette').getBoundingClientRect()
    // 贴着行首一边，只隔卡片自己的外边距
    expect(palette.left - body.left).toBeLessThan(16)
    expect(palette.width).toBeLessThan(body.width)
    expect(region('canvas').getBoundingClientRect().width).toBe(canvasWidth)
    expect(frame.panelEntries().find(entry => entry.name === 'palette')!.shown).toBe(true)

    frame.togglePanel('properties')
    await until(() => inPlace('properties') && !visible('palette'))
    const properties = region('properties').getBoundingClientRect()
    expect(body.right - properties.right).toBeLessThan(16)
    expect([changes, frame.panels]).toEqual([[], undefined])

    frame.togglePanel('properties')
    await until(() => !visible('properties'))
  })

  it('面板头的「×」与 Esc 都只收起抽屉，panels 不变', async () => {
    frame.togglePanel('palette')
    await until(() => visible('palette'))
    region('palette').querySelector<HTMLButtonElement>('[data-part="panel-close"]')!.click()
    await until(() => !visible('palette'))
    expect(frame.panels).toBeUndefined()

    frame.togglePanel('palette')
    await until(() => visible('palette'))
    region('palette').querySelector<HTMLButtonElement>('[data-part="panel-close"]')!.focus()
    await userEvent.keyboard('{Escape}')
    await until(() => !visible('palette'))
    expect(frame.panelEntries().find(entry => entry.name === 'palette')!.shown).toBe(false)
  })

  it('抽屉里的提示开了又收起，抽屉仍开着；提示的 open-change 照常冒泡到外框外面', async () => {
    frame.regions = frame.regions!.map(item => item.name === 'palette' ? { ...item, help: '拖进画布添加' } : item)
    await settle()
    // 捕获阶段记下提示的每次开合，冒泡阶段记下传到外框外面的
    const seen: unknown[] = []
    const bubbled: unknown[] = []
    const record = (list: unknown[]) => (event: Event): void => {
      if ((event.target as Element).localName === 'xh-tooltip')
        list.push((event as CustomEvent<{ open: boolean }>).detail.open)
    }
    const capture = record(seen)
    const bubble = record(bubbled)
    document.addEventListener('open-change', capture, true)
    document.addEventListener('open-change', bubble)
    try {
      // 抽屉打开后焦点落在面板头的帮助钮上，提示随之打开；Tab 移到关闭钮，提示收起
      frame.togglePanel('palette')
      await until(() => inPlace('palette') && seen.includes(true))
      expect(document.activeElement?.closest('[data-part="panel-help-tip"]')).not.toBeNull()
      await userEvent.tab()
      await until(() => seen.includes(false))
      await settle()
      const shown = frame.panelEntries().find(entry => entry.name === 'palette')!.shown
      expect([shown, visible('palette'), bubbled]).toEqual([true, true, [true, false]])
    }
    finally {
      document.removeEventListener('open-change', capture, true)
      document.removeEventListener('open-change', bubble)
    }
  })

  it('视口变宽回到三栏，抽屉收起；再变窄时两侧仍收着', async () => {
    frame.togglePanel('palette')
    await until(() => visible('palette'))
    await page.viewport(1280, 800)
    await until(() => !frame.narrow)
    await settle()
    expect([visible('palette'), visible('properties'), frame.hasAttribute('data-narrow')]).toEqual([true, true, false])
    await page.viewport(375, 700)
    await until(() => frame.narrow)
    await settle()
    expect([visible('palette'), visible('properties')]).toEqual([false, false])
  })
})
