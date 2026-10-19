// 新手引导在真实 Chromium 与组件皮肤下：第一步居中，往下走时高亮框落在外框的工具栏与面板上；
// 收成标题条的面板走到那一步时被展开；Esc 收起并派发 tour-end（skip）；没有 wc.* 诊断，axe 也没有违规。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { DesignerTourEventMap, XhDesignerFrameElement, XhDesignerTourElement } from '../../src'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
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

async function mount(): Promise<{ frame: XhDesignerFrameElement, tour: XhDesignerTourElement, ends: DesignerTourEventMap['tour-end']['detail'][] }> {
  stage = document.createElement('div')
  const frame = document.createElement('xh-designer-frame')
  frame.style.cssText = 'position:fixed;left:0;top:0;width:1000px;height:640px'
  frame.regions = [
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

function region(frame: XhDesignerFrameElement, name: string): DOMRect {
  return frame.querySelector<HTMLElement>(`[data-part="region"][data-region="${name}"]`)!.getBoundingClientRect()
}

/** 高亮框盖住了目标（四边各留出 spotlight-padding）。 */
function covers(outer: DOMRect, inner: DOMRect): boolean {
  return outer.left <= inner.left + 1 && outer.top <= inner.top + 1 && outer.right >= inner.right - 1 && outer.bottom >= inner.bottom - 1
}

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
