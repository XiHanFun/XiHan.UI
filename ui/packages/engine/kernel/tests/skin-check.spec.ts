// @vitest-environment jsdom
import type { DiagnosticRecord } from '../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DIAGNOSTIC_CODES, onDiagnostic, resetDiagnostics } from '../src'
import { resetSkinCheck, startSkinCheck } from '../src/diagnostics/skin-check'

const seen: DiagnosticRecord[] = []
let stopSubscribe: (() => void) | undefined
let stopCheck: (() => void) | undefined

beforeEach(() => {
  seen.length = 0
  resetDiagnostics()
  resetSkinCheck()
  stopSubscribe = onDiagnostic(record => void seen.push(record))
})

afterEach(() => {
  stopCheck?.()
  stopSubscribe?.()
  document.body.innerHTML = ''
  document.head.innerHTML = ''
})

/** 皮肤在场与否只看 --xh-<scope>-skin 取不取得到。 */
function loadSkin(scope: string): void {
  const style = document.createElement('style')
  style.textContent = `[data-scope='${scope}'] { --xh-${scope}-skin: 1; }`
  document.head.appendChild(style)
}

function mountScope(scope: string): HTMLElement {
  const element = document.createElement('div')
  element.setAttribute('data-scope', scope)
  element.setAttribute('data-part', 'root')
  document.body.appendChild(element)
  return element
}

describe('皮肤在场探测', () => {
  it('皮肤没引时报一条 styles.missing-skin', () => {
    mountScope('button')
    stopCheck = startSkinCheck()

    expect(seen).toHaveLength(1)
    expect(seen[0]?.code).toBe(DIAGNOSTIC_CODES.stylesMissingSkin)
    expect(seen[0]?.scope).toBe('button')
    expect(seen[0]?.message).toContain('@xihan-ui/styles/button.css')
  })

  it('皮肤引了就不报', () => {
    loadSkin('button')
    mountScope('button')
    stopCheck = startSkinCheck()

    expect(seen).toHaveLength(0)
  })

  it('同一个 scope 只报一次，多少个实例都一样', () => {
    mountScope('button')
    mountScope('button')
    mountScope('button')
    stopCheck = startSkinCheck()

    expect(seen).toHaveLength(1)
  })

  it('启动之后才进来的节点也接得住', async () => {
    stopCheck = startSkinCheck()
    expect(seen).toHaveLength(0)

    mountScope('dialog')
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(seen).toHaveLength(1)
    expect(seen[0]?.scope).toBe('dialog')
  })

  it('嵌在子树里的节点也探得到', async () => {
    stopCheck = startSkinCheck()
    const host = document.createElement('div')
    const inner = document.createElement('span')
    inner.setAttribute('data-scope', 'tooltip')
    host.appendChild(inner)
    document.body.appendChild(host)
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(seen.map(record => record.scope)).toEqual(['tooltip'])
  })

  it('停掉之后不再报', async () => {
    stopCheck = startSkinCheck()
    stopCheck()
    stopCheck = undefined

    mountScope('select')
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(seen).toHaveLength(0)
  })
})
