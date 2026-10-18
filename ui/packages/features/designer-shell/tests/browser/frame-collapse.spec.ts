// 外框的分隔条双击折叠：左边那条收起物料、右边那条收起属性、下方那条收起问题，再双击放回折叠前的大小；
// 收起期间外框重排（换了显示的面板、外框变宽变窄）后仍收着，再双击放回的还是折叠前的大小；sizes-change 记的是折叠前的大小。
import type { DesignerFrameEventMap, DesignerFrameSizes, XhDesignerFrameElement } from '../../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let frame: XhDesignerFrameElement
let seen: DesignerFrameSizes[]

async function settle(): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await frame.updateComplete
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
  const finite = document.getAnimations().filter(animation => animation.effect?.getComputedTiming().endTime !== Infinity)
  await Promise.all(finite.map(animation => animation.finished.catch(() => {})))
  await new Promise(resolve => requestAnimationFrame(resolve))
}

beforeEach(async () => {
  frame = document.createElement('xh-designer-frame')
  frame.style.cssText = 'position:fixed;left:20px;top:20px;width:1100px;height:640px'
  for (const name of ['toolbar', 'palette', 'properties', 'issues']) {
    const content = document.createElement('div')
    content.setAttribute('slot', name)
    content.style.cssText = name === 'toolbar' ? 'height:40px' : 'min-height:0'
    frame.append(content)
  }
  frame.append(document.createElement('div'))
  seen = []
  frame.addEventListener('sizes-change', event => seen.push((event as DesignerFrameEventMap['sizes-change']).detail.sizes))
  document.body.prepend(frame)
  await settle()
})

afterEach(() => {
  frame.remove()
})

function extent(name: string): { width: number, height: number } {
  const box = frame.querySelector(`[data-part="region"][data-region="${name}"]`)!.getBoundingClientRect()
  return { width: box.width, height: box.height }
}

function trigger(orientation: 'horizontal' | 'vertical', index: number): HTMLElement {
  const splitter = frame.querySelector(`[data-part="splitter"][data-orientation="${orientation}"]`)!
  return splitter.querySelectorAll<HTMLElement>(':scope > div > [data-xh-part="resize-trigger"]')[index]!
}

/** 三处都比各自的下限宽：放回的大小要与下限分得开。 */
async function widen(): Promise<void> {
  frame.sizes = { start: 30, end: 32, bottom: 45 }
  await settle()
  seen.length = 0
}

async function dblclick(target: HTMLElement): Promise<void> {
  await userEvent.dblClick(target)
  await settle()
}

describe('<xh-designer-frame> 双击分隔条（Chromium）', () => {
  it('左、右、下三条分隔条双击各收起那一侧的面板，再双击放回原来的大小', async () => {
    const before = { palette: extent('palette').width, properties: extent('properties').width, issues: extent('issues').height }
    for (const [name, target, measure] of [
      ['palette', () => trigger('horizontal', 0), () => extent('palette').width],
      ['properties', () => trigger('horizontal', 1), () => extent('properties').width],
      ['issues', () => trigger('vertical', 0), () => extent('issues').height],
    ] as const) {
      await dblclick(target())
      expect([name, measure()]).toEqual([name, expect.closeTo(0, 0)])
      await dblclick(target())
      expect([name, Math.round(measure())]).toEqual([name, Math.round(before[name])])
    }
  })

  it('收起期间换了显示的面板、外框变宽变窄后仍收着，再双击放回折叠前的大小；sizes-change 记的是折叠前的大小', async () => {
    await widen()
    const width = extent('palette').width
    await dblclick(trigger('horizontal', 0))
    expect(extent('palette').width).toBeCloseTo(0, 0)
    const recorded = seen.at(-1)!
    expect(recorded.start).toBeCloseTo(30, 0)

    frame.panels = 'toolbar palette properties'
    await settle()
    expect(extent('palette').width).toBeCloseTo(0, 0)
    frame.style.width = '1000px'
    await settle()
    expect(extent('palette').width).toBeCloseTo(0, 0)
    frame.style.width = '1100px'
    await settle()

    await dblclick(trigger('horizontal', 0))
    expect(Math.round(extent('palette').width)).toBe(Math.round(width))
    expect(document.activeElement).toBe(trigger('horizontal', 0))
  })

  it('按 Enter 收起右侧，外框重排后再按 Enter 放回原来的大小，焦点留在那条分隔条上', async () => {
    await widen()
    const width = extent('properties').width
    const enter = async (): Promise<void> => {
      trigger('horizontal', 1).focus()
      await userEvent.keyboard('{Enter}')
      await settle()
    }
    await enter()
    expect(extent('properties').width).toBeCloseTo(0, 0)
    frame.style.width = '1000px'
    await settle()
    frame.style.width = '1100px'
    await settle()
    expect(extent('properties').width).toBeCloseTo(0, 0)
    await enter()
    expect([Math.round(extent('properties').width), document.activeElement]).toEqual([Math.round(width), trigger('horizontal', 1)])
  })

  it('「面板」菜单里收起的面板不打勾，勾上就按原来的大小放回，panels 不变', async () => {
    await widen()
    const height = extent('issues').height
    await dblclick(trigger('vertical', 0))
    expect(frame.panelEntries().find(entry => entry.name === 'issues')!.shown).toBe(false)
    frame.togglePanel('issues')
    await settle()
    expect([Math.round(extent('issues').height), frame.panelEntries().find(entry => entry.name === 'issues')!.shown, frame.panels]).toEqual([Math.round(height), true, undefined])
  })
})
