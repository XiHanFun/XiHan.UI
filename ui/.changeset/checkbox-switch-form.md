---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

checkbox 与 switch 能进 HTML 表单了。表单字段组件从 18 个变成 20 个，五个缺口清完。

**先纠正一条我此前记错的约束**：我曾把这两个记为「要单独一轮，因为 HTML 内容模型禁止 button 有
交互后代」。查规范后不成立——interactive content 的定义里 `input` 那条写的是「**type 属性不处于
Hidden 状态时**」，所以 `<input type="hidden">` 不是交互内容，放进 `<button>` 里是合法的。
DOM 不必重构，与 color-picker、combobox 同一条路。

- 新增 `hidden-input` 部件、`name` 与 `value` 两个 prop（`value` 缺省 `'on'`，与原生一致）。
- **勾上才带 `name`**：没勾就整条不参与提交，这是原生复选框的语义。
- **半选按未勾处理**：原生里 indeterminate 只是外观，提交与否看 `checked`。
- Vue 侧由组件自己渲染（单体控件没有子部件插槽，作者递不进来），**给了 `name` 才有这个节点**——
  没给就与从前逐字节相同。WC 侧照旧由作者写 `data-xh-part="hidden-input"`。

**两者的重置走转移而不是写 context**：它们的值就是机器状态（`on` / `off` / `indeterminate`），
没有值 cell 可 reset。`FORM.RESET` 因此是一组带守卫的转移，受控时只发意图、非受控才真的转过去；
已经停在默认态就不白发一次通知。

如实记一处限制：`onCheckedChange` 的载荷刻意只有布尔（「用户交互的落点只可能是全选或全不选」），
表达不了半选。所以回落点是半选时状态照常转、通知不发；受控且默认半选的组合因此拿不到重置。
不为这一处去改已公开的载荷类型。
