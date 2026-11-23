---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 选择器的多选上限 `maxSelected`（自定义元素写 `max-selected`），与日期、时间、颜色选择器的同名属性同一条规则：选满后没选中的条目按禁用处理——转 `aria-disabled`，方向键与连打检索跳过，点击与确认键都加不进去；已选的照旧可以点掉，点掉一个即腾出名额。只拦用户这一路的加选，`setValue` 与受控值原样收下；非整数向下取整，小于 1 时不设上限，单选下不生效。连接层 API 新增 `maxSelected`（生效的上限，没有时为 `null`）。
