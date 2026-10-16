// @vitest-environment jsdom
// label 部件在 setup 里同步登记：label 排在被命名的节点之前时（文本框的输入），服务端直出就带上名字；
// 被命名的是 label 的祖先时（单选组的组根），直出时它先于 label 渲染，挂载后才补上引用；没写 label 时都不写这条引用。
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { XhRadioGroupItem, XhRadioGroupItemText, XhRadioGroupLabel, XhRadioGroupRoot, XhTextFieldInput, XhTextFieldLabel, XhTextFieldRoot } from '../src'

function parse(html: string): HTMLElement {
  const box = document.createElement('div')
  box.innerHTML = html
  return box
}

describe('服务端直出的名字链', () => {
  it('文本框的 label 排在输入之前：直出的输入框引用它', async () => {
    const box = parse(await renderToString(h(XhTextFieldRoot, null, () => [h(XhTextFieldLabel, null, () => '昵称'), h(XhTextFieldInput)])))
    const label = box.querySelector('[data-scope="text-field"][data-part="label"]')!
    expect(box.querySelector('input')!.getAttribute('aria-labelledby')).toBe(label.id)
  })

  it('文本框没写 label：直出的输入框不写 aria-labelledby', async () => {
    const box = parse(await renderToString(h(XhTextFieldRoot, null, () => [h(XhTextFieldInput)])))
    expect(box.querySelector('input')!.hasAttribute('aria-labelledby')).toBe(false)
  })

  it('单选组的组根是标题的祖先：直出时根先于标题渲染，不写引用，也不留落空的 id', async () => {
    const box = parse(await renderToString(h(XhRadioGroupRoot, null, () => [
      h(XhRadioGroupLabel, null, () => '配送方式'),
      h(XhRadioGroupItem, { value: 'a' }, () => [h(XhRadioGroupItemText, null, () => '快递')]),
    ])))
    expect(box.querySelector('[data-scope="radio-group"][data-part="root"]')!.hasAttribute('aria-labelledby')).toBe(false)
  })
})
