# 树选择

浮层内放一棵树的选择器，适用于层级不规整、深浅不一的数据。

## 何时使用

- 选项是任意形状的树（组织架构、目录、权限节点）。
- 需要在浮层内展开、勾选，并把选中项回显在触发器上。

## 何时不用

- 层级规整、层数固定时，[级联选择](./cascader)的分列展开更快。
- 树本身是页面主体时，使用[树](./tree)。

## 特性

- 选中与展开两套值各自可受控。
- 原生表单按每个选中值生成一个同名隐藏字段；`['a,b', 'c']` 用 `FormData.getAll(name)` 读取为两个原值，不使用逗号拼接。零选中没有提交项，禁用不提交，只读仍提交。
- 声明 `HiddenInput` 部件才参与原生表单。`form` 可指定外部表单 ID，提交与重置使用同一所有者；显式 ID 不存在时不回退祖先表单。非受控 reset 恢复 `defaultValue`，受控值由业务响应重置请求。
- 单选、多选、分支与叶子统一用末端对号表示选中，级联半选使用横线；正文保持正常颜色和字重，中性底只用于悬停和键盘高亮。展开箭头位于行首，与选择标记分开。
- `cascade` 与 `checkedStrategy` 决定勾选是否带子级、回显给哪一层。
- 节点可逐条声明语气，不向下传导；叶子行与分支行同样表达。
- 节点可写副文本，第 2 行放一句解释，不进连打检索串。
- 节点行尾留一格给作者（计数、徽标）；行首那一格归勾选框与展开箭头。
- 支持只选叶子不选分支、浮层内关键词过滤、子节点异步加载：节点用 `hasChildren: true` 声明懒分支，首次展开由 `loadChildren({ node, signal })` 获取直接子项；失败保留 cause，默认 `branch-error` 与 `branch-retry-trigger` 直接可用。
- 整树空（`empty`）与在途（`loading`）默认自动渲染；collection 看有效树长度，手写节点由适配器只上报挂载事实、Headless 统一判空。`loading` 为真时树报 `aria-busy`，空态让位；作者写同名部件时保留作者结构与文案。
- 输入框保持实体；浮层使用 M2 磨砂材质、内侧顶光和四向短位移，不缩放树中文字。树、空态与加载态共用一个外壳，底部操作使用同材质分隔线；增强对比度时材质自动实体化。面板宽度受定位后的可用空间约束，触发器更宽时也不撑大面板。
- 仅 `{ hasChildren: true, children: undefined }` 触发 `loadChildren({ node, signal })`；`children: []` 是已知为空目录，永不请求。成功子项、可见行、键盘导航与级联选择由 headless 的同一有效树计算，三端不各自缓存结果。
- 分支状态不互相降级：`api.branchLoadState(value)` 公开 `idle` / `loading` / `loaded` / `error`；`loaded` 的 `empty` 明确区分成功空数组，`error` 保留原始 cause。默认结构提供 `branch-loading`、`branch-error`、`branch-retry-trigger`、`branch-empty`，也可用同名部件替换文案；错误分支行上的 Enter/Space 是不破坏 tree roving 的正式键盘重试入口。
- `onBranchLoadStart`、`onBranchLoad`、`onBranchLoadError`（三端事件为 `branch-load-start` / `branch-load` / `branch-load-error`）公开有效请求生命周期。分支或整浮层收起、重试、节点移除/同 value 换代、组件卸载都会中止并作废旧请求；迟到兑现或拒绝不能写回当前树，也不发成功/失败事件。

## 组合

- 外层放[表单字段](./field)。

## 最佳实践

- 大树必须开启浮层内过滤，逐级展开查找节点很慢。
- 无头用法需要按 `api.value` 遍历，为每个值调用 `api.getHiddenInputProps({ value })` 并渲染原生 input；旧的无参调用与 CSV 提交合同已删除。Vue/React 的 `HiddenInput` 部件自动铺开，Web Components 仍只需声明一个原生 `input[data-xh-part="hidden-input"]`，额外字段由宿主管理。
- 明确只能选叶子还是分支也可选，并在界面上让分支的可点性可见。
- 自定义 `branch-control` 与 `item` 都应包含 `item-indicator`，分支标记直接读取所属分支的选择与半选状态，不另写状态判定或自绘复选框。Vue / React 自动结构已提供此部件。

## 反模式

- 一次把整棵大树放进浮层，首屏即卡顿。
- 勾选策略与后端理解不一致。
