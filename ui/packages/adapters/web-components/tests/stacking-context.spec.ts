// @vitest-environment jsdom
//
// Light DOM 搬不动浮层，只能在展开时把「祖先建了层叠上下文」这件事报出来。
import type { DiagnosticRecord } from '@xihan-ui/core'
import {
  DIAGNOSTIC_CODES,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'
import { findStackingTrap, stackingCauseOf } from '../src/dom/stacking-context'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

let seen: DiagnosticRecord[] = []

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  // 去重会把重复的那条压掉，一次只报一次这件事得由宿主自己的闸门保证
  setDiagnosticsDedupe(false)
  seen = []
  onDiagnostic(r => void seen.push(r))
})

afterEach(() => {
  document.body.innerHTML = ''
  resetDiagnostics()
})

const MARKUP = `
  <button data-xh-part="trigger">开</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">内容</div>
  </div>
`

async function settle(el: Updatable): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

/** 在给定样式的祖先里挂一个默认展开的 popover。 */
async function mount(ancestorStyle?: string, attrs?: Record<string, string>): Promise<Updatable> {
  const wrap = document.createElement('div')
  wrap.id = 'app'
  wrap.className = 'shell main'
  if (ancestorStyle)
    wrap.setAttribute('style', ancestorStyle)
  const el = document.createElement('xh-popover') as Updatable
  el.setAttribute('default-open', '')
  for (const [k, v] of Object.entries(attrs ?? {})) el.setAttribute(k, v)
  el.innerHTML = MARKUP
  wrap.appendChild(el)
  document.body.appendChild(wrap)
  await settle(el)
  return el
}

function traps(): DiagnosticRecord[] {
  return seen.filter(r => r.code === DIAGNOSTIC_CODES.overlayStackingTrap)
}

function div(style: string): HTMLElement {
  const el = document.createElement('div')
  el.setAttribute('style', style)
  document.body.appendChild(el)
  return el
}

describe('层叠上下文判据', () => {
  it('干净的元素不算', () => {
    expect(stackingCauseOf(div(''))).toBeNull()
    expect(stackingCauseOf(div('position: relative'))).toBeNull()
    expect(stackingCauseOf(div('opacity: 1'))).toBeNull()
    expect(stackingCauseOf(div('contain: size style'))).toBeNull()
    expect(stackingCauseOf(div('container-type: normal'))).toBeNull()
    expect(stackingCauseOf(div('z-index: 3'))).toBeNull()
  })

  it('逐条命中并回出属性名', () => {
    const cases: [string, string][] = [
      ['transform: translateX(1px)', 'transform'],
      ['translate: 10px', 'translate'],
      ['rotate: 30deg', 'rotate'],
      ['scale: 1.2', 'scale'],
      ['perspective: 100px', 'perspective'],
      ['transform-style: preserve-3d', 'transform-style'],
      ['filter: blur(2px)', 'filter'],
      ['clip-path: circle(50%)', 'clip-path'],
      ['mask-image: linear-gradient(black, transparent)', 'mask-image'],
      ['view-transition-name: hero', 'view-transition-name'],
      ['opacity: 0.5', 'opacity'],
      ['mix-blend-mode: multiply', 'mix-blend-mode'],
      ['isolation: isolate', 'isolation'],
      ['contain: paint', 'contain'],
      ['contain: strict', 'contain'],
      ['content-visibility: auto', 'content-visibility'],
      ['container-type: inline-size', 'container-type'],
      ['will-change: transform', 'will-change'],
      ['will-change: backdrop-filter', 'will-change'],
      ['position: fixed', 'position'],
      ['position: sticky', 'position'],
      ['position: relative; z-index: 2', 'z-index'],
      ['position: absolute; z-index: 0', 'z-index'],
    ]
    for (const [style, property] of cases)
      expect(stackingCauseOf(div(style))?.property, style).toBe(property)
  })

  it('flex 子项带 z-index 也算，不必自己定位', () => {
    const parent = div('display: flex')
    const child = document.createElement('div')
    child.setAttribute('style', 'z-index: 4')
    parent.appendChild(child)
    expect(stackingCauseOf(child)?.property).toBe('z-index')

    const plain = div('display: block')
    const kid = document.createElement('div')
    kid.setAttribute('style', 'z-index: 4')
    plain.appendChild(kid)
    expect(stackingCauseOf(kid)).toBeNull()
  })

  it('往上只取最近的那个祖先', () => {
    const outer = div('filter: blur(1px)')
    const inner = document.createElement('div')
    inner.setAttribute('style', 'opacity: 0.4')
    const positioner = document.createElement('div')
    outer.appendChild(inner)
    inner.appendChild(positioner)
    const trap = findStackingTrap(positioner)
    expect(trap?.ancestor).toBe(inner)
    expect(trap?.cause.property).toBe('opacity')
  })

  it('撞上外层浮层的 positioner 即止步', () => {
    const outer = div('transform: translateX(1px)')
    const host = document.createElement('div')
    host.dataset.part = 'positioner'
    const positioner = document.createElement('div')
    outer.appendChild(host)
    host.appendChild(positioner)
    expect(findStackingTrap(positioner)).toBeNull()
  })
})

describe('浮层展开时的层叠上下文诊断', () => {
  it('祖先带 transform 时投诊断，并指出祖先与那条属性', async () => {
    await mount('transform: translateX(1px)')
    const hits = traps()
    expect(hits).toHaveLength(1)
    expect(hits[0]).toMatchObject({ level: 'warn', scope: 'popover', part: 'positioner' })
    expect(hits[0]!.message).toContain('div#app.shell.main')
    expect(hits[0]!.message).toContain('transform')
    expect(hits[0]!.detail).toMatchObject({ property: 'transform', ancestor: 'div#app.shell.main' })
    expect((hits[0]!.node as HTMLElement).id).toBe('app')
  })

  it('补救方式写在文案里', async () => {
    await mount('opacity: 0.5')
    expect(traps()[0]!.message).toMatch(/去掉该祖先这条属性/)
  })

  it('同一实例反复展开也只投一次', async () => {
    const el = await mount('transform: translateX(1px)')
    expect(traps()).toHaveLength(1)

    el.setAttribute('open', 'false')
    await settle(el)
    el.setAttribute('open', '')
    await settle(el)
    el.removeAttribute('open')
    await settle(el)

    expect(traps()).toHaveLength(1)
  })

  it('祖先干净时不投', async () => {
    await mount('position: relative')
    expect(traps()).toHaveLength(0)
  })

  it('浮层没展开就不查', async () => {
    const wrap = document.createElement('div')
    wrap.setAttribute('style', 'transform: translateX(1px)')
    const el = document.createElement('xh-popover') as Updatable
    el.innerHTML = MARKUP
    wrap.appendChild(el)
    document.body.appendChild(wrap)
    await settle(el)
    expect(traps()).toHaveLength(0)
  })

  it('通道静默时不扫描', async () => {
    setDiagnosticsLevel('silent')
    await mount('transform: translateX(1px)')
    expect(traps()).toHaveLength(0)
  })
})

describe('body 与根元素不算陷阱', () => {
  it('滚动锁给 body 写 position: fixed 时不报', () => {
    document.body.style.position = 'fixed'
    const host = document.createElement('div')
    const positioner = document.createElement('div')
    positioner.dataset.part = 'positioner'
    host.append(positioner)
    document.body.append(host)

    expect(findStackingTrap(positioner)).toBeNull()

    document.body.style.position = ''
    host.remove()
  })
})
