// 历史记录在真实键盘、指针与布局下：整张列表一个 Tab 位，方向键只移焦点、不跳转，Enter 才派发 history-go；
// 点一行同样派发；设计器交来新快照后当前位置那一行选中；已撤销的步骤字色减淡；头部的清空钮在列表之前占一个 Tab 位；
// 列表以标题命名，axe 没有违规。
import type { ApplyOperation, History } from '@xihan-ui/designer-kit'
import type { DesignerHistoryEventMap, XhDesignerHistoryElement } from '../../src'
import { createHistory, snapshotHistory } from '@xihan-ui/designer-kit'
import { expectNoAxeViolations } from '@xihan-ui/testing/a11y'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineDesignerShell } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import '../../style.css'

defineDesignerShell()

let wrapper: HTMLElement | null = null

afterEach(() => {
  wrapper?.remove()
  wrapper = null
})

async function until(check: () => boolean, message = '期望的状态'): Promise<void> {
  const start = performance.now()
  while (!check()) {
    if (performance.now() - start > 2000)
      throw new Error(`等了 2 秒仍没到${message}`)
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
}

type Doc = readonly string[]
type Op = { readonly type: 'push', readonly value: string } | { readonly type: 'pop' }

const apply: ApplyOperation<Doc, Op> = (doc, op) => (op.type === 'push'
  ? { document: [...doc, op.value], inverse: [{ type: 'pop' }] }
  : { document: doc.slice(0, -1), inverse: [{ type: 'push', value: doc.at(-1)! }] })

/** 加了 a、b、c 三步，撤销了 c。 */
function sample(): History<Doc, Op> {
  const history = createHistory<Doc, Op>({ document: [], apply })
  for (const value of ['a', 'b', 'c'])
    history.execute([{ type: 'push', value }], { label: `Add ${value}` })
  history.undo()
  return history
}

/** 挂上面板，并像设计器那样接线：history-go 调 goTo、清空调 clear，之后交新快照。 */
async function mount(history: History<Doc, Op>): Promise<XhDesignerHistoryElement> {
  const box = document.createElement('div')
  box.style.cssText = 'display: flex; flex-direction: column; inline-size: 288px; block-size: 360px'
  const before = document.createElement('button')
  before.textContent = 'before'
  const panel = document.createElement('xh-designer-history')
  panel.style.cssText = 'flex: 1; min-block-size: 0'
  panel.snapshot = snapshotHistory(history)
  const refresh = (): void => {
    panel.snapshot = snapshotHistory(history)
  }
  panel.addEventListener('history-go', (event) => {
    history.goTo((event as DesignerHistoryEventMap['history-go']).detail.position)
    refresh()
  })
  panel.addEventListener('history-clear', () => {
    history.clear()
    refresh()
  })
  box.append(before, panel)
  document.body.append(box)
  wrapper = box
  await panel.updateComplete
  await until(() => panel.querySelector('[role="option"]') !== null, '列表铺好')
  return panel
}

function options(panel: Element): HTMLElement[] {
  return [...panel.querySelectorAll<HTMLElement>('[role="option"]')]
}

function selected(panel: Element): string[] {
  return options(panel).filter(option => option.getAttribute('aria-selected') === 'true').map(option => option.querySelector('[data-part="item-text"]')!.textContent!)
}

/** 当前持有焦点（或被标为活动项）的那一行的文字。 */
function focusedText(panel: Element): string | null {
  const active = document.activeElement
  const listbox = panel.querySelector('[role="listbox"]')
  const id = active?.getAttribute('aria-activedescendant')
  const option = id ? listbox?.querySelector(`[id="${id}"]`) : active?.closest('[role="option"]')
  return option?.querySelector('[data-part="item-text"]')?.textContent ?? null
}

describe('历史记录（真实键盘与指针）', () => {
  it('按 Tab 先到头部的清空钮再进列表，方向键只移焦点不跳转，Enter 跳到焦点那一步', async () => {
    const history = sample()
    const panel = await mount(history)
    const goes: number[] = []
    panel.addEventListener('history-go', event => goes.push((event as DesignerHistoryEventMap['history-go']).detail.position))
    expect(selected(panel)).toEqual(['Add b'])
    ;(wrapper!.querySelector('button') as HTMLButtonElement).focus()
    await userEvent.keyboard('{Tab}')
    expect(document.activeElement).toBe(panel.querySelector('[data-part="clear-trigger"] button'))
    await userEvent.keyboard('{Tab}')
    await until(() => panel.querySelector('[role="listbox"]')!.contains(document.activeElement), '焦点进列表')
    await userEvent.keyboard('{Home}')
    await until(() => focusedText(panel) === 'Opened', '焦点到起点')
    await userEvent.keyboard('{ArrowDown}')
    await until(() => focusedText(panel) === 'Add a', '焦点到第一步')
    expect([goes, history.position]).toEqual([[], history.entries[1]!.position])
    await userEvent.keyboard('{Enter}')
    await until(() => selected(panel)[0] === 'Add a', '跳到第一步')
    expect([goes, history.document]).toEqual([[history.entries[0]!.position], ['a']])
  })

  it('列表以标题命名，axe 没有违规', async () => {
    const panel = await mount(sample())
    await expectNoAxeViolations(panel)
  })

  it('点一行就跳过去；已撤销的步骤字色比已做的淡', async () => {
    const history = sample()
    const panel = await mount(history)
    await userEvent.click(options(panel)[0]!)
    await until(() => selected(panel)[0] === 'Opened', '跳到起点')
    expect(history.document).toEqual([])
    const color = (index: number): string => getComputedStyle(options(panel)[index]!.querySelector('[data-part="item-text"]')!).color
    await userEvent.click(options(panel)[2]!)
    await until(() => selected(panel)[0] === 'Add b', '跳到第二步')
    expect(color(3)).not.toBe(color(2))
    expect(color(1)).toBe(color(2))
  })

  it('清空钮用键盘按下派发 history-clear', async () => {
    const history = sample()
    const panel = await mount(history)
    const clear = panel.querySelector<HTMLElement>('[data-part="clear-trigger"] button')!
    clear.focus()
    expect(document.activeElement).toBe(clear)
    await userEvent.keyboard('{Enter}')
    await until(() => options(panel).length === 1, '清空后只剩起点')
    expect(history.entries).toEqual([])
  })
})
