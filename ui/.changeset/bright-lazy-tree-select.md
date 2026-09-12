---
"@xihan-ui/headless": minor
"@xihan-ui/react": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

TreeSelect 新增 headless 懒分支加载合同：`hasChildren` 声明未取回的分支，`loadChildren({ node, signal })` 在首次展开时取得直接子项；失败保留 cause，并通过 `api.branchLoadState(value)` 与 `api.retryBranch(value)` 公开。重试、节点移除和卸载都会中止并作废旧请求，过期回调不能覆盖当前有效树。三端均透传 loader，React/Vue 默认树把懒节点渲染为 branch，Web Components 将相位接到既有 branch 属性。
