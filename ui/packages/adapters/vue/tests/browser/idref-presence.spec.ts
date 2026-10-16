// 名字链与描述链只引用在场的部件：字段没写说明、控件没写自己的 label 时，引用的每个 id 都查得回节点，axe 不报无效引用。
import type { App, VNode } from 'vue'
import { runAxe } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldControl,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(render: () => VNode): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  for (let i = 0; i < 3; i++)
    await new Promise(resolve => requestAnimationFrame(resolve))
  return host
}

/** 容器里每条 aria-labelledby / aria-describedby 引用的 id 都要能在文档里找到。 */
function danglingRefs(root: HTMLElement): string[] {
  const out: string[] = []
  for (const el of root.querySelectorAll('[aria-labelledby], [aria-describedby]')) {
    for (const attr of ['aria-labelledby', 'aria-describedby']) {
      for (const id of (el.getAttribute(attr) ?? '').split(/\s+/).filter(Boolean)) {
        if (!document.getElementById(id))
          out.push(`${el.localName}[${attr}] → ${id}`)
      }
    }
  }
  return out
}

async function refViolations(root: HTMLElement): Promise<string[]> {
  const { violations } = await runAxe(root)
  return violations.filter(v => ['aria-valid-attr-value', 'aria-input-field-name', 'button-name', 'label'].includes(v.id)).map(v => v.id)
}

describe('只引用在场的部件', () => {
  it('字段没写说明、invalid：下拉触发钮只引用字段标签与错误文案', async () => {
    const root = await mount(() => h(XhFieldRoot, { invalid: true }, () => [
      h(XhFieldLabel, null, () => '部门'),
      h(XhFieldControl, null, () => [h(XhSelectRoot, null, () => [h(XhSelectTrigger, null, () => [h(XhSelectValueText)])])]),
      h(XhFieldErrorText, null, () => '必填'),
    ]))
    expect(danglingRefs(root)).toEqual([])
    expect(await refViolations(root)).toEqual([])
  })

  it('字段没写说明：没写自己 label 的文本框，名字链只有字段标签', async () => {
    const root = await mount(() => h(XhFieldRoot, null, () => [
      h(XhFieldLabel, null, () => '邮箱'),
      h(XhFieldControl, { asChild: false }, () => [h(XhTextFieldRoot, null, () => [h(XhTextFieldInput)])]),
    ]))
    const input = root.querySelector('input')!
    expect(input.getAttribute('aria-labelledby')).toBe(root.querySelector('[data-scope="field"][data-part="label"]')!.id)
    expect(input.hasAttribute('aria-describedby')).toBe(false)
    expect(danglingRefs(root)).toEqual([])
    expect(await refViolations(root)).toEqual([])
  })

  it('字段外没写自己 label 的文本框：不写 aria-labelledby，作者写的 aria-label 生效', async () => {
    const root = await mount(() => h(XhTextFieldRoot, null, () => [h(XhTextFieldInput, { 'aria-label': '搜索' })]))
    expect(root.querySelector('input')!.hasAttribute('aria-labelledby')).toBe(false)
    expect(danglingRefs(root)).toEqual([])
    expect(await refViolations(root)).toEqual([])
  })

  it('写了自己 label 的文本框照旧引用它', async () => {
    const root = await mount(() => h(XhTextFieldRoot, null, () => [h(XhTextFieldLabel, null, () => '昵称'), h(XhTextFieldInput)]))
    expect(root.querySelector('input')!.getAttribute('aria-labelledby')).toBe(root.querySelector('[data-scope="text-field"][data-part="label"]')!.id)
    expect(danglingRefs(root)).toEqual([])
  })
})
