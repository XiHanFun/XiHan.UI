---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
---

**grid 的列数、跨列与错列有了执行得动的取值范围。** 三个 prop 此前是裸 `number`：`:cols="16"` 编译通过、DOM 上写着 `data-cols="16"`、屏幕上是一列——没有类型错、没有告警、也没有门禁；文档里的「1 至 12」只是一句描述，没有任何执行点。

现在两头都收紧，与同形态的 `descriptions.columns` 一致：

- **类型收成字面量联合。** 新增导出 `GridColumnCount`（`1 | 2 | … | 12`，`cols` 与 `span` 用它，断点对象的每一档也是它）与 `GridColumnOffset`（`1 | 2 | … | 11`，`offset` 用它）。
- **连接层归一。** 范围外的值——0、负数、小数、超过上限——一律按没写算：`cols` 落回一列、`span` 占一列、`offset` 不错列。DOM 上因此只出得来皮肤有规则接的取值：`data-cols` 恒在 1 至 12 之间，`data-span` 与 `data-offset` 要么落在范围内、要么不出现。

范围与「越界怎么办」都写进了组件文档，不再是口头约定。

**破坏性：TypeScript 那一路，`cols` / `span` / `offset` 上原来编译得过的任意数字现在报错。** 改法是把值收进范围，或按业务先夹一次再传。HTML 属性与纯 JS 那一路（`cols="16"`、JS 里 `el.cols = 16`）不报错——元素的 `cols` property 在 TypeScript 下同样收了范围，那一路照报——但行为从「落一个没人接的值」变成「按一列排」——写了越界值的地方屏幕上看不出差别，DOM 上的 `data-cols` 会从 `16` 变成 `1`，取它的选择器要跟着改。

## 默认渲染逐像素未变

范围内的取值一个字没动；范围外的取值此前就没有任何一条皮肤规则接得住。
