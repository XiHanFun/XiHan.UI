import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Candidate = 'cascader' | 'combobox' | 'date-picker' | 'time-picker' | 'tree-select'

defineXhElements()

let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function mount(kind: Candidate): HTMLElement {
  host = document.createElement('div')
  if (kind === 'cascader') {
    host.innerHTML = `<xh-cascader open>
        <div data-xh-part="root">
          <div data-xh-part="control"><button data-xh-part="trigger">选择路径</button></div>
          <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
        </div>
      </xh-cascader>`
  }
  else if (kind === 'date-picker') {
    host.innerHTML = `<xh-date-picker open>
        <div data-xh-part="root">
          <div data-xh-part="control"><button data-xh-part="trigger">选择日期</button></div>
          <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="calendar"></div></div></div>
        </div>
      </xh-date-picker>`
  }
  else if (kind === 'time-picker') {
    host.innerHTML = `<xh-time-picker open default-value="09:30">
        <div data-xh-part="root">
          <div data-xh-part="control"><span data-xh-part="segment" segment="hour"></span><button data-xh-part="trigger">选择时间</button></div>
          <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
        </div>
      </xh-time-picker>`
  }
  else if (kind === 'tree-select') {
    host.innerHTML = `<xh-tree-select open>
        <div data-xh-part="root">
          <div data-xh-part="control"><button data-xh-part="trigger">选择节点</button></div>
          <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree"></div></div></div>
        </div>
      </xh-tree-select>`
  }
  else {
    host.innerHTML = `<xh-combobox open>
        <div data-xh-part="root">
          <div data-xh-part="control"><input data-xh-part="input"></div>
          <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
        </div>
      </xh-combobox>`
  }
  document.body.append(host)
  return host.firstElementChild as HTMLElement
}

afterEach(() => {
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe.each(['cascader', 'combobox', 'date-picker', 'time-picker', 'tree-select'] as const)('wc %s 真实退场资源', (scope) => {
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

describe('wc mention 真实退场资源', () => {
  it('有限动画完成前保留 Layer，逻辑关闭立即失活，完成后释放', async () => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes test-mention-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='mention'][data-part='content'][data-state='closed'] {
        animation: test-mention-exit 60s linear forwards;
      }
    `
    document.body.append(style)
    host = document.createElement('div')
    host.innerHTML = `<xh-mention>
      <div data-xh-part="root">
        <input data-xh-part="input">
        <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
      </div>
    </xh-mention>`
    document.body.append(host)
    await settle()
    const input = host.querySelector<HTMLInputElement>('[data-xh-part="input"]')!
    input.value = '@a'
    input.setSelectionRange(2, 2)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    const content = document.querySelector<HTMLElement>(`[data-scope='mention'][data-part='content']`)!
    expect(content.inert).toBe(true)
    expect(content.getAttribute('aria-hidden')).toBe('true')
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    const animation = content.getAnimations().find(item => (item as CSSAnimation).animationName === 'test-mention-exit')
    expect(animation).toBeDefined()

    animation!.finish()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
