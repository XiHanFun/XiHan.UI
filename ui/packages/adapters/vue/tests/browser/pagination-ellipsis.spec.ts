// 省略位摊开被折叠的页码。
//
// 这条必须在真实浏览器里验：浮层被 Teleport 搬到 portal 落点，坐标由定位引擎实测，
// 而「落位才露」是皮肤按 data-positioned 判的——jsdom 既不排版也量不出坐标。
import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhPaginationContent,
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationPositioner,
  XhPaginationRoot,
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
  // 浮层搬去了 body，卸载后确认没留下
  document.querySelectorAll('[data-scope="pagination"][data-part="positioner"]').forEach(el => el.remove())
})

async function tick(times = 4): Promise<void> {
  for (let i = 0; i < times; i++) {
    await nextTick()
    await new Promise(r => requestAnimationFrame(() => r(null)))
  }
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () =>
      // 2000 条 / 每页 10 条 = 200 页，停在第 100 页：两侧各折一段
      h(XhPaginationRoot, { count: 2000, pageSize: 10, defaultPage: 100 }, {
        default: ({ pageItems }: { pageItems: Array<Record<string, unknown>> }) => [
          ...pageItems.map((item, i) =>
            item.type === 'ellipsis'
              ? h(XhPaginationEllipsis, { key: `e${i}`, side: item.side as 'start' | 'end' })
              : h(XhPaginationItem, { key: `p${i}`, value: item.value as number }, () => String(item.value)),
          ),
          h(XhPaginationPositioner, null, () => [
            h(XhPaginationContent, null, {
              default: ({ pages }: { pages: number[] }) =>
                pages.map(p => h(XhPaginationItem, { key: p, value: p }, () => String(p))),
            }),
          ]),
        ],
      }),
  })
  app.mount(host)
  await tick()
}

function ellipses(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="pagination"][data-part="ellipsis"]')]
}

function positioner(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="pagination"][data-part="positioner"]')!
}

function content(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="pagination"][data-part="content"]')!
}

/** 面板里的页码按钮（不含分页行里的那些）。 */
function foldedPages(): number[] {
  return [...content().querySelectorAll<HTMLElement>('[data-part="item"]')]
    .map(el => Number(el.textContent))
}

describe('摊开省略号', () => {
  it('两个省略位各自报出自己那一侧，且不再对读屏隐藏', async () => {
    await mount()
    const list = ellipses()

    expect(list).toHaveLength(2)
    expect(list.map(el => el.getAttribute('data-side'))).toEqual(['start', 'end'])
    for (const el of list) {
      expect(el.getAttribute('aria-hidden')).toBeNull()
      expect(el.tagName).toBe('BUTTON')
      expect(el.getAttribute('aria-expanded')).toBe('false')
    }
  })

  it('点左侧省略位：摊开的是首页与窗口之间那几页', async () => {
    await mount()
    ellipses()[0]!.click()
    await tick()

    expect(ellipses()[0]!.getAttribute('aria-expanded')).toBe('true')
    const pages = foldedPages()
    expect(pages.length).toBeGreaterThan(0)
    // 左侧折的是 2 到「窗口起点前一页」，必定小于当前页且大于 1
    expect(Math.min(...pages)).toBe(2)
    expect(Math.max(...pages)).toBeLessThan(100)
  })

  it('点右侧省略位：换到另一侧，摊开的是窗口与末页之间那几页', async () => {
    await mount()
    ellipses()[1]!.click()
    await tick()

    expect(ellipses()[0]!.getAttribute('aria-expanded')).toBe('false')
    expect(ellipses()[1]!.getAttribute('aria-expanded')).toBe('true')
    const pages = foldedPages()
    expect(Math.min(...pages)).toBeGreaterThan(100)
    // 右侧折到末页前一页为止，末页本身仍在分页行里
    expect(Math.max(...pages)).toBe(199)
  })

  it('摊开后浮层落了位：坐标算出来才露面', async () => {
    await mount()
    ellipses()[1]!.click()
    await tick()

    const pos = positioner()
    expect(pos.getAttribute('data-positioned')).toBe('')
    expect(getComputedStyle(pos).position).toBe('fixed')
    // 落位前皮肤把定位层藏着；落位后要真的可见
    expect(getComputedStyle(pos).visibility).not.toBe('hidden')
    expect(content().getBoundingClientRect().height).toBeGreaterThan(0)
  })

  it('浮层被搬到统一落点，不留在分页行里', async () => {
    await mount()
    ellipses()[1]!.click()
    await tick()

    // 留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    expect(host!.contains(positioner())).toBe(false)
    // 落点是库统一的那一个，不是 body 本身
    expect(positioner().parentElement?.id).toBe('xh-portal-root')
    expect(document.body.contains(positioner())).toBe(true)
  })

  it('点面板里的页码即跳页，并收起面板', async () => {
    await mount()
    ellipses()[1]!.click()
    await tick()

    const target = [...content().querySelectorAll<HTMLElement>('[data-part="item"]')][0]!
    const page = Number(target.textContent)
    target.click()
    await tick()

    const current = document.querySelector<HTMLElement>('[data-scope="pagination"][data-part="item"][aria-current="page"]')
    expect(Number(current?.textContent)).toBe(page)
  })

  it('再点同一个省略位即收起', async () => {
    await mount()
    ellipses()[1]!.click()
    await tick()
    expect(ellipses()[1]!.getAttribute('aria-expanded')).toBe('true')

    ellipses()[1]!.click()
    await tick()
    expect(ellipses()[1]!.getAttribute('aria-expanded')).toBe('false')
  })
})

/**
 * 上面那些用例调的是 element.click()，事件从元素上直接派发，不过命中测试——
 * 省略位就算被样式挡在指针之外也照样通过。这一组走真实指针与真实键盘，
 * 只有它们能证明省略位对使用者真的到得了。
 */
describe('省略位对真实指针与键盘可达', () => {
  /** 指针停在角落那块 fixture 上；每条用完都要还回去，免得下一条挂载时被补发 pointerenter。 */
  async function parkPointer(): Promise<void> {
    await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
  }

  it('省略位在命中测试里就是它自己，不是被它挡住的底下那层', async () => {
    await mount()
    const el = ellipses()[1]!
    const box = el.getBoundingClientRect()
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)

    // 吞掉指针事件的话，这里点到的会是分页行乃至更外层
    expect(el.contains(hit)).toBe(true)
  })

  it('真实指针悬停即摊开：折进去的那几页对指针用户不是死区', async () => {
    await mount()
    await parkPointer()
    await userEvent.hover(ellipses()[1]!)
    // 悬停要停够 openDelay 才摊开；多等无妨，指针不挪开就一直是开着的
    await new Promise(r => setTimeout(r, 400))
    await tick()

    expect(ellipses()[1]!.getAttribute('aria-expanded')).toBe('true')
    expect(foldedPages().length).toBeGreaterThan(0)
    await parkPointer()
  })

  it('键盘走到省略位时有聚焦环', async () => {
    await mount()
    const target = ellipses()[0]!
    // 从头逐个 Tab 过去：只有真实键盘走到的焦点才匹配 :focus-visible
    for (let i = 0; i < 20 && document.activeElement !== target; i++)
      await userEvent.tab()

    expect(document.activeElement).toBe(target)
    // 判的是库自己那圈环（solid），不是浏览器兜底的那圈（auto）——省略位漏出皮肤的 focus 组时，
    // 屏幕上仍会有 UA 的环，只看宽度不为零验不出东西
    const ring = getComputedStyle(target)
    expect(ring.outlineStyle).toBe('solid')
    expect(Number.parseFloat(ring.outlineWidth)).toBeGreaterThan(0)
  })
})
