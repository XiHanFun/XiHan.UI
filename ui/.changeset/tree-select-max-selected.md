---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': patch
---

**新增** 树选择的多选上限 `maxSelected`（自定义元素写 `max-selected`），只在不开 `cascade` 时生效：级联勾选一次带上整枝，对外值的条数又随收敛策略变，上限在那里没有唯一的算法。选满后没选中的节点转 `aria-disabled`、点击与确认键都选不进去；与选择器不同的是，这些节点方向键与连打检索照样落得上去、分支照常展开（展开箭头不带禁用面，光标仍是 pointer）——里面可能有要点掉的已选项。已选的照旧可以点掉，点掉一个即腾出名额。只拦用户这一路的加选，`setValue` 与受控值原样收下；非整数向下取整，小于 1 时不设上限，单选下不生效。连接层 API 新增 `maxSelected`。
