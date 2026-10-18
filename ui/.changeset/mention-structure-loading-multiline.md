---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
---

提及的标准结构补上在途占位与多行形态：浮层里空态之后是 `loading`，文字取新增的 `translations.loading`（十种语言包同步补上），`MentionApi` 新增 `loadingText`；结构选项新增 `multiline`，三端新增同名属性，开了之后输入框铺成 textarea。多行形态（含手写 textarea）的候选浮层改为锚在这条提及的前缀处，随前缀所在的行与列落位，不再贴着整个输入框；单行照旧贴着输入框。
