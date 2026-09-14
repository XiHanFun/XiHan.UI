// @vitest-environment jsdom
// 套进表单字段的控件要念得出字段的标签。
//
// 复合控件的可聚焦部件自带 aria-labelledby，指的是它自己的 label 部件。套进字段时
// 作者用的是字段的标签、组件那个 label 部件没渲染，这条引用于是悬空——按 accname 规则
// 悬空 IDREF 跳过，名字也回退不到 label 的 for（for 指的是封装根那个 div，只对可标注
// 元素生效）。不把字段的标签并进来，焦点所在的控件就一个名字都没有。
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

async function mount(render: () => unknown): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => render() })
  app.mount(host)
  await nextTick()
  await nextTick()
  return host
}

function selectInField() {
  return h(XhFieldRoot, null, () => [
    h(XhFieldLabel, null, () => '所属部门'),
    h(XhFieldControl, null, () => [
      h(XhSelectRoot, { collection: [{ value: 'a', label: 'A' }] }, () => [
        h(XhSelectControl, null, () => [h(XhSelectTrigger, null, () => [h(XhSelectValueText)])]),
      ]),
    ]),
  ])
}

function part(scope: string, name: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)!
}

/** aria-labelledby 里那串 id 逐个查回节点，取它们的文字——读屏拼名字就是这么拼的。 */
function nameOf(el: HTMLElement): string {
  const ids = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean)
  return ids
    .map(id => host!.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
    .filter(Boolean)
    .join(' ')
}

describe('字段标签要念到真控件上', () => {
  it('select：字段的标签排在自己那截前面', async () => {
    await mount(selectInField)
    const labelId = part('field', 'label').id
    const chain = part('select', 'trigger').getAttribute('aria-labelledby')!

    expect(chain.startsWith(`${labelId} `)).toBe(true)
    // 自己那截还在：只把字段标签换上去会挤掉当前值
    expect(chain).toContain(part('select', 'value-text').id)
    expect(nameOf(part('select', 'trigger'))).toContain('所属部门')
  })

  it('text-field：焦点进的是 input，标签得落在它身上', async () => {
    await mount(() =>
      h(XhFieldRoot, null, () => [
        h(XhFieldLabel, null, () => '姓名'),
        h(XhFieldControl, null, () => [h(XhTextFieldRoot, null, () => [h(XhTextFieldInput)])]),
      ]),
    )

    expect(nameOf(part('text-field', 'input'))).toBe('姓名')
  })

  it('字段标签的 id 查得回真节点，不是又一条悬空引用', async () => {
    await mount(selectInField)
    const first = part('select', 'trigger').getAttribute('aria-labelledby')!.split(' ')[0]!

    expect(host!.ownerDocument.getElementById(first)).toBe(part('field', 'label'))
  })

  it('不在字段里时，控件自己的名字链原样不动', async () => {
    await mount(() =>
      h(XhSelectRoot, { collection: [{ value: 'a', label: 'A' }] }, () => [
        h(XhSelectControl, null, () => [h(XhSelectTrigger, null, () => [h(XhSelectValueText)])]),
      ]),
    )
    const chain = part('select', 'trigger').getAttribute('aria-labelledby')!

    // 只剩组件自己的两截，没有多出来的前缀
    expect(chain.split(' ')).toHaveLength(2)
    expect(chain.startsWith('select:')).toBe(true)
  })
})
