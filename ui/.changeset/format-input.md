---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/react": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `format-input` 组件（格式输入）：编辑一份 `@xihan-ui/expression` 的格式说明（`FormatSpec`）。先选种类，再填这一种的参数，下方显示样例。Vue、React 与 Web Components 三端同时可用。

- 种类有数字、百分比、日期、人民币大写与数字字形，`kinds` 限定可选的几种；`clearable`（缺省开）在种类里多一项「不设格式」，选它派发 `null`。连同这一项不超过三项时种类用分段切换，否则用下拉。
- 参数行按种类铺开：小数位（固定、范围、不舍入）与位数、千分位、舍入方式、日期模式（预设由 `datePatterns` 给，也可自由输入）、数字字形的样式。种类一换，参数行整组换。
- 只派发合法的格式说明：清空位数、最少位数大于最多位数、日期模式清空时不派发，根标 `aria-invalid`，行内说明出现并进根的描述链。受控时宿主写回另一份格式说明，种类与参数行按它改写；写回同一个值时输入中的文字不被打断。
- 样例按 `sample`（缺省按种类取一个值）、`locale` 与 `timeZone` 格式化，是 `role=status` 的礼貌播报，停止输入一会儿后才换文字。
- 根是 `role=group`；写了标题部件以它为名，放进字段时用字段的标题与说明。里面的下拉、分段切换、数字框、开关与组合框都是库内组件的实例，结构由 `formatInputStructure` 一份给出：Web Components 只写元素本身（或只写 root），Vue / React 不写默认插槽时，三端铺出同一棵树；按需注册 `xh-format-input` 时连带注册这几个元素。
- 皮肤只管排布：参数行按列宽自动分栏、各格底边对齐，开关那一行与旁边的输入框等高；里面的控件铺满所在的那一格。
- 十种内建语言包新增 `format-input` 一桶，中文与英文给出全部文案，其余语言的问题说明沿用英文。
