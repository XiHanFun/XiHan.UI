---
'@xihan-ui/headless': patch
---

修正 Cascader 搜索结果与列项的选择状态分叉。

搜索结果现在复用级联聚合后的 `checked` / `indeterminate` 状态，并在级联模式输出对应的 `aria-checked`。`all`、`parent`、`child` 只改变对外值的收敛形式，同一路径在列视图和搜索视图中不再出现相反的选中状态。

整控件禁用会同步落到搜索结果的 `aria-disabled` / `data-disabled`，并清除虚假高亮；节点自身禁用继续沿整条搜索路径传递。只读仍允许浏览候选，不改变既有只读合同。
