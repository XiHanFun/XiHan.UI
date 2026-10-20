// 自定义元素声明 xhConfig 就是一层配置作用域（设计器自己设语言即这样用）。改了它要调 notifyXhConfigChange(作用域)：
// 子树里已渲染的元素（含搬进 Portal 的浮层内容）照新配置重画；没调就照旧，证明这一步是必需的。
import type { XhConfig, XhConfigScope } from '../../src/authoring'
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { notifyXhConfigChange } from '../../src/authoring'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

/** 第三方的作用域元素：只认 XhConfigScope 那一个字段。 */
class TestDesignerScope extends HTMLElement implements XhConfigScope {
  xhConfig: XhConfig = {}
}
if (!customElements.get('test-designer-scope'))
  customElements.define('test-designer-scope', TestDesignerScope)

const CHINESE: XhConfig = {
  translations: {
    'file-upload': { dropzone: '把文件拖到这里' },
    'select': { empty: '没有候选' },
  },
}

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

function dropzoneText(): string | null {
  return document.querySelector<HTMLElement>(`[data-scope='file-upload'][data-part='dropzone']`)!.textContent
}

function emptyText(): string | null | undefined {
  return document.querySelector<HTMLElement>(`[data-scope='select'][data-part='empty']`)?.textContent
}

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

describe('wc 自定义元素当配置作用域', () => {
  it('改了 xhConfig 不调 notifyXhConfigChange 时照旧；调了之后子树里的元素（含浮层内容）换成新文案', async () => {
    const scope = document.createElement('test-designer-scope') as TestDesignerScope
    scope.innerHTML = '<xh-file-upload></xh-file-upload><xh-select></xh-select>'
    document.body.append(scope)
    await settle()
    // 浮层打开着：空态文案在搬进 Portal 的定位层里
    document.querySelector<HTMLElement>(`[data-scope='select'][data-part='trigger']`)!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expect(document.querySelector(`[data-scope='select'][data-part='positioner']`)!.closest('test-designer-scope')).toBeNull()
    expect([dropzoneText(), emptyText()]).toEqual(['Drag files here or click to browse', 'No data'])

    scope.xhConfig = CHINESE
    await settle()
    expect([dropzoneText(), emptyText()]).toEqual(['Drag files here or click to browse', 'No data'])

    notifyXhConfigChange(scope)
    await settle()
    expect([dropzoneText(), emptyText()]).toEqual(['把文件拖到这里', '没有候选'])
  })
})
