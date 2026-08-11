---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

combobox 能进 HTML 表单了。

此前它既没有 `name` prop 也没有表单影子——放进 `<form>` 提交，`FormData` 里没有这个字段。

**形状照 tree-select，不另起一套**：单个 `hidden-input` 部件（`type=hidden`，排在解剖末位），
多选按逗号拼成一串。同为多值浮层选择器的 tree-select 已经是这个形状，combobox 换一种（比如
一值一个影子输入、或隐藏 `<select multiple>`）会凭空造出第二套约定。

如实记一笔：逗号拼串对含逗号的值不可逆，也不是原生的多值 `FormData`（`name=a&name=b`）。
这是 tree-select 已有的性质，要改得两个一起改，是另一件事。

纯增量：影子是作者自己写的可选部件，不写它就不存在，既有 DOM 与皮肤选择器一个字节不变。
判据也按这个形状加——只在本用例的 fixture 里挂影子，其余用例的 order/counts 一条没改。

**顺带被门禁逼出来的一件事**：加了 `name` 之后 `check-form-reset` 当场变红——带 `name` 就是表单
字段，就必须认表单重置。combobox 因此一并接上了 `FORM.RESET`：值与输入串是两条独立受控轴各判各的，
高亮锚点一并清（它指向的条目可能已被过滤掉）。表单字段组件从 17 个变成 18 个。
