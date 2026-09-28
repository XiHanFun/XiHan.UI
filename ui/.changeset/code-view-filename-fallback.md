---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

CodeView 的 filename 部件留空时显示根上的 `filename`：此前 Vue / React 的 `XhCodeViewFilename` 不写内容、也没给自己的 `filename` 时渲成空节点，头部条看不到文件名，`pre` 的可访问名指向它也读空。三端现在同一条规则：部件自己的内容与 `filename` 优先，都没有时取根上的；Web Components 在作者没写内容时由元素写上。API 新增 `filename`。
