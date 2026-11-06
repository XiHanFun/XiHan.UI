// 下拉开着时，后出现的提示压在它上面；两者没有嵌套关系，提示不该挡住下拉的层外按下（Web Components）。
// 提示可见时按它的触发器、提示正在退场、提示可见时按在外面，这三种状态下按在下拉之外都要把下拉收起；
// 按在提示里不收它开在其内容里的浮层。真实指针的悬停、按下与退场期间的层栈只有浏览器里有。
// 按在层外时提示谁也不护：它可见、正在播退场，它所在的浮层都在这一下收起；浮层等提示的层先释放，层栈不报乱序。
// 悬停展开的导航面板里放带提示的按钮同理。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { SelectNode } from '@xihan-ui/headless'
import { DIAGNOSTIC_CODES, getLayerRegistry, onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const ITEMS: SelectNode[] = [
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '停用' },
  { value: 'locked', label: '锁定' },
]

const BLANK = '<div data-test="blank" style="position:fixed;inset-block-end:40px;inset-inline-start:40px;inline-size:160px;block-size:60px"></div>'

type Upgraded = HTMLElement & { updateComplete: Promise<unknown> }

let box: HTMLElement | null = null
let stopDiagnostics: (() => void) | null = null

afterEach(async () => {
  stopDiagnostics?.()
  stopDiagnostics = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
  box?.remove()
  box = null
  document.querySelector('[data-test="exit-style"]')?.remove()
})

async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function tip(closeDelay: number): string {
  return `
    <xh-tooltip open-delay="0" close-delay="${closeDelay}">
      <button data-xh-part="trigger" data-test="tip-trigger">查询</button>
      <div data-xh-part="positioner"><div data-xh-part="content" data-test="tip-content">按条件查询</div></div>
    </xh-tooltip>`
}

async function mount(html: string, style: string): Promise<void> {
  box = document.createElement('div')
  box.style.cssText = style
  box.innerHTML = html
  const select = box.querySelector<Upgraded & { collection?: SelectNode[] }>('xh-select')
  if (select)
    select.collection = ITEMS
  document.body.append(box)
  await Promise.all([...box.querySelectorAll<Upgraded>('xh-select, xh-tooltip, xh-popover, xh-navigation-menu')].map(el => el.updateComplete))
  await settle()
}

/**
 * 筛选区：带提示的按钮在上、下拉在下（列表朝下展开，盖不到按钮），左下角留一块空白。
 * 用例页面只有 414px 宽：竖着排，整页不出滚动条。页面能滚时，真实指针的点击在目标还没稳住的那几帧里
 * 会换着对齐方式把目标滚进视口。
 */
function mountFilters(closeDelay = 0): Promise<void> {
  return mount(
    `${tip(closeDelay)}<xh-select><div data-xh-part="root"></div></xh-select>${BLANK}`,
    'display:flex;flex-direction:column;gap:120px;padding:120px 40px;align-items:flex-start',
  )
}

/** 浮层里放一颗带提示的按钮：提示开在浮层的内容里。挂载即展开的浮层不取焦点，提示要指针移上去才出现。 */
function mountNested(defaultOpen = true): Promise<void> {
  return mount(
    `<xh-popover ${defaultOpen ? 'default-open' : ''}>
      <button data-xh-part="trigger" data-test="popover-trigger">筛选</button>
      <div data-xh-part="positioner"><div data-xh-part="content" data-test="popover-content">${tip(0)}</div></div>
    </xh-popover>${BLANK}`,
    'padding:120px 40px',
  )
}

function test(name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-test="${name}"]`)!
}

function selectTrigger(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope="select"][data-part="trigger"]')!
}

const selectOpen = (): string | null => selectTrigger().getAttribute('aria-expanded')
const popoverOpen = (): string | null => test('popover-trigger').getAttribute('aria-expanded')
const tipState = (): string | undefined => test('tip-content').dataset.state
const layers = (): number => getLayerRegistry(document).list().length

/** 键盘打开浮层：初始焦点落在带提示的按钮上，提示随聚焦出现，压在浮层上面。 */
async function openNestedByKeyboard(): Promise<void> {
  test('popover-trigger').focus()
  await userEvent.keyboard('{Enter}')
  await expect.poll(popoverOpen).toBe('true')
  await expect.poll(tipState).toBe('open')
  await expect.poll(layers).toBe(2)
}

/** 收下层栈的乱序诊断：父层先于开在它里面的层释放时才有。 */
function watchReleaseOrder(): DiagnosticRecord[] {
  const records: DiagnosticRecord[] = []
  stopDiagnostics = onDiagnostic((record) => {
    if (record.code === DIAGNOSTIC_CODES.layerDisposeNotTop)
      records.push(record)
  })
  return records
}

async function openSelect(): Promise<void> {
  await userEvent.click(selectTrigger())
  await expect.poll(selectOpen).toBe('true')
  await expect.poll(layers).toBe(1)
}

/** 指针移到带提示的按钮上，等提示出现并入栈。 */
async function showTip(layerCount: number): Promise<void> {
  await userEvent.hover(test('tip-trigger'))
  await expect.poll(tipState).toBe('open')
  await expect.poll(layers).toBe(layerCount)
}

/** 提示的退场拉到 60 秒：逻辑收起之后它的层一直留在栈里。 */
function holdTipExit(): void {
  const style = document.createElement('style')
  style.dataset.test = 'exit-style'
  style.textContent = `
    @keyframes test-tip-exit { from { opacity: 1 } to { opacity: 0 } }
    [data-scope='tooltip'][data-part='content'][data-state='closed'] {
      animation: test-tip-exit 60s linear forwards;
    }
  `
  document.head.append(style)
}

describe('wc 下拉开着时提示压在上面', () => {
  it('提示可见时按它的触发器：下拉收起', async () => {
    await mountFilters()
    await openSelect()
    await showTip(2)

    await userEvent.click(test('tip-trigger'))

    await expect.poll(selectOpen).toBe('false')
  })

  it('提示正在退场、层还留在栈里：按在空白处，下拉收起', async () => {
    holdTipExit()
    await mountFilters()
    await openSelect()
    await showTip(2)

    await userEvent.hover(test('blank'))
    await expect.poll(tipState).toBe('closed')
    // 提示逻辑上已经收起，退场没播完，层还压在下拉上面
    expect(layers()).toBe(2)
    expect(selectOpen()).toBe('true')

    await userEvent.click(test('blank'))

    await expect.poll(selectOpen).toBe('false')
    // 放掉拉长的退场：两层各自播完后都从栈里释放
    for (const animation of test('tip-content').getAnimations())
      animation.finish()
    await expect.poll(layers).toBe(0)
  })

  it('提示可见时按在空白处：提示与下拉一并收起', async () => {
    // 收起等待拉长：指针移到空白处之后提示仍然可见
    await mountFilters(60_000)
    await openSelect()
    await showTip(2)

    await userEvent.click(test('blank'))

    await expect.poll(selectOpen).toBe('false')
    await expect.poll(tipState).toBe('closed')
  })

  it('escape 先收提示，下拉等下一次按键', async () => {
    await mountFilters()
    await openSelect()
    await showTip(2)

    await userEvent.keyboard('{Escape}')
    await expect.poll(tipState).toBe('closed')
    expect(selectOpen()).toBe('true')

    // 提示播完退场、层释放之后，下一次 Escape 才轮到下拉
    await expect.poll(layers).toBe(1)
    await userEvent.keyboard('{Escape}')
    await expect.poll(selectOpen).toBe('false')
  })
})

describe('wc 提示开在浮层的内容里', () => {
  it('按在提示里：浮层不收', async () => {
    await mountNested()
    await expect.poll(popoverOpen).toBe('true')
    await showTip(2)

    // 提示的内容区搬到了浮层落点上，不在浮层的内容区里：按在它上面的事件路径不经过浮层
    await userEvent.click(test('tip-content'))
    await settle()

    expect(popoverOpen()).toBe('true')

    // 收干净再移除：指针移开后提示收起（随聚焦出现的那一次已经随失焦收起），浮层按一次 Escape 收起
    await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
    await expect.poll(layers).toBe(1)
    await userEvent.keyboard('{Escape}')
    await expect.poll(layers).toBe(0)
  })

  it('提示随聚焦出现时按在层外：提示与浮层一并收起，层栈清空，不报乱序', async () => {
    const records = watchReleaseOrder()
    await mountNested(false)
    await openNestedByKeyboard()

    await userEvent.click(test('blank'))

    // 这一下把两层都收起：各播各的退场，浮层等提示的层先释放
    await expect.poll(popoverOpen).toBe('false')
    await expect.poll(layers).toBe(0)
    expect(document.querySelector<HTMLElement>('[data-test="tip-content"]')?.dataset.state).not.toBe('open')
    expect(records).toEqual([])
  })

  it('提示收起后还在播退场、层留在栈里：按在层外，浮层这一下就收起，不报乱序', async () => {
    const records = watchReleaseOrder()
    holdTipExit()
    await mountNested(false)
    await openNestedByKeyboard()

    // Escape 只收栈顶的提示；退场拉长，它的层还压在浮层上面
    await userEvent.keyboard('{Escape}')
    await expect.poll(tipState).toBe('closed')
    expect(popoverOpen()).toBe('true')
    expect(layers()).toBe(2)

    await userEvent.click(test('blank'))

    await expect.poll(popoverOpen).toBe('false')
    // 拉长的退场还在播就放掉：提示的层先释放，浮层的层跟着释放
    for (const animation of test('tip-content').getAnimations())
      animation.finish()
    await expect.poll(layers).toBe(0)
    expect(records).toEqual([])
  })
})

describe('wc 提示开在导航面板里', () => {
  it('提示可见时按在层外：提示与面板一并收起，不报乱序', async () => {
    const records = watchReleaseOrder()
    // 收起等待拉长：指针移到空白处之后提示仍然可见
    await mount(
      `<div style="inline-size:320px">
        <xh-navigation-menu delay-duration="0">
          <nav data-xh-part="root"><ul data-xh-part="list">
            <li data-xh-part="item">
              <button data-xh-part="trigger" value="products" data-test="nav-trigger">产品</button>
              <div data-xh-part="content" value="products">${tip(60_000)}</div>
            </li>
            <li data-xh-part="item"><a data-xh-part="link" href="#home">首页</a></li>
          </ul></nav>
        </xh-navigation-menu>
      </div>${BLANK}`,
      'display:flex;flex-direction:column;gap:120px;padding:120px 40px;align-items:flex-start',
    )

    const navOpen = (): string | null => test('nav-trigger').getAttribute('aria-expanded')
    await userEvent.hover(test('nav-trigger'))
    await expect.poll(navOpen).toBe('true')
    // 提示开在导航面板里，两层都是悬停出现的内联层
    await showTip(2)

    await userEvent.click(test('blank'))

    // 面板等提示的层先释放，不抢在它前面走
    await expect.poll(navOpen).toBe('false')
    await expect.poll(layers).toBe(0)
    expect(records).toEqual([])
  })
})
