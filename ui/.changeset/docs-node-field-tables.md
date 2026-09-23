---
'@xihan-ui/vue': patch
---

Vue 的三个条目插槽补上 JSDoc：文档「插槽」表的说明列此前是空的，看得到名字与载荷类型，看不出 `item` / `item-prefix` / `item-suffix` 三者分工。

`item` 在菜单里是整条的接管口，在 ContextMenu / Menubar / 候选列表里填的是文字槽——这条差别现在写在各自的声明上，一并进文档。
