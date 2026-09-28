---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

DiffView 两处修正：

- 没写头部时表格的可访问名改用文件路径：此前模型带路径时表格一律 `aria-labelledby` 指向头部，没渲染头部（比如多文件放进折叠面板、路径写在面板标题上）就指向一个不存在的 id，读屏读空。三端现在登记头部是否在场（Web Components 看作者写没写 `header` 角色节点），在场才指过去，否则直接以路径为名。
- `parseUnifiedPatch` 取够 hunk 头声明的行数就收：`git diff` 的输出以换行结尾，末尾那个空串此前会被当成一行空的上下文，多出一行、行号也跟着多一。
