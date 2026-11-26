---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 标签组的 `name`：选中值按逗号拼成一串随表单提交，一枚都没选时是空串，同时给了 `required` 时没选就拦下表单提交。表单出口是新增的 `hidden-input` 部件（Vue / React 为 `XhTagGroupHiddenInput`），一份视觉隐藏的文本输入；不写结构时给了 `name` 才铺。所在表单重置时选中集合回到 `defaultValue`。连接层 API 新增 `getHiddenInputProps`。
