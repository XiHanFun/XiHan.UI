// @vitest-environment jsdom
// 点字段的标题要能聚焦到控件上。
//
// label 的 for 只对可标注元素生效（button / input / select / textarea 这几种），
// 而库里的复合控件根是个 div，for 指过去什么也不会发生——而且不报错。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhSelectControl,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhTextFieldInput,
  XhTextFieldRoot,
} from '../src'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(render: () => unknown): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => render() })
  app.mount(host)
  await nextTick()
  await nextTick()
}

function part(scope: string, name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!
}

function clickLabel(): void {
  part('field', 'label').dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

describe('点字段的标题', () => {
  it('select：焦点落到 trigger 上，不是那个藏起来的原生 select', async () => {
    await mount(() =>
      h(XhFieldRoot, null, () => [
        h(XhFieldLabel, null, () => '所属部门'),
        h(XhFieldControl, null, () => [
          h(XhSelectRoot, { collection: [{ value: 'a', label: 'A' }] }, () => [
            h(XhSelectControl, null, () => [
              h(XhSelectTrigger, null, () => [h(XhSelectValueText)]),
            ]),
          ]),
        ]),
      ]),
    )

    clickLabel()
    expect(document.activeElement).toBe(part('select', 'trigger'))
  })

  it('text-field：焦点落到 input 上', async () => {
    await mount(() =>
      h(XhFieldRoot, null, () => [
        h(XhFieldLabel, null, () => '姓名'),
        h(XhFieldControl, null, () => [h(XhTextFieldRoot, null, () => [h(XhTextFieldInput)])]),
      ]),
    )

    clickLabel()
    expect(document.activeElement).toBe(part('text-field', 'input'))
  })

  it('控件根本身就是真控件时让位给浏览器的 for', async () => {
    await mount(() =>
      h(XhFieldRoot, null, () => [
        h(XhFieldLabel, null, () => '邮箱'),
        h(XhFieldControl, null, () => [h('input', { type: 'email' })]),
      ]),
    )

    // 转交查的是控件根的子节点：根就是那个 input 时查不到东西，库不动手，
    // 焦点该由浏览器的 for 送过去（jsdom 不实现原生激活，所以这里量到的是「没动」）
    clickLabel()
    expect(document.activeElement).not.toBe(host!.querySelector('input'))
  })

  it('控件里没有可聚焦的东西时安静收场', async () => {
    await mount(() =>
      h(XhFieldRoot, null, () => [
        h(XhFieldLabel, null, () => '只读展示'),
        h(XhFieldControl, null, () => [h('div', null, '一段文字')]),
      ]),
    )

    expect(() => clickLabel()).not.toThrow()
  })
})
