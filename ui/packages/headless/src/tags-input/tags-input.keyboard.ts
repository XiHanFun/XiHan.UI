import type { KeyboardTable } from '../spec/types'

// APG 没有"标签输入"这个模式：它是文本框加一串可删条目的组合件。
// 可核对的规格只有文本输入本身的行为（光标、选区、撤销全归浏览器），
// 以及"每个控件都要有可及的名字"这条实践，故出处指向后者。
const SPEC = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

export const tagsInputKeyboard: KeyboardTable = {
  component: 'tags-input',
  source: SPEC,
  rows: [
    {
      id: 'tags-input.kbd.commit',
      keys: ['Enter'],
      when: 'focus in input, 框里有能成标签的内容, not disabled/readOnly',
      does: '把输入框里的文本变成标签（含 delimiter 时一次进多个）；框里只有空白时不接管，Enter 留给表单提交',
    },
    {
      id: 'tags-input.kbd.delimiter',
      keys: ['delimiter（默认 ,）'],
      when: 'focus in input, not disabled/readOnly',
      does: '断词：分隔符之前的每一段各成一个标签，最后一段留在框里接着打',
    },
    {
      id: 'tags-input.kbd.backspace-highlight',
      keys: ['Backspace'],
      when: '输入框为空且没有标签被高亮, 至少有一个标签',
      does: '高亮最后一个标签（这一下不删任何东西）',
    },
    {
      id: 'tags-input.kbd.backspace-delete',
      keys: ['Backspace'],
      when: '输入框为空且已有标签被高亮',
      does: '删掉高亮的标签，光标落到前一个上；删的是第一个就交回输入框',
    },
    {
      id: 'tags-input.kbd.delete',
      keys: ['Delete'],
      when: '已有标签被高亮',
      does: '同上，删掉高亮的标签',
    },
    {
      id: 'tags-input.kbd.prev',
      keys: ['ArrowLeft'],
      when: 'focus in input 且光标贴着最左端（无选区）, 至少有一个标签',
      does: '往左走一格；还没走进标签时从最后一个起步，已经在第一个就停住',
    },
    {
      id: 'tags-input.kbd.next',
      keys: ['ArrowRight'],
      when: '已有标签被高亮',
      does: '往右走一格；走出末尾即交回输入框。光标还在框里时不接管',
    },
    {
      id: 'tags-input.kbd.first',
      keys: ['Home'],
      when: '已有标签被高亮',
      does: '跳到第一个标签',
    },
    {
      id: 'tags-input.kbd.last',
      keys: ['End'],
      when: '已有标签被高亮',
      does: '交回输入框',
    },
    {
      id: 'tags-input.kbd.escape-navigating',
      keys: ['Escape'],
      when: '已有标签被高亮',
      does: '取消高亮，光标交回输入框；没在标签间走时不接管该键',
    },
    {
      id: 'tags-input.kbd.edit',
      keys: ['Enter'],
      when: '已有标签被高亮, editable 开着',
      does: '就地编辑这个标签，焦点进编辑框并整段选中',
    },
    {
      id: 'tags-input.kbd.edit-submit',
      keys: ['Enter'],
      when: 'focus in item-input（就地编辑中）',
      does: '提交改写；改成空白等于删掉这个标签，改成另一个已有标签则并成一个。焦点交回输入框',
    },
    {
      id: 'tags-input.kbd.edit-cancel',
      keys: ['Escape'],
      when: 'focus in item-input（就地编辑中）',
      does: '撤销这次改写，标签保持原样，焦点交回输入框',
    },
  ],
}
