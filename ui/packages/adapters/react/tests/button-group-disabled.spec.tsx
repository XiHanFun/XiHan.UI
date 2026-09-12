// @vitest-environment jsdom
//
// 整组禁用要落到组内每一段的原生 disabled 上：只在根上打 data-disabled 的话，
// 按钮照样可聚焦、照样派 click，看着灰、点得动。
// 共享的一致性套件核不到这一路：它的 fixture 里每一段是裸 <button>，不经过 XhButton。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhButton, XhButtonGroup } from '../src'

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
