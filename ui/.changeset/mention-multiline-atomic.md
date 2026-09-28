---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Mention 支持多行正文：`input` 部件写 `as="textarea"`（Web Components 直接摆 `<textarea data-xh-part="input">`）即多行形态，撤掉单行才有的 `type`、`combobox` 角色与 `aria-expanded`，换 Field Chrome 的多行布局，上下内衬取 `--xh-mention-textarea-py`，只许纵向拉伸；候选收起时 Enter 照常换行。插入后的引用是一个整体：光标紧贴它时 Backspace（在其后）或 Delete（在其前）整条删掉、光标落回它的起点，在它内部改字即退回普通文字，光标停在插完的引用里不再弹候选。新增 `api.mentions`（三端插槽 / children 载荷同名，Web Components 为元素的 `mentions` 只读属性），列出正文里仍然完整的引用：值、文本、前缀与起止下标。
