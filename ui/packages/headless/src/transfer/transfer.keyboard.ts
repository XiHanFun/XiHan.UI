import type { KeyboardTable } from '../spec/types'

// Transfer 不是 APG 的一个模式，它是两个多选 listbox 加中间的搬运按钮。
// 列表那一半逐条对齐 listbox 的键盘规格，按钮那一半是原生 button 的激活行为。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/#keyboardinteraction'

export const transferKeyboard: KeyboardTable = {
  component: 'transfer',
  source: APG,
  rows: [
    { id: 'transfer.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'focus outside a list', does: '每一侧列表只占一个 Tab 位：焦点进入该侧锚点条目，无锚点时先落列表容器再由它转投；两个搬运按钮与两个全选格各自另占一位，禁用时自动退出 Tab 序列' },
    { id: 'transfer.kbd.next', keys: ['ArrowDown'], when: 'focus in a list', does: '焦点移到本侧下一个可停留条目（禁用项跳过、尽头按 loop 回绕）；不会走到对面那一侧去' },
    { id: 'transfer.kbd.prev', keys: ['ArrowUp'], when: 'focus in a list', does: '焦点移到本侧上一个可停留条目' },
    { id: 'transfer.kbd.first', keys: ['Home'], when: 'focus in a list', does: '焦点移到本侧首个可停留条目' },
    { id: 'transfer.kbd.last', keys: ['End'], when: 'focus in a list', does: '焦点移到本侧末个可停留条目' },
    { id: 'transfer.kbd.toggle', keys: ['Space', 'Enter', 'Ctrl+Space'], when: 'focus on item, 本侧可勾选', does: '切换焦点条目的勾选态，其余勾选不动；条目禁用、或已被搜索藏起来则不认' },
    { id: 'transfer.kbd.extend', keys: ['Shift+ArrowDown', 'Shift+ArrowUp'], when: 'focus in a list, 本侧可勾选', does: '焦点移到相邻条目并切换它的勾选态；往回走即把刚扩进来的那个摘掉' },
    { id: 'transfer.kbd.select-all', keys: ['Ctrl+A', 'Cmd+A'], when: 'focus in a list, 本侧可勾选', does: '勾中本侧全部可操作条目（可见且未禁用）；已经全勾则一并取消' },
    { id: 'transfer.kbd.move', keys: ['ArrowRight', 'ArrowLeft'], when: 'focus in a list, 该方向指向对面且对面搬得动', does: '把本侧勾中的条目搬到对面（dir=rtl 时左右语义对调）；搬完焦点落到目的地那一侧的列表上。方向指向本侧、或此刻搬不动时这个键放行给页面' },
    { id: 'transfer.kbd.trigger', keys: ['Enter', 'Space'], when: 'focus on to-target-trigger / to-source-trigger', does: '把对面勾中的条目搬过来（原生按钮的激活行为）；搬完按钮多半随即变禁用，焦点改落到目的地那一侧的列表上' },
    { id: 'transfer.kbd.select-all-trigger', keys: ['Enter', 'Space'], when: 'focus on select-all-trigger', does: '全选/取消全选该侧可操作条目（原生按钮的激活行为）；三态经 aria-checked 上报，半选时是 mixed' },
  ],
}
