// @vitest-environment jsdom
//
// 整组禁用要落到组内每一段的原生 disabled 上：只在根上打 data-disabled 的话，
// 按钮照样可聚焦、照样派 click，看着灰、点得动。
// 组的 variant / tone / size 走同一条路下发：段自己没写的取组值，写了的优先，段因此自带
// data-xh-action-variant，颜色由家族形态矩阵给出。
// 共享的一致性套件核不到这一路：它的 fixture 里每一段是裸 <button>，不经过 XhButton。
import type React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhButton, XhButtonGroup, XhConfigProvider } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

async function render(groupDisabled: boolean | undefined, separators?: boolean): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(
      <XhButtonGroup disabled={groupDisabled} separators={separators}>
        <XhButton>日</XhButton>
        <XhButton disabled>周</XhButton>
      </XhButtonGroup>,
    )
  })
}

function buttons(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[data-scope="button"][data-part="root"]')]
}

describe('按钮组的禁用传到组内每一段', () => {
  it('整组禁用：每一段拿到的是原生 disabled，不是只有 data-*', async () => {
    await render(true)
    const [first, second] = buttons()
    expect(first!.disabled).toBe(true)
    expect(second!.disabled).toBe(true)
  })

  it('整组没禁用：段自己写了禁用的仍然禁用，其余照常可点', async () => {
    await render(undefined)
    const [first, second] = buttons()
    expect(first!.disabled).toBe(false)
    expect(second!.disabled).toBe(true)
  })

  it('段间装饰线跟着整组的排布走，读屏不念', async () => {
    await render(true)
    const separator = document.querySelector('[data-xh-button-group-separator]')!
    expect(separator.localName).toBe('span')
    expect(separator.getAttribute('aria-hidden')).toBe('true')
    // 画的是这条线自己的朝向：横排的组里它是一条竖线
    expect(separator.getAttribute('data-orientation')).toBe('vertical')
    expect(separator.getAttribute('data-disabled')).toBe('')
  })

  it('separators=false：不生成分隔线', async () => {
    await render(undefined, false)
    expect(document.querySelector('[data-xh-button-group-separator]')).toBeNull()
  })
})

async function renderAxes(node: React.ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(node)
  })
}

describe('按钮组的三轴下发到组内每一段', () => {
  it('组写了 variant / tone / size：未自写的段取组值，自写的段优先', async () => {
    await renderAxes(
      <XhButtonGroup variant="outline" tone="danger" size="sm">
        <XhButton>继承组</XhButton>
        <XhButton variant="solid" tone="brand" size="lg">自写</XhButton>
      </XhButtonGroup>,
    )
    const [inherited, own] = buttons()
    expect(inherited!.getAttribute('data-xh-action-variant')).toBe('outline')
    expect(inherited!.getAttribute('data-variant')).toBe('outline')
    expect(inherited!.getAttribute('data-tone')).toBe('danger')
    expect(inherited!.getAttribute('data-size')).toBe('sm')
    expect(inherited!.getAttribute('data-xh-action-size')).toBe('sm')
    expect(own!.getAttribute('data-xh-action-variant')).toBe('solid')
    expect(own!.getAttribute('data-tone')).toBe('brand')
    expect(own!.getAttribute('data-size')).toBe('lg')
  })

  it('组没写 variant：段落组的缺省 subtle，不是单独一枚 Button 的 solid', async () => {
    await renderAxes(
      <div>
        <XhButtonGroup><XhButton>组内</XhButton></XhButtonGroup>
        <XhButton>组外</XhButton>
      </div>,
    )
    const [grouped, standalone] = buttons()
    expect(grouped!.getAttribute('data-xh-action-variant')).toBe('subtle')
    expect(grouped!.getAttribute('data-tone')).toBeNull()
    expect(standalone!.getAttribute('data-xh-action-variant')).toBe('solid')
  })

  it('组的 size 压过全局配置的 size，段自写的又压过组', async () => {
    await renderAxes(
      <XhConfigProvider config={{ size: 'lg' }}>
        <XhButtonGroup size="sm">
          <XhButton>组值</XhButton>
          <XhButton size="md">自写</XhButton>
        </XhButtonGroup>
      </XhConfigProvider>,
    )
    const [grouped, own] = buttons()
    expect(grouped!.getAttribute('data-size')).toBe('sm')
    expect(own!.getAttribute('data-size')).toBe('md')
  })
})
