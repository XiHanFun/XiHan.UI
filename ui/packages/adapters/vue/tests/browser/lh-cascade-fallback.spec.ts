// 皮肤里用 `lh`（一行字的高度）的两处，都必须写成级联兜底：同一条 padding-block
// 先写一条按令牌算的「字号 × 行距」，再写 lh 那条。不认 lh 的引擎丢掉后一条、留下前一条，
// 上下留白仍在；认 lh 的引擎取后一条，两者算出来是同一个数。
//
// 判据两段：
// ① 皮肤源码里两条声明都在，且兜底那条排在 lh 那条之前（顺序反了级联就不成立）；
// ② 把两条各自的取值原样贴到真实元素上，算出来的留白一样——本机 Chromium 认 lh，
//    所以量到的是「lh 那条的结果」，与兜底那条对上就说明兜底没有换掉几何。
import type { App } from 'vue'
import fieldCss from '@xihan-ui/styles/field.css?raw'
import promptInputCss from '@xihan-ui/styles/prompt-input.css?raw'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import {
  XhFieldControl,
  XhFieldLabel,
  XhFieldRoot,
  XhFormFieldGroup,
  XhFormRoot,
  XhPromptInputControl,
  XhPromptInputInput,
  XhPromptInputRoot,
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

/** 挂一棵树，cssText 落在宿主上，槽由它往下继承。 */
function mount(render: () => unknown, cssText = ''): void {
  app?.unmount()
  host?.remove()
  host = document.createElement('div')
  host.style.cssText = cssText
  document.body.append(host)
  app = createApp({ setup: () => () => render() as never })
  app.mount(host)
}

/** 取值里有没有行盒单位。与 check-css-floor 的判据同一条。 */
function hasLineUnit(value: string): boolean {
  return /(?:^|[^\w-])[\d.]+r?lh\b/.test(value)
}

/**
 * 按出现顺序取某个属性的全部取值。
 * 先去注释：说明文字里也写着 1lh，照字面扫会多数出几条来。
 * 属性名后面直接跟冒号，`padding-block` 因此不会连 `padding-block-start` 一起收。
 */
function valuesOf(css: string, property: string): string[] {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const re = new RegExp(`(?:^|[;{])\\s*${property}\\s*:([^;}]*)`, 'g')
  return [...bare.matchAll(re)].map(m => (m[1] ?? '').trim())
}

/** 皮肤里那一对声明：兜底在前、lh 在后。 */
function cascadePair(css: string, property: string): { fallback: string, lineUnit: string } {
  const values = valuesOf(css, property)
  const at = values.findIndex(hasLineUnit)
  expect(at, `皮肤里没有用 ${property} + 行盒单位的那条声明`).toBeGreaterThanOrEqual(0)
  expect(at, `${property} 的行盒单位那条前面没有别的声明，兜底缺位`).toBeGreaterThan(0)
  const fallback = values[at - 1] ?? ''
  expect(hasLineUnit(fallback), `${property} 的兜底那条里还带着行盒单位`).toBe(false)
  return { fallback, lineUnit: values[at] ?? '' }
}

/** 把一条取值原样贴到元素上，量出来的上补白；量完还原。 */
function paddingWith(el: HTMLElement, value: string): string {
  const before = el.style.getPropertyValue('padding-block')
  el.style.setProperty('padding-block', value)
  const got = getComputedStyle(el).paddingTop
  if (before)
    el.style.setProperty('padding-block', before)
  else
    el.style.removeProperty('padding-block')
  return got
}

/** 皮肤当前算出来的上补白（本机认 lh，所以这就是 lh 那条的结果）。 */
function padding(el: HTMLElement): string {
  return getComputedStyle(el).paddingTop
}

function part(scope: string, name: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
  if (!el)
    throw new Error(`没有 ${scope} 的 ${name} 部件`)
  return el
}

describe('字段标签左置：一行高的兜底', () => {
  const { fallback, lineUnit } = cascadePair(fieldCss, 'padding-block')

  function mountHorizontal(cssText = ''): HTMLElement {
    mount(
      () => h(
        XhFormRoot,
        { layout: 'horizontal' as const, labelWidth: 96 },
        () => h(XhFormFieldGroup, { value: 'username' }, () => h(XhFieldRoot, null, () => [
          h(XhFieldLabel, null, () => '用户名'),
          h(XhFieldControl, null, () => h('input')),
        ])),
      ),
      cssText,
    )
    return part('field', 'label')
  }

  it('两条声明都在，兜底排在行盒单位那条前面', () => {
    expect(lineUnit).toContain('lh')
    expect(fallback).toContain('var(--xh-field-label-font-size')
    expect(fallback).toContain('var(--xh-field-label-leading')
  })

  it('兜底算出来的留白与皮肤当前的一样', () => {
    const label = mountHorizontal()
    const now = padding(label)
    expect(Number.parseFloat(now), '这一档的补白本来就该大于 0，等于 0 就量不出差别').toBeGreaterThan(0)
    expect(paddingWith(label, fallback)).toBe(now)
    expect(paddingWith(label, lineUnit)).toBe(now)
  })

  it('改控件高度、标签字号、标签行距，兜底都跟着走', () => {
    for (const cssText of [
      '--xh-field-control-h: 40px',
      '--xh-field-label-font-size: 18px',
      '--xh-field-label-leading: 2',
      '--xh-field-control-h: 48px; --xh-field-label-font-size: 20px; --xh-field-label-leading: 1.25',
    ]) {
      const label = mountHorizontal(cssText)
      const now = padding(label)
      expect(Number.parseFloat(now), cssText).toBeGreaterThan(0)
      expect(paddingWith(label, fallback), cssText).toBe(now)
    }
  })
})

describe('提示输入框：一行高的兜底', () => {
  const { fallback, lineUnit } = cascadePair(promptInputCss, 'padding-block')

  function mountInput(size: 'sm' | 'md' | 'lg', cssText = ''): HTMLElement {
    mount(
      () => h(XhPromptInputRoot, { size }, () => h(XhPromptInputControl, null, () => h(XhPromptInputInput))),
      cssText,
    )
    return part('prompt-input', 'input')
  }

  it('两条声明都在，兜底排在行盒单位那条前面', () => {
    expect(lineUnit).toContain('lh')
    expect(fallback).toContain('var(--xh-prompt-input-input-font-size')
    expect(fallback).toContain('var(--xh-leading-normal)')
  })

  it('三档尺寸下兜底算出来的留白都与皮肤当前的一样', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const input = mountInput(size)
      const now = padding(input)
      expect(Number.parseFloat(now), size).toBeGreaterThan(0)
      expect(paddingWith(input, fallback), size).toBe(now)
      expect(paddingWith(input, lineUnit), size).toBe(now)
    }
  })

  it('使用者改输入框字号，兜底跟着走', () => {
    const input = mountInput('md', '--xh-prompt-input-input-font-size: 20px')
    const now = padding(input)
    expect(Number.parseFloat(now)).toBeGreaterThan(0)
    expect(paddingWith(input, fallback)).toBe(now)
  })
})
