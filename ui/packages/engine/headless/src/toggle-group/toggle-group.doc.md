# 切换按钮组

将多个切换按钮组合为单选或多选控件。

## 何时使用

- 在少量选项之间切换视图或显示方式。
- 同时启用多个格式或工具状态。

## 何时不用

- 选项较多或需要搜索时，使用[选择器](./select)。
- 选项需要完整表单标签时，使用[单选组](./radio-group)。
- 各项只执行操作时，使用[按钮组](./button-group)。

## 特性

- 支持单选和多选模式。
- 支持受控和非受控状态。
- 支持水平、垂直、全宽和三种尺寸。
- 默认在相邻条目之间显示分隔线，可通过 `separators=false` 关闭。
- 使用 roving tabindex 管理组内键盘导航。
- `disallowEmpty` 可阻止清空最后一个选中项。
- `collection` 可统一提供标签和禁用状态。
- 不写结构时按标准结构铺出整组（Vue 不写默认插槽、React 不给 children、Web Components 不写部件或只写 `root`）：每一条一个按钮，末尾一份表单影子，给了 `name` 才参与提交。Web Components 里某一条的内容可以写在宿主的直接子节点上接管：`slot="item:<值>"`。
- 值可以是任意类型：`value`、`defaultValue` 与 `collection` 里交进来数字、对象都行，`onValueChange`、`v-model`、插槽与 `renderItem` 拿到的是原值；Vue 与 React 按 `value` 或 `collection` 推断值的类型、按 `multiple` 推断形状——写了 `multiple` 时值是数组，没写时是一个值或 `null`，单选却绑数组、`valueKey` 写错字段编译即报错。数字转成字符串当键，对象值给 `valueKey`（字段名或取值函数），同一个选项每次都是新对象（接口刚取回来）也认得出来，不给按对象身份认；键也是条目的 `data-value`与随表单提交的值。Vue 的 `h()` 推断不了泛型，那里按宽松的类型检查；Web Components 经 property 交值，写 `querySelector<XhToggleGroupElement<number>>("xh-toggle-group")` 收窄。

## 组合

- 每一项就是一个[切换按钮](./toggle)；放入[工具栏](./toolbar)与其他按钮组成一排。
- 需要面板关联时使用[标签页](./tabs)；选的是一个随表单提交的值、要画成分段轨道时，使用[单选组](./radio-group)的 `variant="segmented"`。

## 最佳实践

- 每组使用二到五个简短选项。
- 同组条目应保持相近宽度。
- 必须保留一个选中项时启用 `disallowEmpty`。

## 反模式

- 不要用切换按钮组代替带面板关联的标签页。
- 关闭 roving focus 时，应提供其他组内导航方式。
