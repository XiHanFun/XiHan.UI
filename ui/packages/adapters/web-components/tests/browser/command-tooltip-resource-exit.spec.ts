import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Candidate = 'command' | 'tooltip'
defineXhElements()

let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function mount(kind: Candidate): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = kind === 'command'
    ? `<xh-command open modal>
        <button data-xh-part="trigger">命令</button>
        <div data-xh-part="backdrop"></div>
        <div data-xh-part="positioner"><div data-xh-part="content">
          <input data-xh-part="input"><div data-xh-part="list"></div>
        </div></div>
      </xh-command>`
    : `<xh-tooltip open>
        <button data-xh-part="trigger">说明</button>
        <div data-xh-part="positioner"><div data-xh-part="content">提示内容</div></div>
      </xh-tooltip>`
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

afterEach(() => {
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe.each(['command', 'tooltip'] as const)('wc %s 真实退场资源', (scope) => {
  it('有限动画全部完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-command-tooltip-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'],
      [data-scope='${scope}'][data-part='backdrop'][data-state='closed'] {
        animation: test-command-tooltip-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const outside = document.createElement('button')
    document.body.append(outside)
    const element = mount(scope)
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    element.setAttribute('open', 'false')
    await settle()
    const content = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    if (scope === 'command') {
      expect(document.body.style.overflow).toBe('hidden')
      expect(outside.inert).toBe(true)
    }
    const animations = [
      content,
      document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='backdrop']`),
    ]
      .flatMap(node => node?.getAnimations() ?? [])
      .filter(animation => (animation as CSSAnimation).animationName === 'test-command-tooltip-exit')
    expect(animations).toHaveLength(scope === 'command' ? 2 : 1)

    animations[0]!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(scope === 'command' ? 1 : 0)
    if (scope === 'command') {
      expect(document.body.style.overflow).toBe('hidden')
      expect(outside.inert).toBe(true)
      animations[1]!.finish()
      await settle()
      expect(getLayerRegistry(document).list()).toHaveLength(0)
      expect(document.body.style.overflow).not.toBe('hidden')
      expect(outside.inert).toBe(false)
    }
  })
})
