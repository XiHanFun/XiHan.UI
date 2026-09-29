# 级联选择

用于从多层分类中选择完整路径。

## 何时使用

- 选项具有稳定的多层结构，如地区或商品类目。
- 用户需要逐层缩小选择范围。

## 何时不用

- 不规则层级使用[树选择](./tree-select)。
- 单层选项使用[选择器](./select)。
- 主要通过关键词查找时使用[组合框](./combobox)。

## 特性

- `changeOnSelect` 允许选择中间层。
- `expandTrigger` 支持点击或悬停展开。
- `multiple`、`cascade` 与 `checkedStrategy` 控制多选及路径收敛方式。
- 多选的已选路径在触发器里排成标签，与[选择器](./select)同一套呈现：文字是整条路径（按 `separator` 连缀），超出 `maxTagCount`（默认 3）合并为 `+N`；标签身份写路径的比较键（`api.tags` 里的 `key`），触发器外可放带删除钮的标签，value-text 仍留在 DOM 里给触发器的可及名。
- `searchable` 按完整路径筛选选项；`filter` 接管匹配规则，拿到的候选是一条可落值的完整路径（`path` 与逐段的 `labels`），检索词已 trim，空串不调用。搜索框与命令面板、穿梭框的搜索框同一种写法：控件高与字号随尺寸档，只画一道面内分隔的下划线，聚焦不画环（插入符就是焦点指示），占位文字与其它字段同一支前景。
- 选项可逐条声明语气，不向下传导；搜索结果取整条路径末段的语气。
- 选项可写副文本，第 2 行放一句解释，与标题同列、走 muted 档。
- 选项行尾留一格给作者（计数、徽标）。
- 懒加载：节点写 `hasChildren: true` 不给 `children` 即是懒分支，照样算分支、右边开一列；展开路径走到它时由 `loadChildren({ node, path, signal })` 取回直接子项，结果留在组件里并进 `api.collection` 与 `levels`，宿主不必重建 collection。那一列在途时报 `aria-busy` 并露出 `branch-loading`，失败时露出 `branch-error` 与 `branch-retry-trigger`（不占 Tab 位，父条目上按 Enter / Space 同样重试）；取回空数组即成了叶子，可以落值。三块由适配器在列末自动铺出，文案走 `translations.loading` / `branchError` / `retry`。展开路径离开、浮层收起、重试、节点换代与卸载都会中止在途请求，迟到的结果不写回。`onBranchLoadStart` / `onBranchLoad` / `onBranchLoadError`（三端事件 `branch-load-start` / `branch-load` / `branch-load-error`）公开有效请求的生命周期，`api.branchLoadState(value)` 读取状态。
- 支持空状态、整浮层加载状态与原生表单提交。
- 选中项使用末端标记，半选项使用横线。
- 浮层锚在字段盒上、与盒起始缘对齐，宽度按内容定：每一列按条目的自然宽度，不随字段盒拉伸，长选项撑到条目上限为止、余下的在条目里截断；搜索框不参与定宽，铺满列撑出的宽度；面板随列数伸展，宽过可用区时收成可用宽度并在面内横滚。
- 面板含多列，取不透景的实体浮起面，与时间选择同一档。
- 占位态：首次加载时在途占位在文案前转一枚加载环；已有选项时后台刷新保留上一帧、列表按 micro 淡下，在途占位让位；空态与加载文字取次要文字、上下内距一档。

## 组合

- 使用 `label`、`control` 与 `value-text` 组成字段外壳。
- 使用 `column`、`item` 与 `item-indicator` 组成分级列表。

## 最佳实践

- 层级建议控制在三层以内。
- 回显完整路径，避免同名末级选项产生歧义。
- 自定义条目时保留 `item-text` 与 `item-indicator`。

## 反模式

- 不要在异步加载时隐藏已有列。
- 多选时明确约定 `checkedStrategy`。
