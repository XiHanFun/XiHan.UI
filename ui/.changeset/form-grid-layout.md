---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增**表单的网格排布档。`layout` 从三档变四档，多出来的 `grid` 把字段排进等宽列；三档老值渲染逐值不变，不改一行代码升上来看不出差别。

列数走新 prop `columns`，与栅格的 `cols` 同一套写法：整数是各档同一个列数，断点对象 `{ base, sm, md, lg, xl }` 逐档取值，没写的档沿用比它窄的那一档。取值 1 至 4，范围外按一列排。

```vue
<XhFormRoot layout="grid" :columns="{ base: 1, md: 2 }">
  <XhFormFieldGroup value="name">…</XhFormFieldGroup>
  <XhFormFieldGroup value="phone">…</XhFormFieldGroup>
  <XhFormFieldGroup value="address" span="full">…</XhFormFieldGroup>
</XhFormRoot>
```

跨列由字段容器自报：`FormFieldGroupProps` 补 `span`，收 1 至 4 与 `full` 两种写法，落成 `data-span`。`full` 占满整行且跟着当下的列数走——窄视口收成一列时它仍是一整行；写数字则是固定跨度，比当下列数还大会多撑出一列。

Web Components 侧 `<xh-form>` 补 `columns` 特性（写整数或 JSON 对象），字段容器的角色节点上再写个 `span` 特性；两者的取值判定与 Vue 侧同一份代码。

皮肤补 `[data-layout='grid']` 一段：`data-columns` 与逐档的 `data-columns-sm/-md/-lg/-xl` 各接一条规则，`data-span` 接跨列。四个断点宽度与栅格同源。

**未做**：整份轨道表的使用者覆盖槽（`columns` 已覆盖 1 至 4 与逐档写法，要非等宽的两列直接在自己的表单元素上写 `grid-template-columns`）；`labelWidth` / `labelAlign` 仍只在 `horizontal` 下生效，网格档里标签在控件上方。
