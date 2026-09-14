// @vitest-environment jsdom
// <xh-bar-code> 的布尔特性是三态：缺席是没给、x="false" 是关、其余写法是开。
// 没给与关在 connect 里是两回事：checksum / bearer-bars 给了别的码制要报警告，缺席则不报。
import type { DiagnosticRecord } from '@xihan-ui/core'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsDedupe, setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

let diagnostics: DiagnosticRecord[] = []
let host: HTMLElement | null = null

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
  setDiagnosticsDedupe(false)
  diagnostics = []
  onDiagnostic(record => void diagnostics.push(record))
})

afterEach(() => {
  host?.remove()
  host = null
  resetDiagnostics()
})

async function render(attrs: string): Promise<Updatable> {
  host = document.createElement('div')
  host.innerHTML = `<xh-bar-code ${attrs}><svg data-xh-part="root"></svg></xh-bar-code>`
  document.body.appendChild(host)
  const el = host.firstElementChild as Updatable
  await el.updateComplete
  return el
}

function texts(el: Element): number {
  return el.querySelectorAll('[data-xh-geom="text"]').length
}

function ignored(): string[] {
  return diagnostics.filter(r => r.code === 'bar-code.option-ignored').map(r => String((r.detail as { option: string }).option))
}

describe('xh-bar-code 的布尔特性', () => {
  it('text 缺席印文字，text="false" 不印，text（空值）印', async () => {
    expect(texts(await render('format="ean8" value="9638507"'))).toBe(8)
    host?.remove()
    expect(texts(await render('format="ean8" value="9638507" text="false"'))).toBe(0)
    host?.remove()
    expect(texts(await render('format="ean8" value="9638507" text'))).toBe(8)
  })

  it('checksum 与 bearer-bars 缺席不报警告；写了 "false" 也算给了，用错码制照报', async () => {
    await render('format="ean13" value="4006381333931"')
    expect(ignored()).toEqual([])
    host?.remove()
    await render('format="ean13" value="4006381333931" checksum="false" bearer-bars="false"')
    expect(ignored()).toEqual(['checksum', 'bearerBars'])
  })

  it('gs1 只在写了且不是 "false" 时生效：起始符后多出一个 FNC1 码字', async () => {
    const width = (el: Element): number => Number(el.querySelector('svg')!.getAttribute('viewBox')!.split(' ')[2])
    const plain = await render('value="0112345678901231"')
    const plainD = plain.querySelector('[data-xh-geom="bars"]')!.getAttribute('d')!
    const plainWidth = width(plain)
    host?.remove()
    const off = await render('value="0112345678901231" gs1="false"')
    expect(off.querySelector('[data-xh-geom="bars"]')!.getAttribute('d')).toBe(plainD)
    host?.remove()
    const on = await render('value="0112345678901231" gs1')
    expect(on.querySelector('[data-xh-geom="bars"]')!.getAttribute('d')).not.toBe(plainD)
    // 多一个 11 模块的码字 → 宽 22px（barWidth 2）
    expect(width(on) - plainWidth).toBe(22)
  })

  it('bar-width / height / margin 走数字特性', async () => {
    const el = await render('value="X" bar-width="3" height="30" margin="0"')
    const root = el.querySelector('svg')!
    // Code 128 单字符：起始 + 1 + 校验 + 终止 = 3 × 11 + 13 = 46 模块 × 3
    expect(root.getAttribute('viewBox')).toBe('0 0 138 60')
    expect(root.style.inlineSize).toBe('138px')
    expect(root.style.blockSize).toBe('60px')
  })
})
