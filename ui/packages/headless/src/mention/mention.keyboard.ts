import type { KeyboardTable } from '../spec/types'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#keyboardinteraction'

// 焦点自始至终在输入框上：方向键移的是 aria-activedescendant 指向的高亮，不是 DOM 焦点。
// 与组合框的分水岭在于「收起态一条按键都不接管」——这是一个正文输入框，
// 抢走 Home / End / 回车就等于抢走了打字。
export const mentionKeyboard: KeyboardTable = {
  component: 'mention',
  source: APG,
  rows: [
    { id: 'mention.kbd.trigger', keys: ['前缀字符'], when: '光标前是行首或空白', does: '开候选浮层，并把前缀到光标之间那段作为查询串交给宿主' },
    { id: 'mention.kbd.type', keys: ['可打印字符'], when: 'open', does: '查询串跟着变长，过滤由调用方按 onQueryChange 自己做' },
    { id: 'mention.kbd.next', keys: ['ArrowDown'], when: 'open', does: '高亮移到下一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动' },
    { id: 'mention.kbd.prev', keys: ['ArrowUp'], when: 'open', does: '高亮移到上一个候选（禁用项跳过、尽头按 loop 回绕），焦点不动' },
    { id: 'mention.kbd.commit', keys: ['Enter'], when: 'open, 有高亮且未禁用', does: '把候选文本插到光标处替换查询串，光标落到插入内容之后，浮层收起；这次回车不换行' },
    { id: 'mention.kbd.newline', keys: ['Enter'], when: 'open, 无可提交候选', does: '照常换行，只把浮层收起来' },
    { id: 'mention.kbd.escape', keys: ['Escape'], when: 'open', does: '收起浮层且正文不变；光标不离开这个触发点就不再自动展开' },
    { id: 'mention.kbd.tab', keys: ['Tab', 'Shift+Tab'], when: 'open', does: '收起浮层且不拦按键，焦点按 Tab 序列自然离开' },
    { id: 'mention.kbd.caret', keys: ['ArrowLeft', 'ArrowRight', 'Home', 'End'], when: '任意时候', does: '一律不接管：光标照常移动，触发按新的光标位置重算，挪出查询串即收起' },
  ],
}
