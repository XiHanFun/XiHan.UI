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
- `searchable` 按完整路径筛选选项。
- 选项可逐条声明语气，不向下传导；搜索结果取整条路径末段的语气。
- 支持按需加载、空状态、加载状态与原生表单提交。
- 选中项使用末端标记，半选项使用横线。

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
