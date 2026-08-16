// @vitest-environment jsdom
import type { DiagnosticRecord } from '../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DIAGNOSTIC_CODES, onDiagnostic, resetDiagnostics } from '../src'
import { findDeprecatedPart, registerDeprecation, resetDeprecations, startDeprecationScan } from '../src/diagnostics/deprecations'

const seen: DiagnosticRecord[] = []
let stopSubscribe: (() => void) | undefined
let stopScan: (() => void) | undefined

beforeEach(() => {
  seen.length = 0
  resetDiagnostics()
  resetDeprecations()
  stopSubscribe = onDiagnostic(record => void seen.push(record))
})

afterEach(() => {
  stopScan?.()
  stopScan = undefined
  stopSubscribe?.()
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  resetDeprecations()
})

function codes(code: string): DiagnosticRecord[] {
  return seen.filter(record => record.code === code)
}

function injectStyle(text: string): HTMLStyleElement {
  const style = document.createElement('style')
  style.textContent = text
  document.head.appendChild(style)
  return style
}

describe('废弃登记与探测', () => {
  it('登记表为空时启动零开销:不报任何诊断,也不崩', () => {
    injectStyle('.a { color: var(--xh-button-bg) }')
    document.body.innerHTML = '<xh-switch legacy-attr="x"></xh-switch>'
    stopScan = startDeprecationScan()
    expect(seen).toHaveLength(0)
  })

  it('样式表里的废弃 CSS 变量报 deprecated.css-var', () => {
    registerDeprecation({ medium: 'css-var', match: '--xh-button-bg', message: '--xh-button-bg 已废弃', replaceWith: '--xh-button-surface', until: '2.0.0' })
    injectStyle('.a { color: var(--xh-button-bg) }')
    stopScan = startDeprecationScan()

    const hits = codes(DIAGNOSTIC_CODES.deprecatedCssVar)
    expect(hits).toHaveLength(1)
    expect(hits[0]?.level).toBe('warn')
    expect(hits[0]?.detail).toMatchObject({ match: '--xh-button-bg', replaceWith: '--xh-button-surface', until: '2.0.0' })
  })

  it('样式表里的废弃 @layer 名报 deprecated.layer', () => {
    registerDeprecation({ medium: 'layer', match: 'xihan.legacy', message: 'xihan.legacy 层已废弃' })
    injectStyle('@layer xihan.legacy { .a { color: red } }')
    stopScan = startDeprecationScan()

    expect(codes(DIAGNOSTIC_CODES.deprecatedLayer)).toHaveLength(1)
  })

  it('样式表里的废弃 data-* 选择器报 deprecated.selector', () => {
    registerDeprecation({ medium: 'selector', match: '[data-part=\'thumb\']', message: 'thumb 部件已废弃', replaceWith: 'knob' })
    injectStyle('[data-scope=\'switch\'][data-part=\'thumb\'] { color: red }')
    stopScan = startDeprecationScan()

    expect(codes(DIAGNOSTIC_CODES.deprecatedSelector)).toHaveLength(1)
  })

  it('同一废弃名在多条规则里只报一次(通道去重)', () => {
    registerDeprecation({ medium: 'css-var', match: '--xh-old', message: '--xh-old 已废弃' })
    injectStyle('.a { color: var(--xh-old) } .b { color: var(--xh-old) }')
    stopScan = startDeprecationScan()

    expect(codes(DIAGNOSTIC_CODES.deprecatedCssVar)).toHaveLength(1)
  })

  it('xh-* 元素上的废弃 attribute 报 deprecated.attribute 并指向节点', () => {
    registerDeprecation({ medium: 'attribute', match: 'legacy-size', message: 'legacy-size 已废弃', replaceWith: 'size' })
    document.body.innerHTML = '<xh-switch legacy-size="xl"></xh-switch>'
    stopScan = startDeprecationScan()

    const hits = codes(DIAGNOSTIC_CODES.deprecatedAttribute)
    expect(hits).toHaveLength(1)
    expect(hits[0]?.scope).toBe('switch')
    expect(hits[0]?.node?.tagName.toLowerCase()).toBe('xh-switch')
    expect(hits[0]?.detail).toMatchObject({ replaceWith: 'size' })
  })

  it('非 xh-* 元素上同名 attribute 不报', () => {
    registerDeprecation({ medium: 'attribute', match: 'legacy-size', message: 'legacy-size 已废弃' })
    document.body.innerHTML = '<div legacy-size="xl"></div>'
    stopScan = startDeprecationScan()

    expect(seen).toHaveLength(0)
  })

  it('启动之后才进来的节点与样式也接得住', async () => {
    registerDeprecation({ medium: 'attribute', match: 'legacy-size', message: 'legacy-size 已废弃' })
    registerDeprecation({ medium: 'css-var', match: '--xh-old', message: '--xh-old 已废弃' })
    stopScan = startDeprecationScan()
    expect(seen).toHaveLength(0)

    document.body.innerHTML = '<xh-slider legacy-size="md"></xh-slider>'
    injectStyle('.x { color: var(--xh-old) }')
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(codes(DIAGNOSTIC_CODES.deprecatedAttribute)).toHaveLength(1)
    expect(codes(DIAGNOSTIC_CODES.deprecatedCssVar)).toHaveLength(1)
  })

  it('停掉之后不再报', async () => {
    registerDeprecation({ medium: 'attribute', match: 'legacy-size', message: 'legacy-size 已废弃' })
    stopScan = startDeprecationScan()
    stopScan()
    stopScan = undefined

    document.body.innerHTML = '<xh-slider legacy-size="md"></xh-slider>'
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(seen).toHaveLength(0)
  })

  it('part 介质不在这里扫:扫描器管 CSS 与 attribute,part 由适配器的部件契约校验查表', () => {
    registerDeprecation({ medium: 'part', match: 'thumb-legacy', message: 'thumb-legacy 已废弃', replaceWith: 'thumb' })
    document.body.innerHTML = '<div data-xh-part="thumb-legacy"></div>'
    stopScan = startDeprecationScan()

    expect(seen).toHaveLength(0)
    expect(findDeprecatedPart('thumb-legacy')?.replaceWith).toBe('thumb')
    expect(findDeprecatedPart('thumb')).toBeUndefined()
  })

  it('真实消费方的形状(Website 站点样式)能命中,不登记的层名与选择器不误报', () => {
    registerDeprecation({ medium: 'css-var', match: '--xh-font-family-mono', message: '--xh-font-family-mono 已废弃', replaceWith: '--xh-font-mono' })
    // 摘自 Website/src/styles/site.css:令牌覆盖写进 @layer site,重置用 :not([data-scope]) 把库节点让出去
    injectStyle([
      '@layer site {',
      '  :root {',
      '    --xh-font-family-mono: \'JetBrains Mono\', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;',
      '  }',
      '  :is(h1, h2, h3):not([data-scope]) { margin: 0 }',
      '  a:not([data-scope]) { color: inherit }',
      '}',
    ].join('\n'))
    stopScan = startDeprecationScan()

    expect(codes(DIAGNOSTIC_CODES.deprecatedCssVar)).toHaveLength(1)
    expect(codes(DIAGNOSTIC_CODES.deprecatedLayer)).toHaveLength(0)
    expect(codes(DIAGNOSTIC_CODES.deprecatedSelector)).toHaveLength(0)
  })
})
