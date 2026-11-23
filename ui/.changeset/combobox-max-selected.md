---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 组合框的多选上限 `maxSelected`（自定义元素写 `max-selected`），与选择器同一条规则：选满后没选中的候选按禁用处理——转 `aria-disabled`，方向键跳过，点击与确认键都加不进去；`allowCustomValue` 下回车也造不出新的一项，输入串原样留着。已选的照旧可以去掉（标签删除钮、退格、再点一次），去掉一个即腾出名额。只拦用户这一路的加选，`setValue` 与受控值原样收下；非整数向下取整，小于 1 时不设上限，单选下不生效。连接层 API 新增 `maxSelected`。
