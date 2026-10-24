---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

**新增** 树的标准结构 `treeStructure`：Vue / React 不写默认插槽、Web Components 不写部件（或只写 root）时，按 `collection` 铺出标题（新 `label` 属性 / Vue `label` 插槽）与整棵树，分支、叶子、说明文字与对号都照数据生成，`<XhTreeRoot :collection="files" label="项目文件" />` 一行即可用。行尾附加内容、拖动把手、整树空态与占位不在标准结构里，要用时照旧整棵手写。

**新增** 树的懒分支：节点写 `hasChildren: true` 且不带 `children` 即为懒分支，首次展开时调 `loadChildren({ node, signal })` 取子项；取回的子项由组件暂存，收起再展开不重复请求，收起或卸载时经 `signal` 中止在途请求。新增事件 `branch-load-start` / `branch-load` / `branch-load-error`（React 为 `onBranchLoadStart` / `onBranchLoad` / `onBranchLoadError`），新增部件 `branch-loading` / `branch-error` / `branch-retry-trigger` / `branch-empty`，懒分支在子层的位置自动铺出这四行（手写结构也一样，不必另写；Vue / React 另导出 `XhTreeBranchLoading` 等四个同名组件），在途时分支行报告 `aria-busy`，失败时点重试钮或在该行按 Enter / Space 再取。`branch` 部件新增 `data-load-state`、`data-error`、`data-empty` 三个状态属性，翻译新增 `tree.loading` / `branchError` / `retry` / `branchEmpty`，十个语言包已补齐。

TreeSelect 与 Cascader 的懒分支取数改为与树共用同一份内核（`shared/lazy-branch`），行为不变。`tree.css` 为四个反馈部件新增样式，体积约增 12%。
