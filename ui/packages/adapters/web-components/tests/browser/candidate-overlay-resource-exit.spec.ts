import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Candidate = 'cascader' | 'combobox'

defineXhElements()

let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function mount(kind: Candidate): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = kind === 'cascader'
    ? `<xh-cascader open>
        <div data-xh-part="root">
          <div data-xh-part="control"><button data-xh-part="trigger">选择路径</button></div>
          <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
        </div>
      </xh-cascader>`
    : `<xh-combobox open>
        <div data-xh-part="root">
          <div data-xh-part="control"><input data-xh-part="input"></div>
          <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
        </div>
      </xh-combobox>`
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

afterEach(() => {
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe.each(['cascader', 'combobox'] as const)('wc %s 真实退场资源', (scope) => {
  it('有限动画完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-candidate-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-candidate-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    const element = mount(scope)
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    element.setAttribute('open', 'false')
    await settle()
    const content = document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    const animation = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-candidate-exit')
    expect(animation).toBeDefined()

    animation!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
