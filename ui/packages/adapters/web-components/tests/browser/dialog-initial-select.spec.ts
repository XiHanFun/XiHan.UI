// 对话框打开时把焦点交给第一个可聚焦元素：单行文本框全选里面的内容，多行的 textarea 只落焦、不全选。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await Promise.resolve()
  // 等宿主提交与落焦：两帧
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await Promise.resolve()
}

function mount(first: 'textarea' | 'input'): void {
  const field = first === 'textarea' ? '<textarea>第一行\n第二行</textarea>' : '<input type="text" value="张三">'
  const host = document.createElement('div')
  host.innerHTML = `
    <xh-dialog open>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content"><h2 data-xh-part="title">编辑</h2>${field}<button type="button">保存</button></div>
      </div>
    </xh-dialog>
  `
  document.body.append(host)
}

/** 焦点所在的文本框是不是整段选中。 */
function fullySelected(): boolean {
  const el = document.activeElement as HTMLInputElement | HTMLTextAreaElement
  return el.selectionStart === 0 && el.selectionEnd === el.value.length
}

describe('对话框打开时的落焦与全选', () => {
  it('第一个可聚焦元素是 textarea：焦点落上去，不全选', async () => {
    mount('textarea')
    await settle()
    expect(document.activeElement?.localName).toBe('textarea')
    expect(fullySelected()).toBe(false)
  })

  it('第一个可聚焦元素是单行文本框：焦点落上去并全选', async () => {
    mount('input')
    await settle()
    expect(document.activeElement?.localName).toBe('input')
    expect(fullySelected()).toBe(true)
  })
})
