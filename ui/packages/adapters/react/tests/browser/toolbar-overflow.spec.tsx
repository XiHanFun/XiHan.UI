// 工具条的溢出收纳（React）：放不下的条目按次序收进行尾「更多」钮弹出的菜单。
// 收起个数、菜单里的条目、选中后替条目触发的点击与焦点的来回，只有真实排版算得出来。
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhToolbarItem, XhToolbarOverflowTrigger, XhToolbarRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const ITEM_WIDTH = 50
const LABELS = ['撤销', '重做', '加粗', '斜体', '复制', '粘贴']
const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  // 指针停回角落的停靠点：点过菜单项后它还悬在菜单的位置上，下一条用例的菜单一开就被它点亮
  const park = document.querySelector<HTMLElement>('[data-test-park-pointer]')
  if (park)
    await userEvent.hover(park)
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

interface Mounted {
  clicks: string[]
  resize: (width: number) => Promise<void>
  root: () => HTMLElement
  items: () => HTMLElement[]
  trigger: () => HTMLElement
  menuItem: (label: string) => HTMLElement | null
}

async function mount(width: number): Promise<Mounted> {
  host = document.createElement('div')
  document.body.append(host)
  const clicks: string[] = []
  const render = (w: number) => (
    <div style={{ inlineSize: `${w}px` }}>
      <XhToolbarRoot aria-label="编辑">
        {LABELS.map(label => (
          <XhToolbarItem key={label} value={label} type="button" style={{ inlineSize: `${ITEM_WIDTH}px` }} onClick={() => clicks.push(label)}>
            {label}
          </XhToolbarItem>
        ))}
        <XhToolbarOverflowTrigger />
      </XhToolbarRoot>
    </div>
  )
  root = createRoot(host)
  await inAct(() => root!.render(render(width)))
  const scope = host
  return {
    clicks,
    resize: async (w) => {
      await inAct(() => root!.render(render(w)))
    },
    root: () => scope.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="root"]')!,
    items: () => [...scope.querySelectorAll<HTMLElement>('[data-scope="toolbar"][data-part="item"]')],
    trigger: () => scope.querySelector<HTMLElement>('[data-scope="toolbar"][data-part="overflow-trigger"]')!,
    menuItem: label => document.querySelector<HTMLElement>(`[data-scope="menu"][data-part="item"][data-value="${label}"]`),
  }
}

/** 按工具条自己的间距与钮的尺寸，算出这条宽度下应当露出几个条目。 */
function expectedVisible(bar: Mounted, available: number): number {
  const gap = Number.parseFloat(getComputedStyle(bar.root()).columnGap)
  const room = available - (bar.trigger().getBoundingClientRect().width + gap)
  let count = 0
  while (count < LABELS.length && (count + 1) * ITEM_WIDTH + count * gap <= room)
    count += 1
  return count
}

const hiddenFlags = (bar: Mounted): boolean[] => bar.items().map(el => el.hasAttribute('hidden'))

describe('react toolbar 溢出收纳（真实排版）', () => {
  it('挂载首帧就收好：放不下的尾部条目藏起来，钮贴在最后一个露出的条目之后；变宽后放回、钮收起', async () => {
    const bar = await mount(240)
    expect(bar.trigger().hidden).toBe(false)
    const visible = expectedVisible(bar, 240)
    expect(visible).toBeGreaterThan(0)
    expect(hiddenFlags(bar)).toEqual(LABELS.map((_, i) => i >= visible))
    expect(bar.trigger().getBoundingClientRect().left).toBeGreaterThanOrEqual(bar.items()[visible - 1]!.getBoundingClientRect().right)

    await bar.resize(400)
    await expect.poll(() => hiddenFlags(bar)).toEqual(LABELS.map(() => false))
    expect(bar.trigger().hidden).toBe(true)
  })

  it('菜单里选中一项即替它触发点击；键盘 End / 下方向键 / Escape 的焦点来回', async () => {
    const bar = await mount(240)
    const visible = expectedVisible(bar, 240)
    bar.items()[0]!.focus()
    await userEvent.keyboard('{End}')
    expect(document.activeElement).toBe(bar.trigger())
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => document.activeElement).toBe(bar.menuItem(LABELS[visible]!))
    await userEvent.keyboard('{Escape}')
    await expect.poll(() => document.activeElement).toBe(bar.trigger())

    await userEvent.click(bar.trigger())
    await expect.poll(() => bar.trigger().getAttribute('aria-expanded')).toBe('true')
    const target = LABELS[LABELS.length - 1]!
    await userEvent.click(bar.menuItem(target)!)
    expect(bar.clicks).toEqual([target])
    await expect.poll(() => bar.trigger().getAttribute('aria-expanded')).toBe('false')
    await expect.poll(() => document.activeElement).toBe(bar.trigger())
  })
})
