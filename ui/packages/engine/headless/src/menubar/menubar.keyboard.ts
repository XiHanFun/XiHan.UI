import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction'

export const menubarKeyboard: KeyboardTable = {
  component: 'menubar',
  source: APG,
  rows: [
    { id: 'menubar.kbd.next', keys: ['ArrowRight'], when: 'focus in trigger, horizontal', does: '焦点移到下一个 trigger（禁用项跳过、尽头按 loop 回绕）；已有菜单展开着则展开项跟着切过去' },
    { id: 'menubar.kbd.prev', keys: ['ArrowLeft'], when: 'focus in trigger, horizontal', does: '焦点移到上一个 trigger（禁用项跳过、尽头按 loop 回绕）；已有菜单展开着则展开项跟着切过去' },
    { id: 'menubar.kbd.first', keys: ['Home'], when: 'focus in trigger', does: '焦点移到首个可用 trigger' },
    { id: 'menubar.kbd.last', keys: ['End'], when: 'focus in trigger', does: '焦点移到末个可用 trigger' },
    { id: 'menubar.kbd.open-first', keys: ['ArrowDown', 'Enter', 'Space'], when: 'focus in trigger, horizontal', does: '展开本项的菜单；方向键入口把焦点落到首个可用条目，Enter/Space 让焦点留在 trigger 上' },
    { id: 'menubar.kbd.open-last', keys: ['ArrowUp'], when: 'focus in trigger, horizontal', does: '展开本项的菜单并把焦点落到末个可用条目' },
    { id: 'menubar.kbd.item-next', keys: ['ArrowDown'], when: 'open, focus in content', does: '焦点移到下一个条目（禁用项跳过、尽头按 loop 回绕）' },
    { id: 'menubar.kbd.item-prev', keys: ['ArrowUp'], when: 'open, focus in content', does: '焦点移到上一个条目（禁用项跳过、尽头按 loop 回绕）' },
    { id: 'menubar.kbd.item-first', keys: ['Home'], when: 'open, focus in content', does: '焦点移到本张菜单的首个可用条目' },
    { id: 'menubar.kbd.item-last', keys: ['End'], when: 'open, focus in content', does: '焦点移到本张菜单的末个可用条目' },
    { id: 'menubar.kbd.across', keys: ['ArrowRight', 'ArrowLeft'], when: 'open, focus in content', does: '切到相邻菜单并保持展开，焦点落到那一项的 trigger 上' },
    { id: 'menubar.kbd.typeahead', keys: ['a-z', '0-9'], when: 'open, focus in content', does: '连打检索：焦点跳到首字母匹配的条目（同字符连打则在候选间轮换）' },
    { id: 'menubar.kbd.select', keys: ['Enter', 'Space'], when: 'focus in item, not disabled', does: '派发选中详情并收起菜单，焦点归还 trigger' },
    { id: 'menubar.kbd.escape', keys: ['Escape'], when: 'open', does: '收起菜单并把焦点留在 trigger 上' },
    { id: 'menubar.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '收起菜单，焦点不被抢回 trigger，按 Tab 序列自然离开' },
  ],
}
