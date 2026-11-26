---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

**新增** 就地编辑的 `required`：根带 `data-required`，输入框带 `aria-required`，放进表单字段时从字段继承必填。不写原生 `required`：预览态的输入框收着，浏览器的必填提示落不到收起的节点上，空值的拦截交给表单的校验规则。连接层 API 新增 `required`。
