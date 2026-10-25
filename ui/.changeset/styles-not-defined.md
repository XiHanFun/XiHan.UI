---
'@xihan-ui/styles': minor
---

**改名** `@xihan-ui/styles/undefined.css` → `@xihan-ui/styles/not-defined.css`：这份是自定义元素升级前（`:not(:defined)`）收起浮层部件的样式，旧名容易被当成生成器把 `undefined` 写进了文件名。全量入口照常包含它，不必改动；单独引入的改引新路径。旧路径在 5.x 里保留，内容与新路径相同，文件开头带弃用说明，6.0.0 移除。
