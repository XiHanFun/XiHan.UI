---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增**文本输入与表单外壳族的能力补齐，九个组件共 16 条，全部是加法：部件、prop、覆盖槽都是新增，一个都没删也没改名，不改一行代码升上来渲染逐值不变。

**装饰段**。`text-field` 与 `number-field` 各补 `prefix` / `suffix` 两个部件，流式排在 `input` 两侧、随 `data-disabled` 变淡、`aria-hidden` 不进可及树。框内摆货币符、单位或图标不必再自己套节点：

```vue
<XhTextFieldControl>
  <XhTextFieldPrefix>¥</XhTextFieldPrefix>
  <XhTextFieldInput />
  <XhTextFieldSuffix>元</XhTextFieldSuffix>
</XhTextFieldControl>
```

**字数提示**。`text-field` 与 `tags-input` 各补 `count` 部件与 `showCount` prop；不写子节点时自己渲「已用 / 上限」，`TextFieldApi` 另开 `count` / `maxLength` / `showCount` 三个只读项。机器早就算得出 `atLimit`，现在有承载它的落点。

**口令强度**。`password-input` 补 `strength-meter` 部件与 `strength` prop（0–4 五档，夹回区间后落 `aria-valuenow` 与 `data-level`，不给即整条收起）。打分算法归调用方——库不猜什么叫「强」。

**分段与只读**。`pin-input` 补 `group` / `separator` 两个部件（`123-456` 这类分段写法有了角色节点，下标仍按文档序算）、逐格补发 `data-empty`，并补 `readOnly` 与 `required` 两个 prop（原生 `readonly` / `required` 加机器守卫，从此不必用全禁用代替只读）。

**就地编辑的三条轴**。`editable` 补 `variant` / `tone` / `size`：尺寸换根上四个私有槽，形态给 outline / subtle / ghost 三档，语气落在聚焦描边与提交钮上。三颗按钮刻意不进尺寸档——比框小一号是形上的固定关系。

**数组字段**。`field-array` 补 `invalid` / `readOnly` / `name` 三个 prop 与根级 `FORM.RESET`，给了 `name` 之后每行经 `item.name` 拿到 `名字[下标]`；另补 `item-label` 部件与行级 `data-invalid` / `data-readonly` / `data-at-min` / `data-at-max`。整份数组从此进得了原生表单、也认表单重置。

**提及框**。`mention` 补 `label` 部件（`for` 写向真输入框）与 `empty` 部件（给了 `collection` 却一条不剩时显出，`role=status`），再补 `name` prop 与根级 `FORM.RESET`。

**字段组排布**。`fieldset` 补 `field-group`（够宽自动分栏的一段字段）与 `actions`（组末尾那一行按钮）两个部件，并排字段与按钮行不必再自己套裸 `div`。

配套的覆盖槽同批开出：`--xh-text-field-affix-*` / `-count-*`、`--xh-number-field-affix-*`、`--xh-password-input-strength-*`、`--xh-pin-input-separator-*` 与 `-box-bg-readonly`、`--xh-field-array-item-label-*`、`--xh-mention-label-*` / `-empty-*`、`--xh-tags-input-count-*`、`--xh-fieldset-field-group-*` / `-actions-gap`。

**未做**：`field-array` 的 `variant` / `tone` 两条轴（那两条说的是控件盒的底与描边，而它的行没有盒，只补 `size` 会成半套三轴）、`fieldset` 的禁用够到 `div` 型控件（两条实现路径一条要拿无障碍换行为正确、一条要越过「只产出属性不改作者 DOM」的契约）。`fieldset` 的 doc 已写明现状：`disabled` 只连坐原生表单控件，组内 `div` 型控件须各自接 `disabled`。
