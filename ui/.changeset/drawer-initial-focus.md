---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 抽屉（Drawer）补上 `initialFocus`（`<xh-drawer>` 的 `initial-focus`）：展开后先把焦点落到面板里匹配这个选择器的元素上，匹配不到时回到缺省顺序。文档一直写着这一项，对话框也早就有，抽屉的契约与三端却都没有入口可写。
