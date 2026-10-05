// Tour 的说明文字字号留使用者槽：缺省取说明档，作者写 --xh-tour-description-font-size 即改，与标题、进度文字同一待遇。
// 判据是计算样式；皮肤只认 data-scope / data-part，直接摆节点量。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(style = ''): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = `<div data-scope="tour" class="xh-scope-tour" data-part="content" style="${style}"><p data-scope="tour" class="xh-scope-tour" data-part="description">下一步：打开设置</p></div>`
  document.body.append(host)
  return host.querySelector<HTMLElement>(`[data-part='description']`)!
}

describe('tour 的说明文字字号', () => {
  it('缺省取说明档', () => {
    const description = mount()
    const probe = document.createElement('span')
    probe.style.fontSize = 'var(--xh-text-secondary-size)'
    host!.append(probe)
    expect(getComputedStyle(description).fontSize).toBe(getComputedStyle(probe).fontSize)
  })

  it('写 --xh-tour-description-font-size 即改', () => {
    const description = mount('--xh-tour-description-font-size: 17px')
    expect(getComputedStyle(description).fontSize).toBe('17px')
  })
})
