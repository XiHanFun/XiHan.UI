import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhSelectRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

const OPTIONS = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
  { value: 'gamma', label: 'Gamma', disabled: true },
]

function isTransparentColor(value: string): boolean {
  return value === 'transparent' || /(?:,\s*0|\/\s*0)\)$/.test(value)
}

/**
 * @param size 尺寸档。
 * @param open 打开方式：'default' 走 defaultOpen（首轮就打开，焦点由脚本落到选中项，浏览器没见过指针，
 * 这枚焦点带 :focus-visible）；'pointer' 由真实指针点开触发器，之后脚本搬到条目上的焦点不带
 * :focus-visible，与用户用鼠标打开后划过条目的那条路一致。
 */
async function mountSelect(size: 'sm' | 'md' | 'lg' = 'md', open: 'default' | 'pointer' | 'closed' = 'default'): Promise<HTMLElement[]> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhSelectRoot, {
      collection: OPTIONS,
      defaultOpen: open === 'default' || undefined,
      defaultValue: 'beta',
      size,
    }),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  if (open === 'pointer') {
    await userEvent.click(document.querySelector<HTMLElement>('[data-scope=\'select\'][data-part=\'trigger\']')!)
    await nextTick()
    await nextTick()
  }
  return [...document.querySelectorAll<HTMLElement>('[data-scope=\'select\'][data-part=\'item\']')]
}

function rawItem({ context = 'overlay', attrs = {} }: { context?: 'overlay' | 'page', attrs?: Record<string, string> } = {}): HTMLElement {
  const item = document.createElement('div')
  item.setAttribute('data-xh-collection-item', '')
  item.setAttribute('data-xh-collection-size', 'md')
  item.setAttribute('data-xh-collection-context', context)
  for (const [name, value] of Object.entries(attrs))
    item.setAttribute(name, value)
  // 裸条目只断言换面的终值，不等待家族的释放过渡
  item.style.transition = 'none'
  for (const slot of ['prefix', 'text', 'description', 'shortcut', 'suffix', 'indicator']) {
    const child = document.createElement('span')
    child.dataset.xhCollectionSlot = slot
    child.textContent = slot
    item.append(child)
  }
  host!.append(item)
  return item
}

/** 读取某个令牌在当前主题下的计算色：探针元素只写 background-color，和条目在同一个文档里求值。 */
function tokenColor(token: string): string {
  const probe = document.createElement('div')
  probe.style.backgroundColor = `var(${token})`
  host!.append(probe)
  const value = getComputedStyle(probe).backgroundColor
  probe.remove()
  return value
}

afterEach(async () => {
  app?.unmount()
  host?.remove()
  document.getElementById('xh-portal-root')?.remove()
  app = null
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('select 使用 Collection Item', () => {
  it('三尺寸只改变块内距、行内距、gap、字号与 glyph 档', async () => {
    const measurements: Array<Record<string, string>> = []
    for (const size of ['sm', 'md', 'lg'] as const) {
      const items = await mountSelect(size)
      const style = getComputedStyle(items[0]!)
      expect(items[0]!.dataset.xhCollectionItem).toBe('')
      expect(items[0]!.dataset.xhCollectionSize).toBe(size)
      expect(style.display).toBe('grid')
      measurements.push({
        paddingBlock: style.paddingBlockStart,
        paddingInline: style.paddingInlineStart,
        gap: style.getPropertyValue('--xh-collection-gap').trim(),
        fontSize: style.fontSize,
        glyphSize: style.getPropertyValue('--xh-icon-size').trim(),
      })
      app!.unmount()
      host!.remove()
      document.getElementById('xh-portal-root')?.remove()
      app = null
      host = null
    }
    expect(new Set(measurements.map(value => value.paddingBlock)).size).toBe(3)
    expect(new Set(measurements.map(value => value.paddingInline)).size).toBe(3)
    expect(new Set(measurements.map(value => value.gap)).size).toBe(3)
    expect(new Set(measurements.map(value => value.fontSize)).size).toBe(3)
    expect(new Set(measurements.map(value => value.glyphSize)).size).toBe(3)
  })

  it('selected 与 checked 保留对号，hover 和键盘高亮分别叠加且不改变字重或宽度', async () => {
    // 指针点开：随后划过条目时脚本搬去的焦点不带 :focus-visible，指针高亮只换面、不画环。
    // defaultOpen 那条路的焦点带 :focus-visible，公共聚焦环会照画——描边色不再过渡后同步读也读得到它
    const [plain, selected, disabled] = await mountSelect('md', 'pointer')
    const indicator = selected!.querySelector<HTMLElement>('[data-part=\'item-indicator\']')!
    expect(selected!.getAttribute('aria-selected')).toBe('true')
    expect(selected!.dataset.state).toBe('checked')
    expect(disabled!.getAttribute('aria-disabled')).toBe('true')
    expect(getComputedStyle(indicator).visibility).toBe('visible')
    expect(getComputedStyle(selected!).fontWeight).toBe(getComputedStyle(plain!).fontWeight)

    const width = selected!.getBoundingClientRect().width
    const rest = getComputedStyle(plain!).backgroundColor
    await userEvent.hover(plain!)
    await nextTick()
    expect(plain!.hasAttribute('data-highlighted')).toBe(true)
    expect(plain!.matches(':focus-visible'), '指针路径的焦点不带 :focus-visible').toBe(false)
    expect(getComputedStyle(plain!).backgroundColor).not.toBe(rest)
    expect(isTransparentColor(getComputedStyle(plain!).outlineColor)).toBe(true)

    await userEvent.keyboard('{ArrowDown}')
    await nextTick()
    expect(document.activeElement).toBe(selected)
    expect(selected!.matches(':focus-visible')).toBe(true)
    expect(isTransparentColor(getComputedStyle(selected!).outlineColor)).toBe(false)
    expect(selected!.getBoundingClientRect().width).toBe(width)
    expect(getComputedStyle(disabled!).cursor).toBe('not-allowed')

    // overlay 的选中项悬停仍走中性 hover 面，不铺品牌淡底
    selected!.style.transition = 'none'
    await userEvent.hover(selected!)
    await nextTick()
    expect(getComputedStyle(selected!).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(indicator).visibility).toBe('visible')

    // 按下：白底阶梯 hover 100 → pressed 200，面由家族 pressed 规则给出，只换面不缩放
    plain!.style.transition = 'none'
    await userEvent.hover(plain!)
    await nextTick()
    const hoverBg = getComputedStyle(plain!).backgroundColor
    let pressedBg = ''
    let pressedTransform = ''
    plain!.addEventListener('pointerdown', () => {
      pressedBg = getComputedStyle(plain!).backgroundColor
      pressedTransform = getComputedStyle(plain!).transform
    }, { once: true })
    await userEvent.click(plain!)
    expect(pressedBg).not.toBe(hoverBg)
    expect(pressedBg).toBe(tokenColor('--xh-bg-subtle-hover'))
    expect(pressedTransform).toBe('none')
  })

  it('overlay 裸条目：open-path 与 hover 同档、loading/error/separator 命名空间', async () => {
    // 裸条目只借皮肤在场：面板收着，否则随字段缺省宽撑到 16rem 的面板会盖住条目中心、挡住指针
    await mountSelect('md', 'closed')
    const item = rawItem()
    const width = item.getBoundingClientRect().width
    const restColor = getComputedStyle(item).color
    const text = item.querySelector<HTMLElement>('[data-xh-collection-slot=\'text\']')!
    const description = item.querySelector<HTMLElement>('[data-xh-collection-slot=\'description\']')!
    const indicator = item.querySelector<HTMLElement>('[data-xh-collection-slot=\'indicator\']')!
    expect(description.getBoundingClientRect().top).toBeGreaterThanOrEqual(text.getBoundingClientRect().bottom)
    expect(indicator.getBoundingClientRect().right).toBeCloseTo(item.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(item).paddingInlineEnd), 0)

    await userEvent.hover(item)
    const hoverBg = getComputedStyle(item).backgroundColor
    await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
    item.dataset.inPath = ''
    const openPathBg = getComputedStyle(item).backgroundColor
    expect(openPathBg).not.toBe('rgba(0, 0, 0, 0)')
    expect(openPathBg).toBe(hoverBg)
    expect(getComputedStyle(item).fontWeight).toBe('400')
    expect(item.getBoundingClientRect().width).toBe(width)
    delete item.dataset.inPath
    item.setAttribute('aria-busy', 'true')
    expect(getComputedStyle(item).cursor).toBe('progress')
    item.removeAttribute('aria-busy')
    item.dataset.error = ''
    expect(getComputedStyle(item).color).not.toBe(restColor)

    const separator = document.createElement('hr')
    separator.dataset.xhCollectionSeparator = ''
    host!.append(separator)
    const separatorStyle = getComputedStyle(separator)
    expect(Number.parseFloat(separatorStyle.marginBlockStart)).toBeGreaterThanOrEqual(0)
    expect(Number.parseFloat(separatorStyle.marginInlineStart)).toBeGreaterThanOrEqual(0)
    expect(Number.parseFloat(separatorStyle.height)).toBeGreaterThan(0)
  })

  it('page 上下文：选中 = 品牌淡底 + 行尾对号，current 同一块面、不画指示条，宽度不变', async () => {
    // 裸条目只借皮肤在场：面板收着，否则随字段缺省宽撑到 16rem 的面板会盖住条目中心、挡住指针
    await mountSelect('md', 'closed')
    const item = rawItem({ context: 'page' })
    const indicator = item.querySelector<HTMLElement>('[data-xh-collection-slot=\'indicator\']')!
    const width = item.getBoundingClientRect().width
    expect(getComputedStyle(indicator).visibility).toBe('hidden')

    item.setAttribute('aria-selected', 'true')
    expect(getComputedStyle(item).backgroundColor).toBe(tokenColor('--xh-bg-brand-subtle'))
    expect(getComputedStyle(item).color).toBe(tokenColor('--xh-fg-on-brand-subtle'))
    expect(getComputedStyle(indicator).visibility).toBe('visible')
    // 与 overlay 同列：对号贴着结束侧内边距，行首一格留给前导图标
    expect(indicator.getBoundingClientRect().right).toBeCloseTo(item.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(item).paddingInlineEnd), 0)
    expect(getComputedStyle(item).fontWeight).toBe('400')
    expect(item.getBoundingClientRect().width).toBe(width)
    expect(getComputedStyle(item, '::before').content).toBe('none')

    // 当前项（SideNav 当前页）与选中同一块面：行面 + 字色就是标记，起始侧不再画 2px 指示条
    item.dataset.current = ''
    expect(getComputedStyle(item, '::before').content).toBe('none')
    expect(getComputedStyle(item).backgroundColor).toBe(tokenColor('--xh-bg-brand-subtle'))
    expect(getComputedStyle(item).color).toBe(tokenColor('--xh-fg-on-brand-subtle'))
    expect(item.getBoundingClientRect().width).toBe(width)

    await userEvent.hover(item)
    expect(getComputedStyle(item).backgroundColor).toBe(tokenColor('--xh-bg-brand-subtle-hover'))
  })
})
