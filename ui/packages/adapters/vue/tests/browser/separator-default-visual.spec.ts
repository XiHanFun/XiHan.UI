import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function mount(html: string): HTMLElement {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  return host.querySelector<HTMLElement>('[data-part="root"]')!
}

describe('separator 缺省视觉', () => {
  it('横线取 border-default、上下各留 20px', () => {
    const root = mount('<div data-scope="separator" class="xh-scope-separator" data-part="root" data-orientation="horizontal" role="separator"></div>')
    const style = getComputedStyle(root)
    expect(style.backgroundColor).toBe(tokenColor('--xh-border-default'))
    expect(style.marginTop).toBe('20px')
    expect(style.marginBottom).toBe('20px')
  })

  it('竖线左右各留 12px，父容器没有高度时也有一截与文字等高的线', () => {
    const root = mount('<span style="display:inline-flex"><div data-scope="separator" class="xh-scope-separator" data-part="root" data-orientation="vertical" role="separator"></div></span>')
    const style = getComputedStyle(root)
    expect(style.marginLeft).toBe('12px')
    expect(style.marginRight).toBe('12px')
    expect(root.getBoundingClientRect().height).toBeGreaterThan(0)
  })

  // 横排工具条里的竖线：行高由兄弟撑出来（没有写死高度），竖线要铺满这一行、与兄弟上下对齐。
  // 此前 block-size 写成 100%，父容器高度不确定时解析不出来，stretch 也随之失效：线只剩 1em 高、贴着行顶
  it('放在内容撑高、交叉轴居中的横排里：竖线铺满行高，不贴顶', () => {
    const root = mount(`
      <div style="display:flex;align-items:center;font-size:14px">
        <button style="block-size:28px">A</button>
        <div data-scope="separator" class="xh-scope-separator" data-part="root" data-orientation="vertical" role="separator"></div>
        <button style="block-size:28px">B</button>
      </div>`)
    const row = root.parentElement!.getBoundingClientRect()
    const line = root.getBoundingClientRect()
    expect(row.height).toBe(28)
    expect(line.height).toBe(28)
    expect(line.top).toBe(row.top)
  })

  it('父容器写死高度时照样铺满', () => {
    const root = mount('<div style="display:flex;block-size:40px"><div data-scope="separator" class="xh-scope-separator" data-part="root" data-orientation="vertical" role="separator"></div></div>')
    expect(root.getBoundingClientRect().height).toBe(40)
  })

  it('带分节文字：文字 14px / 500 / 正文色，与两条线各隔 16px，上下留白收到 10px', () => {
    const root = mount(`
      <div data-scope="separator" class="xh-scope-separator" data-part="root" data-orientation="horizontal" role="separator">
        <span data-scope="separator" class="xh-scope-separator" data-part="line" data-orientation="horizontal"></span>
        <span data-scope="separator" class="xh-scope-separator" data-part="content">基本信息</span>
        <span data-scope="separator" class="xh-scope-separator" data-part="line" data-orientation="horizontal"></span>
      </div>`)
    const content = root.querySelector<HTMLElement>('[data-part="content"]')!
    const style = getComputedStyle(content)
    expect(style.fontSize).toBe('14px')
    expect(style.fontWeight).toBe('500')
    expect(style.color).toBe(tokenColor('--xh-fg-default'))
    expect(getComputedStyle(root).columnGap).toBe('16px')
    expect(getComputedStyle(root).marginTop).toBe('10px')
  })
})
