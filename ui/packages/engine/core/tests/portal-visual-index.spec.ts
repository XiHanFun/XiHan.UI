// @vitest-environment jsdom

import type { DiagnosticRecord } from '../src/kernel/diagnostics/types'
import { afterEach, describe, expect, it } from 'vitest'
import { onDiagnostic, resetDiagnostics, setDiagnosticsConsoleOutput, setDiagnosticsLevel } from '../src/kernel/diagnostics/channel'
import { DIAGNOSTIC_CODES } from '../src/kernel/diagnostics/codes'
import { portalVisualIndex } from '../src/kernel/structure/portal-visual-index'

const INPUT = { reproduced: new Set(['data-theme', 'data-density', 'data-tone', 'dir']) }

let sheets: HTMLStyleElement[] = []

function css(text: string): void {
  const style = document.createElement('style')
  style.textContent = text
  document.head.append(style)
  sheets.push(style)
}

function index(): ReturnType<typeof portalVisualIndex> {
  return portalVisualIndex(document, INPUT)
}

function names(): string[] {
  return [...index().names ?? []].sort()
}

afterEach(() => {
  for (const style of sheets)
    style.remove()
  sheets = []
})

describe('portal 视觉索引', () => {
  it('只由文档根或复制过去的属性选中的声明不进名字集合', () => {
    css(':where(:root) { --a: 1; }')
    css('html { --b: 1; }')
    css(':root { --c: 1; }')
    css('[data-theme=\'dark\'] { --d: 1; }')
    css(':is(:root, [data-density=\'compact\']) { --e: 1; }')
    css(':where(:root), :where([data-density=\'compact\']) { --f: 1; }')
    css('[data-tone] { --g: 1; }')
    expect(names()).toEqual([])
  })

  it('别处声明的名字进名字集合', () => {
    css('.card { --a: 1; }')
    css(':root .card { --b: 1; }')
    css('[data-scope=\'button\'] { --c: 1; }')
    css('#main { --d: 1; }')
    css('* { --e: 1; }')
    css('[data-theme=\'dark\'] [data-theme=\'light\'] { --f: 1; }')
    css('html.dense { --g: 1; }')
    expect(names()).toEqual(['--a', '--b', '--c', '--d', '--e', '--f', '--g'])
  })

  it('分组规则不改变判定，关键帧里的声明一律进名字集合', () => {
    css('@media (min-width: 0px) { :where(:root) { --a: 1; } .card { --b: 1; } }')
    css('@keyframes pulse { to { --c: 1; } }')
    expect(names()).toEqual(['--b', '--c'])
  })

  it('只从壳复现不出来的声明里收 var() 引用，回退值里嵌套的一并收', () => {
    css(':where(:root) { --a: var(--root-only); }')
    css('.card { --b: calc(var(--gap) * 2); --c: var(--first, var(--fallback)); color: var(--not-custom); }')
    expect([...index().references ?? []].sort()).toEqual(['--fallback', '--first', '--gap'])
  })

  it('class 名只从声明了自定义属性的规则收集', () => {
    css('.declares { --a: 1; }')
    css('.plain { color: red; }')
    css('.outer .inner:not(.excluded) { --b: 1; }')
    expect([...index().classes ?? []].sort()).toEqual(['declares', 'excluded', 'inner', 'outer'])
  })

  it('反斜杠转义的 class 名按真实名字收集', () => {
    css('.md\\:dense { --a: 1; }')
    expect(index().classes?.has('md:dense')).toBe(true)
  })

  it('出现 [class] 属性选择器时 class 集合作废，名字集合照旧可用', () => {
    css('.card { --a: 1; }')
    css('[class~=\'opaque\'] { --b: 1; }')
    expect(index().classes).toBeNull()
    expect(names()).toEqual(['--a', '--b'])
  })

  it('读不到规则的样式表让名字、引用与 class 集合一并作废，并点名投递诊断', () => {
    // 节点交给内建 console 打印时会被测试运行器整个检视一遍，连同这里抛错的 cssRules；只经订阅收
    setDiagnosticsConsoleOutput(false)
    setDiagnosticsLevel('warn')
    const records: DiagnosticRecord[] = []
    const off = onDiagnostic(record => records.push(record))
    css('.card { --a: 1; }')
    // 跨域且没以 CORS 加载的表：读 cssRules 抛 SecurityError
    const sheet = sheets[0]!.sheet!
    Object.defineProperty(sheet, 'cssRules', {
      configurable: true,
      get() {
        throw new DOMException('cross-origin', 'SecurityError')
      },
    })
    const reported = (): DiagnosticRecord[] => records.filter(record => record.code === DIAGNOSTIC_CODES.portalUnreadableStylesheet)
    expect(index()).toEqual({ names: null, references: null, classes: null })
    expect(reported()).toHaveLength(1)
    expect(reported()[0]!.message).toContain('crossorigin')
    // 指纹不变的再次读取走缓存，不重复投递
    index()
    expect(reported()).toHaveLength(1)
    off()
    resetDiagnostics()
    // 摘表时 jsdom 还会读 cssRules，先撤掉替身
    delete (sheet as { cssRules?: unknown }).cssRules
  })

  it('样式表指纹不变时复用同一份结果，替换样式文本后重建', () => {
    css('.card { --a: 1; }')
    const first = index()
    expect(index()).toBe(first)
    sheets[0]!.textContent = '.card { --a: 1; } .badge { --b: 1; }'
    expect(index()).not.toBe(first)
    expect(names()).toEqual(['--a', '--b'])
  })
})
