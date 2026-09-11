---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

组合框与树选择删除逗号拼接表单协议，每个选中值生成一个同名原生隐藏字段；零选中不提交空字符串，含逗号的值保持原样。读取多值请使用 FormData.getAll(name)。

无头 getHiddenInputProps 现要求显式传入 { value }，调用方按 api.value 逐个生成 input，不保留旧无参调用。Vue/React HiddenInput 自动铺开；Web Components 保留一个作者声明节点并管理额外字段。两组件根新增 form 属性，显式关联表单的提交与 reset 使用同一所有者。
