---
'@xihan-ui/web-components': minor
---

**新增** `@xihan-ui/web-components/authoring` 导出 `STRING_CONVERTER`、`NUMBER_CONVERTER`、`STRING_LIST_CONVERTER` 与 `NUMBER_LIST_CONVERTER`，与库内元素同一口径，作者自己写的元素可以直接用。

**修复** 库内元素的属性转换器各写一份、同名不同义：一批数字属性（各浮层的 `offset` 等）写成空串时得 0，另一批当没写；字符串列表有的空串得空列表、有的当没写。现在全部改用上面这四个共享件：

- 数字属性的空串、空白与读不出数的写法一律当没写（`Infinity` 照收），交回缺省值（原先 `offset=""` 等得 0，多数元素写成文字时得 `NaN`）。
- 字符串列表写了就是一份列表，空串是空列表（`checkbox-group`、`tags-input` 的 `value=""` 即受控且一项不选，与原来相同）；`color-picker` 的 `recent-colors=""` 现在也是受控的空列表，原先当没写。
- 数字列表逐项读数，`"30,,70"` 里的空项不再被读成 0。
- 时间输入、时间选择器与时间范围的 `hour-cycle` 改用共享的小时制转换器，取值不变。
