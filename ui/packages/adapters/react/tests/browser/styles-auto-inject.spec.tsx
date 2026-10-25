// 按需注入（@xihan-ui/styles/vite）：本文件只写到按钮这一个组件，vitest.browser.config 里的插件扫的就是本文件，
// 注入层序、令牌、公共层、Action Control 家族与按钮皮肤。库的聚焦环画在公共层 focus.css 里，单引按钮那一份皮肤时
// 只剩浏览器缺省的那圈；这里断言插件把它带上了，再与全量入口逐项比对按钮在静息与键盘聚焦下的计算样式。
// 注释里不写别的组件名：插件按文本认组件，写了就会多注入一份。
import type { ReactNode } from 'react'
import buttonCss from '@xihan-ui/styles/button.css?inline'
import fullCss from '@xihan-ui/styles/index.css?inline'
import layersCss from '@xihan-ui/styles/layers.css?inline'
import tokensCss from '@xihan-ui/tokens/tokens.css?inline'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import injectedCss from 'virtual:xihan-ui/styles.css?inline'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhButton } from '../../src'

/** 比对的计算样式：盒、面、字、环与指针。 */
const PROPS = [
  'display',
  'box-sizing',
  'block-size',
  'inline-size',
  'padding-block-start',
  'padding-inline-start',
  'border-block-start-width',
  'border-block-start-style',
  'border-block-start-color',
  'border-start-start-radius',
  'background-color',
  'background-image',
  'color',
  'font-size',
  'font-weight',
  'line-height',
  'gap',
  'outline-style',
  'outline-width',
  'outline-color',
  'outline-offset',
  'box-shadow',
  'cursor',
]

type Style = Record<string, string>

const cleanups: Array<() => void> = []

beforeAll(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()!()
})

const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))

async function mount(css: string, node: ReactNode): Promise<HTMLElement> {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => root.render(node))
  await frame()
  cleanups.push(() => style.remove(), () => host.remove(), () => act(() => root.unmount()))
  return host
}

function read(element: Element, pseudo?: string): Style {
  const computed = getComputedStyle(element, pseudo)
  return Object.fromEntries(PROPS.map(prop => [prop, computed.getPropertyValue(prop)]))
}

/** 静息与键盘聚焦两态下按钮本体与 ::before 的计算样式。 */
async function states(css: string): Promise<{ restRoot: Style, restBefore: Style, focusRoot: Style, focusBefore: Style }> {
  const node = (
    <>
      <button type="button" data-test-start>起点</button>
      <XhButton>保存</XhButton>
    </>
  )
  const host = await mount(css, node)
  const button = host.querySelector<HTMLElement>('[data-scope="button"]')!
  const rest = { root: read(button), before: read(button, '::before') }
  host.querySelector<HTMLElement>('[data-test-start]')!.focus()
  await userEvent.tab()
  await frame()
  expect(document.activeElement, '键盘焦点落在按钮上').toBe(button)
  expect(button.matches(':focus-visible')).toBe(true)
  const focus = { root: read(button), before: read(button, '::before') }
  cleanups.splice(0).reverse().forEach(cleanup => cleanup())
  return { restRoot: rest.root, restBefore: rest.before, focusRoot: focus.root, focusBefore: focus.before }
}

describe('按需注入样式（只用到按钮）', () => {
  it('只注入按钮的皮肤，层序、令牌与公共层都在', () => {
    expect(injectedCss).toContain('--xh-button-skin: 1')
    expect(injectedCss).toContain(':focus-visible')
    expect(injectedCss).not.toMatch(/--xh-(?!button-)[a-z-]+-skin: 1/)
    // 两边都内联了整份令牌（一百多 kB），皮肤部分只剩按钮那一份
    expect(injectedCss.length).toBeLessThan(fullCss.length / 5)
  })

  it('键盘聚焦时聚焦环在场', async () => {
    const { focusRoot, focusBefore, restRoot } = await states(injectedCss)
    const ring = (style: Style): boolean =>
      (style['outline-style'] !== 'none' && Number.parseFloat(style['outline-width']!) > 0) || style['box-shadow'] !== 'none'
    expect(ring(focusRoot) || ring(focusBefore), '聚焦后按钮或它的 ::before 画出了环').toBe(true)
    expect(ring(restRoot), '静息时没有环').toBe(false)
  })

  it('手工只引层序、令牌与按钮那一份皮肤时，聚焦环是浏览器缺省的那圈：库的环画在公共层 focus.css 里', async () => {
    const ring = (style: Style): string => ['outline-style', 'outline-width', 'outline-color', 'outline-offset'].map(prop => style[prop]).join(' ')
    const manual = await states([layersCss, tokensCss, buttonCss].join('\n'))
    const full = await states(fullCss)
    expect(full.focusRoot['outline-style']).toBe('solid')
    expect(ring(manual.focusRoot)).not.toBe(ring(full.focusRoot))
  })

  it('与全量引入渲染一致：静息与键盘聚焦两态的计算样式逐项相同', async () => {
    const injected = await states(injectedCss)
    const full = await states(fullCss)
    expect(injected).toEqual(full)
  })
})
