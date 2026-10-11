// 字段族控件放进表格格子（就地编辑）铺满这一格：格子声明 --xh-control-w: 100%，WC 宿主是 display: contents，
// 作者写的 root 直接当格子的 flex 项。此前宿主多出一层按内容定宽的盒子，字段只剩几十像素宽，
// 示例只好在宿主上手写 inline-size 与 --xh-control-w。宽度要按真实排版量。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
}

describe('表格格子里的字段', () => {
  it('文本框与数字框都铺满所在的格子', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '560px'
    host.innerHTML = `
      <xh-table>
        <div data-xh-part="root">
          <div data-xh-part="header">
            <div data-xh-part="row">
              <div data-xh-part="column-header" value="count"><span data-xh-part="column-label">数量</span></div>
              <div data-xh-part="column-header" value="note"><span data-xh-part="column-label">备注</span></div>
            </div>
          </div>
          <div data-xh-part="body">
            <div data-xh-part="row" value="a">
              <div data-xh-part="cell" value="count">
                <xh-number-field default-value="2" size="sm">
                  <div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input" aria-label="数量" /></div></div>
                </xh-number-field>
              </div>
              <div data-xh-part="cell" value="note">
                <xh-text-field size="sm">
                  <div data-xh-part="root"><div data-xh-part="control"><input data-xh-part="input" aria-label="备注" /></div></div>
                </xh-text-field>
              </div>
            </div>
          </div>
        </div>
      </xh-table>`
    document.body.append(host)
    await settle()
    for (const scope of ['number-field', 'text-field']) {
      const root = host.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='root']`)!
      const cell = root.closest<HTMLElement>(`[data-scope='table'][data-part='cell']`)!
      const style = getComputedStyle(cell)
      // 按小数宽量：clientWidth 取整，格子内容宽落在半像素上时会差 0.5
      const inset = [style.borderInlineStartWidth, style.borderInlineEndWidth, style.paddingInlineStart, style.paddingInlineEnd]
        .reduce((sum, value) => sum + Number.parseFloat(value), 0)
      const content = cell.getBoundingClientRect().width - inset
      expect(root.getBoundingClientRect().width, scope).toBeCloseTo(content, 0)
    }
  })
})
