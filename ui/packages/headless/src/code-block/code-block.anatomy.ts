import { createAnatomy } from '@xihan-ui/core'

// data-part 直接用 kebab-case，与 CSS 选择器一致。
//
// 分工：root 是外壳，语言与闭合标记挂在它身上供皮肤取用；
// lang-label 是右上角那枚纯装饰的语言角标（代码本身已经写着语言，读屏不需要再听一遍）；
// pre 是真正 overflow-x:auto 的那层，也是唯一的 Tab 停靠点；
// code 只承载代码文本，将来接精细高亮时被替换的也只有它这一层。
//
// 刻意没有复制按钮 part：复制是一段带"已复制"反馈的状态机，本仓已有 headless clipboard，
// 在这里再造一套只会分叉。要复制按钮就把 clipboard 组合进来。
export const codeBlockAnatomy = createAnatomy('code-block', ['root', 'lang-label', 'pre', 'code'])
