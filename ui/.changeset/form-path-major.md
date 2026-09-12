---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

Form 字段身份统一为 `FormPath`。`XhFormFieldGroup` 与 `XhFormErrorSummaryItem`
的 `value` 改为必填 `name`；字符串始终是单个字段（`user.email` 不再被解释为
层级），嵌套字段必须显式传数组路径。

Headless 新增 `formPathKey`、`formPathDisplay`、`getFormPathValue`、
`setFormPathValue` 与 `createFormPathRecord`。数组路径的 values、rules、errors、
校验任务、DOM id、摘要和落焦均走同一条路径身份，绝不依赖数组隐式转成逗号字符串。
Web Components 的字符串字段写 `name`；数组路径必须写严格 JSON `data-path`，
运行期改写会自动重新接线。FieldArray 现在会在 Form 内自动接入路径真源；新增、删除、换序会同时迁移其子字段的 values、rules、errors、进行中的 validation 与已验证错误标记，行字段名改为显式数组 FormPath，绝不拼接或解析字符串下标。
