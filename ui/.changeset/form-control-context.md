---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

Form/Field 的四条状态轴现在会真正进入 TextField 控件机器，而不只停在包装节点的 data/ARIA 属性。

`disabled`、`readOnly`、`required`、`invalid` 的统一优先级为「实例 > 最近 Field > Form > false」：
控件未声明时从 FormFieldGroup 继承，Field 包装时继续把结果下传到实际可聚焦的 input。显式
`false` 是正式的实例覆盖，不再会因为外层 Form 为 disabled 或有规则/错误而被重写。

Web Components 的 `<xh-field>` 同步支持 `read-only`，并将 Form/Field 状态交给嵌套的
`<xh-text-field>` 机器；直接放进 `<xh-form>` 字段组的 `<xh-text-field>` 也使用同一优先级。
此前依赖「Form disabled 仍能编辑内置 TextField」或「显式 false 被外层状态强制改写」的写法需要调整。
