// 换图的交叉淡变：头像与图片换了 src、新图还在载入时，旧图的替身原样盖在原处；新图载好那一刻替身淡出、播完即移除。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

beforeEach(() => {
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  host?.remove()
  host = null
  setDiagnosticsLevel('warn')
})

function swatch(color: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="${color}"/></svg>`)}`
}

describe.each(['avatar', 'image'] as const)('xh-%s 换图', (scope) => {
  it('换了 src：旧图的替身盖在原处；新图载好那一刻替身淡出，播完即移除', async () => {
    host = document.createElement('div')
    host.style.setProperty('--xh-motion-duration-exit', '10s')
    document.body.append(host)
    const el = document.createElement(`xh-${scope}`)
    el.setAttribute('src', swatch('red'))
    el.setAttribute('alt', '图')
    el.innerHTML = `<div data-xh-part="root" style="inline-size: 64px; block-size: 64px"><img data-xh-part="image"><span data-xh-part="fallback">AB</span></div>`
    host.append(el)
    const image = (): HTMLElement => host!.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='image']:not([data-xh-ghost])`)!
    await expect.poll(() => image()?.getAttribute('data-state')).toBe('loaded')
    el.setAttribute('src', swatch('blue'))
    await expect.poll(() => host!.querySelector(`[data-scope='${scope}'][data-part='image'][data-xh-ghost]`) !== null).toBe(true)
    const ghost = host!.querySelector<HTMLImageElement>(`[data-scope='${scope}'][data-part='image'][data-xh-ghost]`)!
    expect(ghost.getAttribute('src')).toBe(swatch('red'))
    await expect.poll(() => image().getAttribute('data-state')).toBe('loaded')
    await expect.poll(() => ghost.getAttribute('data-state')).toBe('closed')
    expect(ghost.getAnimations().map(a => (a as CSSAnimation).animationName)).toEqual(['xh-fade-out'])
    for (const animation of ghost.getAnimations())
      animation.finish()
    await expect.poll(() => ghost.isConnected).toBe(false)
  })
})
