---
'@xihan-ui/core': minor
'@xihan-ui/headless': minor
'@xihan-ui/react': patch
'@xihan-ui/vue': patch
---

修正多级 Menu、ContextMenu 与 Menubar 在 Portal 之间悬停时祖先提前关闭的问题。

`trackHoverIntent` 新增可选的 `getHoverBranches` 端口：调用方可显式登记同一 Document 中、
逻辑上属于当前悬停树的 Portal 后代。主内容、后代分支与触发器之间均使用实时区域快照和
安全多边形仲裁；没有登记的 Dialog、Popover 等无关浮层不会被推断成菜单后代。

Menu 机器新增适配器 ref `getHoverBranches`。React 与 Vue 的 Menu、ContextMenu、Menubar
组合部件按真实父子关系递归登记仅处于展开态的子菜单 positioner；进入三级、在三级内移动、
返回二级均不会触发祖先的旧关闭计时。末级选择改为从叶到根同步收链，避免共享 LayerRegistry
出现非栈顶释放；键盘逐层进入、返回与 Escape 栈顶语义保持不变。
