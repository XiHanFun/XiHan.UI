---
'@xihan-ui/web-components': major
'@xihan-ui/designer-shell': major
---

全部元素的布尔 attribute 改为三态，与已有的三态属性同一个转换器：显式写 `="false"` 为假，不写交给组件缺省，写空串或别的值为真。此前约一百三十个布尔属性（`disabled`、`default-open`、`loading`、`multiple`、`lazy-mount`、`unmount-on-exit`、`full-width`、`icon-only`、`read-only` 等）按 HTML 原生规矩写出即为真，`disabled="false"` 也是禁用，与同一元素上其余属性的读法不一致。

`@xihan-ui/web-components/authoring` 新增导出 `BOOLEAN_CONVERTER`，作者自己写的元素在 `static properties` 里写 `{ converter: BOOLEAN_CONVERTER }`，与库内元素同一个读法：没写为 `undefined`，写 `"false"` 为 `false`，其余为 `true`。designer-shell 的零件（`xh-designer-properties`、`-palette`、`-issues`、`-minimap`、`-ruler`、`-transform`）的 `readonly`、`searchable`、`collapsible` 一并改为三态。

迁移：

- 只有显式写成 `"false"` 的地方受影响。写过 `disabled="false"`、`loading="false"` 这类却期望为真的，改成不带值的 `disabled` 或 `disabled=""`；本意就是关的，现在按本意生效。
- 不写、写空串、写 `"true"` 或别的值，读法都不变。
- 移除属性改为回到组件缺省，不再固定为假。缺省为假的开关看不出差别；缺省为真的开关（如 `xh-citation` 的 `loop`）移除后回到开，要关请写 `loop="false"`。
- 经 property 赋值（`el.disabled = false`）不受影响。
