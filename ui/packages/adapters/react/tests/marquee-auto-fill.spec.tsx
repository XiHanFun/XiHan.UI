// @vitest-environment jsdom
// autoFill 决定轨道里铺几份内容。接缝对不对得上，看的是「走完的距离恰好等于一份的长度」，
// 所以每份都要各自成壳、各自等长；这里盯的就是壳的份数、副本的可及性，以及什么才算真有内容可铺。
// 共享的一致性套件核不到这一路：壳不是部件，快照只采 [data-part] 的节点。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhMarqueeContent, XhMarqueeRoot } from '../src'

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

async function render(props: Record<string, unknown>, children: ReactNode = '曦寒前端组件库'): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(
      <XhMarqueeRoot {...props}>
        <XhMarqueeContent>{children}</XhMarqueeContent>
      </XhMarqueeRoot>,
    )
  })
}

function copies(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-xh-copy]')]
}

describe('xhMarquee 的 autoFill', () => {
  it('缺省铺一份，那一份不标 aria-hidden', async () => {
    await render({})
    const all = copies()
    expect(all).toHaveLength(1)
    expect(all[0]!.getAttribute('aria-hidden')).toBeNull()
  })

  it('开了 autoFill 铺两份，第二份是副本、既不朗读也不可聚焦', async () => {
    await render({ autoFill: true })
    const all = copies()
    expect(all).toHaveLength(2)
    expect(all[0]!.getAttribute('aria-hidden')).toBeNull()
    expect(all[0]!.hasAttribute('inert')).toBe(false)
    expect(all[1]!.getAttribute('aria-hidden')).toBe('true')
    // 只标 aria-hidden 而留着可聚焦的副本，焦点会落进一个读屏看不见的地方。
    // inert 是布尔属性，在场即生效，不比对它的值
    expect(all[1]!.hasAttribute('inert')).toBe(true)
    // 两份内容逐字相同，走完一份才接得上
    expect(all[1]!.textContent).toBe(all[0]!.textContent)
  })

  it('条件渲染落空留下的假值不算有内容，一份都不铺', async () => {
    await render({ autoFill: true }, false)
    expect(copies()).toHaveLength(0)
  })

  it('纯空白文本不算有内容，一份都不铺', async () => {
    await render({ autoFill: true }, '\n  ')
    expect(copies()).toHaveLength(0)
  })
})
