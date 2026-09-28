---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

Cascader 新增懒加载，与 TreeSelect 同一套契约：节点写 `hasChildren: true` 不给 `children` 即是懒分支，照样算分支、右边开一列；展开路径走到它时由 `loadChildren({ node, path, signal })` 取回直接子项，结果留在组件里并进 `api.collection` 与 `levels`（还没取回时补一个空层）。那一列在途时报 `aria-busy` 并露出新部件 `branch-loading`，失败露出 `branch-error` 与 `branch-retry-trigger`（Action Control text ghost 档，不占 Tab 位；父条目上按 Enter / Space 同样重试），取回空数组即成了叶子。三块由三端在列末自动铺出，文案走新文案 `translations.branchError` / `retry` 与原有的 `loading`。展开路径离开、浮层收起、重试、节点换代与卸载都会中止在途请求，迟到的结果不写回也不发事件。新增 `onBranchLoadStart` / `onBranchLoad` / `onBranchLoadError`（三端事件 `branch-load-start` / `branch-load` / `branch-load-error`）、`api.branchLoadState` / `columnLoadState` / `retryBranch`、`getBranchLoadingProps` / `getBranchErrorProps` / `getBranchRetryTriggerProps`，导出 `isCascaderLazyBranch` / `resolveCascaderCollection` / `findCascaderNode` 与相关类型；`cascaderSearchCandidates` 不再把没取回的懒分支当叶子候选。`api.collection` 改为有效树（作者的 collection 并上已取回的子项）。样式槽 `--xh-cascader-branch-status-*`。
