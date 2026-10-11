---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

字段集整组禁用压进子树：组内组件库的控件各自拿到 `disabled`，行为与禁用面一起到位。此前只靠原生 `fieldset[disabled]`：原生表单控件行为上被禁了，外观却不变灰（各家族认的是 `data-disabled`），滑块拇指这类 `div` 交互节点更是照样能用。现在 Fieldset 把禁用作为作用域配置下发（Vue `provideXhConfig`、React `XhConfigProvider`、`<xh-fieldset>` 本身就是作用域），与原生语义一致：外层禁了，组件自己写 `false` 也拦不住；首个 legend 里的控件不受本组禁用，常用来放「启用这一组」的开关。配置新增 `disabled` 键，`<xh-config>` / `provideXhConfig` / `XhConfigProvider` 也可以用它禁用一整棵子树。
