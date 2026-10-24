# 表单参与与重置

复合控件的值保存在自己的状态机中，浏览器不可见。要让它随 `<form>` 一起提交、一起重置，依靠两件事：一份表单影子（把值映射为原生输入）和一条重置事件（把宿主表单的 `reset` 转换进状态机）。

## 表单影子

提供 `name` 才生成影子，未提供时整个组件不参与提交，既有 DOM 不变。

```vue
<XhSwitch name="notify" default-checked />
```

提交结果是 `notify=on`。值可以更换：`<XhSwitch name="theme" value="dark" />` 提交 `theme=dark`。

三种形态，按组件的值形状划分：

| 形态 | 使用者 | 说明 |
| --- | --- | --- |
| 单个 `hidden-input` | color-picker、combobox、tree-select、checkbox、switch、rating 等 | 多值按逗号拼接为一串 |
| 一值一个影子输入 | checkbox-group、radio-group | 与原生 checkbox / radio 同构，依靠 `checked` 表达选中 |
| 隐藏 `<select>` | select | 多选直接开启原生 `multiple` |

勾选类控件的语义与原生一致：未勾选时整个字段不进入 `FormData`，不是提交空值。checkbox 的半选（`indeterminate`）按未勾选处理，原生中它也只是外观，是否提交由 `checked` 决定。

影子在各适配器中的来源不同：

- Vue：单体控件（checkbox、switch）由组件自行渲染，提供 `name` 后才有该节点；有子部件的组件由作者写出对应部件，例如 `<XhComboboxHiddenInput />`。
- Web Components：一律由作者编写 `data-xh-part="hidden-input"` 的原生节点，元素只负责写入属性。

::: tip 为什么 `type=hidden` 可以放进 `<button>`
checkbox 与 switch 的根是 `<button>`，HTML 的内容模型禁止 button 含有交互内容后代。`<input type="hidden">` 不在此列：规范中 input 的条目写明“type 属性不处于 Hidden 状态时”才算交互内容，因此这种嵌套是合法的。
:::

## 表单重置

带 `name` 的组件都响应表单重置。点击 `<button type="reset">`（或调用 `form.reset()`）时，它们各自回到自己的默认值，与旁边的原生输入框一致。

重置桥按事件目标的原生 HTMLElement 品牌与 `form` 节点名识别表单，不依赖顶层 `HTMLFormElement` 构造器。因此组件与表单位于 iframe 中，或表单从另一 Window adopt 到当前 Document 后，仍会跟随所属表单重置；普通元素派发的同名事件不会冒充表单。

对于正式提供 `form` 属性的组件，重置桥优先按该 ID 查找组件所属 Document 或 ShadowRoot 中的表单；未提供时才关联最近的祖先表单。空 ID、目标不存在或目标不是表单时均不关联其他表单。关联在重置发生时读取，因此目标表单延后创建或属性变更不需要重新挂载组件；取消原生 `reset` 事件仍会取消组件重置。此规则不使未声明 `form` 的组件自动获得该公共属性。

```vue
<form>
  <XhRadioGroupRoot name="plan" default-value="standard">…</XhRadioGroupRoot>
  <XhRatingRoot name="score" :default-value="3">…</XhRatingRoot>
  <button type="reset">重置</button>
</form>
```

几条要点：

- 落点按当前的 props 重新计算，不是挂载时冻结的值。宿主更换 `defaultValue`（例如切换到编辑另一条记录）后，重置回到新的默认值，与原生 `reset()` 回到当前 default 一致。
- 受控组件只发出意图。组件不自行修改状态，只调用一次 `onValueChange`（或 `onCheckedChange`），由宿主写回。

::: warning 受控组件要响应重置，必须显式传 `defaultValue`
这是本库与“受控 reset 是空操作”的分歧点，也是最容易出错的一条。

组件内部的 `?? 兜底` 把宿主声明的默认值和组件的空值写在同一个表达式中（radio-group 是 `null`、rating 是 `0`、tags-input 是空数组）。受控且未写 `defaultValue` 时，组件不做任何动作、不发出任何意图；否则该空值会被当作默认值发给宿主，重置就变成了清空数据。
:::

- 重置被拦截时不动作。表单侧 `event.preventDefault()` 之后，同表单的原生控件也未还原，组件单方面还原会产生半份默认值。
- 归属在事件发生时计算。监听挂在组件所在的根节点上而不是 `<form>` 上（表单会被条件渲染替换、组件也会被移动），用 `closest('form')` 比对，因此嵌套表单不会误伤。

不在任何表单内、无 DOM 的服务端、作者未写影子输入，三种情形都不需要特别处理：归属判定不命中、服务端不挂载副作用、锚点是组件根节点而不是影子输入。

## 放进表单字段组

库内的录入控件放进 `XhFormFieldGroup`（Web Components 是 `data-xh-part="field-group"`）后，按字段组的 `name` 读写 `XhFormRoot` 的值表，不必再接 `v-model`、`value` / `onValueChange` 或监听 `value-change` 后回写：

```vue
<XhFormRoot :default-values="{ title: '', notify: true }">
  <XhFormFieldGroup name="title">
    <XhTextFieldRoot placeholder="一句话说清现象" />
  </XhFormFieldGroup>
  <XhFormFieldGroup name="notify">
    <XhSwitch />
  </XhFormFieldGroup>
</XhFormRoot>
```

- 值落在哪个 prop 由控件决定：多数是 `value`，开关与复选框是 `checked`，文件上传是 `files`。登记表在 headless 的 `formModelOf`。
- 控件自己给了值（`null` 也算）就一概不接，表单的值不读也不写，作用域插槽里的 `value` / `setValue` 手动接法照旧可用。
- 字段在 `defaultValues` 里有值时控件是受控的：表单重置、`setFieldValue` 改了这个字段，控件跟着变。初值与重置这时都归表单，控件自己写的 `defaultValue` / `defaultChecked` 不生效，原生表单的 `reset` 也不会让控件报出自己的初值去覆盖表单刚还原的值。字段还没有值时控件照旧非受控（自己的初值照用），第一次改动写进表单后转为受控。
- 一个字段组里有几个控件就都接同一个字段，例如滑块旁配一个数字框显示同一个值。组件内部借来跑的子控件（颜色选择器里的滑块、日期选择器里的日期输入、分页里的每页条数下拉）不接，`XhFieldBoundary` 与浮层的 Portal 后面的实例也不接。
- 禁用、只读、必填与错误态本来就由表单下传，不必再写 `:invalid="invalid"`；错误文案仍从作用域插槽的 `error` 取。

新增的表单组件没登记值通道、或组件内部借来跑子控件时没写 `formField: false`，都会被门禁拦截（`check-form-model`）。

## 控件在薄封装内

`XhFieldControl` 默认把接线属性（`id` 与各条 `aria-*`）合并到它唯一的子节点上。子节点是组件时，合并到的是组件的根，而薄封装的根往往是 `div`。

标签的 `for` 只对可标注元素生效（`input` / `select` / `textarea` / `button` 等），指向 `div` 时没有任何效果，且不报错。

点击标题这一半由库处理：`for` 未落到实处时，字段会把焦点送给控件内第一个可 tab 的节点，无论封装是库内的还是自行编写的。读屏能否读出名称是另一半，取决于以下两种写法。

一、控件的根就是可聚焦元素：不需要额外处理，默认路径正确：

```vue
<XhFieldControl>
  <input type="email" />
</XhFieldControl>
```

二、控件位于封装内：关闭 `asChild`，让封装内部自行获取：

```vue
<XhFieldControl :as-child="false">
  <MyInput />
</XhFieldControl>
```

```ts
// MyInput 内部
import { useFieldControl } from "@xihan-ui/vue";

const controlProps = useFieldControl();
// 绑定到真正可聚焦的节点上
```

`useFieldControl` 在字段外调用返回空对象，封装仍可单独使用。不关闭 `asChild` 时属性会被合并两次，一次在封装根、一次在真控件，页面上会出现两个相同的 `id`。

库自身的控件不需要处理这一层。select、text-field、date-picker 等封装内部已经把两份接线取到真正可聚焦的部件上：说明与校验状态一份，字段的标签一份。直接放入 `XhFieldControl` 即可，`asChild` 保持默认。

标签那份是并入而不是覆盖：字段的标签排在最前，控件自己的部分（下拉的当前值等）跟在后面，两者都能读出。控件自带的 `aria-labelledby` 指向它自己的 `label` 部件，使用字段的标签时该部件未渲染，只保留它会形成悬空引用：按 accname 规则跳过，名称又无法回退到 `for`（`for` 指向封装根的 `div`），焦点所在的控件就没有名称。

## 不显示出来的名字

库内的表单控件都收 `ariaLabel`，用在没有可见标题的地方，例如表格的一格、工具条上单独放的控件、组合节点里的一段。它写成 `aria-label`，落在字段标签会接到的那个部件上。

名称的先后：

1. 放进字段时，取字段的标签。
2. 其次是控件自己渲染的 `label` 部件。
3. 前两者都不在时，才用 `ariaLabel`。

前两者在场时 `ariaLabel` 不进名称。select、cascader、tree-select、color-picker 的名称原本是「标签 + 当前值」，只给 `ariaLabel` 时是「`ariaLabel` + 当前值」。

三端的写法：

- Vue：写 `ariaLabel`；模板里写 `aria-label` 也落到这个 prop 上。
- React：写 `ariaLabel`。JSX 里的 `aria-label` 是透传到根节点的 DOM 属性，不是这一项。
- Web Components：写在宿主的 `aria-label` 特性上，或给元素的 `ariaLabel` 属性赋值（浏览器把它映射到同一个特性），改了随时跟着变。

field-array 只在表格排布下有落点（表格本体）。transfer 平时只是容器，给了名称才作为一个具名的组。

## 参与的组件

checkbox、cascader、checkbox-group、color-field、color-picker、color-slider、color-swatch-picker、combobox、date-field、date-picker、date-range-picker、editable、field-array、file-upload、image-cropper、mention、number-field、password-input、pin-input、radio-group、rating、select、signature-pad、slider、switch、tags-input、text-field、time-field、time-picker、time-range-picker、toggle-group、transfer、tree-select。

新增的表单组件未接入重置会被门禁拦截：判据的分母从源码扫描得出（`types` 的 props 中有 `name?:` 即表单字段，字段名可以是标量字符串或 `FormPath`），不是手写名单。
