// 标签、说明与错误文案的公共层（label.css / description.css）：
// 控件下方那一行辅助文字同时只留一段：无效时显示错误，不无效时显示说明；
// 必填星号与错误文案的字形、字号、字色按公共层规则画，逐份皮肤只接覆盖槽。
// 判据是级联算出来的 display / content / color / font-size——规则写在公共层里，逐份皮肤都没有，
// 只有把部件渲出来、按真实的引入顺序算一遍才看得出它有没有生效。
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

/** 语义令牌解出来的值：颜色令牌解到色值串，尺寸令牌借一个探针元素解到像素。 */
function tokenColor(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

function tokenFontSize(name: string): string {
  const probe = document.createElement('span')
  probe.style.fontSize = `var(${name})`
  document.body.append(probe)
  const value = getComputedStyle(probe).fontSize
  probe.remove()
  return value
}

function field(invalid: boolean, required = false): unknown {
  return h(XhFieldRoot, { invalid, required }, () => [
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

describe('field 的必填星号与错误文案走公共层', () => {
  it('required：标签末尾的星号由 label.css 按标签自己的 data-required 画，字形取 --xh-glyph-mark-required、颜色取 --xh-fg-danger', () => {
    mount(() => field(false, true))
    const label = part('field', 'label')
    expect(label.hasAttribute('data-required')).toBe(true)
    const star = getComputedStyle(label, '::after')
    expect(star.content).toBe('"*"')
    expect(star.color).toBe(tokenColor('--xh-fg-danger'))
  })

  it('选填：标签不带 data-required，末尾没有生成内容', () => {
    mount(() => field(false))
    const label = part('field', 'label')
    expect(label.hasAttribute('data-required')).toBe(false)
    expect(getComputedStyle(label, '::after').content).toBe('none')
  })

  it('invalid：错误文案由 description.css 画，字号取 --xh-text-secondary-size、颜色取 --xh-fg-danger；标签同档转警示色', () => {
    mount(() => field(true))
    const error = getComputedStyle(part('field', 'error-text'))
    expect(error.fontSize).toBe(tokenFontSize('--xh-text-secondary-size'))
    expect(error.color).toBe(tokenColor('--xh-fg-danger'))
    expect(getComputedStyle(part('field', 'label')).color).toBe(tokenColor('--xh-fg-danger'))
  })
})

describe('fieldset 的必填星号与错误文案走公共层', () => {
  it('required 与 invalid：组标题自己带两位，星号与警示色、错误文案的字号字色都按公共层解出', () => {
    mount(() => h(XhFieldsetRoot, { invalid: true, required: true }, () => [
      h(XhFieldsetLegend, () => '账号'),
      h(XhFieldsetDescription, () => '这组信息用于登录'),
      h(XhFieldsetErrorText, () => '这组还有没填的'),
    ]))
    const legend = part('fieldset', 'legend')
    expect(legend.hasAttribute('data-required')).toBe(true)
    expect(legend.hasAttribute('data-invalid')).toBe(true)
    const star = getComputedStyle(legend, '::after')
    expect(star.content).toBe('"*"')
    expect(star.color).toBe(tokenColor('--xh-fg-danger'))
    expect(getComputedStyle(legend).color).toBe(tokenColor('--xh-fg-danger'))
    const error = getComputedStyle(part('fieldset', 'error-text'))
    expect(error.fontSize).toBe(tokenFontSize('--xh-text-secondary-size'))
    expect(error.color).toBe(tokenColor('--xh-fg-danger'))
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
