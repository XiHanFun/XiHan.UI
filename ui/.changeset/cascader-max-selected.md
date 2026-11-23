---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 级联选择的多选上限 `maxSelected`（自定义元素写 `max-selected`），只在不开 `cascade` 时生效，理由同树选择。选满后没选中的叶子转 `aria-disabled`、点击与确认键都选不进去，但方向键照样落得上去；分支照常铺开子列——`changeOnSelect` 下它只是不落值、勾选框降级，行不换禁用面。搜索结果是平铺的列表，没选中的候选按禁用处理。已选的照旧可以点掉，点掉一条即腾出名额。只拦用户这一路的加选，`setValue` 与受控值原样收下；非整数向下取整，小于 1 时不设上限，单选下不生效。连接层 API 新增 `maxSelected`。
