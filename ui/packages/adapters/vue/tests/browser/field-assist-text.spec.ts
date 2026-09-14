// 控件下方那一行辅助文字同时只留一段：无效时显示错误，不无效时显示说明。
// 判据是级联算出来的 display——收起写在公共层里，逐份皮肤都没有这条规则，
// 只有把两个部件一起渲出来、按真实的引入顺序算一遍才看得出它有没有生效。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFieldsetDescription,
  XhFieldsetErrorText,
  XhFieldsetLegend,
  XhFieldsetRoot,
} from '../../src'
// 皮肤要一起加载：这里查的就是皮肤算出来的取值
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

function mount(render: () => unknown): void {
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => () => render() as never })
  app.mount(host)
}

function part(scope: string, name: string, index = 0): HTMLElement {
  const all = document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
  const el = all[index]
  if (!el)
    throw new Error(`没有第 ${index} 个 ${scope}/${name} 节点`)
  return el
}

const displayOf = (el: HTMLElement): string => getComputedStyle(el).display

function field(invalid: boolean): unknown {
  return h(XhFieldRoot, { invalid }, () => [
    h(XhFieldLabel, () => '邮箱'),
    h(XhFieldControl, () => h('input')),
    h(XhFieldDescription, () => '工作邮箱，登录用'),
    h(XhFieldErrorText, () => '格式不对'),
  ])
}

describe('field 的辅助文字', () => {
  it('不无效：说明在场，错误由 hidden 收起', () => {
    mount(() => field(false))
    expect(displayOf(part('field', 'description'))).not.toBe('none')
    expect(displayOf(part('field', 'error-text'))).toBe('none')
  })

  it('无效：错误顶上来，说明让出这一行', () => {
    mount(() => field(true))
    expect(displayOf(part('field', 'description'))).toBe('none')
    expect(displayOf(part('field', 'error-text'))).not.toBe('none')
  })

  it('说明收起了仍留在控件的描述链上：读屏两段照旧都念得到', () => {
    mount(() => field(true))
    const described = part('field', 'control').getAttribute('aria-describedby') ?? ''
    expect(described.split(' ')).toContain(part('field', 'description').id)
  })
})

describe('fieldset 的辅助文字', () => {
  it('整组无效只收起它自己那段说明，组内字段的说明照常在场', () => {
    mount(() => h(XhFieldsetRoot, { invalid: true }, () => [
      h(XhFieldsetLegend, () => '账号'),
      h(XhFieldsetDescription, () => '这组信息用于登录'),
      field(false),
      h(XhFieldsetErrorText, () => '这组还有没填的'),
    ]))
    expect(displayOf(part('fieldset', 'description'))).toBe('none')
    expect(displayOf(part('field', 'description'))).not.toBe('none')
  })
})
