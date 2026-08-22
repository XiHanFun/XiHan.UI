# 表单参与与重置

复合控件的值攥在自己的机器里，浏览器看不见。要让它随 `<form>` 一起提交、一起重置，靠两件事：
一份**表单影子**（把值映射成原生输入）和一条**重置事件**（把宿主表单的 `reset` 翻译进机器）。

## 表单影子

给了 `name` 才生出影子，不给就整条不参与提交——既有 DOM 一个字节不变。

```vue
<XhSwitch name="notify" default-checked />
```

提交出去是 `notify=on`。值可以换：`<XhSwitch name="theme" value="dark" />` 提交 `theme=dark`。

三种形态，按组件的值形状分：

| 形态 | 谁在用 | 说明 |
| --- | --- | --- |
| 单个 `hidden-input` | color-picker、combobox、tree-select、checkbox、switch、rating…… | 多值的按逗号拼成一串 |
| 一值一个影子输入 | checkbox-group、radio-group | 与原生 checkbox / radio 同构，靠 `checked` 表达选中 |
| 隐藏 `<select>` | select | 多选直接开原生 `multiple` |

**勾选类控件的语义与原生一致**：没勾就整条不进 `FormData`，不是提交一个空值。checkbox 的半选
（`indeterminate`）按未勾处理——原生里它也只是外观，提交与否看 `checked`。

影子在两个适配器里的来路不同：

- **Vue**：单体控件（checkbox、switch）由组件自己渲染，给了 `name` 才有那个节点；有子部件的组件
  由作者写上对应部件，例如 `<XhComboboxHiddenInput />`。
- **Web Components**：一律由作者写 `data-xh-part="hidden-input"` 的原生节点，元素只负责往上铺属性。

::: tip 为什么 `type=hidden` 能放进 `<button>`
checkbox 与 switch 的根是 `<button>`，而 HTML 的内容模型禁止 button 有交互内容后代。
`<input type="hidden">` 不在其列——规范里 input 那条写的是「type 属性**不处于 Hidden 状态时**」，
所以这样嵌是合法的。
:::

## 表单重置

带 `name` 的组件都认表单重置。点 `<button type="reset">`（或调 `form.reset()`），它们各自回到
自己的默认值，和旁边的原生输入框一起。

```vue
<form>
  <XhRadioGroupRoot name="plan" default-value="standard">…</XhRadioGroupRoot>
  <XhRatingRoot name="score" :default-value="3">…</XhRatingRoot>
  <button type="reset">重置</button>
</form>
```

几条要点：

**落点按当下的 props 重算**，不是挂载那一刻冻结的值。宿主把 `defaultValue` 换掉（比如切去编辑
另一条记录），重置就回到新的那一份——与原生 `reset()` 回到「当下的 default」一致。

**受控组件只发意图。** 组件不会自改状态，只调一次 `onValueChange`（或 `onCheckedChange`），
由宿主写回。

::: warning 受控组件要拿到重置，必须显式传 `defaultValue`
这是本库与「受控 reset 是纯空操作」的分歧点，也是最容易踩的一条。

组件内部那句 `?? 兜底` 把「宿主声明的默认值」和「组件的空值」写在同一个表达式里
（radio-group 是 `null`、rating 是 `0`、tags-input 是空数组）。受控且没写 `defaultValue` 时，
组件**一动不动、一条意图都不发**——否则那个空值会被当成默认值发给宿主，重置就成了「把你的数据抹掉」。
:::

**重置被拦下就不动。** 表单那侧 `event.preventDefault()` 之后，同表单的原生控件也没还原，
组件单方面还原会拼出半份默认值。

**归属在事件那一刻现算。** 监听挂在组件所在的根节点上而不是那个 `<form>` 上（表单会被条件渲染
换掉、组件也会被搬走），用 `closest('form')` 比对，因此嵌套表单不会误伤。

不在任何表单里、无 DOM 的服务端、作者没写影子输入——三种情形都不需要特别处理：归属判定不命中、
服务端根本不挂副作用、锚点是组件根节点而不是影子输入。

## 哪些组件参与

24 个：checkbox、checkbox-group、color-picker、combobox、date-field、date-picker、editable、
file-upload、image-cropper、number-field、password-input、pin-input、radio-group、rating、
segmented、select、signature-pad、slider、switch、tags-input、text-field、time-field、
time-picker、tree-select。

新加的表单组件忘了接重置会被门禁拦下：判据的分母是从源码里扫出来的（`types` 的 props 里有
`name?: string` 即表单字段），不是手写名单。
